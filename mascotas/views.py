from rest_framework import viewsets
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
    # Contamos cuántos pedidos ya fueron procesados por el proveedor (Estatus 2, 3 o 4) [cite: 25]
    # En un sistema en producción, cruzarías esto con una tabla de "notificaciones leídas"
    conteo_movimientos = Pedido.objects.filter(estatus__in=['2', '3', '4']).count()
    
    return Response({
        "nuevos_movimientos": conteo_movimientos
    })

@api_view(['POST'])
def login_usuario(request):
    correo = request.data.get('correo')
    contrasena = request.data.get('contrasena')

    try:
        # 1. Buscamos al usuario por su correo
        usuario = Usuario.objects.get(correo=correo)

        # 2. Verificamos que la contraseña coincida 
        # (Nota para tu amigo: En el futuro, aquí se debería usar check_password() para contraseñas encriptadas)
        if usuario.contrasena == contrasena:
            # 3. Si todo está bien, devolvemos los datos del usuario
            return Response({
                'id_usuario': usuario.id_usuario,
                'nombre_usuario': usuario.nombre_usuario,
                'correo': usuario.correo,
                'rol': usuario.rol
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)

    except Usuario.DoesNotExist:
        return Response({'error': 'El correo no está registrado'}, status=status.HTTP_404_NOT_FOUND)