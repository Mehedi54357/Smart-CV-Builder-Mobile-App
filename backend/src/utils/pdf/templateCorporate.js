const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try { const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 }); return r.data; }
  catch (e) { return null; }
};

// CORPORATE template — Dark Blue sidebar + white main, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  const W = 595.28, H = 841.89;
  const SW = 185, MX = SW + 14, MW = W - MX - 30;
  const BOTTOM = H - 50;

  // --- Draw page backgrounds ---
  const drawBg = () => {
    doc.rect(0, 0, SW, H).fill('#1a365d');
    doc.rect(SW, 0, W - SW, H).fill('#ffffff');
  };

  const checkPageMain = (need = 40) => {
    if (my + need > BOTTOM) {
      doc.addPage();
      drawBg();
      my = 40;
      return true;
    }
    return false;
  };

  drawBg();

  // Profile Photo in Sidebar
  const photoRadius = 45;
  const photoX = SW / 2;
  const photoY = 60;
  
  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      doc.save();
      doc.circle(photoX, photoY, photoRadius).clip();
      doc.image(imgBuf, photoX - photoRadius, photoY - photoRadius, { width: photoRadius * 2, height: photoRadius * 2 });
      doc.restore();
    }
  } else {
    doc.circle(photoX, photoY, photoRadius).fill('#2b6cb0');
    doc.fillColor('#fff').fontSize(36).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0].toUpperCase(), photoX - photoRadius, photoY - 14, { width: photoRadius * 2, align: 'center' });
  }
  doc.circle(photoX, photoY, photoRadius).lineWidth(3).strokeColor('#fff').stroke();

  // Header strip on main side
  doc.rect(SW, 0, W - SW, 110).fill('#2b6cb0');
  doc.fillColor('#fff').fontSize(20).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), MX, 22, { width: MW, lineGap: 2 });
  if (profile?.jobTitle || profile?.objective) {
    doc.fontSize(10).font('Helvetica').fillColor('#bfdbfe').text(profile.jobTitle || (profile.objective || '').substring(0, 60) + '…', MX, 52, { width: MW });
  }
  const ct = []; if (user?.phone) ct.push(user.phone); if (user?.email) ct.push(user.email);
  doc.fontSize(8.5).fillColor('#93c5fd').text(ct.join('  |  '), MX, 72, { width: MW });

  // === SIDEBAR ===
  let sy = photoY + photoRadius + 20;
  const sHead = (t) => {
    doc.rect(12, sy, SW - 24, 1).fill('#3b82f6'); sy += 6;
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#93c5fd').text(t.toUpperCase(), 12, sy, { characterSpacing: 1 }); sy += 18;
  };
  const sTxt = (t) => {
    doc.fontSize(8.5).font('Helvetica').fillColor('#e2e8f0').text(t, 12, sy, { width: SW - 24 });
    sy += doc.heightOfString(t, { width: SW - 24 }) + 4;
  };
  const sBold = (t) => { doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff').text(t, 12, sy, { width: SW - 24 }); sy += 14; };

  if (profile?.presentAddress) { sHead('Contact'); sTxt(`📍 ${profile.presentAddress}`); }
  if (profile?.linkedin) { sTxt(`in ${profile.linkedin}`); }
  sy += 6;

  sHead('Education');
  educations?.forEach(e => {
    sBold(e.degree || e.type || '');
    sTxt(e.institution || '');
    sTxt(`GPA: ${e.gpa || ''}  |  ${e.passingYear || ''}`);
    sy += 4;
  });
  sy += 4;

  sHead('Skills');
  skills?.technical?.forEach(s => sTxt(`• ${s}`));
  if (skills?.soft?.length) { sy += 4; sHead('Soft Skills'); skills.soft.forEach(s => sTxt(`• ${s}`)); }
  if (languages?.length) { sy += 4; sHead('Languages'); languages.forEach(l => sTxt(`• ${l.name || l.language}`)); }

  // === MAIN CONTENT ===
  let my = 120;
  const mHead = (t) => {
    checkPageMain(50);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#1a365d').text(t.toUpperCase(), MX, my, { characterSpacing: 1.2 });
    my += 14;
    doc.rect(MX, my, MW, 1.5).fill('#2b6cb0');
    my += 10;
  };

  const mSub = (t, r = '') => {
    checkPageMain();
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(t, MX, my, { continued: !!r, width: MW - 100 });
    if (r) doc.fontSize(8.5).font('Helvetica').fillColor('#64748b').text(r, { align: 'right' });
    my += 15;
  };

  const mBody = (t) => {
    if (!t) return;
    checkPageMain();
    doc.fontSize(9).font('Helvetica').fillColor('#475569').text(t, MX, my, { width: MW, align: 'justify' });
    my += doc.heightOfString(t, { width: MW }) + 8;
  };

  if (profile?.objective) { mHead('Professional Summary'); mBody(profile.objective); my += 8; }

  if (experiences?.length) {
    mHead('Work Experience');
    experiences.forEach(e => {
      checkPageMain(60);
      mSub(e.title, `${e.fromDate || ''}–${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#2b6cb0').text(e.company, MX, my); my += 14;
      mBody(e.description);
    });
  }

  if (projects?.length) {
    mHead('Projects');
    projects.forEach(p => {
      checkPageMain(50);
      mSub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#1a365d').text('Tech: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), MX, my);
        my += 13;
      }
      mBody(p.description);
    });
  }

  // Personal info
  my += 10; mHead('Personal Information');
  [["Father's Name", profile?.fatherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['Gender', profile?.gender], ['NID', profile?.nid]]
    .filter(([, v]) => v).forEach(([k, v]) => {
      checkPageMain();
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(k + ': ', MX, my, { continued: true });
      doc.font('Helvetica').fillColor('#1e293b').text(v, { width: MW });
      my += 14;
    });

  // Footer
  doc.rect(SW, H - 26, W - SW, 26).fill('#2b6cb0');
  doc.fontSize(7.5).fillColor('#bfdbfe').font('Helvetica').text(`SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, MX, H - 17, { width: MW, align: 'center' });
  doc.end();
  } catch(err) { reject(err); }
});
