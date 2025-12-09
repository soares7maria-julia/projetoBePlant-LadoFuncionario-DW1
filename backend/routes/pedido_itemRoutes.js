const express = require('express'); 
const router = express.Router();
const itemCtrl = require('../controllers/pedido_itemController');

/// PRIMEIRO a rota específica
router.get('/:idpedido/:iditem', itemCtrl.buscarItemPorId);

router.get('/:idpedido/:iditem', itemCtrl.buscarItemPorId);

// DEPOIS a rota que lista todos
router.get('/:idpedido', itemCtrl.listarItensPorPedido);

// CRUD
router.post('/', itemCtrl.criarItem);
router.put('/:idpedido/:iditem', itemCtrl.atualizarItem);
router.delete('/:idpedido/:iditem', itemCtrl.deletarItem);

module.exports = router;
