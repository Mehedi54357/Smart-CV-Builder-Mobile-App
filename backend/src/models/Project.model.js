const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  String,
  technologies: [String],
  role:         String,
  githubLink:   String,
  liveLink:     String,
  order:        { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);
