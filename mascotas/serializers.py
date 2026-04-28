from rest_framework import serializers
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
    DetallePedido,
)

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    # Declaramos el ID como solo lectura para que PostgreSQL lo genere solo
    id_producto = serializers.IntegerField(read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'contrasena': {'write_only': True}
        }

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class SeccionExtranetSerializer(serializers.ModelSerializer):
    # Para que PostgreSQL genere el ID automático del banner
    id_seccion = serializers.IntegerField(read_only=True)

    class Meta:
        model = SeccionExtranet
        fields = '__all__'

class CarritoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrito
        fields = '__all__'

class OrdenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orden
        fields = '__all__'

class CobroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cobro
        fields = '__all__'

# ==========================================
# SERIALIZADORES DE PEDIDOS B2B
# ==========================================
class PedidoSerializer(serializers.ModelSerializer):
    # Declaramos el ID explícitamente como "solo lectura" para que la BD lo genere
    id_pedido = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pedido
        fields = '__all__'

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = '__all__'