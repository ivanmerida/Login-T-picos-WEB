const express = require('express');
const LoginController = require('../controllers/LoginController');

const router = express.Router();

router.get('/login', LoginController.login);
router.post('/login', LoginController.auth);

router.get('/register', LoginController.obtener_usuarios);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);

router.get('/logout', LoginController.logout);

router.get('/pass', LoginController.pass);
router.post('/pass', LoginController.changePass);

module.exports = router;