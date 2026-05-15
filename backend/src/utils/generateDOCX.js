const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, ImageRun } = require('docx');
const axios = require('axios');
const Profile    = require('../models/Profile.model');
const Education  = require('../models/Education.model');
const Experience = require('../models/Experience.model');
const Skills     = require('../models/Skills.model');
const Project    = require('../models/Project.model');
const User       = require('../models/User.model');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

const bNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const THEME = {
  govt:      { header: '14b8a6', accent: '0f766e', text: '0c4a6e' },
  corporate: { header: '2b6cb0', accent: '1a365d', text: '1e3a8a' },
  creative:  { header: '2d3748', accent: '38b2ac', text: '2d3748' },
  tech:      { header: '0f172a', accent: 'f43f5e', text: '0f172a' },
  europass:  { header: '003399', accent: '003399', text: '0c4a6e' },
  academic:  { header: '0891b2', accent: '0369a1', text: '0c4a6e' },
  'smart-pro': { header: '3b82f6', accent: '2563eb', text: '334155' },
  'bengali-pro': { header: '0F2044', accent: '1e3a8a', text: '0c4a6e' },
};

const generateDOCX = async (userId, template = 'govt') => {
  const [user, profile, educations, experiences, skills, projects] = await Promise.all([
    User.findById(userId),
    Profile.findOne({ user: userId }),
    Education.find({ user: userId }).sort('order'),
    Experience.find({ user: userId }).sort('order'),
    Skills.findOne({ user: userId }),
    Project.find({ user: userId }).sort('order'),
  ]);
  const languages = skills?.languages || [];

  const theme = THEME[template] || THEME.govt;
  const imgBuffer = user.profilePhoto ? await fetchImage(user.profilePhoto) : null;

  const sectionHead = (title) => new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), font: 'Arial', size: 22, bold: true, color: theme.text })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: theme.accent, space: 2 } },
    spacing: { before: 280, after: 140 },
  });

  const bodyText = (text) => new Paragraph({
    children: [new TextRun({ text, font: 'Arial', size: 19, color: '475569' })],
    spacing: { before: 0, after: 60 },
  });

  const children = [
    // Header
    new Table({
      width: { size: 9360, type: WidthType.DXA }, 
      columnWidths: imgBuffer ? [1500, 7860] : [9360],
      rows: [new TableRow({ children: [
        ...(imgBuffer ? [new TableCell({
          children: [new Paragraph({
            children: [new ImageRun({ data: imgBuffer, transformation: { width: 70, height: 70 } })],
            alignment: AlignmentType.CENTER
          })],
          shading: { fill: theme.header, type: ShadingType.CLEAR },
          borders: { top: bNone, bottom: bNone, left: bNone, right: bNone },
        })] : []),
        new TableCell({
          children: [
            new Paragraph({ children: [new TextRun({ text: user.fullName, font: 'Arial', size: 44, bold: true, color: 'FFFFFF' })], alignment: AlignmentType.LEFT, spacing: { before: 160, after: 80 } }),
            new Paragraph({ children: [new TextRun({ text: `${user.phone||''}  |  ${user.email||''}`, font: 'Arial', size: 20, color: 'E2E8F0' })], alignment: AlignmentType.LEFT, spacing: { before: 0, after: 160 } }),
          ],
          shading: { fill: theme.header, type: ShadingType.CLEAR },
          borders: { top: bNone, bottom: bNone, left: bNone, right: bNone },
          margins: { top: 200, bottom: 200, left: 400, right: 400 },
        })
      ]})],
    }),
    // Objective
    ...(profile?.objective ? [sectionHead('Career Objective'), bodyText(profile.objective)] : []),
    // Personal Info (Only for non-smart-pro templates)
    ...(template !== 'smart-pro' ? [
      sectionHead('Personal Information'),
      ...[
        ['Father\'s Name', profile?.fatherName], ['Mother\'s Name', profile?.motherName],
        ['Date of Birth', profile?.dob ? new Date(profile.dob).toDateString() : ''],
        ['Gender', profile?.gender], ['Nationality', profile?.nationality],
        ['Religion', profile?.religion], ['NID', profile?.nid],
      ].filter(([,v]) => v).map(([k,v]) => new Paragraph({
        children: [
          new TextRun({ text: k + ': ', font: 'Arial', size: 18, bold: true, color: '64748B' }),
          new TextRun({ text: v, font: 'Arial', size: 18, color: '1E293B' }),
        ], spacing: { before: 0, after: 40 },
      }))
    ] : []),
    // Education
    ...(educations.length ? [
      sectionHead('Education'),
      ...educations.flatMap(edu => [
        new Paragraph({ children: [new TextRun({ text: edu.degree, font: 'Arial', size: 20, bold: true }), new TextRun({ text: `  —  ${edu.passingYear}`, font: 'Arial', size: 18, color: '64748B' })], spacing: { before: 80, after: 20 } }),
        new Paragraph({ children: [new TextRun({ text: `${edu.institution}  |  GPA: ${edu.gpa}`, font: 'Arial', size: 18, color: '1E3A8A' })], spacing: { before: 0, after: 60 } }),
      ]),
    ] : []),
    // Experience
    ...(experiences.length ? [
      sectionHead('Work Experience'),
      ...experiences.flatMap(exp => [
        new Paragraph({ children: [new TextRun({ text: exp.title, font: 'Arial', size: 20, bold: true }), new TextRun({ text: `  |  ${exp.fromDate} – ${exp.isCurrent ? 'Present' : exp.toDate}`, font: 'Arial', size: 18, color: '64748B' })], spacing: { before: 80, after: 20 } }),
        new Paragraph({ children: [new TextRun({ text: exp.company, font: 'Arial', size: 18, color: '1E3A8A', bold: true })], spacing: { before: 0, after: 20 } }),
        ...(exp.description ? [bodyText(exp.description)] : []),
      ]),
    ] : []),
    // Projects
    ...(projects.length ? [
      sectionHead('Projects'),
      ...projects.flatMap(proj => [
        new Paragraph({ children: [new TextRun({ text: proj.title, font: 'Arial', size: 20, bold: true })], spacing: { before: 80, after: 20 } }),
        ...(proj.technologies?.length ? [new Paragraph({ children: [new TextRun({ text: 'Tech: ' + (Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies), font: 'Arial', size: 18, color: '1E3A8A' })], spacing: { before: 0, after: 20 } })] : []),
        ...(proj.description ? [bodyText(proj.description)] : []),
      ]),
    ] : []),
    // Skills
    ...(skills ? [
      sectionHead('Skills'),
      ...(skills.technical?.length ? [new Paragraph({ children: [new TextRun({ text: 'Technical: ', font: 'Arial', size: 19, bold: true }), new TextRun({ text: skills.technical.join(', '), font: 'Arial', size: 19 })], spacing: { before: 0, after: 60 } })] : []),
      ...(skills.soft?.length ? [new Paragraph({ children: [new TextRun({ text: 'Soft Skills: ', font: 'Arial', size: 19, bold: true }), new TextRun({ text: skills.soft.join(', '), font: 'Arial', size: 19 })], spacing: { before: 0, after: 60 } })] : []),
    ] : []),
    // Languages
    ...(languages?.length ? [
      sectionHead('Language Proficiency'),
      ...languages.map(l => new Paragraph({
        children: [
          new TextRun({ text: `${l.name || l.language}: `, font: 'Arial', size: 19, bold: true }),
          new TextRun({ text: `Reading: ${l.reading || ''}, Writing: ${l.writing || ''}, Speaking: ${l.speaking || ''}`, font: 'Arial', size: 19 }),
        ],
        spacing: { before: 0, after: 40 },
      }))
    ] : []),
  ];

  const doc = new Document({
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }],
  });
  return Packer.toBuffer(doc);
};

module.exports = generateDOCX;
