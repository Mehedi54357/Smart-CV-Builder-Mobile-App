const router = require('express').Router();
const ctrl   = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.use(protect);
router.get('/',             ctrl.getProfile);
router.post('/',            ctrl.createOrUpdateProfile);
router.put('/',             ctrl.createOrUpdateProfile);
router.get('/completion',   ctrl.getCompletion);
router.post('/photo',       upload.single('profilePhoto'), ctrl.uploadPhoto);
router.post('/sync',        ctrl.syncAll);
module.exports = router;
