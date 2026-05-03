const router = require('express').Router();
const ctrl   = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',     ctrl.getAll);
router.post('/',    ctrl.add);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);
module.exports = router;
