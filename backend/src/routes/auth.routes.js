const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register',       authLimiter, ctrl.register);
router.post('/login',          authLimiter, ctrl.login);
router.post('/send-otp',       authLimiter, ctrl.sendOTP);
router.post('/verify-otp',     ctrl.verifyOTP);
router.post('/forgot-password',authLimiter, ctrl.forgotPassword);
router.put('/reset-password',  ctrl.resetPassword);
router.post('/logout',         ctrl.logout);
module.exports = router;
