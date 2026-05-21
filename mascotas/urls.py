from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import subir_imagen_cloudinary
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
    login_google,
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
    actualizar_usuario,
    crear_usuario_por_admin,
    BannerPorPortalView,
    cancelar_orden,
    actualizar_estatus_orden,
    recuperar_password, 
    cambiar_password
)
from django.conf import settings
from django.conf.urls.static import static

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
    
    # 3. RUTAS DE ADMINISTRACIÓN Y ÓRDENES
    path('usuarios/crear-admin/', crear_usuario_por_admin, name='crear-admin'),
    
    # 4. RUTAS DE ÓRDENES
    path('ordenes/cancelar/<int:id_orden>/', cancelar_orden, name='cancelar-orden'),
    path('ordenes/actualizar-estatus/<int:id_orden>/', actualizar_estatus_orden, name='actualizar-estatus'),
    
    path('login/', login_usuario, name='login_api'),
    path('checkout/', crear_orden_completa),
    path('mis-pedidos/<str:id_usuario>/', pedidos_usuario),
    path('detalle-orden/<int:id_orden>/', detalle_orden),
    path('usuarios/actualizar/<str:id_usuario>/', actualizar_usuario),
    
    path('cart/agregar/', agregar_carrito),
    path('cart/eliminar/<str:id_usuario>/<int:id_producto>/', eliminar_producto_carrito),
    path('cart/actualizar/', actualizar_cantidad_carrito),
    path('cart/limpiar/<str:id_usuario>/', limpiar_carrito),
    path('cart/<str:id_usuario>/', obtener_carrito),
    path('usuarios/recuperar-password/', recuperar_password, name='recuperar-password'),
    path('usuarios/cambiar-password/', cambiar_password, name='cambiar-password'),
    path('login-google/', login_google),
    

    path('banners/<str:rol>/', BannerPorPortalView.as_view(), name='banners-portal'),
    path('subir-imagen/', subir_imagen_cloudinary, name='subir-imagen'),
    path('', include(router.urls)),
    
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)