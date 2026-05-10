const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try { const r = await axios.get(url, { responseType: 'arraybuffer' }); return r.data; }
  catch (e) { return null; }
};

// ACADEMIC template — Clean, cyan accent, photo circle, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89, M = 50, bW = 495.28;
  const BOTTOM = H - 55;

  const checkPage = (need = 40) => {
    if (y + need > BOTTOM) { doc.addPage(); y = 40; return true; }
    return false;
  };

  // Clean white bg + top accent
  doc.rect(0, 0, W, H).fill('#ffffff');
  doc.rect(0, 0, W, 6).fill('#0891b2');

  // Photo circle (centered, below top bar)
  const photoR = 38, photoX = W / 2, photoY = 6 + photoR + 10;
  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      doc.save();
      doc.circle(photoX, photoY, photoR).clip();
      doc.image(imgBuf, photoX - photoR, photoY - photoR, { width: photoR * 2, height: photoR * 2 });
      doc.restore();
    }
  } else {
    doc.circle(photoX, photoY, photoR).fill('#e0f2fe');
    doc.fillColor('#0891b2').fontSize(28).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0], photoX - photoR, photoY - 14, { width: photoR * 2, align: 'center' });
  }
  doc.circle(photoX, photoY, photoR).lineWidth(2).strokeColor('#0891b2').stroke();

  const nameY = photoY + photoR + 8;
  doc.fillColor('#0c4a6e').fontSize(22).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), M, nameY, { align: 'center', width: bW, characterSpacing: 1 });
  doc.rect(M + 80, nameY + 34, bW - 160, 1.5).fill('#0891b2');
  const ct = []; if (user?.phone) ct.push(user.phone); if (user?.email) ct.push(user.email); if (profile?.linkedin) ct.push(`LinkedIn: ${profile.linkedin}`);
  doc.fontSize(9).font('Helvetica').fillColor('#0369a1').text(ct.join('   •   '), M, nameY + 40, { align: 'center', width: bW });
  if (profile?.presentAddress) doc.fontSize(8).fillColor('#64748b').text(profile.presentAddress, M, nameY + 56, { align: 'center', width: bW });

  let y = nameY + 76;

  const sec = (t) => {
    checkPage(50);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0c4a6e').text(t.toUpperCase(), M, y, { characterSpacing: 1.5 });
    y += 16; doc.rect(M, y, bW, 1.5).fill('#0891b2'); y += 10;
  };

  const sub = (t, r = '') => {
    checkPage();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(t, M, y, { continued: !!r, width: bW - 100 });
    if (r) doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text(r, { align: 'right' });
    y += 15;
  };

  const body = (t) => {
    if (!t) return;
    checkPage();
    doc.fontSize(9).font('Helvetica').fillColor('#334155').text(t, M, y, { width: bW, align: 'justify' });
    y += doc.heightOfString(t, { width: bW }) + 8;
  };

  const kv = (k, v) => {
    if (!v) return;
    checkPage();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text(k + ': ', M, y, { continued: true, width: 120 });
    doc.font('Helvetica').fillColor('#1e293b').text(v, { width: bW - 120 });
    y += 15;
  };

  if (profile?.objective) { sec('Research Interests / Summary'); body(profile.objective); y += 6; }

  if (educations?.length) {
    sec('Academic Qualifications');
    educations.forEach(e => {
      checkPage(50);
      sub(e.degree || e.type, e.passingYear?.toString() || '');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0891b2').text(e.institution || '', M, y); y += 14;
      doc.fontSize(8.5).font('Helvetica').fillColor('#475569').text(`GPA/CGPA: ${e.gpa || ''}${e.board ? ' | ' + e.board : ''}`, M, y); y += 14;
    });
    y += 4;
  }

  if (experiences?.length) {
    sec('Academic & Professional Experience');
    experiences.forEach(e => {
      checkPage(60);
      sub(e.title, `${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0891b2').text(e.company || '', M, y); y += 14;
      body(e.description);
    });
  }

  if (projects?.length) {
    sec('Research / Publications / Projects');
    projects.forEach(p => {
      checkPage(50);
      sub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#0369a1').text('Keywords / Tools: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), M, y);
        y += 13;
      }
      body(p.description);
      if (p.githubLink) { doc.fontSize(8).fillColor('#0891b2').text('🔗 ' + p.githubLink, M, y); y += 12; }
      y += 4;
    });
  }

  if (skills) {
    sec('Skills & Competencies');
    if (skills.technical?.length) {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text('Technical: ', M, y, { continued: true });
      doc.font('Helvetica').fillColor('#334155').text(skills.technical.join(', '), { width: bW - 80 });
      y += doc.heightOfString(skills.technical.join(', '), { width: bW - 80 }) + 6;
    }
    if (skills.soft?.length) {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text('Soft Skills: ', M, y, { continued: true });
      doc.font('Helvetica').fillColor('#334155').text(skills.soft.join(', '), { width: bW - 90 });
      y += 14;
    }
    y += 4;
  }

  if (languages?.length) {
    sec('Language Proficiency');
    languages.forEach(l => {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b').text((l.name || l.language) + ': ', M, y, { continued: true, width: 90 });
      doc.font('Helvetica').fillColor('#475569').text(`Reading: ${l.reading || l.readingLevel || ''}  |  Writing: ${l.writing || l.writingLevel || ''}  |  Speaking: ${l.speaking || l.speakingLevel || ''}`, { width: bW - 90 });
      y += 14;
    });
    y += 4;
  }

  sec('Personal Information');
  [["Father's Name", profile?.fatherName], ["Mother's Name", profile?.motherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['Gender', profile?.gender], ['Nationality', profile?.nationality || 'Bangladeshi'], ['Religion', profile?.religion], ['Marital Status', profile?.maritalStatus], ['NID / Passport', profile?.nid || profile?.passport]]
    .forEach(([k, v]) => kv(k, v));

  // Footer on last page
  doc.rect(0, H - 28, W, 28).fill('#f0f9ff');
  doc.rect(0, H - 28, W, 2).fill('#0891b2');
  doc.fontSize(7.5).fillColor('#0369a1').font('Helvetica').text(`Curriculum Vitae  •  ${user?.fullName || ''}  •  Generated: ${new Date().toLocaleDateString('en-GB')}`, 0, H - 18, { align: 'center', width: W });
  doc.end();
  } catch(err) { reject(err); }
});
