const PDFDocument = require('pdfkit');

// CREATIVE template — Dark grey sidebar, teal accent, AUTO PAGE-BREAK
module.exports = ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89;
  const SW = 190, MX = SW + 16, MW = W - MX - 30;
  const BOTTOM = H - 50;

  const drawBg = () => {
    doc.rect(0, 0, SW, H).fill('#2d3748');
    doc.rect(SW, 0, W - SW, H).fill('#ffffff');
  };

  const checkPageMain = (need = 40) => {
    if (my + need > BOTTOM) { doc.addPage(); drawBg(); my = 40; return true; }
    return false;
  };

  drawBg();

  // Photo circle placeholder
  doc.circle(SW / 2, 75, 50).fill('#4a5568');
  const ini = (user?.fullName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  doc.fillColor('#e2e8f0').fontSize(26).font('Helvetica-Bold').text(ini, SW / 2 - 18, 57);

  // === SIDEBAR ===
  let sy = 140;
  const sHead = (t) => { doc.rect(14, sy, SW - 28, 1.5).fill('#38b2ac'); sy += 7; doc.fontSize(8).font('Helvetica-Bold').fillColor('#81e6d9').text(t.toUpperCase(), 14, sy, { characterSpacing: 1.2, width: SW - 28 }); sy += 17; };
  const sTxt = (t, c = '#cbd5e0') => { if (!t) return; doc.fontSize(8.5).font('Helvetica').fillColor(c).text(t, 14, sy, { width: SW - 28 }); sy += doc.heightOfString(t, { width: SW - 28 }) + 4; };
  const sBold = (t) => { doc.fontSize(9).font('Helvetica-Bold').fillColor('#f7fafc').text(t, 14, sy, { width: SW - 28 }); sy += 14; };

  sHead('Contact');
  if (user?.phone) sTxt(`📞 ${user.phone}`);
  if (user?.email) sTxt(`✉ ${user.email}`);
  if (profile?.presentAddress) sTxt(`📍 ${profile.presentAddress}`);
  if (profile?.linkedin) sTxt(`in ${profile.linkedin}`);
  sy += 6;

  sHead('Education');
  educations?.forEach(e => { sBold(e.degree || e.type || ''); sTxt(e.institution || ''); sTxt(`${e.passingYear || ''}  GPA: ${e.gpa || ''}`); sy += 4; });
  sy += 4;

  sHead('Skills');
  skills?.technical?.forEach(s => sTxt(`▸ ${s}`));
  if (skills?.soft?.length) { sy += 4; sHead('Soft Skills'); skills.soft.forEach(s => sTxt(`▸ ${s}`)); }
  if (languages?.length) { sy += 4; sHead('Languages'); languages.forEach(l => { sBold(l.name || l.language); sTxt(`R: ${l.reading || l.readingLevel || ''}  W: ${l.writing || l.writingLevel || ''}  S: ${l.speaking || l.speakingLevel || ''}`); }); }

  // === MAIN CONTENT ===
  // Name block
  doc.rect(SW, 0, W - SW, 105).fill('#f7fafc');
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#2d3748').text((user?.fullName || '').toUpperCase(), MX, 20, { width: MW });
  doc.rect(MX, 52, 50, 3).fill('#38b2ac');
  if (profile?.jobTitle) { doc.fontSize(11).font('Helvetica').fillColor('#4a5568').text(profile.jobTitle, MX, 62, { width: MW }); }
  else { doc.fontSize(10).font('Helvetica').fillColor('#718096').text('Professional', MX, 62, { width: MW }); }

  let my = 118;

  const mHead = (t) => {
    checkPageMain(50);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#2d3748').text(t.toUpperCase(), MX, my, { characterSpacing: 1.2 });
    my += 13; doc.rect(MX, my, MW, 2).fill('#38b2ac'); my += 10;
  };

  const mSub = (t, r = '') => {
    checkPageMain();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2d3748').text(t, MX, my, { continued: !!r, width: MW - 100 });
    if (r) doc.fontSize(8.5).font('Helvetica').fillColor('#718096').text(r, { align: 'right' });
    my += 14;
  };

  const mBody = (t) => {
    if (!t) return;
    checkPageMain();
    doc.fontSize(9).font('Helvetica').fillColor('#4a5568').text(t, MX, my, { width: MW, align: 'justify' });
    my += doc.heightOfString(t, { width: MW }) + 8;
  };

  if (profile?.objective) { mHead('About Me'); mBody(profile.objective); my += 8; }

  if (experiences?.length) {
    mHead('Experience');
    experiences.forEach(e => {
      checkPageMain(60);
      mSub(e.title, `${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#38b2ac').text(e.company, MX, my); my += 14;
      mBody(e.description);
    });
  }

  if (projects?.length) {
    mHead('Projects');
    projects.forEach(p => {
      checkPageMain(50);
      mSub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#2c7a7b').text('Tech: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), MX, my);
        my += 13;
      }
      mBody(p.description);
    });
  }

  // Footer
  doc.rect(SW, H - 26, W - SW, 26).fill('#2d3748');
  doc.fontSize(7.5).fillColor('#81e6d9').font('Helvetica').text(`SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, MX, H - 17, { width: MW, align: 'center' });
  doc.end();
});
