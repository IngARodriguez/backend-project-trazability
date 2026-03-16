const { generarHash }             = require('../hash_utils');
const { leerDB, guardarDB, siguienteId } = require('../data/store');

function generarFactura(req, res) {
  const { cliente_id, mesero_id } = req.body;

  if (!cliente_id || !mesero_id) {
    return res.status(400).json({ error: 'cliente_id y mesero_id son requeridos' });
  }

  const db      = leerDB();
  const cliente = db.clientes.find(c => c.id === cliente_id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const pedidos = db.pedidos
    .filter(p => p.cliente_id === cliente_id)
    .sort((a, b) => a.id - b.id);

  if (!pedidos.length) {
    return res.status(400).json({ error: 'No hay pedidos para este cliente' });
  }

  const pedidoIds   = pedidos.map(p => p.id);
  const entregas    = db.entregas
    .filter(e => pedidoIds.includes(e.pedido_id))
    .sort((a, b) => b.id - a.id);

  if (!entregas.length) {
    return res.status(400).json({ error: 'No hay entregas confirmadas para este cliente' });
  }

  const ultimaEntrega = entregas[0];
  const hashAnterior  = ultimaEntrega.hash_actual;
  const monto_total   = pedidos.reduce((acc, p) => acc + (p.monto_total || 0), 0);
  const primerPedido  = pedidos[0];
  const timePago      = new Date().toISOString();

  const datos = {
    cliente_id,
    mesero_id,
    no_mesa:        primerPedido.no_mesa,
    monto_total,
    time_solicitud: primerPedido.timestamp,
    time_pago:      timePago,
  };

  const hash_actual = generarHash(datos, hashAnterior);

  const factura = {
    id:             siguienteId(db, 'facturas'),
    cliente_id,
    mesero_id,
    no_mesa:        primerPedido.no_mesa,
    monto_total,
    time_solicitud: primerPedido.timestamp,
    time_entregada: ultimaEntrega.time_entregada,
    time_pago:      timePago,
    hash_anterior:  hashAnterior,
    hash_actual,
  };

  db.facturas.push(factura);
  guardarDB(db);

  return res.status(201).json({ factura, pedidos, hash_final: hash_actual });
}

module.exports = { generarFactura };
