const mongoose = require('mongoose');
const EducationSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['SSC','HSC','Diploma','BSc','MSc','PhD','Other'] },
  degree:      { type: String, required: true },
  subject:     String,
  institution: { type: String, required: true },
  board:       String,
  gpa:         { type: Number, min: 0, max: 5 },
  passingYear: Number,
  order:       { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Education', EducationSchema);
