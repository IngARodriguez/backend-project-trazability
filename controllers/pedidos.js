const { generarHash }             = require('../hash_utils');
const { leerDB, guardarDB, siguienteId } = require('../data/store');

function crearPedido(req, res) {
  const { cliente_id, no_mesa, zona, botellas, mezcladores, metodo_pago } = req.body;

  if (!cliente_id || !no_mesa || !botellas || !botellas.length) {
    return res.status(400).json({ error: 'cliente_id, no_mesa y botellas son requeridos' });
  }

  const db      = leerDB();
  const cliente = db.clientes.find(c => c.id === cliente_id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  // Verificar inventario para todos los productos
  for (const b of botellas) {
    const item = db.inventario.find(i => i.producto === b.producto);
    if (!item || item.cantidad < b.cantidad) {
      return res.status(400).json({ error: `Sin stock para: ${b.producto}` });
    }
  }

  // Obtener la punta más reciente de la cadena del cliente
  // Prioridad: factura > entrega > pedido > hash0
  const pedidosCliente = db.pedidos.filter(p => p.cliente_id === cliente_id);
  const pedidoIds      = pedidosCliente.map(p => p.id);

  const ultimaFactura  = db.facturas
    .filter(f => f.cliente_id === cliente_id)
    .sort((a, b) => b.id - a.id)[0];

  const ultimaEntrega  = db.entregas
    .filter(e => pedidoIds.includes(e.pedido_id))
    .sort((a, b) => b.id - a.id)[0];

  const ultimoPedido   = pedidosCliente.sort((a, b) => b.id - a.id)[0];

  let hashAnterior = cliente.hash0;
  if (ultimaFactura) hashAnterior = ultimaFactura.hash_actual;
  else if (ultimaEntrega) hashAnterior = ultimaEntrega.hash_actual;
  else if (ultimoPedido)  hashAnterior = ultimoPedido.hash_actual;

  // Calcular monto total usando precios del inventario
  let monto_total = 0;
  for (const b of botellas) {
    const item = db.inventario.find(i => i.producto === b.producto);
    monto_total += (item?.precio || 0) * b.cantidad;
  }

  // Generar hash del pedido
  const timestamp  = new Date().toISOString();
  const datos      = { cliente_id, no_mesa, zona: zona || '', botellas, mezcladores: mezcladores || [], timestamp };
  const hash_actual = generarHash(datos, hashAnterior);

  const pedido = {
    id:          siguienteId(db, 'pedidos'),
    cliente_id,
    no_mesa,
    zona:        zona || '',
    botellas,
    mezcladores: mezcladores || [],
    metodo_pago: metodo_pago || '',
    monto_total,
    timestamp,
    hash_anterior: hashAnterior,
    hash_actual,
    estado: 'pendiente',
  };

  // Descontar inventario
  for (const b of botellas) {
    const item = db.inventario.find(i => i.producto === b.producto);
    if (item) item.cantidad -= b.cantidad;
  }

  db.pedidos.push(pedido);
  guardarDB(db);

  return res.status(201).json({ pedido, hash_anterior: hashAnterior, hash_actual });
}

function obtenerPendientes(req, res) {
  const db       = leerDB();
  const pendientes = db.pedidos
    .filter(p => p.estado === 'pendiente')
    .map(p => ({ ...p, cliente: db.clientes.find(c => c.id === p.cliente_id) }));
  return res.json(pendientes);
}

module.exports = { crearPedido, obtenerPendientes };
