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