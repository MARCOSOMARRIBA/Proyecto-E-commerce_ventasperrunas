from rest_framework import viewsets
from django.utils import timezone
from .models import (
    Carrito,
    Categoria,
    Cobro,
    Orden,
    Pedido,
    Producto,
    Proveedor,
    SeccionExtranet,
    Usuario,
    DetalleOrden,
    DetalleCarrito
)
from .serializers import (
    CarritoSerializer,
    CategoriaSerializer,
    CobroSerializer,
    OrdenSerializer,
    PedidoSerializer,
    ProductoSerializer,
    ProveedorSerializer,
    SeccionExtranetSerializer,
    UsuarioSerializer,
)
from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction




class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


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


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer


class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all()
    serializer_class = OrdenSerializer


class CobroViewSet(viewsets.ModelViewSet):
    queryset = Cobro.objects.all()
    serializer_class = CobroSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario # Asegúrate de que tenga importado el modelo Usuario
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Pedido, DetallePedido
from .serializers import PedidoSerializer, DetallePedidoSerializer
import random


# 1. Endpoint: GET /api/pedidos/
@api_view(['GET'])
def lista_pedidos(request):
    # Traemos todos los pedidos, ordenados por los más recientes primero
    pedidos = Pedido.objects.all().order_by('-fecha_compra', '-id_pedido')
    serializer = PedidoSerializer(pedidos, many=True)
    return Response(serializer.data)

# 2. Endpoint: GET /api/pedidos/<id>/detalles/
@api_view(['GET'])
def detalles_pedido(request, id_pedido):
    # Buscamos solo los detalles que pertenezcan a este ID específico [cite: 26]
    detalles = DetallePedido.objects.filter(id_pedido=id_pedido)
    serializer = DetallePedidoSerializer(detalles, many=True)
    return Response(serializer.data)

# 3. Endpoint: GET /api/pedidos/movimientos-recientes/
@api_view(['GET'])
def movimientos_recientes(request):
    movimientos = []
    
    # 1. Obtenemos los últimos 20 pedidos registrados en la base de datos
    # Usamos '-id_pedido' para que los más nuevos salgan hasta arriba
    ultimos_pedidos = Pedido.objects.all().order_by('-id_pedido')[:20]
    
    for pedido in ultimos_pedidos:
        # Transformamos cada pedido al formato exacto que espera la tabla de React
        
        # Determinamos el color de la etiqueta visual basado en el estatus
        tipo_alerta = "INFO"
        if pedido.estatus == '1':
            tipo_alerta = "ALERTA" # Amarillo/Rojo para pedidos recién creados
            
        movimientos.append({
            "fecha_hora": str(pedido.fecha_compra),
            # Si en tu modelo Pedido tienes la relación al usuario, puedes poner pedido.id_usuario.nombre
            "usuario": str(pedido.id_usuario) if pedido.id_usuario else "Empleado del sistema",
            "accion": "Solicitud de Resurtido B2B",
            "tipo": tipo_alerta,
            "detalle": f"Se generó la orden #{pedido.id_pedido} para el proveedor {pedido.rfc} por un total de ${pedido.total_compra}"
        })
        
    # NOTA: En un futuro, aquí mismo puedes agregar consultas a la tabla de "Producto" 
    # u "Orden" para combinar todos los movimientos en esta misma lista.

    # Retornamos la lista (React la recibirá como un Array de objetos)
    return Response(movimientos)

@api_view(['POST'])
def login_usuario(request):
    correo = request.data.get('correo')
    contrasena = request.data.get('contrasena')

    try:
        usuario = Usuario.objects.get(correo=correo)

        if usuario.contrasena == contrasena:
            
            # ==============================================================
            # LÓGICA DE ROLES PARA EL RFC (Sin tocar la Base de Datos)
            # ==============================================================
            rfc_asignado = None
            
            # Si es un Proveedor de la Extranet (Rol 4)
            if usuario.rol == '4':
                # Asignamos el RFC dependiendo de quién inicie sesión.
                # Daniel Rosas (EXT0000000001) pertenece a Pet Premium del Golfo:
                if usuario.id_usuario == 'EXT0000000001':
                    rfc_asignado = 'DPG260401A1B'
                
                # Aquí puedes agregar más "elif" si en el futuro tienes más proveedores
                # elif usuario.id_usuario == 'EXT0000000002':
                #     rfc_asignado = 'OTRO_RFC...'

            # Devolvemos los datos. 
            # Los Administradores (Rol 3) recibirán "rfc": null, lo cual es correcto.
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
def crear_orden_completa(request):
    try:
        data = request.data

        id_usuario = data.get('id_usuario')
        direccion_envio = data.get('direccion_envio')
        metodo_pago = data.get('metodo_pago')
        productos = data.get('productos', [])

        if not id_usuario or not productos:
            return Response({"error": "Datos incompletos"}, status=400)

        # 🎯 DEFINIR ESTADOS
        if metodo_pago == "3":  # transferencia
            estatus_orden = "1"   # creada
            estatus_cobro = "3"   # pendiente
            descontar_stock = False
        else:
            estatus_orden = "1"   # completada
            estatus_cobro = "1"   # aprobado
            descontar_stock = True

        with transaction.atomic():

            total_orden = 0
            productos_db = []

            # 🔒 VALIDAR PRODUCTOS
            for item in productos:
                producto = Producto.objects.select_for_update().get(
                    id_producto=item['id_producto']
                )

                cantidad = int(item.get('cantidad', 1))

                if descontar_stock and producto.stock < cantidad:
                    return Response({
                        "error": f"Stock insuficiente: {producto.nombre}"
                    }, status=400)

                subtotal = float(producto.precio) * cantidad
                total_orden += subtotal

                productos_db.append((producto, cantidad, subtotal))

            # 🚨 VALIDACIÓN EXTRA
            if not productos_db:
                return Response({"error": "Carrito vacío"}, status=400)

            # 🧾 CREAR ORDEN
            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO orden (
                        descripcion,
                        estatus,
                        fecha_creacion,
                        total_orden,
                        direccion_envio,
                        id_usuario
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id_orden
                """, [
                    "Compra desde frontend",
                    estatus_orden,
                    timezone.now(),
                    total_orden,
                    direccion_envio,
                    id_usuario
                ])

                id_orden = cursor.fetchone()[0]

            # 📦 DETALLE
            for producto, cantidad, subtotal in productos_db:

                DetalleOrden.objects.create(
                    precio_subtotal=subtotal,
                    cantidad=cantidad,
                    precio_unitario=producto.precio,
                    estatus="1",
                    id_producto=producto,
                    id_orden_id=id_orden
                )

                # 🔻 SOLO TARJETA
                if descontar_stock:
                    producto.stock -= cantidad
                    producto.save()

            # 💳 COBRO
            referencia = f"REF-{int(timezone.now().timestamp())}"

            with connection.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO cobro (
                        referencia_pago,
                        estatus,
                        fecha_cobro,
                        metodo_pago,
                        monto,
                        id_orden
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, [
                    referencia,
                    estatus_cobro,
                    timezone.now(),
                    metodo_pago,
                    total_orden,
                    id_orden
                ])

            # 🧹 LIMPIAR CARRITO
            carrito = Carrito.objects.filter(id_usuario_id=id_usuario).first()
            if carrito:
                DetalleCarrito.objects.filter(id_carrito=carrito).delete()

        return Response({
            "success": True,
            "id_orden": id_orden,
            "estatus": estatus_orden,
            "referencia": referencia  # 🔥 IMPORTANTE PARA FRONTEND
        }, status=201)

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
            "id": pedido.id_orden,
            "fecha": pedido.fecha_creacion,
            "total": pedido.total_orden,
            "direccion": pedido.direccion_envio,
            "estatus": pedido.estatus
        })

    return Response(data)

@api_view(['GET'])
def detalle_orden(request, id_orden):
    detalles = DetalleOrden.objects.filter(id_orden_id=id_orden)

    data = []

    for d in detalles:
        data.append({
            "producto": d.id_producto.nombre,
            "cantidad": d.cantidad,
            "precio": d.precio_unitario,
            "subtotal": d.precio_subtotal
        })

    return Response(data)

@api_view(['POST'])
def agregar_carrito(request):
    try:
        id_usuario = request.data.get('id_usuario')
        id_producto = request.data.get('id_producto')
        cantidad = int(request.data.get('cantidad', 1))

        # 🔒 Validar usuario
        try:
            usuario = Usuario.objects.get(id_usuario=id_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no existe"}, status=404)

        # 🔥 Crear u obtener carrito
        carrito = Carrito.objects.filter(id_usuario=usuario).first()

        if not carrito:
            carrito = Carrito.objects.create(
                id_usuario=usuario,
                fecha_creacion=timezone.now()
            )

        # 🔒 Validar producto
        try:
            producto = Producto.objects.get(id_producto=id_producto)
        except Producto.DoesNotExist:
            return Response({"error": "Producto no existe"}, status=404)

        # 🔥 Precio correcto
        if hasattr(producto, "precio_final") and producto.precio_final:
            precio = producto.precio_final or producto.precio
        elif hasattr(producto, "precio") and producto.precio:
            precio = producto.precio
        else:
            return Response({"error": "Producto sin precio válido"}, status=400)

        # 🔥 Buscar detalle (PK compuesta)
        detalle = DetalleCarrito.objects.filter(
            id_carrito=carrito,
            id_producto=producto
        ).first()

        if detalle:
            detalle.cantidad += cantidad
            detalle.save()
        else:
            DetalleCarrito.objects.create(
                id_carrito=carrito,
                id_producto=producto,
                cantidad=cantidad,
                precio_unitario=precio
            )

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
                "id": producto.id_producto,
                "nombre": producto.nombre,
                "precio": float(d.precio_unitario),
                "cantidad": d.cantidad,
                "imagen": getattr(producto, "imagen", None)
            })

        return Response(data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            "error": str(e)
        }, status=500)

@api_view(['DELETE'])
def eliminar_producto_carrito(request, id_usuario, id_producto):
    try:
        carrito = Carrito.objects.get(id_usuario_id=id_usuario)

        DetalleCarrito.objects.filter(
            id_carrito=carrito,
            id_producto_id=id_producto
        ).delete()

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

        detalle = DetalleCarrito.objects.get(
            id_carrito=carrito,
            id_producto_id=id_producto
        )

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

@api_view(['GET'])
def mis_ordenes(request, id_usuario):
    ordenes = Orden.objects.filter(id_usuario_id=id_usuario).order_by('-fecha_creacion')
    serializer = OrdenSerializer(ordenes, many=True)
    return Response(serializer.data)

