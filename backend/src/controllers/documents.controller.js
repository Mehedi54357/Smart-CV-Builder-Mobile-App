const Document = require('../models/Documents.model');
const { cloudinary } = require('../config/cloudinary');

exports.getAll = async (req, res) => {
  try { res.json({ success:true, documents: await Document.find({ user: req.user._id }).sort('-createdAt') }); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.upload = async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({success:false,message:'No file uploaded'});
    const { docType } = req.body;
    // Remove old doc of same type
    const old = await Document.findOne({ user: req.user._id, docType });
    if(old){ await cloudinary.uploader.destroy(old.publicId, { resource_type: 'raw' }); await old.deleteOne(); }
    const doc = await Document.create({
      user: req.user._id, docType,
      fileUrl: req.file.path, publicId: req.file.filename,
      fileName: req.file.originalname, fileSize: req.file.size, mimeType: req.file.mimetype,
    });
    res.status(201).json({ success:true, document: doc });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if(!doc) return res.status(404).json({success:false,message:'Document not found'});
    await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' });
    await doc.deleteOne();
    res.json({ success:true, message:'Document deleted' });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};
