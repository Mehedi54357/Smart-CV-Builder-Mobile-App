const mongoose = require('mongoose');
const crypto = require('crypto');
const CVSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  template:      { type: String, enum: ['govt','corporate','europass','creative','tech','academic'], default: 'govt' },
  language:      { type: String, enum: ['en','bn'], default: 'en' },
  pdfUrl:        String, docxUrl: String,
  score:         { type: Number, min: 0, max: 100, default: 0 },
  isPublic:      { type: Boolean, default: false },
  shareToken:    { type: String, unique: true, sparse: true },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true });
CVSchema.methods.generateShareToken = function () {
  this.shareToken = crypto.randomBytes(20).toString('hex');
  this.isPublic = true;
  return this.shareToken;
};
module.exports = mongoose.model('CV', CVSchema);
