const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try { const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 }); return r.data; }
  catch (e) { return null; }
};

// TECH template — Dark header, terminal style, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89, M = 45, bW = 505.28;
  const BOTTOM = H - 50;

  const checkPage = (need = 40) => {
    if (y + need > BOTTOM) { doc.addPage(); y = 40; return true; }
    return false;
  };

  // Dark header
  doc.rect(0, 0, W, 125).fill('#0f172a');
  doc.rect(0, 122, W, 3).fill('#f43f5e');

  const photoSize = 75;
  const photoX = W - M - photoSize;
  const photoY = 25;

  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      doc.save();
      doc.rect(photoX, photoY, photoSize, photoSize).clip();
      doc.image(imgBuf, photoX, photoY, { width: photoSize, height: photoSize });
      doc.restore();
      doc.rect(photoX, photoY, photoSize, photoSize).lineWidth(2).strokeColor('#f43f5e').stroke();
    }
  } else {
    doc.rect(photoX, photoY, photoSize, photoSize).fill('#1e293b');
    doc.fillColor('#f43f5e').fontSize(26).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0].toUpperCase(), photoX, photoY + 22, { width: photoSize, align: 'center' });
    doc.rect(photoX, photoY, photoSize, photoSize).lineWidth(2).strokeColor('#f43f5e').stroke();
  }

  const textW = bW - photoSize - 20;

  doc.fillColor('#f8fafc').fontSize(22).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), M, 28, { width: textW, characterSpacing: 1.5 });
  doc.fontSize(9).font('Helvetica').fillColor('#f43f5e').text('// Developer & Engineer', M, 58, { width: textW });
  const ct = []; if (user?.phone) ct.push(user.phone); if (user?.email) ct.push(user.email); if (profile?.github) ct.push(`GitHub: ${profile.github}`);
  doc.fontSize(8.5).fillColor('#94a3b8').text(ct.join('   |   '), M, 76, { width: textW });

  let y = 142;

  const sec = (t, c = '#f43f5e') => {
    checkPage(50);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(c).text(`// ${t.toUpperCase()}`, M, y, { characterSpacing: 1 });
    y += 13;
    doc.rect(M, y, bW, 1.5).fill(c);
    y += 10;
  };

  const sub = (t, r = '') => {
    checkPage();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text(t, M, y, { continued: !!r, width: bW - 100 });
    if (r) doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text(r, { align: 'right' });
    y += 15;
  };

  const body = (t) => {
    if (!t) return;
    checkPage();
    doc.fontSize(9).font('Helvetica').fillColor('#475569').text(t, M, y, { width: bW, align: 'justify' });
    y += doc.heightOfString(t, { width: bW }) + 8;
  };

  const kv = (k, v) => {
    if (!v) return;
    checkPage();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(k + ':', M, y, { continued: true, width: 110 });
    doc.font('Helvetica').fillColor('#1e293b').text(v, M + 112, y, { width: bW - 112 });
    y += 15;
  };

  // --- Sections ---
  if (profile?.objective) { sec('Summary', '#f43f5e'); body(profile.objective); y += 6; }

  if (skills) {
    sec('Tech Stack', '#3b82f6');
    if (skills.technical?.length) {
      const cols = 3, cW = Math.floor(bW / cols);
      skills.technical.forEach((s, i) => {
        const col = i % cols;
        if (col === 0 && i > 0) y += 18;
        checkPage(20);
        doc.rect(M + col * cW, y, cW - 8, 16).fill('#f1f5f9');
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b').text(s, M + col * cW + 6, y + 4, { width: cW - 16 });
      });
      y += 22;
    }
    if (skills.soft?.length) {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('Soft: ', M, y, { continued: true });
      doc.font('Helvetica').fillColor('#475569').text(skills.soft.join(' • '), { width: bW - 50 });
      y += 14;
    }
    y += 6;
  }

  if (experiences?.length) {
    sec('Experience', '#8b5cf6');
    experiences.forEach(e => {
      checkPage(60);
      sub(e.title, `${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#3b82f6').text(e.company, M, y); y += 14;
      body(e.description);
    });
  }

  if (projects?.length) {
    sec('Projects', '#10b981');
    projects.forEach(p => {
      checkPage(50);
      sub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#0891b2').text('Stack: ' + (Array.isArray(p.technologies) ? p.technologies.join(' | ') : p.technologies), M, y);
        y += 13;
      }
      body(p.description);
      if (p.githubLink) { doc.fontSize(8).fillColor('#3b82f6').text('🔗 ' + p.githubLink, M, y); y += 12; }
      y += 4;
    });
  }

  if (educations?.length) {
    sec('Education', '#f59e0b');
    educations.forEach(e => {
      checkPage(50);
      sub(e.degree || e.type, e.passingYear?.toString() || '');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#92400e').text(e.institution || '', M, y); y += 13;
      doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text(`GPA: ${e.gpa || ''}`, M, y); y += 14;
    });
  }

  // Personal Details
  sec('Personal Details', '#64748b');
  [["Father's Name", profile?.fatherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['Gender', profile?.gender], ['Nationality', profile?.nationality || 'Bangladeshi'], ['NID', profile?.nid]].forEach(([k, v]) => kv(k, v));

  // Footer on last page
  doc.rect(0, H - 26, W, 26).fill('#0f172a');
  doc.fontSize(7.5).fillColor('#f43f5e').font('Helvetica').text(`SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, 0, H - 17, { align: 'center', width: W });
  doc.end();
  } catch(err) { reject(err); }
});
