const router = require('express').Router();
const ctrl   = require('../controllers/skills.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',  ctrl.get);
router.put('/',  ctrl.update);
module.exports = router;
