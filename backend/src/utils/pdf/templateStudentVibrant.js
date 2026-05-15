const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// STUDENT VIBRANT template — Colorful & Modern for Students
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages, achievements, certifications }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buf = [];
      doc.on('data', b => buf.push(b));
      doc.on('end', () => resolve(Buffer.concat(buf)));
      doc.on('error', reject);

      const W = 595.28, H = 841.89;
      const primaryColor = '#14b8a6'; // Vibrant Teal
      const secondaryColor = '#0f766e';
      const bgLight = '#f0fdfa';
      const textDark = '#134e4a';

      // --- Header Gradient ---
      doc.rect(0, 0, W, 180).fill(primaryColor);
      
      // Top Decorations
      doc.circle(W, 0, 100).fillColor('#ffffff20').fill();
      doc.circle(0, 0, 150).fillColor('#ffffff10').fill();

      let y = 50;

      // Photo
      const photoR = 55, pX = 80, pY = 90;
      if (user?.profilePhoto) {
        const imgBuf = await fetchImage(user.profilePhoto);
        if (imgBuf) {
          doc.save();
          doc.circle(pX, pY, photoR).clip();
          const img = doc.openImage(imgBuf);
          const iAspect = img.width / img.height;
          let dW, dH, dx, dy;
          if (iAspect > 1) { dH = photoR * 2; dW = dH * iAspect; dx = pX - dW / 2; dy = pY - photoR; }
          else { dW = photoR * 2; dH = dW / iAspect; dx = pX - photoR; dy = pY - dH / 2; }
          doc.image(imgBuf, dx, dy, { width: dW, height: dH });
          doc.restore();
        }
      } else {
        doc.circle(pX, pY, photoR).fill('#ffffff40');
      }
      doc.circle(pX, pY, photoR).lineWidth(4).strokeColor('#fff').stroke();

      // Name & Title
      doc.fillColor('#fff').fontSize(28).font('Helvetica-Bold').text(user?.fullName || '', 160, 65);
      doc.fontSize(14).font('Helvetica').text('Student / Aspiring Professional', 160, 98);
      
      // Contact Bar
      doc.rect(160, 130, 400, 30).fill('#ffffff30');
      doc.fontSize(9).text(`📞 ${user?.phone || ''}  |  ✉ ${user?.email || ''}  |  📍 ${profile?.presentAddress || ''}`, 170, 140);

      // --- Body ---
      const SW = 180, MW = W - SW - 60, MX = SW + 40;
      y = 200;

      // Sidebar (Left)
      doc.rect(0, 180, SW, H - 180).fill(bgLight);
      
      let ly = 220;
      const sHead = (t) => {
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(t.toUpperCase(), 20, ly);
        ly += 18;
        doc.moveTo(20, ly).lineTo(SW - 20, ly).lineWidth(2).strokeColor(primaryColor).stroke();
        ly += 12;
      };

      if (skills?.technical?.length) {
        sHead('Skills');
        skills.technical.forEach(s => {
          doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text('• ' + s, 25, ly);
          ly += 16;
        });
        ly += 15;
      }

      if (languages?.length) {
        sHead('Language');
        languages.forEach(l => {
          doc.fillColor(textDark).fontSize(9.5).text('✓ ' + (l.name || l.language), 25, ly);
          ly += 16;
        });
      }

      // Main Content (Right)
      let ry = 220;
      const mHead = (t) => {
        doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text(t, MX, ry);
        ry += 18;
        doc.moveTo(MX, ry).lineTo(W - 40, ry).lineWidth(1).strokeColor('#e2e8f0').stroke();
        ry += 15;
      };

      // Objective
      if (profile?.objective) {
        mHead('Career Objective');
        doc.fillColor(textDark).fontSize(10).font('Helvetica').text(profile.objective, MX, ry, { width: MW, align: 'justify', lineGap: 3 });
        ry += doc.heightOfString(profile.objective, { width: MW, lineGap: 3 }) + 30;
      }

      // Education Timeline
      if (educations?.length) {
        mHead('Education Journey');
        educations.sort((a,b) => b.passingYear - a.passingYear).forEach((e, i) => {
          // Timeline dot and line
          doc.circle(MX, ry + 5, 4).fill(primaryColor);
          if (i < educations.length - 1) {
            doc.moveTo(MX, ry + 12).lineTo(MX, ry + 60).lineWidth(1).strokeColor('#cbd5e1').stroke();
          }

          doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text(e.passingYear || 'Running', MX + 15, ry);
          ry += 12;
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(e.institution, MX + 15, ry);
          ry += 14;
          doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text(e.degree || e.type, MX + 15, ry);
          ry += 35;
        });
      }

      // Projects or Awards
      if (projects?.length) {
        mHead('Key Projects');
        projects.forEach(p => {
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(p.title, MX, ry);
          ry += 15;
          doc.fillColor(textDark).fontSize(9.5).font('Helvetica').text(p.description, MX, ry, { width: MW });
          ry += doc.heightOfString(p.description, { width: MW }) + 15;
        });
      }

      if (achievements?.length) {
        mHead('Achievements');
        achievements.forEach(a => {
          doc.fillColor(textDark).fontSize(10).text('🏆 ' + (a.title || a), MX, ry, { width: MW });
          ry += 20;
        });
      }

      doc.end();
    } catch (err) { reject(err); }
  });
};
