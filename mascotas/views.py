from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction, connection
import random
import time
from django.db.models import Max
from rest_framework.generics import ListAPIView
from django.db.models import Sum
from rest_framework.decorators import action
from datetime import datetime
from django.contrib.auth.hashers import check_password, make_password
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings

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

from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer

    # 🚀 1. CONTROL DE VISIBILIDAD DE DATOS (Data Isolation)
    def get_queryset(self):
        user_rol = self.request.query_params.get('rol', None)
        user_rfc = self.request.query_params.get('rfc', None)

        queryset = Producto.objects.all().order_by('-id_producto')

        # Clientes (1), Empleados (2), Admins (3) o público general ven todo el catálogo
        if user_rol in ['1', '2', '3'] or not user_rol:
            return queryset

        # Proveedores (4) solo ven sus propios productos
        if user_rol == '4' and user_rfc:
            # ⚠️ Asumimos que tu modelo Producto tiene un campo llamado 'rfc' (o ajústalo al nombre real)
            return queryset.filter(rfc_id=user_rfc)

        return Producto.objects.none()

    # 🚀 2. SOBREESCRIBIMOS LA CREACIÓN PARA INVENTAR EL CÓDIGO Y SELLAR EL DUEÑO
    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            # 1. Buscamos el ID más alto y le sumamos 1
            ultimo_producto = Producto.objects.all().order_by('-id_producto').first()
            # Si no hay productos, empezamos desde el 9000000000000
            nuevo_id = (ultimo_producto.id_producto + 1) if ultimo_producto else 9000000000000

            # 2. Creamos el producto forzando el ID nuevo
            nuevo_producto = Producto.objects.create(
                id_producto=nuevo_id,
                nombre=data.get('nombre'),
                descripcion=data.get('descripcion', ''),
                precio=data.get('precio', 0),
                stock=data.get('stock', True),
                imagen=data.get('imagen', ''),
                activo=data.get('activo', True),
                id_categoria_id=data.get('id_categoria'),
                
                # 🔥 CLAVE: Guardamos a qué proveedor le pertenece este producto
                rfc_id=data.get('rfc') 
            )

            return Response({"message": "¡Producto agregado con éxito!", "id_producto": nuevo_id}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def mas_vendidos(self, request):
        productos = (
            DetalleOrden.objects
            .values('id_producto')
            .annotate(
                total_vendido=Sum('cantidad')
            )
            .order_by('-total_vendido')[:12]
        )

        data = []
        for item in productos:
            try:
                producto = Producto.objects.get(
                    id_producto=item['id_producto']
                )
                data.append({
                    "id_producto": producto.id_producto,
                    "nombre": producto.nombre,
                    "precio": producto.precio,
                    "imagen": producto.imagen,
                    "stock": producto.stock,
                    "activo": producto.activo,
                    "total_vendido": item['total_vendido']
                })
            except Producto.DoesNotExist:
                continue

        return Response(data)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

class SeccionExtranetViewSet(viewsets.ModelViewSet):
    serializer_class = SeccionExtranetSerializer

    # 🚀 CONTROL DE VISIBILIDAD DE BANNERS (Data Isolation)
    def get_queryset(self):
        user_rol = self.request.query_params.get('rol', None)
        
        # Ordenamos los banners del más reciente al más antiguo
        queryset = SeccionExtranet.objects.all().order_by('-id_seccion')

        # 👑 Administrador (3): Tiene control total, ve absolutamente todos los banners
        if user_rol == '3':
            return queryset

        # 👷 Empleado (2): Solo ve los banners del panel operativo
        if user_rol == '2':
            return queryset.filter(portal_destino='2')

        # 📦 Proveedor/Extranet (4): Solo ve los banners dirigidos a proveedores
        if user_rol == '4':
            return queryset.filter(portal_destino='4')

        # 👤 Cliente (1) o Público: Solo ve los banners activos de la tienda principal
        if user_rol == '1' or not user_rol:
            return queryset.filter(portal_destino='1', estatus=True)

        return SeccionExtranet.objects.none()

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

class OrdenViewSet(viewsets.ModelViewSet):
    serializer_class = OrdenSerializer

    # 🚀 CONTROL DE VISIBILIDAD DE DATOS (Data Isolation)
    def get_queryset(self):
        # Capturamos quién está haciendo la petición desde React
        user_rol = self.request.query_params.get('rol', None)
        user_id = self.request.query_params.get('id_usuario', None)

        # Preparamos la consulta base ordenada desde la más reciente
        # (Si tu modelo tiene fecha_creacion, puedes cambiar '-id_orden' por '-fecha_creacion')
        queryset = Orden.objects.all().order_by('-id_orden')

        # 🏪 Empleados (2) y Administradores (3) tienen acceso total para despachar
        if user_rol in ['2', '3']:
            return queryset

        # 👤 Clientes (1) solo pueden ver sus propias compras
        if user_rol == '1' and user_id:
            return queryset.filter(id_usuario_id=user_id)

        # 🔒 Por privacidad, los Proveedores (4) u otros roles NO ven las órdenes de clientes finales
        return Orden.objects.none()

class CobroViewSet(viewsets.ModelViewSet):
    queryset = Cobro.objects.all()
    serializer_class = CobroSerializer

# ✅ CÓDIGO NUEVO (Cópialo y pégalo)
class BannerPorPortalView(ListAPIView):
    serializer_class = SeccionExtranetSerializer

    def get_queryset(self):
        # Capturamos el rol que nos pide React desde la URL
        rol_solicitado = self.kwargs.get('rol', '4') 
        
        return SeccionExtranet.objects.filter(
            estatus=True,
            portal_destino=rol_solicitado # Filtramos por el rol
        ).order_by('-id_seccion')

# ==========================================
# VIEWSET DE PEDIDOS (CON LÓGICA DE DETALLES)
# ==========================================

class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer

    # 🚀 1. CONTROL DE VISIBILIDAD DE DATOS (Data Isolation)
    def get_queryset(self):
        # Capturamos el rol y el RFC desde los parámetros de consulta (Query Params) de la URL
        user_rol = self.request.query_params.get('rol', None)
        user_rfc = self.request.query_params.get('rfc', None)

        # Base de consulta ordenada por el pedido más reciente
        queryset = Pedido.objects.all().order_by('-id_pedido')

        # Si el usuario es Operativo/Empleado (2) o Administrador (3), tiene acceso total
        if user_rol in ['2', '3']:
            return queryset

        # Si el usuario es un Proveedor de la Extranet (4), filtramos estrictamente por su RFC
        if user_rol == '4' and user_rfc:
            return queryset.filter(rfc_id=user_rfc)

        # Por seguridad, si no se especifican roles válidos o no hay sesión activa, 
        # devolvemos un conjunto vacío para proteger la base de datos de filtraciones
        return Pedido.objects.none()

    # 📦 2. TU MÉTODO DE CREACIÓN ATÓMICA DE PEDIDOS
    def create(self, request, *args, **kwargs):
        data = request.data
        try:
            with transaction.atomic():
                # 🚀 1. FORZAMOS UN ID NUEVO MANUALMENTE
                ultimo_pedido = Pedido.objects.all().order_by('-id_pedido').first()
                nuevo_id = (ultimo_pedido.id_pedido + 1) if ultimo_pedido else 1

                # 2. Gestión de fecha
                fecha = data.get('fecha_compra')
                if not fecha:
                    fecha = timezone.now().date()

                # 3. Creamos la cabecera CON el nuevo ID
                pedido = Pedido.objects.create(
                    id_pedido=nuevo_id,
                    rfc_id=data.get('rfc'),
                    descripcion=data.get('descripcion', ''),
                    total_compra=data.get('total_compra', 0),
                    estatus=data.get('estatus', '1'),
                    id_usuario_id=data.get('id_usuario'),
                    fecha_compra=fecha
                )

                # 4. Escudo Anti-Duplicados para los productos
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

                # 5. Guardamos en DetallePedido
                for prod_id, info in detalles_limpios.items():
                    DetallePedido.objects.create(
                        id_pedido_id=nuevo_id,
                        id_producto_id=prod_id,
                        cantidad=info['cantidad'],
                        precio_unitario=info['precio_unitario'],
                        precio_subtotal=info['precio_subtotal'],
                        estatus='1'
                    )
            
            return Response({"message": "Pedido y detalles creados con éxito", "id_pedido": nuevo_id}, status=status.HTTP_201_CREATED)
        
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
    
    for pedido in ultimos_pedidos:
        tipo_alerta = "INFO"
        if pedido.estatus == '1':
            tipo_alerta = "ALERTA" 
            
        movimientos.append({
            "fecha_hora": str(pedido.fecha_compra),
            "usuario": str(pedido.id_usuario) if pedido.id_usuario else "Empleado del sistema",
            "accion": "Solicitud de Resurtido B2B",
            "tipo": tipo_alerta,
            "detalle": f"Se generó la orden #{pedido.id_pedido} para el proveedor {pedido.rfc} por un total de ${pedido.total_compra}"
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
            if usuario.rol == '4':
                if usuario.id_usuario == 'EXT0000000001':
                    rfc_asignado = 'DPG260401A1B'

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
            # 🚀 1. FORZAMOS EL ID SEGURO USANDO MATEMÁTICAS (MAX)
            max_pedido = Pedido.objects.aggregate(Max('id_pedido'))['id_pedido__max']
            nuevo_id = (max_pedido or 0) + 1

            fecha = data.get('fecha_compra')
            if not fecha:
                fecha = timezone.now().date()

            pedido = Pedido.objects.create(
                id_pedido=nuevo_id,
                rfc_id=data.get('rfc'),
                descripcion=data.get('descripcion', ''),
                total_compra=data.get('total_compra', 0),
                estatus=data.get('estatus', '1'),
                id_usuario_id=data.get('id_usuario'),
                fecha_compra=fecha
            )

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

            for prod_id, info in detalles_limpios.items():
                max_detalle = DetallePedido.objects.aggregate(Max('pk'))['pk__max']
                nuevo_id_detalle = (max_detalle or 0) + 1

                DetallePedido.objects.create(
                    id=nuevo_id_detalle, 
                    id_pedido_id=nuevo_id,
                    id_producto_id=prod_id,
                    cantidad=info['cantidad'],
                    precio_unitario=info['precio_unitario'],
                    precio_subtotal=info['precio_subtotal'],
                    estatus='1'
                )

        return Response({"message": "Pedido creado con éxito", "id_pedido": nuevo_id}, status=201)
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

        return Response({
            "success": True, 
            "mensaje": f"Usuario {nombre_recibido} creado exitosamente como {'Empleado' if rol == '2' else 'Proveedor'}",
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

            max_orden = Orden.objects.aggregate(Max('id_orden'))['id_orden__max']
            nuevo_id_orden = (max_orden or 0) + 1

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
            
            max_cobro = Cobro.objects.aggregate(Max('id_cobro'))['id_cobro__max']
            nuevo_id_cobro = (max_cobro or 0) + 1
            
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
    detalles = DetalleOrden.objects.filter(id_orden_id=id_orden)
    data = []
    for d in detalles:
        data.append({
            "producto": d.id_producto.nombre, "cantidad": d.cantidad,
            "precio": d.precio_unitario, "subtotal": d.precio_subtotal
        })
    return Response(data)

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


# 🔥 FUNCIÓN DE CANCELAR ORDEN CORREGIDA 🔥
@api_view(['POST'])
def cancelar_orden(request, id_orden):
    try:
        orden = Orden.objects.get(id_orden=id_orden)
        
        if str(orden.estatus) == "0":
            return Response({"error": "Esta orden ya se encuentra cancelada."}, status=400)
            
        orden.estatus = "0"
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


# 🔥 NUEVA FUNCIÓN PARA QUE EL EMPLEADO ACTUALICE CUALQUIER ESTATUS 🔥
@api_view(['PUT'])
def actualizar_estatus_orden(request, id_orden):
    try:
        orden = Orden.objects.get(id_orden=id_orden)
        nuevo_estatus = str(request.data.get('estatus'))

        # Validamos que sea un estatus permitido (0=Cancelado, 1=Pendiente, 2=Enviado, 3=Entregado)
        if nuevo_estatus not in ["0", "1", "2", "3"]:
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
    
    from django.core.mail import send_mail # 🔥 IMPORTACIÓN CLAVE PARA EL ENVÍO REAL
from django.conf import settings

@api_view(['POST'])
def recuperar_password(request):
    correo = request.data.get('correo')

    if not correo:
        return Response({"error": "Debes proporcionar un correo electrónico."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Validamos si el usuario existe
        usuario = Usuario.objects.get(correo=correo)

        # 2. Generamos la nueva contraseña temporal alfanumérica
        password_temporal = get_random_string(length=8)

        # 3. Encriptamos y guardamos la nueva contraseña en la base de datos
        usuario.contrasena = make_password(password_temporal)
        usuario.save()

        # ==============================================================
        # 📧 DISPARO REAL DE CORREO ELECTRÓNICO VIA SMTP
        # ==============================================================
        asunto = 'Recuperación de contraseña - Ventas Perrunas'
        
        mensaje_cuerpo = (
            f"Hola, {usuario.nombre_usuario}.\n\n"
            f"Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.\n"
            f"Tu nueva contraseña temporal de acceso es:\n\n"
            f"👉   {password_temporal}   <---\n\n"
            f"Por razones de seguridad, te recomendamos cambiarla desde tu perfil "
            f"inmediatamente después de iniciar sesión.\n\n"
            f"Si no solicitaste este cambio, por favor ponte en contacto con soporte.\n\n"
            f"Saludos cordiales,\n"
            f"El equipo de Ventas Perrunas."
        )
        
        email_origen = settings.DEFAULT_FROM_EMAIL
        email_destino = [usuario.correo]

        # Envía el correo de manera síncrona. Si el SMTP falla, saltará al bloque except.
        send_mail(
            subject=asunto,
            message=mensaje_cuerpo,
            from_email=email_origen,
            recipient_list=email_destino,
            fail_silently=False # Si se cae la conexión SMTP, levantará una excepción para avisarte
        )

        return Response({
            "success": True,
            "mensaje": "Se ha enviado un correo electrónico con tu nueva contraseña temporal con éxito."
        }, status=status.HTTP_200_OK)

    except Usuario.DoesNotExist:
        # Mantenemos el mensaje genérico por seguridad contra ataques de enumeración de cuentas
        return Response({
            "error": "Si el correo está registrado en nuestro sistema, recibirás las instrucciones en tu bandeja de entrada."
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            "error": f"El usuario se actualizó, pero falló el envío del correo electrónico. Error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)