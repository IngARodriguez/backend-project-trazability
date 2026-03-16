const { generarHash }             = require('../hash_utils');
const { leerDB, guardarDB, siguienteId } = require('../data/store');

function registrarCliente(req, res) {
  const { nombre, documento } = req.body;
  if (!nombre || !documento) {
    return res.status(400).json({ error: 'nombre y documento son requeridos' });
  }

  const db = leerDB();

  // Si ya existe, devolver el cliente sin crear uno nuevo
  const existente = db.clientes.find(c => c.documento === documento);
  if (existente) {
    return res.json({ mensaje: 'Cliente existente', cliente: existente, hash0: existente.hash0 });
  }

  // Generar Hash0 (bloque génesis del cliente)
  const timestamp    = new Date().toISOString();
  const datos        = { nombre, documento, timestamp };
  const hashAnterior = '0'.repeat(64);
  const hash0        = generarHash(datos, hashAnterior);

  const cliente = {
    id: siguienteId(db, 'clientes'),
    nombre,
    documento,
    timestamp,
    hash0,
  };

  db.clientes.push(cliente);
  guardarDB(db);

  return res.status(201).json({ mensaje: 'Cliente registrado', cliente, hash0 });
}

function obtenerClientes(req, res) {
  const db = leerDB();
  return res.json(db.clientes);
}

function obtenerClientePorId(req, res) {
  const id      = parseInt(req.params.id, 10);
  const db      = leerDB();
  const cliente = db.clientes.find(c => c.id === id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  return res.json(cliente);
}

module.exports = { registrarCliente, obtenerClientes, obtenerClientePorId };
