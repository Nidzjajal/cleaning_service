const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { signup, login, getMe, resetPassword, becomeHelper, forgotPassword, toggle2FA } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `id-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/reset-password', protect, resetPassword);
router.post('/become-helper', upload.single('idDocument'), becomeHelper);
router.post('/forgot-password', forgotPassword);
router.put('/2fa/toggle', protect, toggle2FA);


module.exports = router;
