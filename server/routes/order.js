const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const auth = require('../middlewares/auth');

// CRUD для заказов
router.post('/', auth, orderCtrl.createOrder);
router.get('/my', auth, orderCtrl.getMyOrders);
router.get('/:id', auth, orderCtrl.getOrder);
router.patch('/:id/status', auth, orderCtrl.updateOrderStatus);

module.exports = router;