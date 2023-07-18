const express = require('express');
const router = express.Router();

// Controllers
const userController = require('../../controllers/admin/admin.controller');

// Routes
router.post('/signup', userController.createAdmin);
router.post('/login', userController.loginAdmin);

module.exports = router;