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