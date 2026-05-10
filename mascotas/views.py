from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction, connection
import random
import time

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
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    # 🚀 SOBREESCRIBIMOS LA CREACIÓN PARA INVENTAR EL CÓDIGO DE BARRAS
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
                id_categoria_id=data.get('id_categoria') # Asignamos la categoría directamente
            )

            return Response({"message": "¡Producto agregado con éxito!", "id_producto": nuevo_id}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

class SeccionExtranetViewSet(viewsets.ModelViewSet):
    queryset = SeccionExtranet.objects.all()
    serializer_class = SeccionExtranetSerializer

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer

class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all()
    serializer_class = OrdenSerializer

class CobroViewSet(viewsets.ModelViewSet):
    queryset = Cobro.objects.all()
    serializer_class = CobroSerializer

# ==========================================
# VIEWSET DE PEDIDOS (CON LÓGICA DE DETALLES)
# ==========================================

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

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
        if usuario.contrasena == contrasena:
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
            # 🚀 1. FORZAMOS UN ID NUEVO MANUALMENTE
            ultimo_pedido = Pedido.objects.all().order_by('-id_pedido').first()
            nuevo_id = (ultimo_pedido.id_pedido + 1) if ultimo_pedido else 1

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
                DetallePedido.objects.create(
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

        nuevo_id = str(int(time.time())) 
        nuevo_usuario = Usuario.objects.create(
            id_usuario=nuevo_id,                  
            nombre_usuario=nombre_recibido,       
            correo=correo,
            rol=rol,
            contrasena='temporal123',             
            fecha_registro=timezone.now()         
        )

        return Response({
            "success": True, 
            "mensaje": f"Usuario {nombre_recibido} creado exitosamente como {'Empleado' if rol == '2' else 'Proveedor'}"
        })
    except Exception as e:
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

        if metodo_pago == "3":  
            estatus_orden = "1"   
            estatus_cobro = "3"   
            descontar_stock = False
        else:
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

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO orden (
                        descripcion, estatus, fecha_creacion, total_orden, direccion_envio, id_usuario
                    ) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id_orden
                """, ["Compra desde frontend", estatus_orden, timezone.now(), total_orden, direccion_envio, id_usuario])
                id_orden = cursor.fetchone()[0]

            for producto, cantidad, subtotal in productos_db:
                DetalleOrden.objects.create(
                    precio_subtotal=subtotal, cantidad=cantidad, precio_unitario=producto.precio,
                    estatus="1", id_producto=producto, id_orden_id=id_orden
                )
                if descontar_stock:
                    producto.stock -= cantidad
                    producto.save()

            referencia = f"REF-{int(timezone.now().timestamp())}"
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO cobro (
                        referencia_pago, estatus, fecha_cobro, metodo_pago, monto, id_orden
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """, [referencia, estatus_cobro, timezone.now(), metodo_pago, total_orden, id_orden])

            carrito = Carrito.objects.filter(id_usuario_id=id_usuario).first()
            if carrito:
                DetalleCarrito.objects.filter(id_carrito=carrito).delete()

        return Response({"success": True, "id_orden": id_orden, "estatus": estatus_orden, "referencia": referencia}, status=201)
    except Exception as e:
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

@api_view(['PUT'])
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