from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CarritoViewSet,
    CategoriaViewSet,
    CobroViewSet,
    OrdenViewSet,
    PedidoViewSet,
    ProductoViewSet,
    ProveedorViewSet,
    SeccionExtranetViewSet,
    UsuarioViewSet,
    login_usuario,
    # 1. AGREGAMOS LAS DOS FUNCIONES NUEVAS AQUÍ:
    detalles_pedido,
    movimientos_recientes
)

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')
router.register(r'secciones-extranet', SeccionExtranetViewSet, basename='seccion-extranet')
router.register(r'carritos', CarritoViewSet, basename='carrito')
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'ordenes', OrdenViewSet, basename='orden')
router.register(r'cobros', CobroViewSet, basename='cobro')

urlpatterns = [
    # 2. AGREGAMOS LAS RUTAS CUSTOM ANTES DEL ROUTER
    path('pedidos/movimientos-recientes/', movimientos_recientes, name='movimientos-recientes'),
    path('pedidos/<int:id_pedido>/detalles/', detalles_pedido, name='detalles-pedido'),
    
    path('', include(router.urls)),
    path('login/', login_usuario, name='login_api'),
]