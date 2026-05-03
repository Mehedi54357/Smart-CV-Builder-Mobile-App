const mongoose = require('mongoose');
const DocumentSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  docType:  { type: String, enum: ['nid','passport','ssc_cert','hsc_cert','bsc_cert','transcript','experience_letter','signature','other'], required: true },
  fileUrl:  { type: String, required: true },
  publicId: String, fileName: String, fileSize: Number, mimeType: String,
  status:   { type: String, enum: ['uploaded','processing','approved'], default: 'uploaded' },
}, { timestamps: true });
module.exports = mongoose.model('Document', DocumentSchema);
