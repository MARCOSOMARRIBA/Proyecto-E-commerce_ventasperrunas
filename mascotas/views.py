from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction, connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import random
import time
from django.db.models import Max, Sum, Q
from rest_framework.generics import ListAPIView
from rest_framework.decorators import action
from datetime import datetime
from django.contrib.auth.hashers import check_password, make_password
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
import ssl

from django.contrib.auth.hashers import check_password, make_password
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from django.views.decorators.csrf import csrf_exempt
import cloudinary.uploader

# Parche temporal para correos en desarrollo (Quitar en producción)
ssl._create_default_https_context = ssl._create_unverified_context

from .models import (
    Carrito, Categoria, Cobro, Orden, Pedido, Producto, 
    Proveedor, SeccionExtranet, Usuario, DetalleOrden, DetalleCarrito, DetallePedido
)
from .serializers import (
    CarritoSerializer, CategoriaSerializer, CobroSerializer, 
    OrdenSerializer, PedidoSerializer, ProductoSerializer, 
    ProveedorSerializer, SeccionExtranetSerializer, UsuarioSerializer, DetallePedidoSerializer
)

# ==========================================
# VIEWSETS BÁSICOS
# ==========================================

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer

    def get_queryset(self):
        user_rol = str(self.request.query_params.get('rol', ''))
        user_rfc = str(self.request.query_params.get('rfc', ''))

        if user_rfc in ['null', 'undefined', 'None', '']:
            user_rfc = None

        # 🔥 CAMBIO AQUÍ: Filtramos para traer SOLAMENTE los activos
        queryset = Producto.objects.filter(activo=True).order_by('-id_producto')

        if user_rol in ['1', '2', '3'] or not user_rol:
            return queryset

        if user_rol == '4' and user_rfc:
            user_rfc_limpio = user_rfc.strip()
            from django.db import connection
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT id_producto FROM producto WHERE rfc = %s", [user_rfc_limpio])
                    resultados = cursor.fetchall()
                    ids_permitidos = [fila[0] for fila in resultados]
                return queryset.filter(id_producto__in=ids_permitidos)
            except Exception as e:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT id_producto FROM producto WHERE rfc_id = %s", [user_rfc_limpio])
                        resultados = cursor.fetchall()
                        ids_permitidos = [fila[0] for fila in resultados]
                    return queryset.filter(id_producto__in=ids_permitidos)
                except Exception as inner_e:
                    print("❌ Error crítico en BD al buscar productos:", inner_e)
                    return Producto.objects.none()

        return Producto.objects.none()

    # ... tu método create() se queda exactamente igual ...
    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            ultimo_producto = Producto.objects.all().order_by('-id_producto').first()
            nuevo_id = (ultimo_producto.id_producto + 1) if ultimo_producto else 9000000000000

            # 1. Creamos el producto básico SIN el RFC
            nuevo_producto = Producto.objects.create(
                id_producto=nuevo_id,
                nombre=data.get('nombre'),
                descripcion=data.get('descripcion', ''),
                precio=data.get('precio', 0),
                stock=data.get('stock', True),
                imagen=data.get('imagen', ''),
                activo=data.get('activo', True),
                id_categoria_id=data.get('id_categoria')
            )

            # 🔥 2. SQL DIRECTO PARA ASIGNAR EL RFC Y EVITAR CRASHEOS DEL ORM
            rfc_recibido = data.get('rfc') or data.get('rfc_id')
            
            if rfc_recibido:
                from django.db import connection
                with connection.cursor() as cursor:
                    try:
                        cursor.execute("UPDATE producto SET rfc = %s WHERE id_producto = %s", [rfc_recibido, nuevo_id])
                        print(f"✅ PRODUCTO {nuevo_id} ASIGNADO AL PROVEEDOR {rfc_recibido} (vía rfc)")
                    except Exception:
                        cursor.execute("UPDATE producto SET rfc_id = %s WHERE id_producto = %s", [rfc_recibido, nuevo_id])
                        print(f"✅ PRODUCTO {nuevo_id} ASIGNADO AL PROVEEDOR {rfc_recibido} (vía rfc_id)")

            return Response({"message": "¡Producto agregado con éxito!", "id_producto": nuevo_id}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class ProveedorViewSet(viewsets.ModelViewSet):

    queryset = Proveedor.objects.all().order_by('nombre_empresa')
    serializer_class = ProveedorSerializer

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            proveedor = Proveedor.objects.create(
                rfc=str(data.get('rfc', '')).strip().upper(),
                nombre_empresa=str(data.get('nombre_empresa', '')).strip(),
                telefono=str(data.get('telefono', '')).strip(),
                correo=str(data.get('correo', '')).strip(),
                direccion=str(data.get('direccion', '')).strip(),
                activo=bool(data.get('activo', True))
            )

            serializer = self.get_serializer(proveedor)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SeccionExtranetViewSet(viewsets.ModelViewSet):
    serializer_class = SeccionExtranetSerializer
    lookup_field = 'id_seccion'

    def get_queryset(self):
        user_rol = self.request.query_params.get('rol', None)
        usuario_id = self.request.query_params.get('id_usuario', None)

        queryset = SeccionExtranet.objects.all().order_by('-id_seccion')

        # ADMIN Y EMPLEADOS
        if user_rol in ['2', '3']:
            return queryset

        # PROVEEDORES
        if user_rol == '4':
            if usuario_id:
                return queryset.filter(id_usuario=usuario_id)
            return queryset.none()

        # CLIENTES PUBLICOS
        return queryset.filter(estatus=True)

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            max_seccion = SeccionExtranet.objects.aggregate(Max('id_seccion'))['id_seccion__max']
            nuevo_id = (max_seccion or 0) + 1

            usuario_creador = data.get('id_usuario')
            if not usuario_creador:
                usuario_creador = "ADM0000000001"

            instancia_usuario = Usuario.objects.filter(id_usuario=usuario_creador).first()

            nueva_seccion = SeccionExtranet.objects.create(
                id_seccion=nuevo_id,
                titulo_pagina=data.get('titulo_pagina'),
                texto_bienvenida=data.get('texto_bienvenida', ''),
                imagen_banner=data.get('imagen_banner', ''),
                url_destino=data.get('url_destino', ''),
                estatus=data.get('estatus', True),
                portal_destino=data.get('portal_destino', '1'),
                id_usuario=instancia_usuario 
            )

            return Response({
                "success": True,
                "message": "¡Banner creado exitosamente!",
                "id_seccion": nuevo_id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Fallo al crear el banner: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

class OrdenViewSet(viewsets.ModelViewSet):
    serializer_class = OrdenSerializer

    def get_queryset(self):
        user_rol = self.request.query_params.get('rol', None)
        user_id = self.request.query_params.get('id_usuario', None)

        queryset = Orden.objects.all().order_by('-id_orden')

        if user_rol in ['2', '3']:
            return queryset

        if user_rol == '1' and user_id:
            return queryset.filter(id_usuario_id=user_id)

        return Orden.objects.none()

class CobroViewSet(viewsets.ModelViewSet):
    queryset = Cobro.objects.all()
    serializer_class = CobroSerializer

class BannerPorPortalView(ListAPIView):
    serializer_class = SeccionExtranetSerializer

    def get_queryset(self):
        return SeccionExtranet.objects.filter(
            estatus=True
        ).order_by('-id_seccion')

# ==========================================
# VIEWSET DE PEDIDOS
# ==========================================

# ==========================================
# VIEWSET DE PEDIDOS
# ==========================================

# ==========================================
# VIEWSET DE PEDIDOS
# ==========================================

class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    lookup_field = 'id_pedido'

    # 🔥 BLOQUE NUEVO: Interceptamos el DELETE para hacer borrado lógico
    def destroy(self, request, *args, **kwargs):
        pedido = self.get_object()
        pedido.estatus = 'C'  # 'C' de Completado (Se va al historial)
        pedido.save()
        return Response({"message": "Pedido completado y enviado al historial"}, status=status.HTTP_200_OK)

    def get_queryset(self):
        user_rol = str(self.request.query_params.get('rol', ''))
        user_rfc = str(self.request.query_params.get('rfc', ''))
        estatus_filtro = str(self.request.query_params.get('estatus', '')) # 🔥 NUEVO FILTRO PARA EL HISTORIAL

        if user_rfc in ['null', 'undefined', 'None', '']:
            user_rfc = None

        queryset = Pedido.objects.all().order_by('-id_pedido')

        # 🔥 SI EL FRONTEND PIDE UN ESTATUS EN ESPECÍFICO, LO APLICAMOS
        if estatus_filtro:
            queryset = queryset.filter(estatus=estatus_filtro)

        if user_rol in ['2', '3']:
            return queryset

        if user_rol == '4' and user_rfc:
            user_rfc_limpio = user_rfc.strip()
            from django.db import connection
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT id_pedido FROM pedido WHERE rfc = %s", [user_rfc_limpio])
                    resultados = cursor.fetchall()
                    ids_permitidos = [fila[0] for fila in resultados]
                return queryset.filter(id_pedido__in=ids_permitidos)
            except Exception:
                try:
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT id_pedido FROM pedido WHERE rfc_id = %s", [user_rfc_limpio])
                        resultados = cursor.fetchall()
                        ids_permitidos = [fila[0] for fila in resultados]
                    return queryset.filter(id_pedido__in=ids_permitidos)
                except Exception as inner_e:
                    return Pedido.objects.none()

        return Pedido.objects.none()

    # ... tu método create() se queda exactamente igual ...

    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                fecha = data.get('fecha_compra') or timezone.now().date()
                
                # Generación de ID para Pedido (esto sí mantenlo si quieres tu formato especial)
                year_str = str(fecha)[:4]
                base_id = int(year_str) * 1000000
                max_pedido = Pedido.objects.filter(id_pedido__gte=base_id, id_pedido__lt=base_id + 1000000).aggregate(Max('id_pedido'))['id_pedido__max']
                nuevo_id = (max_pedido or base_id) + 1
                
                rfc_recibido = data.get('rfc') or data.get('proveedor') or data.get('rfc_id')
                instancia_proveedor = Proveedor.objects.filter(rfc=rfc_recibido).first()

                if not instancia_proveedor:
                    return Response({"error": "Proveedor no válido"}, status=status.HTTP_400_BAD_REQUEST)

                pedido = Pedido.objects.create(
                    id_pedido=nuevo_id,
                    descripcion=data.get('descripcion', ''),
                    total_compra=data.get('total_compra', 0),
                    estatus=data.get('estatus', '1'),
                    id_usuario_id=data.get('id_usuario'),
                    fecha_compra=fecha,
                    rfc=instancia_proveedor  
                )

                detalles = data.get('detalles', [])
                detalles_limpios = {}
                
                for d in detalles:
                    prod_id = str(d.get('id_producto') or d.get('producto'))
                    if prod_id in detalles_limpios:
                        detalles_limpios[prod_id]['cantidad'] += int(d.get('cantidad', 1))
                        detalles_limpios[prod_id]['precio_subtotal'] += float(d.get('precio_subtotal', 0))
                    else:
                        detalles_limpios[prod_id] = {
                            'cantidad': int(d.get('cantidad', 1)),
                            'precio_unitario': float(d.get('precio_unitario', 0)),
                            'precio_subtotal': float(d.get('precio_subtotal', 0))
                        }

                for prod_id, info in detalles_limpios.items():
                    # 🔥 AQUÍ ESTÁ EL CAMBIO: Quitamos la lógica de 'max_detalle' y el 'id'
                    DetallePedido.objects.create(
                        id_pedido=pedido, # Pasamos la instancia del pedido
                        id_producto_id=prod_id,
                        cantidad=info['cantidad'],
                        precio_unitario=info['precio_unitario'],
                        precio_subtotal=info['precio_subtotal'],
                        estatus='1'
                    )
            
            return Response({"message": "Pedido creado", "id_pedido": nuevo_id}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            import traceback
            traceback.print_exc() 
            return Response({"error": f"Fallo en BD: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# ENDPOINTS PERSONALIZADOS (@api_view)
# ==========================================

@api_view(['GET'])
def lista_pedidos(request):
    pedidos = Pedido.objects.all().order_by('-fecha_compra', '-id_pedido')
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def detalles_pedido(request, id_pedido):
    detalles = DetallePedido.objects.filter(id_pedido=id_pedido)
    serializer = DetallePedidoSerializer(detalles, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def movimientos_recientes(request):

    movimientos = []
    ultimos_pedidos = Pedido.objects.all().order_by('-id_pedido')[:20]
    accion = ""

    for pedido in ultimos_pedidos:
        tipo_alerta = "INFO"
        accion = "Solicitud de Resurtido B2B"

        if pedido.estatus == '1':
            tipo_alerta = "WARNING"
            accion = "Pedido pendiente"
        elif pedido.estatus == '2':
            tipo_alerta = "INFO"
            accion = "Pedido enviado"
        elif pedido.estatus == '3':
            tipo_alerta = "SUCCESS"
            accion = "Pedido entregado"
        elif pedido.estatus == '4':
            tipo_alerta = "ALERTA"
            accion = "Pedido cancelado"

        nombre_usuario = "Empleado del sistema"

        if pedido.id_usuario:
            nombre_usuario = (
                f"{pedido.id_usuario.nombre_usuario} "
                f"({pedido.id_usuario.id_usuario})"
            )

        movimientos.append({
            "fecha_hora": pedido.fecha_compra.strftime("%Y-%m-%d %H:%M"),
            "usuario": nombre_usuario,
            "accion": accion,
            "tipo": tipo_alerta,
            "detalle":
                f"Se generó la orden #{pedido.id_pedido} "
                f"para el proveedor {pedido.rfc} "
                f"por un total de ${pedido.total_compra}"
        })

    return Response(movimientos)

@api_view(['POST'])
def login_usuario(request):
    correo = request.data.get('correo')
    contrasena = request.data.get('contrasena')

    try:
        usuario = Usuario.objects.get(correo=correo)
        if check_password(contrasena, usuario.contrasena):
            
            rfc_asignado = None
            
            if str(usuario.rol) == '4':
                # 🚀 OPCIÓN TERMINATOR RESTAURADA: Verifica ambas posibles columnas para que nunca falle
                from django.db import connection
                with connection.cursor() as cursor:
                    try:
                        cursor.execute("SELECT rfc FROM proveedor WHERE id_usuario_id = %s", [usuario.id_usuario])
                        fila = cursor.fetchone()
                    except Exception:
                        fila = None
                        
                    if not fila:
                        try:
                            cursor.execute("SELECT rfc FROM proveedor WHERE id_usuario = %s", [usuario.id_usuario])
                            fila = cursor.fetchone()
                        except Exception:
                            fila = None

                    if fila:
                        rfc_asignado = fila[0]
                        print(f"\n✅ LOGIN SQL EXITOSO: RFC encontrado -> {rfc_asignado}")
                    else:
                        print(f"\n❌ ERROR LOGIN: No hay proveedor con id_usuario '{usuario.id_usuario}' en la BD.")

            return Response({
                'id_usuario': usuario.id_usuario,
                'nombre_usuario': usuario.nombre_usuario,
                'correo': usuario.correo,
                'rol': usuario.rol,
                'rfc': rfc_asignado  
            }, status=status.HTTP_200_OK)
            
        else:
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except Usuario.DoesNotExist:
        return Response({'error': 'El correo no está registrado'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def crear_pedido(request):
    data = request.data
    try:
        with transaction.atomic():
            # 1. Crear el Pedido
            # Quitamos el cálculo manual de ID. Si tu tabla es Serial/Auto, 
            # al no enviar el ID, la base de datos lo asigna sola.
            fecha = data.get('fecha_compra') or timezone.now().date()
            
            pedido = Pedido.objects.create(
                rfc_id=data.get('rfc'),
                descripcion=data.get('descripcion', ''),
                total_compra=data.get('total_compra', 0),
                estatus=data.get('estatus', '1'),
                id_usuario_id=data.get('id_usuario'),
                fecha_compra=fecha
            )

            # 2. Procesar detalles
            detalles = data.get('detalles', [])
            detalles_limpios = {}
            
            for d in detalles:
                prod_id = str(d['id_producto'])
                if prod_id in detalles_limpios:
                    detalles_limpios[prod_id]['cantidad'] += int(d.get('cantidad', 1))
                    detalles_limpios[prod_id]['precio_subtotal'] += float(d.get('precio_subtotal', 0))
                else:
                    detalles_limpios[prod_id] = {
                        'cantidad': int(d.get('cantidad', 1)),
                        'precio_unitario': float(d.get('precio_unitario', 0)),
                        'precio_subtotal': float(d.get('precio_subtotal', 0))
                    }

            # 3. Crear detalles usando el objeto 'pedido' que acabamos de crear
            # ELIMINAMOS EL CÁLCULO DE MAX Y LA ASIGNACIÓN DE ID MANUAL
            for prod_id, info in detalles_limpios.items():
                DetallePedido.objects.create(
                    id_pedido=pedido, # Pasamos el objeto pedido directamente
                    id_producto_id=prod_id,
                    cantidad=info['cantidad'],
                    precio_unitario=info['precio_unitario'],
                    precio_subtotal=info['precio_subtotal'],
                    estatus='1'
                )

        return Response({"message": "Pedido creado con éxito", "id_pedido": pedido.id_pedido}, status=201)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Fallo en BD: {str(e)}"}, status=400)

@api_view(['POST'])
def crear_usuario_por_admin(request):
    try:
        nombre_recibido = request.data.get('nombre') 
        correo = request.data.get('correo')
        rol = request.data.get('rol') 
        proveedor_rfc = request.data.get('proveedor_rfc')

        if not nombre_recibido or not correo or not rol:
            return Response({"error": "Faltan datos obligatorios (nombre, correo o rol)"}, status=400)

        if Usuario.objects.filter(correo=correo).exists():
            return Response({"error": "Ya existe un usuario registrado con este correo"}, status=400)

        password_generada = get_random_string(length=8)
        nuevo_id = str(int(time.time())) 
        
        nuevo_usuario = Usuario.objects.create(
            id_usuario=nuevo_id,                  
            nombre_usuario=nombre_recibido,       
            correo=correo,
            rol=rol,
            contrasena=make_password(password_generada),             
            fecha_registro=timezone.now()         
        )

        if str(rol) == "4" and proveedor_rfc:
            print(f"\n---> INYECTANDO SQL: RFC={proveedor_rfc} | Usuario={nuevo_usuario.id_usuario} | Correo={correo}")
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    UPDATE proveedor 
                    SET id_usuario = %s, correo = %s
                    WHERE rfc = %s
                """, [nuevo_usuario.id_usuario, correo, proveedor_rfc])
                
            print(f"✅ INYECCIÓN SQL COMPLETADA PARA {proveedor_rfc}")

        return Response({
            "success": True, 
            "mensaje": f"Usuario {nombre_recibido} creado exitosamente como {'Empleado' if str(rol) == '2' else 'Proveedor'}",
            "password_temporal": password_generada
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
def crear_orden_completa(request):
    try:
        data = request.data
        id_usuario = data.get('id_usuario')
        direccion_envio = data.get('direccion_envio')
        metodo_pago = data.get('metodo_pago')
        productos = data.get('productos', [])

        if not id_usuario or not productos:
            return Response({"error": "Datos incompletos"}, status=400)

        if metodo_pago == "3":  # OXXO
            estatus_orden = "1"   
            estatus_cobro = "3"   
            descontar_stock = False
        else:                   # Tarjeta
            estatus_orden = "1"   
            estatus_cobro = "1"   
            descontar_stock = True

        with transaction.atomic():
            base_id = 2026000000
            max_orden = Orden.objects.filter(id_orden__gte=base_id).aggregate(Max('id_orden'))['id_orden__max']
            nuevo_id_orden = (max_orden or base_id) + 1
            total_orden = 0
            productos_db = []

            for item in productos:
                producto = Producto.objects.select_for_update().get(id_producto=item['id_producto'])
                cantidad = int(item.get('cantidad', 1))

                if descontar_stock and producto.stock < cantidad:
                    return Response({"error": f"Stock insuficiente: {producto.nombre}"}, status=400)

                subtotal = float(producto.precio) * cantidad
                total_orden += subtotal
                productos_db.append((producto, cantidad, subtotal))

            if not productos_db:
                return Response({"error": "Carrito vacío"}, status=400)

            # 🔥 SOLUCIÓN AL TRIGGER DE LA ORDEN
            current_year = timezone.now().year
            base_id = current_year * 1000000
            
            max_orden = Orden.objects.filter(id_orden__gte=base_id, id_orden__lt=base_id + 1000000).aggregate(Max('id_orden'))['id_orden__max']
            nuevo_id_orden = (max_orden or base_id) + 1

            nueva_orden = Orden.objects.create(
                id_orden=nuevo_id_orden,
                descripcion="Compra desde frontend",
                estatus=estatus_orden,
                fecha_creacion=timezone.now(),
                total_orden=total_orden,
                direccion_envio=direccion_envio,
                id_usuario_id=id_usuario
            )

            for producto, cantidad, subtotal in productos_db:
                DetalleOrden.objects.create(
                    precio_subtotal=subtotal, 
                    cantidad=cantidad, 
                    precio_unitario=producto.precio,
                    estatus="1", 
                    id_producto=producto, 
                    id_orden=nueva_orden
                )
                if descontar_stock:
                    producto.stock -= cantidad
                    producto.save()

            referencia = f"REF-{int(timezone.now().timestamp())}"
            
            # Aplicamos la misma lógica para evitar que el cobro choque
            max_cobro = Cobro.objects.filter(id_cobro__gte=base_id, id_cobro__lt=base_id + 1000000).aggregate(Max('id_cobro'))['id_cobro__max']
            nuevo_id_cobro = (max_cobro or base_id) + 1
            
            Cobro.objects.create(
                id_cobro=nuevo_id_cobro,
                referencia_pago=referencia, 
                estatus=estatus_cobro, 
                fecha_cobro=timezone.now(), 
                metodo_pago=metodo_pago, 
                monto=total_orden, 
                id_orden=nueva_orden
            )

            carrito = Carrito.objects.filter(id_usuario_id=id_usuario).first()
            if carrito:
                DetalleCarrito.objects.filter(id_carrito=carrito).delete()

        return Response({"success": True, "id_orden": nuevo_id_orden, "estatus": estatus_orden, "referencia": referencia}, status=201)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def pedidos_usuario(request, id_usuario):
    pedidos = Orden.objects.filter(id_usuario_id=id_usuario).order_by('-fecha_creacion')
    data = []
    for pedido in pedidos:
        data.append({
            "id": pedido.id_orden, "fecha": pedido.fecha_creacion, "total": pedido.total_orden,
            "direccion": pedido.direccion_envio, "estatus": pedido.estatus
        })
    return Response(data)

@api_view(['GET'])
def detalle_orden(request, id_orden):
    try:
        from .models import Orden, DetalleOrden
        orden = Orden.objects.get(id_orden=id_orden)
        
        datos_cliente = {
            "nombre": orden.id_usuario.nombre_usuario, 
            "correo": orden.id_usuario.correo,
            "telefono": "No registrado", 
            "direccion": orden.direccion_envio, 
        }
        
        detalles = DetalleOrden.objects.filter(id_orden_id=id_orden)
        productos_data = [
            {
                "producto": d.id_producto.nombre,
                "cantidad": d.cantidad,
                "precio": float(d.id_producto.precio),
                "subtotal": float(
                    d.cantidad * d.id_producto.precio
                ),
            }
            for d in detalles
        ]
        return Response({"cliente": datos_cliente, "productos": productos_data})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
def agregar_carrito(request):
    try:
        id_usuario = request.data.get('id_usuario')
        id_producto = request.data.get('id_producto')
        cantidad = int(request.data.get('cantidad', 1))

        try:
            usuario = Usuario.objects.get(id_usuario=id_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no existe"}, status=404)

        carrito = Carrito.objects.filter(id_usuario=usuario).first()
        if not carrito:
            carrito = Carrito.objects.create(id_usuario=usuario, fecha_creacion=timezone.now())

        try:
            producto = Producto.objects.get(id_producto=id_producto)
        except Producto.DoesNotExist:
            return Response({"error": "Producto no existe"}, status=404)

        if hasattr(producto, "precio_final") and producto.precio_final:
            precio = producto.precio_final or producto.precio
        elif hasattr(producto, "precio") and producto.precio:
            precio = producto.precio
        else:
            return Response({"error": "Producto sin precio válido"}, status=400)

        detalle = DetalleCarrito.objects.filter(id_carrito=carrito, id_producto=producto).first()

        if detalle:
            detalle.cantidad += cantidad
            detalle.save()
        else:
            DetalleCarrito.objects.create(id_carrito=carrito, id_producto=producto, cantidad=cantidad, precio_unitario=precio)

        return Response({"success": True})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def obtener_carrito(request, id_usuario):
    try:
        carrito = Carrito.objects.filter(id_usuario_id=id_usuario).first()
        if not carrito:
            return Response([])

        detalles = DetalleCarrito.objects.filter(id_carrito=carrito)
        data = []
        for d in detalles:
            producto = d.id_producto
            data.append({
                "id": producto.id_producto, "nombre": producto.nombre,
                "precio": float(d.precio_unitario), "cantidad": d.cantidad,
                "imagen": getattr(producto, "imagen", None)
            })
        return Response(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def eliminar_producto_carrito(request, id_usuario, id_producto):
    try:
        carrito = Carrito.objects.get(id_usuario_id=id_usuario)
        DetalleCarrito.objects.filter(id_carrito=carrito, id_producto_id=id_producto).delete()
        return Response({"success": True})
    except Carrito.DoesNotExist:
        return Response({"error": "Carrito no encontrado"}, status=404)

@api_view(['POST'])
def actualizar_cantidad_carrito(request):
    try:
        id_usuario = request.data.get('id_usuario')
        id_producto = request.data.get('id_producto')
        cantidad = int(request.data.get('cantidad'))

        carrito = Carrito.objects.get(id_usuario_id=id_usuario)
        detalle = DetalleCarrito.objects.get(id_carrito=carrito, id_producto_id=id_producto)

        if cantidad <= 0:
            detalle.delete()
        else:
            detalle.cantidad = cantidad
            detalle.save()

        return Response({"success": True})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def limpiar_carrito(request, id_usuario):
    try:
        carrito = Carrito.objects.get(id_usuario_id=id_usuario)
        DetalleCarrito.objects.filter(id_carrito=carrito).delete()
        return Response({"success": True})
    except Carrito.DoesNotExist:
        return Response({"success": True})

@api_view(['POST'])
def login_google(request):
    correo = request.data.get('correo')
    nombre = request.data.get('nombre')

    if not correo:
        return Response({"error": "Correo requerido"}, status=400)

    try:
        usuario = Usuario.objects.get(correo=correo)
        return Response({
            "id_usuario": usuario.id_usuario,
            "nombre_usuario": usuario.nombre_usuario,
            "correo": usuario.correo,
            "rol": usuario.rol
        })
    except Usuario.DoesNotExist:
        nuevo_usuario = Usuario.objects.create(
            id_usuario=str(int(datetime.now().timestamp())),
            nombre_usuario=nombre,
            correo=correo,
            contrasena=make_password("GOOGLE_AUTH"),
            rol='1',
            fecha_registro=datetime.now()
        )
        return Response({
            "id_usuario": nuevo_usuario.id_usuario,
            "nombre_usuario": nuevo_usuario.nombre_usuario,
            "correo": nuevo_usuario.correo,
            "rol": nuevo_usuario.rol
        })
    
@api_view(['PUT'])
def actualizar_usuario(request, id_usuario):
    try:
        usuario = Usuario.objects.get(id_usuario=id_usuario)
        usuario.nombre_usuario = request.data.get('nombre', usuario.nombre_usuario)
        usuario.save()

        return Response({
            "success": True,
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombre_usuario": usuario.nombre_usuario,
                "correo": usuario.correo,
                "rol": usuario.rol,
            }
        })
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def cancelar_orden(request, id_orden):
    try:
        orden = Orden.objects.get(id_orden=id_orden)
        
        if str(orden.estatus) == "4":
            return Response({"error": "Esta orden ya se encuentra cancelada."}, status=400)
            
        orden.estatus = "4"
        orden.save()

        return Response({
            "success": True, 
            "mensaje": f"La orden #{id_orden} ha sido cancelada exitosamente."
        }, status=200)

    except Orden.DoesNotExist:
        return Response({"error": "Orden no encontrada en la base de datos."}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(['PUT'])
def actualizar_estatus_orden(request, id_orden):
    try:
        orden = Orden.objects.get(id_orden=id_orden)
        nuevo_estatus = str(request.data.get('estatus'))

        if nuevo_estatus not in ["1", "2", "3", "4"]:
            return Response({"error": "Estatus inválido."}, status=400)

        orden.estatus = nuevo_estatus
        orden.save()

        return Response({
            "success": True, 
            "mensaje": f"El estatus de la orden #{id_orden} se actualizó correctamente."
        }, status=200)

    except Orden.DoesNotExist:
        return Response({"error": "Orden no encontrada en la base de datos."}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_password(request):
    correo = request.data.get('correo')
    if not correo:
        return Response({"error": "Correo requerido"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario = Usuario.objects.get(correo=correo)
        password_temporal = get_random_string(length=8)
        usuario.contrasena = make_password(password_temporal)
        usuario.save()

        # 🔥 COMENTAMOS EL ENVÍO DE CORREO TEMPORALMENTE
        # send_mail(...) 

        return Response({
            "success": True, 
            "mensaje": "Simulación: Correo enviado.", 
            "debug_password": password_temporal # Solo para probar que el resto funciona
        }, status=status.HTTP_200_OK)

    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt    
def cambiar_password(request):

    if request.method != "PUT":
        return JsonResponse(
            {"error": "Método no permitido"},
            status=405
        )

    try:

        data = json.loads(request.body)

        print("DATA:", data)

        usuario = Usuario.objects.get(
            id_usuario=data["id_usuario"]
        )

        print("USUARIO ENCONTRADO:", usuario.id_usuario)
        print("HASH EN BD:", usuario.contrasena)

        resultado = check_password(
            data["password_actual"],
            usuario.contrasena
        )

        print("CHECK PASSWORD:", resultado)

        if not check_password(
            data["password_actual"],
            usuario.contrasena
        ):

            return JsonResponse(
                {"error": "Contraseña actual incorrecta"},
                status=400
            )

        usuario.contrasena = make_password(
            data["password_nueva"]
        )

        usuario.save()

        return JsonResponse({
            "message": "Contraseña actualizada"
        })

    except Usuario.DoesNotExist:

        return JsonResponse(
            {"error": "Usuario no encontrado"},
            status=404
        )

    except Exception as e:

        return JsonResponse(
            {"error": str(e)},
            status=500
        )

    
@csrf_exempt
@api_view(['POST'])
def subir_imagen_cloudinary(request):
    try:
        file = request.FILES['imagen']
        # Subimos a Cloudinary
        upload_data = cloudinary.uploader.upload(file)
        return Response({"url": upload_data['secure_url']})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
def productos_mas_vendidos(request):

    try:

        productos = Producto.objects.filter(
            activo=True
        ).order_by('-id_producto')[:10]

        serializer = ProductoSerializer(
            productos,
            many=True
        )

        return Response(serializer.data)

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=500
        )