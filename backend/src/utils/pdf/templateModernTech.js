const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// MODERN TECH template — 100% Same as User Image (Priya Rao style)
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages, achievements, certifications }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buf = [];
      doc.on('data', b => buf.push(b));
      doc.on('end', () => resolve(Buffer.concat(buf)));
      doc.on('error', reject);

      const W = 595.28, H = 841.89;
      const SW = 195, MX = SW + 30, MW = W - MX - 30;
      const primaryBlue = '#3b82f6'; // Royal Blue
      const navyDark = '#1e3a8a';
      const slateText = '#334155';
      const slateMuted = '#64748b';
      const BOTTOM = H - 50;

      const drawBg = () => {
        doc.save();
        // Subtle geometric background pattern
        doc.lineWidth(0.2).strokeColor('#e2e8f0');
        for (let i = 0; i < W; i += 40) {
          doc.moveTo(i, 0).lineTo(i, H).stroke();
          doc.moveTo(0, i).lineTo(W, i).stroke();
        }
        // Diagonal lines for pattern
        for (let i = -H; i < W; i += 80) {
          doc.moveTo(i, 0).lineTo(i + H, H).stroke();
        }
        doc.restore();
      };

      const checkPage = (need = 40) => {
        if (ry + need > BOTTOM) {
          doc.addPage();
          drawBg();
          ry = 40;
          return true;
        }
        return false;
      };

      drawBg();

      // --- Profile Photo (Overlapping) ---
      const photoR = 65, pX = 100, pY = 100;
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
        doc.circle(pX, pY, photoR).fill(navyDark);
      }
      doc.circle(pX, pY, photoR).lineWidth(4).strokeColor('#fff').stroke();

      // --- Blue Name Box (Left Sidebar) ---
      doc.rect(0, 205, SW, 80).fill(navyDark);
      doc.fillColor('#fff').fontSize(24).font('Helvetica-Bold').text(user?.fullName || '', 20, 230, { width: SW - 40 });

      // --- Sidebar Info ---
      let ly = 300;
      const sKV = (icon, v) => {
        if (!v) return;
        doc.fillColor(primaryBlue).fontSize(10).text(icon, 20, ly, { width: 15 });
        doc.fillColor(slateText).fontSize(9.5).font('Helvetica').text(v, 40, ly, { width: SW - 50 });
        ly += Math.max(doc.heightOfString(v, { width: SW - 50 }), 14) + 12;
      };

      sKV('📞', user?.phone);
      sKV('✉', user?.email);
      if (profile?.linkedin) sKV('🔗', profile.linkedin.replace(/https?:\/\//, ''));
      if (profile?.github) sKV('🐙', profile.github.replace(/https?:\/\//, ''));
      sKV('📍', profile?.presentAddress);
      ly += 20;

      const sHead = (icon, t) => {
        doc.fillColor(primaryBlue).fontSize(12).font('Helvetica-Bold').text(icon + ' ' + t, 20, ly);
        ly += 18;
        doc.moveTo(20, ly).lineTo(SW - 10, ly).lineWidth(1).strokeColor('#cbd5e1').stroke();
        ly += 12;
      };

      if (skills?.technical?.length) {
        sHead('📊', 'Skills');
        skills.technical.forEach(s => {
          doc.circle(25, ly + 5, 2.5).fill(primaryBlue);
          doc.fillColor(slateText).fontSize(9).font('Helvetica').text(s, 35, ly, { width: SW - 50 });
          ly += 16;
        });
      }
      
      if (languages?.length) {
        ly += 20;
        sHead('📖', 'Language');
        languages.forEach(l => {
          doc.circle(25, ly + 5, 2.5).fill(primaryBlue);
          doc.fillColor(slateText).fontSize(9).text(l.name || l.language, 35, ly);
          ly += 16;
        });
      }

      // === RIGHT MAIN CONTENT ===
      let ry = 25;

      // Professional Summary Box
      const summary = profile?.objective || '';
      const sH = doc.heightOfString(summary, { width: MW - 40, lineGap: 3 }) + 60;
      doc.roundedRect(MX - 10, ry, MW + 20, sH, 8).fill(navyDark);
      doc.fillColor('#fff').fontSize(13).font('Helvetica-Bold').text('👤 Professional Summary', MX + 10, ry + 15);
      doc.fontSize(10).font('Helvetica').text(summary, MX + 10, ry + 40, { width: MW - 20, align: 'justify', lineGap: 3 });
      ry += sH + 30;

      const mHead = (icon, t) => {
        checkPage(50);
        doc.fillColor(primaryBlue).fontSize(13).font('Helvetica-Bold').text(icon + ' ' + t.toUpperCase(), MX, ry);
        ry += 18;
        doc.moveTo(MX, ry).lineTo(W - 30, ry).lineWidth(1).strokeColor('#cbd5e1').stroke();
        ry += 15;
      };

      const pillDate = (d) => {
        if (!d) return;
        const w = doc.widthOfString(d, { size: 8 }) + 20;
        doc.roundedRect(W - 30 - w, ry - 2, w, 15, 8).fill(primaryBlue);
        doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold').text(d, W - 30 - w, ry + 2, { width: w, align: 'center' });
      };

      if (educations?.length) {
        mHead('🎓', 'Education');
        educations.forEach(e => {
          checkPage(50);
          pillDate(e.passingYear);
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(e.institution, MX, ry, { width: MW - 100 });
          ry += 15;
          doc.fillColor(slateText).fontSize(10).font('Helvetica').text(`${e.degree || e.type}  |  Result: ${e.gpa || ''}`, MX, ry);
          ry += 14;
          doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Oblique').text(e.board || '', MX, ry);
          ry += 25;
        });
      }

      if (experiences?.length) {
        mHead('💼', 'Experience');
        experiences.forEach(e => {
          checkPage(80);
          const dateStr = `${e.fromDate} - ${e.isCurrent ? 'Present' : e.toDate}`;
          pillDate(dateStr);
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(e.company, MX, ry, { width: MW - 100 });
          ry += 15;
          doc.fillColor(slateText).fontSize(10).font('Helvetica-Bold').text(e.title, MX, ry);
          ry += 14;
          doc.fillColor(primaryBlue).fontSize(9).font('Helvetica-Oblique').text(profile?.presentAddress?.split(',').pop() || 'Remote', MX, ry);
          ry += 15;
          if (e.description) {
            const lines = e.description.split('\n');
            lines.forEach(line => {
              checkPage(15);
              doc.circle(MX + 5, ry + 5, 2).fill(primaryBlue);
              doc.fillColor(slateText).fontSize(9.5).font('Helvetica').text(line, MX + 15, ry, { width: MW - 15, lineGap: 2 });
              ry += doc.heightOfString(line, { width: MW - 15, lineGap: 2 }) + 5;
            });
          }
          ry += 15;
        });
      }

      if (projects?.length) {
        mHead('🚀', 'Projects');
        projects.forEach(p => {
          checkPage(60);
          doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text(p.title, MX, ry);
          ry += 16;
          if (p.description) {
            doc.fillColor(slateText).fontSize(9.5).font('Helvetica').text(p.description, MX, ry, { width: MW, lineGap: 2 });
            ry += doc.heightOfString(p.description, { width: MW, lineGap: 2 }) + 8;
          }
          if (p.githubLink || p.liveLink) {
            doc.fillColor(primaryBlue).fontSize(8.5).font('Helvetica-Bold');
            let linkStr = '';
            if (p.githubLink) linkStr += `Code on GitHub: ${p.githubLink.replace(/https?:\/\//, '')}  `;
            if (p.liveLink) linkStr += `Live Preview: ${p.liveLink.replace(/https?:\/\//, '')}`;
            doc.text(linkStr, MX, ry);
            ry += 14;
          }
          ry += 10;
        });
      }

      if (achievements?.length) {
        mHead('🏆', 'Awards');
        achievements.forEach(a => {
          checkPage(20);
          doc.circle(MX + 5, ry + 5, 2).fill(primaryBlue);
          doc.fillColor(slateText).fontSize(10).font('Helvetica').text(a.title || a, MX + 15, ry, { width: MW - 15 });
          ry += 18;
        });
      }

      doc.end();
    } catch (err) { reject(err); }
  });
};
