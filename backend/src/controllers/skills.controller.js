const Skills = require('../models/Skills.model');

exports.get = async (req, res) => {
  try { res.json({ success:true, skills: await Skills.findOne({ user: req.user._id }) }); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
};
exports.update = async (req, res) => {
  try {
    const s = await Skills.findOneAndUpdate({ user: req.user._id }, { ...req.body, user: req.user._id }, { new:true, upsert:true });
    res.json({ success:true, skills:s });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};
