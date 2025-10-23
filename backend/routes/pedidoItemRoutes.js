const express = require('express');
const router = express.Router();
const pedidoItemController = require('../controllers/pedidoItemController');

// Rotas específicas para itens de pedido
router.get('/', pedidoItemController.listarPedidoItens);
router.get('/:idpedido', pedidoItemController.listarItensPorPedido);
router.put('/:idpedido/:iditem', pedidoItemController.atualizarPedidoItem);
router.delete('/:idpedido/:iditem', pedidoItemController.deletarPedidoItem);

module.exports = router;
