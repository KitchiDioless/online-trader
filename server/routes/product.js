const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const auth = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post('/', auth, upload.array('images', 5), productCtrl.createProduct);
router.get('/', productCtrl.getProducts);
router.get('/:id', productCtrl.getProduct);
router.put('/:id', auth, upload.array('images', 5), productCtrl.updateProduct);
router.delete('/:id', auth, productCtrl.deleteProduct);

module.exports = router;