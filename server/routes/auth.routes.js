const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));

module.exports = router;
