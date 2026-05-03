const User=require('../models/User.model');
const axios=require('axios');

// ── bKash Payment Init ────────────────────────────────────────────
exports.initBkash=async(req,res)=>{
  try{
    const {amount,plan}=req.body;
    // bKash sandbox credentials — replace with live in prod
    const tokenRes=await axios.post('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
      {app_key:process.env.BKASH_APP_KEY,app_secret:process.env.BKASH_APP_SECRET},
      {headers:{'Content-Type':'application/json','username':process.env.BKASH_USERNAME,'password':process.env.BKASH_PASSWORD}}
    );
    const idToken=tokenRes.data.id_token;
    const payRes=await axios.post('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
      {mode:'0011',payerReference:req.user._id.toString(),callbackURL:`${process.env.BACKEND_URL}/api/payment/bkash-callback`,amount:amount.toString(),currency:'BDT',intent:'sale',merchantInvoiceNumber:`INV-${Date.now()}`},
      {headers:{'Content-Type':'application/json','Authorization':idToken,'X-APP-Key':process.env.BKASH_APP_KEY}}
    );
    res.json({success:true,bkashURL:payRes.data.bkashURL,paymentID:payRes.data.paymentID,plan});
  }catch(e){
    // Sandbox fallback for dev
    res.json({success:true,bkashURL:'https://sandbox.bkash.com/pay',paymentID:'DEMO-'+Date.now(),plan,demo:true});
  }
};

// ── bKash Callback ────────────────────────────────────────────────
exports.bkashCallback=async(req,res)=>{
  try{
    const {paymentID,status,plan,userId}=req.query;
    if(status==='success'){
      await User.findByIdAndUpdate(userId,{plan:'premium'});
      res.redirect(`${process.env.FRONTEND_DEEP_LINK}://payment-success`);
    } else {
      res.redirect(`${process.env.FRONTEND_DEEP_LINK}://payment-failed`);
    }
  }catch(e){res.status(500).json({success:false,message:e.message});}
};

// ── SSLCommerz Init ───────────────────────────────────────────────
exports.initSSL=async(req,res)=>{
  try{
    const {amount,plan}=req.body;
    const data={
      store_id:process.env.SSL_STORE_ID,
      store_passwd:process.env.SSL_STORE_PASSWORD,
      total_amount:amount,currency:'BDT',
      tran_id:`TXN-${Date.now()}`,
      success_url:`${process.env.BACKEND_URL}/api/payment/ssl-success`,
      fail_url:`${process.env.BACKEND_URL}/api/payment/ssl-fail`,
      cancel_url:`${process.env.BACKEND_URL}/api/payment/ssl-cancel`,
      cus_name:req.user.fullName,
      cus_email:req.user.email,
      cus_phone:req.user.phone,
      cus_add1:'Dhaka',cus_city:'Dhaka',cus_country:'Bangladesh',
      shipping_method:'NO',product_name:`SmartCV ${plan} Plan`,
      product_category:'Software',product_profile:'general',
    };
    const sslRes=await axios.post('https://sandbox.sslcommerz.com/gwprocess/v4/api.php',data,{headers:{'Content-Type':'application/x-www-form-urlencoded'}});
    res.json({success:true,GatewayPageURL:sslRes.data.GatewayPageURL,sessionkey:sslRes.data.sessionkey});
  }catch(e){
    res.json({success:false,message:'Payment gateway unavailable in dev mode',demo:true});
  }
};

// ── Check Premium ─────────────────────────────────────────────────
exports.checkPlan=async(req,res)=>{
  try{
    const user=await User.findById(req.user._id).select('plan');
    res.json({success:true,plan:user.plan,isPremium:user.plan==='premium'});
  }catch(e){res.status(500).json({success:false,message:e.message});}
};
