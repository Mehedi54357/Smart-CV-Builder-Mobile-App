const Profile   = require('../models/Profile.model');
const Education = require('../models/Education.model');
const Experience= require('../models/Experience.model');
const Skills    = require('../models/Skills.model');
const Project   = require('../models/Project.model');

const calcCompletion = async (userId) => {
  let score = 0;
  const profile = await Profile.findOne({ user: userId });
  if (profile) {
    if (profile.fatherName && profile.motherName && profile.dob && profile.gender && profile.nid) score += 10;
    if (profile.presentAddress && profile.permanentAddress) score += 5;
    if (profile.objective) score += 10;
  }
  const edus = await Education.countDocuments({ user: userId });
  if (edus > 0) score += 20;
  const exps = await Experience.countDocuments({ user: userId });
  if (exps > 0) score += 15;
  const projs = await Project.countDocuments({ user: userId });
  if (projs > 0) score += 10;
  const skills = await Skills.findOne({ user: userId });
  if (skills && skills.technical.length > 0) score += 15;
  if (skills && skills.languages && skills.languages.length > 0) score += 5;
  // profile photo
  const User = require('../models/User.model');
  const user = await User.findById(userId);
  if (user?.profilePhoto) score += 10;
  return Math.min(score, 100);
};

module.exports = calcCompletion;
