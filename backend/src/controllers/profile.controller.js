const Profile = require('../models/Profile.model');
const Education = require('../models/Education.model');
const Experience = require('../models/Experience.model');
const Project = require('../models/Project.model');
const Skills = require('../models/Skills.model');
const calcCompletion = require('../utils/calcCompletion');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const completion = await calcCompletion(req.user._id);
    res.json({ success: true, profile, completion });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id }, { ...req.body, user: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );
    const completion = await calcCompletion(req.user._id);
    profile.completionPct = completion;
    await profile.save();
    res.json({ success: true, profile, completion });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getCompletion = async (req, res) => {
  try {
    const completion = await calcCompletion(req.user._id);
    res.json({ success: true, completion });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.syncAll = async (req, res) => {
  try {
    const { formData, educations, experiences, projects, skills, languages } = req.body;
    
    // 1. Update Profile (Step 1, 2, 3)
    if (formData) {
      await Profile.findOneAndUpdate(
        { user: req.user._id }, 
        { ...formData, user: req.user._id }, 
        { new: true, upsert: true, runValidators: true }
      );
    }

    // 2. Sync Educations (Step 4)
    if (educations) {
      await Education.deleteMany({ user: req.user._id });
      if (educations.length > 0) {
        await Education.insertMany(educations.map(e => {
          const { id, _id, ...rest } = e; // Strip local ID
          return { ...rest, user: req.user._id };
        }));
      }
    }

    // 3. Sync Experiences (Step 5)
    if (experiences) {
      await Experience.deleteMany({ user: req.user._id });
      if (experiences.length > 0) {
        await Experience.insertMany(experiences.map(e => {
          const { id, _id, ...rest } = e; 
          return { ...rest, user: req.user._id };
        }));
      }
    }

    // 4. Sync Projects (Step 6)
    if (projects) {
      await Project.deleteMany({ user: req.user._id });
      if (projects.length > 0) {
        await Project.insertMany(projects.map(p => {
          const { id, _id, ...rest } = p; 
          return { ...rest, user: req.user._id };
        }));
      }
    }

    // 5. Sync Skills & Languages (Step 7, 8)
    if (skills || languages) {
      await Skills.findOneAndUpdate(
        { user: req.user._id },
        { 
          user: req.user._id,
          technical: skills?.technical || [], 
          soft: skills?.soft || [], 
          software: skills?.software || [], 
          languages: languages || [] 
        },
        { new: true, upsert: true, runValidators: true }
      );
    }

    // 6. Recalculate and update completion percentage
    const completion = await calcCompletion(req.user._id);
    await Profile.findOneAndUpdate({ user: req.user._id }, { completionPct: completion });

    res.json({ success: true, completion });
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }); 
  }
};

// POST /api/profile/photo
exports.uploadPhoto = async (req, res) => {
  try {
    const User = require('../models/User.model');
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: req.file.path },
      { new: true }
    ).select('-password');
    res.json({ success: true, photoUrl: user.profilePhoto, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
