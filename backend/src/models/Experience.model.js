const mongoose = require('mongoose');
const ExperienceSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: String, required: true },
  title:       { type: String, required: true },
  fromDate:    String, toDate: String,
  isCurrent:   { type: Boolean, default: false },
  description: String,
  achievements:[String],
  order:       { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Experience', ExperienceSchema);
