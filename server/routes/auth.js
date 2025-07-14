const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { upload, uploadNone, handleMulterError } = require('../middlewares/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, upload.single('avatar'), handleMulterError, authController.updateProfile);
router.put('/profile/basic', auth, uploadNone, authController.updateProfile);
router.post('/become-master', auth, authController.becomeMaster);

module.exports = router;