const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return res.data;
  } catch (e) { return null; }
};

// SMART PRO template — 2-Column, ATS-friendly, AUTO PAGE-BREAK
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buf = [];
      doc.on('data', b => buf.push(b));
      doc.on('end', () => resolve(Buffer.concat(buf)));
      doc.on('error', reject);

      const W = 595.28, H = 841.89;
      const SW = 190, MX = SW + 20, MW = W - MX - 20;
      const primaryColor = '#3b82f6';
      const secondaryColor = '#2563eb';
      const textColor = '#334155';
      const textLight = '#64748b';
      const BOTTOM = H - 45;

      // --- Draw backgrounds for a page ---
      const drawBg = () => {
        doc.rect(0, 0, SW, H).fill('#f8fafc');
        doc.moveTo(SW, 0).lineTo(SW, H).strokeColor('#e2e8f0').lineWidth(1).stroke();
      };

      // --- Page break for RIGHT column ---
      const checkPageRight = (need = 40) => {
        if (ry + need > BOTTOM) {
          doc.addPage();
          drawBg();
          ry = 40;
          return true;
        }
        return false;
      };

      drawBg();

      // === LEFT COLUMN (first page only — sidebar fits 1 page) ===
      let ly = 30;

      // Profile Photo
      const photoRadius = 45;
      const photoX = SW / 2;
      const photoY = ly + photoRadius;

      doc.save();
      doc.circle(photoX, photoY, photoRadius).clip();

      if (user?.profilePhoto) {
        const imgBuffer = await fetchImage(user.profilePhoto);
        if (imgBuffer) {
          doc.image(imgBuffer, photoX - photoRadius, photoY - photoRadius, { width: photoRadius * 2, height: photoRadius * 2 });
        } else {
          doc.rect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2).fill(primaryColor);
        }
      } else {
        doc.rect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2).fill(primaryColor);
        doc.fillColor('#fff').fontSize(36).font('Helvetica-Bold').text((user?.fullName?.[0] || 'S').toUpperCase(), photoX - photoRadius, photoY - 14, { width: photoRadius * 2, align: 'center' });
      }
      doc.restore();

      // Border for photo
      doc.circle(photoX, photoY, photoRadius).lineWidth(3).strokeColor('#fff').stroke();
      doc.circle(photoX, photoY, photoRadius + 1.5).lineWidth(1.5).strokeColor(primaryColor).stroke();

      ly += photoRadius * 2 + 20;

      // Name Banner
      doc.rect(0, ly, SW, 40).fill(primaryColor);
      doc.fillColor('#fff').fontSize(16).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), 15, ly + 12, { width: SW - 30 });
      ly += 55;

      const leftHead = (t) => {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(secondaryColor).text(t, 15, ly);
        ly += 14;
        doc.moveTo(15, ly).lineTo(SW - 15, ly).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        ly += 8;
      };

      const leftTxt = (icon, t) => {
        if (!t) return;
        doc.fontSize(9).font('Helvetica').fillColor(primaryColor).text(icon, 15, ly);
        doc.fillColor(textColor).text(t, 32, ly, { width: SW - 47 });
        ly += doc.heightOfString(t, { width: SW - 47 }) + 6;
      };

      // Contact
      leftTxt('📞', user?.phone);
      leftTxt('✉', user?.email);
      if (profile?.linkedin) leftTxt('in', profile.linkedin);
      if (profile?.presentAddress) leftTxt('📍', profile.presentAddress);
      ly += 10;

      // Skills
      if (skills?.technical?.length || skills?.soft?.length) {
        leftHead('Skills');
        [...(skills.technical || []), ...(skills.soft || [])].forEach(s => {
          if (ly > H - 40) return; // safety: skip if sidebar overflows
          doc.circle(20, ly + 4, 2).fill(primaryColor);
          doc.fontSize(9).font('Helvetica').fillColor(textColor).text(s, 30, ly, { width: SW - 45 });
          ly += 14;
        });
        ly += 10;
      }

      // Languages
      if (languages?.length) {
        leftHead('Languages');
        languages.forEach(l => {
          if (ly > H - 40) return;
          doc.circle(20, ly + 4, 2).fill(primaryColor);
          doc.fontSize(9).font('Helvetica').fillColor(textColor).text(l.name || l.language, 30, ly, { width: SW - 45 });
          ly += 14;
        });
      }

      // === RIGHT COLUMN ===
      let ry = 30;

      // Professional Summary (Rounded Box)
      if (profile?.objective) {
        const sumText = profile.objective;
        doc.fontSize(9).font('Helvetica');
        const textH = doc.heightOfString(sumText, { width: MW - 24, lineGap: 2 });
        const boxH = textH + 34;

        doc.roundedRect(MX, ry, MW, boxH, 6).fill(secondaryColor);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#fff').text('Professional Summary', MX + 12, ry + 12);
        doc.fontSize(9).font('Helvetica').fillColor('#f1f5f9').text(sumText, MX + 12, ry + 30, { width: MW - 24, lineGap: 2, align: 'justify' });
        ry += boxH + 20;
      }

      const rightHead = (icon, title) => {
        checkPageRight(50);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(secondaryColor).text(icon + '  ' + title, MX, ry);
        ry += 18;
        doc.moveTo(MX, ry).lineTo(W - 20, ry).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        ry += 10;
      };

      const datePill = (text, yPos) => {
        if (!text) return;
        doc.fontSize(8).font('Helvetica-Bold');
        const tw = doc.widthOfString(text) + 16;
        const px = W - 20 - tw;
        doc.roundedRect(px, yPos - 2, tw, 14, 7).fill(secondaryColor);
        doc.fillColor('#fff').text(text, px, yPos + 1, { width: tw, align: 'center' });
      };

      // Education
      if (educations?.length) {
        rightHead('🎓', 'Education');
        educations.forEach(e => {
          checkPageRight(40);
          doc.fontSize(10).font('Helvetica-Bold').fillColor(textColor).text(e.institution || '', MX, ry);
          datePill(e.passingYear ? e.passingYear.toString() : '', ry);
          ry += 14;
          doc.fontSize(9).font('Helvetica').fillColor(textLight).text(`${e.degree || e.type || ''}${e.gpa ? `, GPA: ${e.gpa}` : ''}`, MX, ry);
          ry += 18;
        });
        ry += 5;
      }

      // Experience
      if (experiences?.length) {
        rightHead('💼', 'Experience');
        experiences.forEach(e => {
          checkPageRight(60);
          doc.fontSize(10).font('Helvetica-Bold').fillColor(textColor).text(e.company || '', MX, ry);
          const dStr = `${e.fromDate || ''} - ${e.isCurrent ? 'Present' : (e.toDate || '')}`;
          datePill(dStr, ry);
          ry += 14;
          doc.fontSize(9).font('Helvetica').fillColor(secondaryColor).text(e.title || '', MX, ry);
          ry += 14;
          if (e.description) {
            checkPageRight(20);
            doc.fontSize(9).font('Helvetica').fillColor(textLight).text(e.description, MX, ry, { width: MW - 10, align: 'justify', lineGap: 1.5 });
            ry += doc.heightOfString(e.description, { width: MW - 10 }) + 6;
          }
          ry += 6;
        });
        ry += 5;
      }

      // Projects & Awards
      if (projects?.length) {
        rightHead('🏆', 'Projects & Awards');
        projects.forEach(p => {
          checkPageRight(50);
          doc.fontSize(10).font('Helvetica-Bold').fillColor(textColor).text(p.title || '', MX, ry);
          ry += 14;
          if (p.technologies?.length) {
            doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(secondaryColor).text('Tech: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), MX, ry);
            ry += 12;
          }
          if (p.description) {
            checkPageRight(20);
            doc.fontSize(9).font('Helvetica').fillColor(textLight).text(p.description, MX, ry, { width: MW - 10, align: 'justify', lineGap: 1.5 });
            ry += doc.heightOfString(p.description, { width: MW - 10 }) + 6;
          }
          ry += 6;
        });
      }

      // Footer on last page
      doc.rect(0, H - 20, W, 20).fill('#1e293b');
      doc.fontSize(7).fillColor('#94a3b8').font('Helvetica').text(`SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-GB')}`, 0, H - 14, { width: W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
