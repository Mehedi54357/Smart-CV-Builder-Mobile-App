const Experience = require('../models/Experience.model');

exports.getAll  = async (req, res) => { try { res.json({ success:true, experiences: await Experience.find({ user: req.user._id }).sort('order') }); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.add     = async (req, res) => { try { const exp = await Experience.create({ ...req.body, user: req.user._id }); res.status(201).json({ success:true, experience: exp }); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.update  = async (req, res) => { try { const exp = await Experience.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new:true }); if(!exp) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,experience:exp}); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.remove  = async (req, res) => { try { await Experience.findOneAndDelete({ _id: req.params.id, user: req.user._id }); res.json({success:true,message:'Deleted'}); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
