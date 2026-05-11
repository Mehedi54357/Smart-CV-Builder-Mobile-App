const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try { const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 }); return r.data; }
  catch (e) { return null; }
};

// EUROPASS template — Official EU format, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89, M = 45, bW = 505.28;
  const BOTTOM = H - 55;

  const checkPage = (need = 40) => {
    if (y + need > BOTTOM) { doc.addPage(); y = 40; return true; }
    return false;
  };

  // EU blue top bar + header
  doc.rect(0, 0, W, 8).fill('#003399');
  doc.rect(0, 8, W, 100).fill('#f0f4ff');
  for (let i = 0; i < 12; i++) { doc.fontSize(9).fillColor('#ffd700').text('★', M + i * 16, 14); }

  const photoSize = 75;
  const photoX = W - M - photoSize;
  const photoY = 20;

  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      doc.save();
      doc.rect(photoX, photoY, photoSize, photoSize).clip();
      doc.image(imgBuf, photoX, photoY, { width: photoSize, height: photoSize });
      doc.restore();
      doc.rect(photoX, photoY, photoSize, photoSize).lineWidth(2).strokeColor('#003399').stroke();
    }
  } else {
    doc.rect(photoX, photoY, photoSize, photoSize).fill('#e2e8f0');
    doc.fillColor('#003399').fontSize(26).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0].toUpperCase(), photoX, photoY + 22, { width: photoSize, align: 'center' });
  }

  const textW = bW - photoSize - 20;

  doc.fillColor('#003399').fontSize(21).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), M, 34, { width: textW, characterSpacing: 0.8 });
  const ct = []; if (user?.phone) ct.push(user.phone); if (user?.email) ct.push(user.email);
  doc.fontSize(9).font('Helvetica').fillColor('#334155').text(ct.join('  |  '), M, 62, { width: textW });
  if (profile?.presentAddress) doc.fontSize(8.5).fillColor('#64748b').text(`📍 ${profile.presentAddress}`, M, 78, { width: textW });

  let y = 120;

  const sec = (t) => {
    checkPage(50);
    doc.rect(0, y, W, 20).fill('#003399');
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(t.toUpperCase(), M, y + 5, { characterSpacing: 1.5, width: bW });
    y += 28;
  };

  const row = (label, content) => {
    if (!content) return;
    checkPage(30);
    const lW = 130;
    const startY = y;
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#003399').text(label, M, y, { width: lW - 8 });
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(content, M + lW, y, { width: bW - lW });
    y += Math.max(doc.heightOfString(content, { width: bW - lW }), 14) + 6;
    doc.rect(M + lW, startY, 0.5, y - startY - 6).fill('#e2e8f0');
  };

  const body = (t) => {
    if (!t) return;
    checkPage();
    doc.fontSize(9).font('Helvetica').fillColor('#475569').text(t, M, y, { width: bW, align: 'justify' });
    y += doc.heightOfString(t, { width: bW }) + 8;
  };

  if (profile?.objective) { sec('Personal Statement'); body(profile.objective); y += 4; }

  sec('Work Experience');
  if (experiences?.length) {
    experiences.forEach(e => {
      checkPage(50);
      row(`${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`, `${e.title}\n${e.company || ''}${e.description ? '\n' + e.description : ''}`);
      y += 4;
    });
  } else { row('', 'No work experience listed.'); }

  sec('Education and Training');
  if (educations?.length) {
    educations.forEach(e => {
      checkPage(40);
      row(`${e.passingYear || ''}`, `${e.degree || e.type || ''}\n${e.institution || ''}\nGPA: ${e.gpa || ''}`);
      y += 4;
    });
  }

  sec('Personal Information');
  [["Date of Birth", profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['Gender', profile?.gender], ['Nationality', profile?.nationality || 'Bangladeshi'], ['Marital Status', profile?.maritalStatus], ["Father's Name", profile?.fatherName], ['NID / Passport', profile?.nid || profile?.passport]]
    .filter(([, v]) => v).forEach(([k, v]) => { checkPage(); row(k, v); });

  sec('Language Skills');
  if (languages?.length) {
    languages.forEach(l => {
      checkPage();
      row(l.name || l.language, `Reading: ${l.reading || l.readingLevel || ''}  |  Writing: ${l.writing || l.writingLevel || ''}  |  Speaking: ${l.speaking || l.speakingLevel || ''}`);
    });
  }

  sec('Digital / Technical Skills');
  if (skills?.technical?.length) { row('Technical', skills.technical.join(', ')); }
  if (skills?.soft?.length) { row('Soft Skills', skills.soft.join(', ')); }

  // Footer on last page
  doc.rect(0, H - 30, W, 30).fill('#f0f4ff');
  doc.rect(0, H - 30, W, 2).fill('#003399');
  doc.fontSize(7.5).fillColor('#003399').font('Helvetica').text(`Europass CV  •  ${user?.fullName || ''}  •  ${new Date().toLocaleDateString('en-GB')}`, 0, H - 18, { align: 'center', width: W });
  doc.end();
  } catch(err) { reject(err); }
});
