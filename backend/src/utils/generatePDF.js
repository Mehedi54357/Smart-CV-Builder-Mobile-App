const Profile=require('../models/Profile.model');
const Education=require('../models/Education.model');
const Experience=require('../models/Experience.model');
const Skills=require('../models/Skills.model');
const Project=require('../models/Project.model');
const User=require('../models/User.model');

const renderGovt=require('./pdf/templateGovt');
const renderCorporate=require('./pdf/templateCorporate');
const renderCreative=require('./pdf/templateCreative');
const renderTech=require('./pdf/templateTech');
const renderEuropass=require('./pdf/templateEuropass');
const renderAcademic=require('./pdf/templateAcademic');
const renderSmartPro=require('./pdf/templateSmartPro');
const renderBengaliPro=require('./pdf/templateBengaliPro');
const renderModernTech=require('./pdf/templateModernTech');
const renderClassicMinimal=require('./pdf/templateClassicMinimal');
const renderClassicCentered=require('./pdf/templateClassicCentered');
const renderStudentVibrant=require('./pdf/templateStudentVibrant');

const generatePDF=async(userId,template='govt')=>{
  const [user,profile,educations,experiences,skills,projects]=await Promise.all([
    User.findById(userId),
    Profile.findOne({user:userId}),
    Education.find({user:userId}).sort('order'),
    Experience.find({user:userId}).sort('order'),
    Skills.findOne({user:userId}),
    Project.find({user:userId}).sort('order'),
  ]);
  // languages live inside Skills document
  const languagesData=skills?.languages||[];
  const data={
    user,
    profile,
    educations,
    experiences,
    skills,
    projects,
    languages:languagesData,
    achievements: profile?.achievements || [],
    certifications: profile?.certifications || []
  };
  
  switch(template){
    case 'student-vibrant': return renderStudentVibrant(data);
    case 'classic-centered': return renderClassicCentered(data);
    case 'classic-minimal': return renderClassicMinimal(data);
    case 'modern-tech': return renderModernTech(data);
    case 'bengali-pro': return renderBengaliPro(data);
    case 'corporate': return renderCorporate(data);
    case 'creative':  return renderCreative(data);
    case 'tech':      return renderTech(data);
    case 'europass':  return renderEuropass(data);
    case 'academic':  return renderAcademic(data);
    case 'smart-pro': return renderSmartPro(data);
    default:          return renderGovt(data);
  }
};
module.exports=generatePDF;
