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
    pedidos_usuario,
    crear_orden_completa,
    detalle_orden,
    login_usuario,
    agregar_carrito,
    obtener_carrito,
    eliminar_producto_carrito,
    actualizar_cantidad_carrito,
    limpiar_carrito,
    detalles_pedido,
    movimientos_recientes,
    # 🔥 1. IMPORTAMOS LA NUEVA FUNCIÓN AQUÍ:
    crear_usuario_por_admin 
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
    
    # 🔥 3. AGREGAMOS LA RUTA DEL ADMIN AQUÍ (ANTES DEL ROUTER)
    path('usuarios/crear-admin/', crear_usuario_por_admin, name='crear-admin'),
    
    path('', include(router.urls)),
    path('login/', login_usuario, name='login_api'),
    path('checkout/', crear_orden_completa),
    path('mis-pedidos/<str:id_usuario>/', pedidos_usuario),
    path('detalle-orden/<int:id_orden>/', detalle_orden),
    path('carrito/agregar/', agregar_carrito),
    path('carrito/<str:id_usuario>/', obtener_carrito),
    path('carrito/eliminar/<str:id_usuario>/<int:id_producto>/', eliminar_producto_carrito),
    path('carrito/actualizar/', actualizar_cantidad_carrito),
    path('carrito/limpiar/<str:id_usuario>/', limpiar_carrito),
]