const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

// Relatório de clientes
router.get('/clientes-por-mes', relatorioController.clientesPorMes);

// Relatório de vendas
router.get('/vendas-por-mes', relatorioController.vendasPorMes);

module.exports = router;
