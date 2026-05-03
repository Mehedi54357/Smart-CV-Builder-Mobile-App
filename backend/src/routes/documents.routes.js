const router = require('express').Router();
const ctrl   = require('../controllers/documents.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/',               ctrl.getAll);
router.post('/upload',        upload.single('document'), ctrl.upload);
router.delete('/:id',         ctrl.remove);
module.exports = router;
