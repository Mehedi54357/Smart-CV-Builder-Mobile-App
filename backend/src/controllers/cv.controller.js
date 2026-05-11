const CV         = require('../models/CV.model');
const generatePDF  = require('../utils/generatePDF');
const generateDOCX = require('../utils/generateDOCX');
const { cloudinary } = require('../config/cloudinary');
const calcCompletion = require('../utils/calcCompletion');

exports.getAll = async (req, res) => {
  try { res.json({ success:true, cvs: await CV.find({ user: req.user._id }).sort('-createdAt') }); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.generate = async (req, res) => {
  try {
    const { title, template = 'govt', language = 'en' } = req.body;
    const score = await calcCompletion(req.user._id);

    // Generate PDF & DOCX with chosen template
    const pdfBuffer  = await generatePDF(req.user._id, template);
    const docxBuffer = await generateDOCX(req.user._id, template);

    // Upload to Cloudinary
    const uploadBuffer = (buffer, fname, resType) => new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `smartcv/cvs/${req.user._id}`, resource_type: resType, public_id: fname },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(buffer);
    });

    const [pdfResult, docxResult] = await Promise.all([
      uploadBuffer(pdfBuffer,  `cv_${Date.now()}.pdf`,  'raw'),
      uploadBuffer(docxBuffer, `cv_${Date.now()}.docx`, 'raw'),
    ]);

    const cv = await CV.create({
      user: req.user._id, title, template, language,
      pdfUrl: pdfResult.secure_url, docxUrl: docxResult.secure_url, score,
    });

    res.status(201).json({ success:true, cv });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.getById = async (req, res) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, user: req.user._id });
    if(!cv) return res.status(404).json({success:false,message:'CV not found'});
    res.json({ success:true, cv });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.remove = async (req, res) => {
  try {
    await CV.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success:true, message:'CV deleted' });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.downloadPDF = async (req, res) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, user: req.user._id });
    if(!cv || !cv.pdfUrl) return res.status(404).json({success:false,message:'PDF not found'});
    cv.downloadCount += 1; await cv.save();
    res.json({ success:true, url: cv.pdfUrl });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.downloadDOCX = async (req, res) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, user: req.user._id });
    if(!cv || !cv.docxUrl) return res.status(404).json({success:false,message:'DOCX not found'});
    cv.downloadCount += 1; await cv.save();
    res.json({ success:true, url: cv.docxUrl });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

exports.share = async (req, res) => {
  try {
    const cv = await CV.findOne({ _id: req.params.id, user: req.user._id });
    if(!cv) return res.status(404).json({success:false,message:'CV not found'});
    const token = cv.generateShareToken();
    await cv.save();
    res.json({ success:true, shareUrl: `${process.env.FRONTEND_URL}/cv/share/${token}` });
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};
