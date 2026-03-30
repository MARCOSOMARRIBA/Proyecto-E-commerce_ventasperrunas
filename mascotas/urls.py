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
    path('', include(router.urls)),
]