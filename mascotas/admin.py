from django.contrib import admin
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


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id_categoria', 'nombre', 'descripcion')
    search_fields = ('nombre', 'descripcion')
    list_per_page = 20


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('id_producto', 'nombre', 'precio', 'stock', 'activo', 'id_categoria')
    search_fields = ('nombre', 'descripcion')
    list_filter = ('activo', 'stock', 'id_categoria')
    list_per_page = 20


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_usuario', 'nombre_usuario', 'correo', 'rol', 'fecha_registro')
    search_fields = ('id_usuario', 'nombre_usuario', 'correo')
    list_filter = ('rol',)
    list_per_page = 20


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('rfc', 'nombre_empresa', 'telefono', 'correo', 'activo')
    search_fields = ('rfc', 'nombre_empresa', 'correo')
    list_filter = ('activo',)
    list_per_page = 20


@admin.register(SeccionExtranet)
class SeccionExtranetAdmin(admin.ModelAdmin):
    list_display = ('id_seccion', 'titulo_pagina', 'estatus', 'url_destino', 'id_usuario')
    search_fields = ('titulo_pagina', 'texto_bienvenida', 'url_destino')
    list_filter = ('estatus',)
    list_per_page = 20


@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ('id_carrito', 'fecha_creacion', 'id_usuario')
    search_fields = ('id_usuario__id_usuario', 'id_usuario__nombre_usuario')
    list_per_page = 20


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id_pedido', 'fecha_compra', 'estatus', 'total_compra', 'rfc', 'id_usuario')
    search_fields = ('id_pedido', 'descripcion', 'rfc__nombre_empresa', 'id_usuario__nombre_usuario')
    list_filter = ('estatus', 'fecha_compra')
    list_per_page = 20


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id_orden', 'fecha_creacion', 'estatus', 'total_orden', 'id_usuario')
    search_fields = ('id_orden', 'descripcion', 'direccion_envio', 'id_usuario__nombre_usuario')
    list_filter = ('estatus', 'fecha_creacion')
    list_per_page = 20


@admin.register(Cobro)
class CobroAdmin(admin.ModelAdmin):
    list_display = ('id_cobro', 'referencia_pago', 'estatus', 'metodo_pago', 'monto', 'id_orden')
    search_fields = ('id_cobro', 'referencia_pago')
    list_filter = ('estatus', 'metodo_pago', 'fecha_cobro')
    list_per_page = 20