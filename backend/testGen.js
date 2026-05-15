require('dotenv').config();
const mongoose = require('mongoose');
const generatePDF = require('./src/utils/generatePDF');
const User = require('./src/models/User.model');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const user = await User.findOne();
    if(!user) return console.log('no user');

    const templates = ['bengali-pro', 'modern-tech', 'classic-minimal', 'classic-centered', 'student-vibrant'];
    
    for(const t of templates) {
      console.log(`[TEST] Generating PDF for template: ${t}...`);
      try {
        const pdf = await generatePDF(user._id, t);
        console.log(`[OK] ${t} generated successfully. Size: ${pdf.length} bytes`);
      } catch(err) {
        console.error(`[FAIL] ${t} failed: ${err.message}`);
      }
    }

  } catch(e) {
    console.error('CRITICAL ERROR:', e);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}
test();
