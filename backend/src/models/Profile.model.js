const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fatherName:       String, motherName: String,
  dob:              Date,   gender: String,
  nationality:      { type: String, default: 'Bangladeshi' },
  religion:         String, maritalStatus: String,
  nid:              String, passport: String,
  presentAddress:   String, permanentAddress: String,
  altPhone:         String, linkedin: String,
  github:           String, portfolio: String,
  objective:        String,
  cvMode:           { type: String, default: 'corporate' },
  completionPct:    { type: Number, default: 0 },
  currentStep:      { type: Number, default: 1 },
}, { timestamps: true });
module.exports = mongoose.model('Profile', ProfileSchema);
