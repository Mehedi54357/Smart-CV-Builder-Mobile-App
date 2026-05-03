const Project = require('../models/Project.model');

exports.getAll  = async (req, res) => { try { res.json({ success:true, projects: await Project.find({ user: req.user._id }).sort('order') }); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.add     = async (req, res) => { try { const p = await Project.create({ ...req.body, user: req.user._id }); res.status(201).json({ success:true, project:p }); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.update  = async (req, res) => { try { const p = await Project.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new:true }); if(!p) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,project:p}); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
exports.remove  = async (req, res) => { try { await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id }); res.json({success:true,message:'Deleted'}); } catch(e){ res.status(500).json({success:false,message:e.message}); }};
