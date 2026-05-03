const Profile = require('../models/Profile.model');
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
