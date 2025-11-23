const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// Clientes cadastrados por mês
router.get('/clientes-mes', relatorioController.clientesPorMes);


// Vendas por mês
router.get('/vendas-mes', relatorioController.vendasPorMes);


module.exports = router;
