const mongoose = require('mongoose');
const SkillsSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  technical: [String], soft: [String], software: [String],
  languages: [{ name: String, reading: String, writing: String, speaking: String }],
}, { timestamps: true });
module.exports = mongoose.model('Skills', SkillsSchema);
