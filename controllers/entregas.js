const { generarHash }             = require('../hash_utils');
const { leerDB, guardarDB, siguienteId } = require('../data/store');

function confirmarEntrega(req, res) {
  const { pedido_id, mesero_id } = req.body;

  if (!pedido_id || !mesero_id) {
    return res.status(400).json({ error: 'pedido_id y mesero_id son requeridos' });
  }

  const db     = leerDB();
  const pedido = db.pedidos.find(p => p.id === pedido_id);
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

  // --- HASH 2: Entrega ---
  const timeSolicitud = pedido.timestamp;
  const timeEntregada = new Date().toISOString();

  const datosEntrega = { pedido_id, mesero_id, timeSolicitud, timeEntregada };
  const hashEntrega  = generarHash(datosEntrega, pedido.hash_actual);

  const entrega = {
    id:             siguienteId(db, 'entregas'),
    pedido_id,
    mesero_id,
    time_solicitud: timeSolicitud,
    time_entregada: timeEntregada,
    hash_anterior:  pedido.hash_actual,
    hash_actual:    hashEntrega,
  };

  pedido.estado = 'entregado';
  db.entregas.push(entrega);

  // --- HASH 3: Factura (automática al entregar — solo este pedido) ---
  const cliente_id  = pedido.cliente_id;
  const monto_total = pedido.monto_total;
  const timePago    = new Date().toISOString();

  const datosFactura = {
    cliente_id,
    mesero_id,
    no_mesa:        pedido.no_mesa,
    monto_total,
    time_solicitud: pedido.timestamp,
    time_pago:      timePago,
  };
  const hashFactura = generarHash(datosFactura, hashEntrega);

  const factura = {
    id:             siguienteId(db, 'facturas'),
    cliente_id,
    mesero_id,
    no_mesa:        pedido.no_mesa,
    monto_total,
    time_solicitud: pedido.timestamp,
    time_entregada: timeEntregada,
    time_pago:      timePago,
    hash_anterior:  hashEntrega,
    hash_actual:    hashFactura,
  };

  db.facturas.push(factura);
  guardarDB(db);

  return res.status(201).json({ entrega, factura, hash_entrega: hashEntrega, hash_factura: hashFactura });
}

module.exports = { confirmarEntrega };
