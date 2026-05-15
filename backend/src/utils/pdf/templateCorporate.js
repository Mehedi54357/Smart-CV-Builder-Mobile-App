const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// CORPORATE template — Dark Blue sidebar + white main, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => new Promise(async (resolve, reject) => {
  try {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const buf = []; doc.on('data', b => buf.push(b)); doc.on('end', () => resolve(Buffer.concat(buf))); doc.on('error', reject);
  
  const W = 595.28, H = 841.89;
  const SW = 200, MX = SW + 30, MW = W - MX - 30;
  const primaryColor = '#0f172a'; // Navy Dark
  const secondaryColor = '#334155';
  const accentColor = '#3b82f6';
  const BOTTOM = H - 50;

  // --- Draw page backgrounds ---
  const drawBg = () => {
    doc.rect(0, 0, SW, H).fill(primaryColor);
    doc.rect(SW, 0, W - SW, H).fill('#ffffff');
  };

  const checkPageMain = (need = 40) => {
    if (my + need > BOTTOM) {
      doc.addPage();
      drawBg();
      my = 50;
      return true;
    }
    return false;
  };

  drawBg();

  // Profile Photo with Aspect Ratio Fix
  const photoRadius = 55;
  const photoX = SW / 2;
  const photoY = 70;
  
  if (user?.profilePhoto) {
    const imgBuf = await fetchImage(user.profilePhoto);
    if (imgBuf) {
      try {
        doc.save();
        doc.circle(photoX, photoY, photoRadius).clip();
        
        const img = doc.openImage(imgBuf);
        const iW = img.width, iH = img.height;
        const iAspect = iW / iH;
        const targetSize = photoRadius * 2;
        
        let drawW, drawH, dx, dy;
        if (iAspect > 1) {
          drawH = targetSize;
          drawW = targetSize * iAspect;
          dx = photoX - (drawW / 2);
          dy = photoY - photoRadius;
        } else {
          drawW = targetSize;
          drawH = targetSize / iAspect;
          dx = photoX - photoRadius;
          dy = photoY - (drawH / 2);
        }
        
        doc.image(imgBuf, dx, dy, { width: drawW, height: drawH });
        doc.restore();
      } catch (e) {
        doc.circle(photoX, photoY, photoRadius).fill('#1e293b');
      }
    }
  } else {
    doc.circle(photoX, photoY, photoRadius).fill('#1e293b');
    doc.fillColor('#fff').fontSize(42).font('Helvetica-Bold')
       .text((user?.fullName || 'U')[0].toUpperCase(), photoX - photoRadius, photoY - 18, { width: photoRadius * 2, align: 'center' });
  }
  doc.circle(photoX, photoY, photoRadius).lineWidth(3).strokeColor('#fff').stroke();

  // Header strip on main side
  doc.rect(SW, 0, W - SW, 120).fill('#f8fafc');
  doc.fillColor(primaryColor).fontSize(22).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), MX, 35, { width: MW });
  if (profile?.jobTitle) {
    doc.fontSize(12).font('Helvetica').fillColor(accentColor).text(profile.jobTitle.toUpperCase(), MX, 65, { width: MW, characterSpacing: 1 });
  }
  const ct = []; if (user?.phone) ct.push(user.phone); if (user?.email) ct.push(user.email);
  doc.fontSize(9).fillColor(secondaryColor).text(ct.join('   |   '), MX, 85, { width: MW });

  // === SIDEBAR ===
  let sy = photoY + photoRadius + 40;
  const sHead = (t) => {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#94a3b8').text(t.toUpperCase(), 20, sy, { characterSpacing: 1.5 });
    sy += 16;
    doc.rect(20, sy, SW - 40, 1).fill('#334155');
    sy += 12;
  };
  const sTxt = (t) => {
    doc.fontSize(9).font('Helvetica').fillColor('#cbd5e1').text(t, 20, sy, { width: SW - 40, lineGap: 2 });
    sy += doc.heightOfString(t, { width: SW - 40, lineGap: 2 }) + 8;
  };
  const sBold = (t) => { doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff').text(t, 20, sy, { width: SW - 40 }); sy += 16; };

  if (profile?.presentAddress) { sHead('Contact'); sTxt(`📍 ${profile.presentAddress}`); }
  if (profile?.linkedin) { sTxt(`in ${profile.linkedin.replace(/https?:\/\//, '')}`); }
  sy += 15;

  if (educations?.length) {
    sHead('Education');
    educations.forEach(e => {
      sBold(e.degree || e.type || '');
      sTxt(`${e.institution}\nResult: ${e.gpa || ''} (${e.passingYear || ''})`);
      sy += 4;
    });
  }
  sy += 15;

  if (skills?.technical?.length) {
    sHead('Technical Skills');
    skills.technical.forEach(s => sTxt(`• ${s}`));
  }
  
  if (languages?.length) {
    sy += 15;
    sHead('Languages');
    languages.forEach(l => sTxt(`• ${l.name || l.language}`));
  }

  // === MAIN CONTENT ===
  let my = 140;
  const mHead = (t) => {
    checkPageMain(50);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(t.toUpperCase(), MX, my, { characterSpacing: 1 });
    my += 16;
    doc.rect(MX, my, MW, 2).fill(accentColor);
    my += 15;
  };

  const mSub = (t, r = '') => {
    checkPageMain();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text(t, MX, my, { continued: !!r, width: MW - 120 });
    if (r) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(secondaryColor).text(r, { align: 'right' });
    }
    my += 18;
  };

  const mBody = (t) => {
    if (!t) return;
    checkPageMain();
    doc.fontSize(10).font('Helvetica').fillColor('#475569').text(t, MX, my, { width: MW, align: 'justify', lineGap: 2 });
    my += doc.heightOfString(t, { width: MW, lineGap: 2 }) + 12;
  };

  if (profile?.objective) { mHead('Professional Summary'); mBody(profile.objective); my += 10; }

  if (experiences?.length) {
    mHead('Work Experience');
    experiences.forEach(e => {
      checkPageMain(80);
      mSub(e.title, `${e.fromDate || ''} — ${e.isCurrent ? 'Present' : e.toDate || ''}`);
      doc.fontSize(10.5).font('Helvetica-Bold').fillColor(accentColor).text(e.company, MX, my); my += 18;
      mBody(e.description);
    });
  }

  if (projects?.length) {
    mHead('Key Projects');
    projects.forEach(p => {
      checkPageMain(60);
      mSub(p.title);
      if (p.technologies?.length) {
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor(secondaryColor).text('Technologies: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), MX, my);
        my += 16;
      }
      mBody(p.description);
    });
  }

  // Personal info
  my += 10; mHead('Personal Information');
  [["Father's Name", profile?.fatherName], ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : null], ['Gender', profile?.gender], ['NID', profile?.nid]]
    .filter(([, v]) => v).forEach(([k, v]) => {
      checkPageMain();
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(secondaryColor).text(k + ': ', MX, my, { continued: true });
      doc.font('Helvetica').fillColor('#1e293b').text(v, { width: MW });
      my += 16;
    });

  // Footer
  doc.rect(SW, H - 30, W - SW, 30).fill('#f8fafc');
  doc.fontSize(8).fillColor(secondaryColor).font('Helvetica').text(`SmartCV Builder Pro  •  www.smartcv.com  •  ${new Date().toLocaleDateString('en-GB')}`, MX, H - 18, { width: MW, align: 'center' });
  doc.end();
  } catch(err) { reject(err); }
});
