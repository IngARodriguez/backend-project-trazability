const { verificarCadena }  = require('../hash_utils');
const { leerDB }           = require('../data/store');

function auditarCliente(req, res) {
  const cliente_id = parseInt(req.params.cliente_id, 10);
  const db         = leerDB();

  const cliente = db.clientes.find(c => c.id === cliente_id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const pedidos   = db.pedidos.filter(p => p.cliente_id === cliente_id);
  const pedidoIds = pedidos.map(p => p.id);
  const entregas  = db.entregas.filter(e => pedidoIds.includes(e.pedido_id));
  const facturas  = db.facturas.filter(f => f.cliente_id === cliente_id);
  const inventario = db.inventario;

  const nombreProducto = (prod) =>
    inventario.find(i => i.producto === prod)?.nombre || prod;

  const precioProducto = (prod) =>
    inventario.find(i => i.producto === prod)?.precio || 0;

  // Construir bloques con datos completos para el frontend
  const todosLosBloques = [
    {
      id:            'reg-0',
      tipo:          'Registro',
      hash_anterior: '0'.repeat(64),
      hash_actual:   cliente.hash0,
      timestamp:     cliente.timestamp,
      descripcion:   `Registro de ${cliente.nombre}`,
      extra: {
        nombre:    cliente.nombre,
        documento: cliente.documento,
      },
    },

    ...pedidos.map(p => {
      const detalles = p.botellas.map(b => ({
        nombre:           nombreProducto(b.producto),
        cantidad:         b.cantidad,
        precio_unitario:  precioProducto(b.producto),
        subtotal:         precioProducto(b.producto) * b.cantidad,
      }));
      return {
        id:            `ped-${p.id}`,
        tipo:          'Pedido',
        hash_anterior: p.hash_anterior,
        hash_actual:   p.hash_actual,
        timestamp:     p.timestamp,
        descripcion:   `Mesa ${p.no_mesa} — ${detalles.map(d => `${d.cantidad}× ${d.nombre}`).join(', ')}`,
        extra: {
          no_mesa:     p.no_mesa,
          zona:        p.zona,
          detalles,
          monto_total: p.monto_total,
          metodo_pago: p.metodo_pago,
        },
      };
    }),

    ...entregas.map(e => ({
      id:            `ent-${e.id}`,
      tipo:          'Entrega',
      hash_anterior: e.hash_anterior,
      hash_actual:   e.hash_actual,
      timestamp:     e.time_entregada,
      descripcion:   `Entregado por mesero #${e.mesero_id}`,
      extra: {
        mesero_id:      e.mesero_id,
        time_solicitud: e.time_solicitud,
        time_entregada: e.time_entregada,
      },
    })),

    ...facturas.map(f => ({
      id:            `fac-${f.id}`,
      tipo:          'Factura',
      hash_anterior: f.hash_anterior,
      hash_actual:   f.hash_actual,
      timestamp:     f.time_pago,
      descripcion:   `Total $${f.monto_total.toFixed(2)} — Mesa ${f.no_mesa}`,
      extra: {
        no_mesa:        f.no_mesa,
        monto_total:    f.monto_total,
        time_solicitud: f.time_solicitud,
        time_entregada: f.time_entregada,
        time_pago:      f.time_pago,
      },
    })),
  ];

  // Reconstruir la cadena siguiendo los links de hash
  const porHashAnterior = {};
  for (const b of todosLosBloques) {
    porHashAnterior[b.hash_anterior] = b;
  }

  const cadena = [];
  let current  = porHashAnterior['0'.repeat(64)];
  const vistos = new Set();

  while (current && !vistos.has(current.id)) {
    vistos.add(current.id);
    cadena.push(current);
    current = porHashAnterior[current.hash_actual];
  }

  const resultado = verificarCadena(cadena);

  // Totales reales por pedido para el resumen
  const totalPedidos = pedidos.reduce((acc, p) => acc + (p.monto_total || 0), 0);

  return res.json({
    cliente_id,
    cliente:       cliente.nombre,
    documento:     cliente.documento,
    total_bloques: cadena.length,
    cadena_valida: resultado.valida,
    bloque_roto:   resultado.bloque_roto,
    total_pedidos: totalPedidos,
    mensaje: resultado.valida
      ? 'Cadena íntegra — no se detectaron alteraciones'
      : `ALERTA: cadena alterada en bloque ${resultado.bloque_roto}`,
    cadena,
  });
}

function listarClientes(req, res) {
  const db = leerDB();
  return res.json(db.clientes.map(c => ({ id: c.id, nombre: c.nombre, documento: c.documento })));
}

module.exports = { auditarCliente, listarClientes };
