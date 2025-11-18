const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Somente login e logout
router.post('/', loginController.login);
router.post('/logout', loginController.logout);

module.exports = router;
