const express = require('express');
const router  = express.Router();

const { registrarCliente, obtenerClientes, obtenerClientePorId } = require('./controllers/registro');
const { crearPedido, obtenerPendientes }    = require('./controllers/pedidos');
const { confirmarEntrega }                  = require('./controllers/entregas');
const { generarFactura }                    = require('./controllers/factura');
const { auditarCliente, listarClientes }    = require('./controllers/auditoria');

router.post('/registro',            registrarCliente);
router.get('/clientes',             obtenerClientes);
router.get('/clientes/:id',         obtenerClientePorId);

// Importante: /pendientes antes de /:id para evitar colisión de rutas
router.get('/pedidos/pendientes',   obtenerPendientes);
router.post('/pedidos',             crearPedido);

router.post('/entregas',            confirmarEntrega);
router.post('/factura',             generarFactura);

router.get('/auditoria',            listarClientes);
router.get('/auditoria/:cliente_id', auditarCliente);

module.exports = router;
