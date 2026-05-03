const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly);
router.get('/users',              ctrl.getUsers);
router.get('/analytics',          ctrl.getAnalytics);
router.patch('/users/:id/toggle', ctrl.toggleUserStatus);
module.exports = router;
