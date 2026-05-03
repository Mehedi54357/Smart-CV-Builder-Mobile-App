const User = require('../models/User.model');
const CV   = require('../models/CV.model');

exports.getUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find().select('-password').sort('-createdAt').skip((page-1)*limit).limit(limit);
    const total = await User.countDocuments();
    res.json({ success:true, users, total, page, pages: Math.ceil(total/limit) });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalCVs, premiumUsers, recentUsers] = await Promise.all([
      User.countDocuments(),
      CV.countDocuments(),
      User.countDocuments({ plan:'premium' }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now()-7*24*60*60*1000) } }),
    ]);
    res.json({ success:true, analytics: { totalUsers, totalCVs, premiumUsers, recentUsers } });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({success:false,message:'User not found'});
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success:true, message:`User ${user.isActive?'activated':'deactivated'}`, isActive: user.isActive });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};
