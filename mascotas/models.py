# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Carrito(models.Model):
    id_carrito = models.BigAutoField(primary_key=True)
    fecha_creacion = models.DateTimeField()
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')

    class Meta:
        managed = True
        db_table = 'carrito'


class Categoria(models.Model):
    id_categoria = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=50)
    descripcion = models.CharField(max_length=150, blank=True, null=True)
    imagen = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'categoria'


class Cobro(models.Model):
    id_cobro = models.BigIntegerField(primary_key=True)
    referencia_pago = models.CharField(unique=True, max_length=150)
    estatus = models.CharField(max_length=1)
    fecha_cobro = models.DateTimeField()
    metodo_pago = models.CharField(max_length=1)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    id_orden = models.OneToOneField('Orden', models.DO_NOTHING, db_column='id_orden')

    class Meta:
        managed = True
        db_table = 'cobro'


class DetalleCarrito(models.Model):
    pk = models.CompositePrimaryKey('id_carrito', 'id_producto')
    id_carrito = models.ForeignKey(Carrito, models.DO_NOTHING, db_column='id_carrito')
    id_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='id_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = True
        db_table = 'detalle_carrito'


class DetalleOrden(models.Model):
    pk = models.CompositePrimaryKey('id_orden', 'id_producto')
    id_orden = models.ForeignKey('Orden', models.DO_NOTHING, db_column='id_orden')
    id_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='id_producto')
    precio_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    estatus = models.CharField(max_length=1)

    class Meta:
        managed = True
        db_table = 'detalle_orden'


class DetallePedido(models.Model):
    pk = models.CompositePrimaryKey('id_pedido', 'id_producto')
    id_pedido = models.ForeignKey('Pedido', models.DO_NOTHING, db_column='id_pedido')
    id_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='id_producto')
    precio_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    cantidad = models.IntegerField()
    estatus = models.CharField(max_length=1)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = True
        db_table = 'detalle_pedido'


class Orden(models.Model):
    id_orden = models.BigIntegerField(primary_key=True)
    descripcion = models.CharField(max_length=150, blank=True, null=True)
    estatus = models.CharField(max_length=1)
    fecha_creacion = models.DateTimeField()
    total_orden = models.DecimalField(max_digits=12, decimal_places=2)
    direccion_envio = models.CharField(max_length=255)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')

    class Meta:
        managed = True
        db_table = 'orden'


class Pedido(models.Model):
    id_pedido = models.BigIntegerField(primary_key=True)
    descripcion = models.CharField(max_length=150, blank=True, null=True)
    fecha_compra = models.DateField()
    estatus = models.CharField(max_length=1)
    total_compra = models.DecimalField(max_digits=12, decimal_places=2)
    rfc = models.ForeignKey('Proveedor', models.DO_NOTHING, db_column='rfc')
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')

    class Meta:
        managed = True
        db_table = 'pedido'


class Producto(models.Model):
    id_producto = models.BigIntegerField(primary_key=True)
    nombre = models.CharField(max_length=40)
    descripcion = models.CharField(max_length=150, blank=True, null=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.BooleanField()
    imagen = models.CharField(max_length=255, blank=True, null=True)
    activo = models.BooleanField()
    id_categoria = models.ForeignKey(Categoria, models.DO_NOTHING, db_column='id_categoria')

    class Meta:
        managed = True
        db_table = 'producto'


class Proveedor(models.Model):
    rfc = models.CharField(primary_key=True, max_length=13)
    nombre_empresa = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    correo = models.CharField(max_length=150)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = True
        db_table = 'proveedor'


class SeccionExtranet(models.Model):
    id_seccion = models.BigAutoField(primary_key=True)
    titulo_pagina = models.CharField(max_length=100)
    imagen_banner = models.CharField(max_length=255, blank=True, null=True)
    texto_bienvenida = models.TextField(blank=True, null=True)
    estatus = models.BooleanField()
    url_destino = models.CharField(max_length=255, blank=True, null=True)
    id_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='id_usuario')

    class Meta:
        managed = True
        db_table = 'seccion_extranet'


class Usuario(models.Model):
    id_usuario = models.CharField(primary_key=True, max_length=13)
    nombre_usuario = models.CharField(max_length=150)
    contrasena = models.CharField(max_length=255)
    correo = models.CharField(max_length=150)
    rol = models.CharField(max_length=1)
    fecha_registro = models.DateTimeField()


    class Meta:
        managed = True
        db_table = 'usuario'
        
class Notificacion(models.Model):
    id_notificacion = models.BigAutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    mensaje = models.TextField()
    leida = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
