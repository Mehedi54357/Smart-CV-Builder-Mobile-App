const PDFDocument = require('pdfkit');
const axios = require('axios');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// CLASSIC MINIMAL template — 100% Same as Mehedi Hasan's CV
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages, achievements, certifications }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buf = [];
      doc.on('data', b => buf.push(b));
      doc.on('end', () => resolve(Buffer.concat(buf)));
      doc.on('error', reject);

      const W = 595.28;
      const MX = 40, MW = W - (MX * 2);
      const primaryColor = '#000000';
      const secondaryColor = '#334155';
      const BOTTOM = 800;

      let y = 40;

      const checkPage = (need = 40) => {
        if (y + need > BOTTOM) {
          doc.addPage();
          y = 40;
          return true;
        }
        return false;
      };

      // --- Header (Name Left, Photo Right) ---
      const photoSize = 85;
      const photoX = W - MX - photoSize;

      // Name & Contact
      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text((user?.fullName || '').toUpperCase(), MX, y);
      y += 25;

      doc.fontSize(9.5).font('Helvetica').fillColor(secondaryColor);
      if (profile?.jobTitle) { doc.text(profile.jobTitle, MX, y); y += 14; }
      doc.text(profile?.presentAddress || '', MX, y); y += 14;
      doc.fillColor('#3b82f6').text(user?.email || '', MX, y); y += 14;
      doc.fillColor(secondaryColor).text(user?.phone || '', MX, y); y += 14;
      if (profile?.github) { doc.fillColor('#3b82f6').text(profile.github, MX, y); y += 14; }

      // Photo on Top Right
      if (user?.profilePhoto) {
        const imgBuf = await fetchImage(user.profilePhoto);
        if (imgBuf) {
          try {
            doc.save();
            doc.rect(photoX, 40, photoSize, photoSize).clip();
            const img = doc.openImage(imgBuf);
            const iAspect = img.width / img.height;
            let dW, dH, dx, dy;
            if (iAspect > 1) { dH = photoSize; dW = dH * iAspect; dx = photoX - (dW - photoSize) / 2; dy = 40; }
            else { dW = photoSize; dH = dW / iAspect; dx = photoX; dy = 40 - (dH - photoSize) / 2; }
            doc.image(imgBuf, dx, dy, { width: dW, height: dH });
            doc.restore();
            doc.rect(photoX, 40, photoSize, photoSize).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
          } catch (e) { }
        }
      }

      y = Math.max(y, 40 + photoSize + 20);

      const section = (t) => {
        checkPage(50);
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text(t, MX, y);
        y += 16;
        doc.moveTo(MX, y).lineTo(W - MX, y).lineWidth(0.8).strokeColor('#000').stroke();
        y += 12;
      };

      const rightDate = (d) => {
        if (!d) return;
        const curY = doc.y;
        doc.fontSize(9).font('Helvetica').fillColor(secondaryColor).text(d, MX, y - 14, { align: 'right', width: MW });
      };

      // Objective
      if (profile?.objective) {
        section('Objective');
        doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica').text(profile.objective, MX, y, { width: MW, align: 'justify', lineGap: 2 });
        y += doc.heightOfString(profile.objective, { width: MW, lineGap: 2 }) + 20;
      }

      // Education
      if (educations?.length) {
        section('Education');
        educations.forEach(e => {
          checkPage(40);
          doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(e.degree || e.type, MX, y, { continued: true });
          doc.font('Helvetica').text(`, ${e.institution}`, { continued: false });
          rightDate(e.passingYear);
          y += 14;
          if (e.board) { doc.fontSize(9).fillColor(secondaryColor).text(`Relevant Courses / Board: ${e.board}`, MX, y); y += 14; }
          y += 6;
        });
        y += 10;
      }

      // Experience
      if (experiences?.length) {
        section('Experience');
        experiences.forEach(e => {
          checkPage(60);
          doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(e.company, MX, y);
          rightDate(`${e.fromDate} - ${e.isCurrent ? 'Present' : e.toDate}`);
          y += 14;
          doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica-Bold').text(e.title, MX, y);
          y += 14;
          if (e.description) {
            const lines = e.description.split('\n');
            lines.forEach(line => {
              checkPage(15);
              doc.circle(MX + 5, y + 5, 1.5).fill('#000');
              doc.fillColor(secondaryColor).fontSize(9).font('Helvetica').text(line, MX + 15, y, { width: MW - 15 });
              y += doc.heightOfString(line, { width: MW - 15 }) + 4;
            });
          }
          y += 10;
        });
      }

      // Projects
      if (projects?.length) {
        section('Projects');
        projects.forEach(p => {
          checkPage(60);
          doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text(p.title, MX, y);
          rightDate(p.year || '2023');
          y += 14;
          if (p.description) {
            const lines = p.description.split('\n');
            lines.forEach(line => {
              checkPage(15);
              doc.circle(MX + 5, y + 5, 1.5).fill('#000');
              doc.fillColor(secondaryColor).fontSize(9).font('Helvetica').text(line, MX + 15, y, { width: MW - 15 });
              y += doc.heightOfString(line, { width: MW - 15 }) + 4;
            });
          }
          if (p.githubLink || p.liveLink) {
            checkPage(15);
            doc.fillColor('#3b82f6').fontSize(8.5).font('Helvetica-Bold');
            let linkStr = '';
            if (p.githubLink) linkStr += `Code on GitHub: ${p.githubLink.replace(/https?:\/\//, '')}  `;
            if (p.liveLink) linkStr += `Live Preview: ${p.liveLink.replace(/https?:\/\//, '')}`;
            doc.text(linkStr, MX + 15, y);
            y += 14;
          }
          y += 8;
        });
      }

      // Technical Skills
      if (skills?.technical?.length) {
        section('Technical Skills');
        skills.technical.forEach(s => {
          checkPage(15);
          doc.circle(MX + 5, y + 5, 1.5).fill('#000');
          doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica').text(s, MX + 15, y, { width: MW - 15 });
          y += 16;
        });
        y += 10;
      }

      // Achievements & Certifications
      if (achievements?.length || certifications?.length) {
        section('Achievements & Certifications');
        [...(achievements || []), ...(certifications || [])].forEach(a => {
          checkPage(15);
          doc.circle(MX + 5, y + 5, 1.5).fill('#000');
          doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica').text(a.title || a, MX + 15, y, { width: MW - 15 });
          y += 16;
        });
      }

      doc.end();
    } catch (err) { reject(err); }
  });
};
