const express = require('express');
const router = express.Router();
const pedido_itemController = require('../controllers/pedido_itemController');

// Rotas específicas para itens de pedido
router.get('/', pedido_itemController.listarPedidoItens);
router.get('/:idpedido', pedido_itemController.listarItensPorPedido);
router.put('/:idpedido/:iditem', pedido_itemController.atualizarPedidoItem);
router.delete('/:idpedido/:iditem', pedido_itemController.deletarPedidoItem);

module.exports = router;
