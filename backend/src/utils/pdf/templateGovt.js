const PDFDocument = require('pdfkit');

// GOVT template — Teal header, single column, AUTO PAGE-BREAK
module.exports = ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89, M = 45, bW = 505.28;
  const BOTTOM = H - 55; // safe zone before footer

  // --- Page break helper ---
  const checkPage = (need = 40) => {
    if (y + need > BOTTOM) { doc.addPage(); y = 40; return true; }
    return false;
  };

  // Header (first page only)
  doc.rect(0, 0, W, 120).fill('#14b8a6');
  doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), 0, 28, { align: 'center', width: W });
  const ct = []; if (user?.phone) ct.push(`📞 ${user.phone}`); if (user?.email) ct.push(`✉ ${user.email}`);
  doc.fontSize(9).font('Helvetica').fillColor('#ccfbf1').text(ct.join('   '), 0, 58, { align: 'center', width: W });
  if (profile?.presentAddress) doc.fontSize(8).fillColor('#99f6e4').text(`📍 ${profile.presentAddress}`, 0, 76, { align: 'center', width: W });

  let y = 138;

  const sec = (t, c = '#0f766e') => {
    checkPage(50);
    doc.rect(M, y, bW, 18).fill(c);
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold').text(t.toUpperCase(), M + 8, y + 4, { characterSpacing: 1.2 });
    y += 24;
  };

  const kv = (k, v) => {
    if (!v) return;
    checkPage();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748B').text(k + ':', M, y, { continued: true, width: 110 });
    doc.font('Helvetica').fillColor('#1E293B').text(v, M + 112, y, { width: bW - 112 });
    y += 15;
  };

  const body = (t) => {
    if (!t) return;
    checkPage();
    doc.fontSize(9).font('Helvetica').fillColor('#475569').text(t, M, y, { width: bW, align: 'justify' });
    y += doc.heightOfString(t, { width: bW }) + 6;
  };

  const sub = (t, r = '') => {
    checkPage();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E293B').text(t, M, y, { continued: !!r, width: bW - 100 });
    if (r) doc.fontSize(9).font('Helvetica').fillColor('#64748B').text(r, { align: 'right' });
    y += 15;
  };

  const hr = () => { doc.moveTo(M, y).lineTo(W - M, y).strokeColor('#E2E8F0').lineWidth(0.5).stroke(); y += 8; };

  // --- Sections ---
  if (profile?.objective) { sec('Career Objective', '#0d9488'); body(profile.objective); y += 6; }

  sec('Personal Information');
  const li = [["Father's Name", profile?.fatherName], ["Mother's Name", profile?.motherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['NID No.', profile?.nid]];
  const ri = [['Gender', profile?.gender], ['Nationality', profile?.nationality || 'Bangladeshi'], ['Religion', profile?.religion], ['Marital Status', profile?.maritalStatus]];
  for (let i = 0; i < Math.max(li.length, ri.length); i++) {
    checkPage();
    if (li[i] && li[i][1]) {
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748B').text(li[i][0] + ':', M, y, { width: 70 });
      doc.font('Helvetica').fillColor('#1E293B').text(li[i][1], M + 72, y, { width: bW / 2 - 80 });
    }
    if (ri[i] && ri[i][1]) {
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748B').text(ri[i][0] + ':', M + bW / 2, y, { width: 70 });
      doc.font('Helvetica').fillColor('#1E293B').text(ri[i][1], M + bW / 2 + 72, y, { width: bW / 2 - 80 });
    }
    y += 15;
  }
  kv('Present Address', profile?.presentAddress);
  kv('Permanent Address', profile?.permanentAddress);
  y += 6;

  if (educations?.length) {
    sec('Educational Qualification');
    // Table header
    doc.rect(M, y, bW, 16).fill('#f0fdfa');
    ['Exam', 'Institute', 'Board', 'GPA', 'Year'].forEach((h, i) => {
      const xs = [M, M + 65, M + 230, M + 380, M + 430];
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f766e').text(h, xs[i], y + 3, { width: 80 });
    });
    y += 18;

    educations.forEach((e, i) => {
      checkPage(20);
      if (i % 2 === 0) doc.rect(M, y, bW, 15).fill('#f8fafc');
      const cs = [e.type || '', e.institution || '', e.board || '', e.gpa?.toString() || '', e.passingYear?.toString() || ''];
      const xs = [M, M + 65, M + 230, M + 380, M + 430];
      cs.forEach((c, j) => doc.fontSize(8.5).font(j === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor('#1E293B').text(c, xs[j], y + 3, { width: j === 1 ? 160 : 60 }));
      y += 16;
    });
    y += 6;
  }

  if (experiences?.length) {
    sec('Work Experience', '#065F46');
    experiences.forEach(e => {
      checkPage(60);
      sub(e.title, `${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f766e').text(e.company, M, y); y += 14;
      if (e.description) body(e.description);
      hr();
    });
  }

  if (projects?.length) {
    sec('Projects', '#7C3AED');
    projects.forEach(p => {
      checkPage(50);
      sub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#1E3A8A').text('Tech: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), M, y);
        y += 13;
      }
      if (p.description) body(p.description);
      y += 4;
    });
  }

  if (skills) {
    sec('Skills', '#92400E');
    if (skills.technical?.length) {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('Technical:', M, y, { continued: true });
      doc.font('Helvetica').fillColor('#475569').text('  ' + skills.technical.join(' • '), { width: bW - 80 });
      y += doc.heightOfString(skills.technical.join(' • '), { width: bW - 80 }) + 6;
    }
    if (skills.soft?.length) {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('Soft Skills:', M, y, { continued: true });
      doc.font('Helvetica').fillColor('#475569').text('  ' + skills.soft.join(' • '), { width: bW - 90 });
      y += 14;
    }
  }

  if (languages?.length) {
    sec('Language Proficiency', '#0F766E');
    languages.forEach(l => {
      checkPage();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text((l.name || l.language) + ':', M, y, { continued: true, width: 80 });
      doc.font('Helvetica').fillColor('#475569').text(`Reading: ${l.reading || l.readingLevel || ''}  Writing: ${l.writing || l.writingLevel || ''}  Speaking: ${l.speaking || l.speakingLevel || ''}`, { width: bW - 80 });
      y += 14;
    });
  }

  // Footer on LAST page
  const pH = doc.page.height;
  doc.rect(0, pH - 28, W, 28).fill('#14b8a6');
  doc.fontSize(7.5).fillColor('#ccfbf1').font('Helvetica').text(`Generated by SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, 0, pH - 18, { align: 'center', width: W });
  doc.end();
});
