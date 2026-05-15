const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// GOVT template — Teal header + passport photo, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89, M = 50, bW = 495.28;
  const primaryColor = '#0d9488'; // Deep Teal
  const BOTTOM = H - 60;

  const checkPage = (need = 40) => {
    if (y + need > BOTTOM) { doc.addPage(); y = 50; return true; }
    return false;
  };

  // Header
  doc.rect(0, 0, W, 135).fill(primaryColor);

  // Passport photo logic (Cover fix)
  const photoSize = 85;
  const photoX = W - M - photoSize;
  const photoY = 25;
  
  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      try {
        doc.save();
        doc.rect(photoX, photoY, photoSize, photoSize).clip();
        
        const img = doc.openImage(imgBuf);
        const iW = img.width, iH = img.height;
        const iAspect = iW / iH;
        
        let drawW, drawH, dx, dy;
        if (iAspect > 1) {
          drawH = photoSize; drawW = photoSize * iAspect;
          dx = photoX - (drawW - photoSize) / 2; dy = photoY;
        } else {
          drawW = photoSize; drawH = photoSize / iAspect;
          dx = photoX; dy = photoY - (drawH - photoSize) / 2;
        }
        
        doc.image(imgBuf, dx, dy, { width: drawW, height: drawH });
        doc.restore();
        doc.rect(photoX, photoY, photoSize, photoSize).lineWidth(2).strokeColor('#fff').stroke();
      } catch (e) {
        doc.rect(photoX, photoY, photoSize, photoSize).fill('rgba(255,255,255,0.2)');
      }
    }
  } else {
    doc.rect(photoX, photoY, photoSize, photoSize).fill('rgba(255,255,255,0.2)');
    doc.fillColor('#fff').fontSize(32).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0].toUpperCase(), photoX, photoY + 25, { width: photoSize, align: 'center' });
  }

  const txtW = W - M - photoSize - 40;
  doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), M, 35, { width: txtW });
  const ct = []; if (user?.phone) ct.push(`📞 ${user.phone}`); if (user?.email) ct.push(`✉ ${user.email}`);
  doc.fontSize(10).font('Helvetica').fillColor('#ccfbf1').text(ct.join('   '), M, 68, { width: txtW });
  if (profile?.presentAddress) doc.fontSize(9).fillColor('#99f6e4').text(`📍 ${profile.presentAddress}`, M, 88, { width: txtW });

  let y = 155;

  const sec = (t, c = primaryColor) => {
    checkPage(55);
    doc.rect(M, y, bW, 22).fill(c);
    doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold').text(t.toUpperCase(), M + 10, y + 6, { characterSpacing: 1.5 });
    y += 30;
  };

  const kv = (k, v) => {
    if (!v) return;
    checkPage();
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#475569').text(k + ':', M, y, { continued: true, width: 120 });
    doc.font('Helvetica').fillColor('#1e293b').text(v, M + 125, y, { width: bW - 125 });
    y += 18;
  };

  const body = (t) => {
    if (!t) return;
    checkPage();
    doc.fontSize(9.5).font('Helvetica').fillColor('#475569').text(t, M, y, { width: bW, align: 'justify', lineGap: 2 });
    y += doc.heightOfString(t, { width: bW, lineGap: 2 }) + 8;
  };

  const sub = (t, r = '') => {
    checkPage();
    doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#1e293b').text(t, M, y, { continued: !!r, width: bW - 120 });
    if (r) doc.fontSize(9.5).font('Helvetica-Bold').fillColor(primaryColor).text(r, { align: 'right' });
    y += 18;
  };

  if (profile?.objective) { sec('Career Objective'); body(profile.objective); y += 10; }

  sec('Personal Information');
  const li = [["Father's Name", profile?.fatherName], ["Mother's Name", profile?.motherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['NID No.', profile?.nid]];
  const ri = [['Gender', profile?.gender], ['Nationality', profile?.nationality || 'Bangladeshi'], ['Religion', profile?.religion], ['Marital Status', profile?.maritalStatus]];
  for (let i = 0; i < Math.max(li.length, ri.length); i++) {
    checkPage();
    if (li[i] && li[i][1]) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(li[i][0] + ':', M, y, { width: 85 });
      doc.font('Helvetica').fillColor('#1e293b').text(li[i][1], M + 88, y, { width: bW / 2 - 95 });
    }
    if (ri[i] && ri[i][1]) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(ri[i][0] + ':', M + bW / 2, y, { width: 85 });
      doc.font('Helvetica').fillColor('#1e293b').text(ri[i][1], M + bW / 2 + 88, y, { width: bW / 2 - 95 });
    }
    y += 18;
  }
  kv('Present Address', profile?.presentAddress);
  kv('Permanent Address', profile?.permanentAddress);
  y += 12;

  if (educations?.length) {
    sec('Educational Qualification');
    const cols = [80, 180, 100, 60, 75];
    const headers = ['Exam', 'Institute', 'Board', 'GPA', 'Year'];
    
    // Header
    doc.rect(M, y, bW, 20).fill('#f0fdfa');
    let curX = M;
    headers.forEach((h, i) => {
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryColor).text(h, curX + 5, y + 6);
      curX += cols[i];
    });
    y += 20;

    educations.forEach((e, i) => {
      checkPage(25);
      if (i % 2 === 0) doc.rect(M, y, bW, 20).fill('#f8fafc');
      const data = [e.type || '', e.institution || '', e.board || '', e.gpa?.toString() || '', e.passingYear?.toString() || ''];
      curX = M;
      data.forEach((d, j) => {
        doc.fontSize(8.5).font(j === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor('#1e293b').text(d, curX + 5, y + 6, { width: cols[j] - 10, height: 14, ellipsis: true });
        curX += cols[j];
      });
      y += 20;
    });
    y += 15;
  }

  if (experiences?.length) {
    sec('Work Experience', '#065f46');
    experiences.forEach(e => {
      checkPage(80);
      sub(e.title, `${e.fromDate || ''} — ${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(e.company, M, y); y += 18;
      if (e.description) body(e.description);
      y += 8;
    });
  }

  if (projects?.length) {
    sec('Key Projects', '#7c3aed');
    projects.forEach(p => {
      checkPage(60);
      sub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#1e3a8a').text('Technologies: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), M, y);
        y += 16;
      }
      if (p.description) body(p.description);
      y += 6;
    });
  }

  if (skills?.technical?.length || skills?.soft?.length) {
    sec('Skills & Expertise', '#92400e');
    if (skills.technical?.length) kv('Technical Skills', skills.technical.join(' • '));
    if (skills.soft?.length) kv('Soft Skills', skills.soft.join(' • '));
  }

  if (languages?.length) {
    sec('Language Proficiency');
    languages.forEach(l => {
      checkPage();
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1e293b').text((l.name || l.language) + ':', M, y, { continued: true, width: 90 });
      doc.font('Helvetica').fillColor('#475569').text(`Reading: ${l.readingLevel || l.reading || ''} | Writing: ${l.writingLevel || l.writing || ''} | Speaking: ${l.speakingLevel || l.speaking || ''}`);
      y += 18;
    });
  }

  // Footer
  const pH = doc.page.height;
  doc.rect(0, pH - 35, W, 35).fill(primaryColor);
  doc.fontSize(8.5).fillColor('#ccfbf1').font('Helvetica').text(`Generated by SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, 0, pH - 22, { align: 'center', width: W });
  doc.end();
  } catch(err) { reject(err); }
});
