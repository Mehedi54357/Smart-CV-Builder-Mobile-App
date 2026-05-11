require('dotenv').config();
const mongoose = require('mongoose');
const generateDOCX = require('./src/utils/generateDOCX');
const generatePDF = require('./src/utils/generatePDF');
const User = require('./src/models/User.model');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const user = await User.findOne();
    if(!user) return console.log('no user');
    console.log('Generating DOCX for user', user._id);
    const docx = await generateDOCX(user._id, 'govt');
    console.log('DOCX OK, size:', docx.length);
    console.log('Generating PDF...');
    const pdf = await generatePDF(user._id, 'govt');
    console.log('PDF OK, size:', pdf.length);
  } catch(e) {
    console.error('ERROR:', e);
  } finally {
    mongoose.disconnect();
  }
}
test();
