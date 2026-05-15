const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
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
      const SW = 195, MX = SW + 25, MW = W - MX - 25;
      const primaryColor = '#1e40af'; // Deeper Blue
      const secondaryColor = '#2563eb';
      const accentColor = '#3b82f6';
      const textColor = '#1e293b';
      const textLight = '#64748b';
      const BOTTOM = H - 45;

      // --- Draw backgrounds for a page ---
      const drawBg = () => {
        doc.rect(0, 0, SW, H).fill('#f1f5f9'); // Lighter sidebar bg
        doc.moveTo(SW, 0).lineTo(SW, H).strokeColor('#cbd5e1').lineWidth(0.8).stroke();
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

      // === LEFT COLUMN ===
      let ly = 40;

      // Profile Photo with Aspect Ratio Fix
      const photoRadius = 50;
      const photoX = SW / 2;
      const photoY = ly + photoRadius;

      if (user?.profilePhoto) {
        const imgBuffer = await fetchImage(user.profilePhoto);
        if (imgBuffer) {
          try {
            doc.save();
            doc.circle(photoX, photoY, photoRadius).clip();
            
            // Fix aspect ratio (Cover logic)
            const img = doc.openImage(imgBuffer);
            const iW = img.width, iH = img.height;
            const iAspect = iW / iH;
            const targetSize = photoRadius * 2;
            
            let drawW, drawH, dx, dy;
            if (iAspect > 1) { // Landscape
              drawH = targetSize;
              drawW = targetSize * iAspect;
              dx = photoX - (drawW / 2);
              dy = photoY - photoRadius;
            } else { // Portrait
              drawW = targetSize;
              drawH = targetSize / iAspect;
              dx = photoX - photoRadius;
              dy = photoY - (drawH / 2);
            }
            
            doc.image(imgBuffer, dx, dy, { width: drawW, height: drawH });
            doc.restore();
          } catch (e) {
            doc.circle(photoX, photoY, photoRadius).fill(primaryColor);
          }
        } else {
          doc.circle(photoX, photoY, photoRadius).fill(primaryColor);
        }
      } else {
        doc.circle(photoX, photoY, photoRadius).fill(primaryColor);
        doc.fillColor('#fff').fontSize(38).font('Helvetica-Bold').text((user?.fullName?.[0] || 'S').toUpperCase(), photoX - photoRadius, photoY - 16, { width: photoRadius * 2, align: 'center' });
      }

      // Decorative border for photo
      doc.circle(photoX, photoY, photoRadius + 2).lineWidth(2).strokeColor(primaryColor).stroke();
      ly += photoRadius * 2 + 25;

      // Name Banner
      doc.rect(0, ly, SW, 45).fill(primaryColor);
      doc.fillColor('#fff').fontSize(15).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), 15, ly + 15, { width: SW - 30, align: 'center' });
      ly += 65;

      const leftHead = (t) => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(t.toUpperCase(), 20, ly, { characterSpacing: 1 });
        ly += 14;
        doc.moveTo(20, ly).lineTo(SW - 20, ly).strokeColor(accentColor).lineWidth(1.5).stroke();
        ly += 10;
      };

      const leftTxt = (icon, t) => {
        if (!t) return;
        doc.fontSize(9).font('Helvetica').fillColor(primaryColor).text(icon, 20, ly);
        doc.fillColor(textColor).text(t, 36, ly, { width: SW - 56 });
        ly += Math.max(doc.heightOfString(t, { width: SW - 56 }), 12) + 8;
      };

      // Contact
      leftHead('Contact');
      leftTxt('📞', user?.phone);
      leftTxt('✉', user?.email);
      if (profile?.linkedin) leftTxt('in', profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, ''));
      if (profile?.presentAddress) leftTxt('📍', profile.presentAddress);
      ly += 12;

      // Skills
      if (skills?.technical?.length) {
        leftHead('Technical Skills');
        skills.technical.forEach(s => {
          if (ly > H - 40) return;
          doc.rect(20, ly + 3, 4, 4).fill(accentColor);
          doc.fontSize(9).font('Helvetica').fillColor(textColor).text(s, 32, ly, { width: SW - 50 });
          ly += 16;
        });
        ly += 10;
      }

      if (skills?.soft?.length) {
        leftHead('Soft Skills');
        skills.soft.forEach(s => {
          if (ly > H - 40) return;
          doc.rect(20, ly + 3, 4, 4).fill(secondaryColor);
          doc.fontSize(9).font('Helvetica').fillColor(textColor).text(s, 32, ly, { width: SW - 50 });
          ly += 16;
        });
        ly += 10;
      }

      // === RIGHT COLUMN ===
      let ry = 40;

      // Title & Summary
      if (profile?.jobTitle) {
        doc.fontSize(18).font('Helvetica-Bold').fillColor(primaryColor).text(profile.jobTitle.toUpperCase(), MX, ry);
        ry += 24;
      }

      if (profile?.objective) {
        const sumText = profile.objective;
        doc.fontSize(9).font('Helvetica').fillColor(textLight).text(sumText, MX, ry, { width: MW, align: 'justify', lineGap: 2 });
        ry += doc.heightOfString(sumText, { width: MW, lineGap: 2 }) + 25;
      }

      const rightHead = (icon, title) => {
        checkPageRight(50);
        doc.fontSize(13).font('Helvetica-Bold').fillColor(primaryColor).text(icon + '  ' + title.toUpperCase(), MX, ry, { characterSpacing: 0.5 });
        ry += 18;
        doc.rect(MX, ry, MW, 2).fill(accentColor);
        ry += 15;
      };

      const datePill = (text, yPos) => {
        if (!text) return;
        doc.fontSize(8.5).font('Helvetica-Bold');
        const tw = doc.widthOfString(text) + 20;
        const px = W - 25 - tw;
        doc.roundedRect(px, yPos - 3, tw, 16, 8).fill(primaryColor);
        doc.fillColor('#fff').text(text, px, yPos + 1, { width: tw, align: 'center' });
      };

      // Experience
      if (experiences?.length) {
        rightHead('💼', 'Work Experience');
        experiences.forEach(e => {
          checkPageRight(70);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text(e.title || '', MX, ry, { width: MW - 100 });
          datePill(`${e.fromDate || ''} - ${e.isCurrent ? 'Present' : (e.toDate || '')}`, ry);
          ry += 15;
          doc.fontSize(10).font('Helvetica-Bold').fillColor(secondaryColor).text(e.company || '', MX, ry);
          ry += 16;
          if (e.description) {
            checkPageRight(30);
            doc.fontSize(9.5).font('Helvetica').fillColor(textLight).text(e.description, MX, ry, { width: MW, align: 'justify', lineGap: 2 });
            ry += doc.heightOfString(e.description, { width: MW, lineGap: 2 }) + 12;
          }
          ry += 8;
        });
        ry += 10;
      }

      // Education
      if (educations?.length) {
        rightHead('🎓', 'Education');
        educations.forEach(e => {
          checkPageRight(50);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text(e.institution || '', MX, ry, { width: MW - 80 });
          datePill(e.passingYear ? e.passingYear.toString() : '', ry);
          ry += 15;
          doc.fontSize(10).font('Helvetica').fillColor(secondaryColor).text(`${e.degree || e.type || ''}${e.gpa ? `  |  Result: ${e.gpa}` : ''}`, MX, ry);
          ry += 20;
        });
        ry += 10;
      }

      // Projects
      if (projects?.length) {
        rightHead('🚀', 'Projects');
        projects.forEach(p => {
          checkPageRight(60);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text(p.title || '', MX, ry);
          ry += 15;
          if (p.technologies?.length) {
            doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text('Tech: ' + (Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies), MX, ry);
            ry += 14;
          }
          if (p.description) {
            checkPageRight(30);
            doc.fontSize(9.5).font('Helvetica').fillColor(textLight).text(p.description, MX, ry, { width: MW, align: 'justify', lineGap: 2 });
            ry += doc.heightOfString(p.description, { width: MW, lineGap: 2 }) + 10;
          }
          ry += 10;
        });
      }

      // Footer
      doc.rect(0, H - 25, W, 25).fill('#1e293b');
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text(`Generated by SmartCV Builder Pro  •  www.smartcv.com`, 0, H - 16, { width: W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

