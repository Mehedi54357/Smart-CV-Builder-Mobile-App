const router = require('express').Router();
const ctrl   = require('../controllers/cv.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/',                  ctrl.getAll);
router.post('/generate',         ctrl.generate);
router.get('/:id',               ctrl.getById);
router.delete('/:id',            ctrl.remove);
router.get('/:id/download/pdf',  ctrl.downloadPDF);
router.get('/:id/download/docx', ctrl.downloadDOCX);
router.post('/:id/share',        ctrl.share);
module.exports = router;
