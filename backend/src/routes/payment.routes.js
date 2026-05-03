const router=require('express').Router();
const ctrl=require('../controllers/payment.controller');
const {protect}=require('../middleware/auth.middleware');

router.post('/bkash-init',protect,ctrl.initBkash);
router.get('/bkash-callback',ctrl.bkashCallback);
router.post('/ssl-init',protect,ctrl.initSSL);
router.get('/ssl-success',ctrl.bkashCallback);
router.get('/ssl-fail',(req,res)=>res.json({success:false,message:'Payment failed'}));
router.get('/check-plan',protect,ctrl.checkPlan);
module.exports=router;
