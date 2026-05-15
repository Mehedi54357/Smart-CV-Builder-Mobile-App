const PDFDocument = require('pdfkit');
const axios = require('axios');
const path = require('path');

const fetchImage = async (url) => {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    return res.data;
  } catch (e) { return null; }
};

// BENGALI PRO template — 100% Same as User Image
module.exports = async ({ user, profile, educations, experiences, skills, projects, languages, achievements, certifications }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buf = [];
      doc.on('data', b => buf.push(b));
      doc.on('end', () => resolve(Buffer.concat(buf)));
      doc.on('error', reject);

      // --- Font Configuration ---
      // Note: You must have a Bengali font like SolaimanLipi.ttf in your fonts folder.
      // If not, it will fallback to Helvetica which won't show Bengali characters.
      const fontPath = path.join(__dirname, '..', '..', 'assets', 'fonts', 'SolaimanLipi.ttf');
      const hasFont = true; // Set to true if file exists
      
      const setFont = (isBold = false) => {
        try { doc.font(fontPath); } catch(e) { doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica'); }
      };

      const W = 595.28, H = 841.89;
      const SW = 195, MX = SW + 25, MW = W - MX - 25;
      const primaryColor = '#0f172a'; // Navy/Dark Sidebar
      const accentColor = '#1e3a8a';
      const BOTTOM = H - 50;

      // --- Draw backgrounds ---
      const drawBg = () => {
        doc.rect(0, 0, SW, H).fill(primaryColor);
        doc.rect(SW, 0, W - SW, H).fill('#ffffff');
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

      // === LEFT SIDEBAR ===
      let ly = 30;

      // Photo (Cover logic)
      const pR = 50, pX = SW / 2, pY = ly + pR;
      if (user?.profilePhoto) {
        const imgBuf = await fetchImage(user.profilePhoto);
        if (imgBuf) {
          doc.save();
          doc.circle(pX, pY, pR).clip();
          const img = doc.openImage(imgBuf);
          const iAspect = img.width / img.height;
          let dW, dH, dx, dy;
          if (iAspect > 1) { dH = pR * 2; dW = dH * iAspect; dx = pX - dW / 2; dy = pY - pR; }
          else { dW = pR * 2; dH = dW / iAspect; dx = pX - pR; dy = pY - dH / 2; }
          doc.image(imgBuf, dx, dy, { width: dW, height: dH });
          doc.restore();
        }
      } else {
        doc.circle(pX, pY, pR).fill('#1e293b');
      }
      doc.circle(pX, pY, pR).lineWidth(3).strokeColor('#fff').stroke();
      ly += pR * 2 + 25;

      const sHead = (t) => {
        doc.rect(0, ly, SW, 30).fill('#1e293b');
        setFont(true); doc.fillColor('#fff').fontSize(11).text(t, 0, ly + 8, { width: SW, align: 'center' });
        ly += 40;
      };

      const sKV = (k, v) => {
        if (!v) return;
        setFont(); doc.fillColor('#94a3b8').fontSize(8.5).text(k + ' :', 15, ly, { width: 80 });
        doc.fillColor('#fff').text(v, 95, ly, { width: SW - 105 });
        ly += Math.max(doc.heightOfString(v, { width: SW - 105 }), 12) + 8;
      };

      // Personal Info
      sHead('ব্যক্তিগত তথ্য');
      sKV('👨 পিতার নাম', profile?.fatherName);
      sKV('👩 মাতার নাম', profile?.motherName);
      sKV('📅 জন্ম তারিখ', profile?.dob ? new Date(profile.dob).toLocaleDateString('bn-BD') : '');
      sKV('🪪 জাতীয় পরিচয়পত্র', profile?.nid);
      sKV('💍 বৈবাহিক অবস্থা', profile?.maritalStatus);
      sKV('🇧🇩 জাতীয়তা', profile?.nationality || 'বাংলাদেশী');
      sKV('🕋 ধর্ম', profile?.religion);
      sKV('📞 মোবাইল নম্বর', user?.phone);
      sKV('✉ ইমেইল', user?.email);
      sKV('📍 বর্তমান ঠিকানা', profile?.presentAddress);
      sKV('🏠 স্থায়ী ঠিকানা', profile?.permanentAddress);
      ly += 10;

      // License Info
      if (profile?.licenseNo) {
        sHead('ড্রাইভিং লাইসেন্স তথ্য');
        sKV('লাইসেন্সের ধরণ', profile.licenseType);
        sKV('লাইসেন্স নম্বর', profile.licenseNo);
        sKV('ইস্যু তারিখ', profile.licenseIssueDate);
        sKV('মেয়াদ উত্তীর্ণ তারিখ', profile.licenseExpiryDate);
        sKV('ইস্যুকারী কর্তৃপক্ষ', profile.licenseAuthority);
        ly += 10;
      }

      // Skills
      sHead('দক্ষতা');
      [...(skills?.technical || []), ...(skills?.soft || [])].forEach(s => {
        // Draw Checkmark Circle
        doc.circle(20, ly + 5, 5).fill('#fff');
        doc.fillColor(primaryColor).fontSize(6).text('✓', 18.5, ly + 3);
        
        setFont(); doc.fillColor('#fff').fontSize(8.5).text(s, 35, ly, { width: SW - 50 });
        ly += 22;
      });

      // === RIGHT MAIN ===
      let ry = 30;
      
      // Name & Profession
      setFont(true); doc.fillColor(accentColor).fontSize(28).text(user?.fullName || '', MX, ry, { width: MW, align: 'center' });
      ry += 35;
      setFont(); doc.fillColor('#334155').fontSize(14).text(`পেশাগত: ${profile?.jobTitle || ''}`, MX, ry, { width: MW, align: 'center' });
      ry += 25;
      doc.moveTo(MX, ry).lineTo(W - 25, ry).strokeColor('#cbd5e1').lineWidth(1).stroke();
      ry += 20;

      const mHead = (icon, t) => {
        checkPage(50);
        doc.circle(MX + 10, ry + 10, 12).fill(accentColor);
        // (Simplified icon drawing)
        setFont(true); doc.fillColor('#fff').fontSize(10).text(t, MX + 30, ry + 5);
        ry += 30;
        doc.rect(MX, ry - 5, MW, 1.5).fill('#e2e8f0');
        ry += 15;
      };

      // Objective
      if (profile?.objective) {
        mHead('O', 'ক্যারিয়ার উদ্দেশ্য');
        setFont(); doc.fillColor('#334155').fontSize(9.5).text(profile.objective, MX, ry, { width: MW, align: 'justify', lineGap: 2 });
        ry += doc.heightOfString(profile.objective, { width: MW, lineGap: 2 }) + 20;
      }

      // Experience
      if (experiences?.length) {
        mHead('E', 'কাজের অভিজ্ঞতা');
        experiences.forEach(e => {
          checkPage(60);
          setFont(true); doc.fillColor('#1e293b').fontSize(10.5).text(e.title, MX, ry, { continued: true });
          doc.fillColor('#64748b').fontSize(9).text(`সময়কাল: ${e.fromDate} – ${e.isCurrent ? 'বর্তমান' : e.toDate}`, { align: 'right' });
          ry += 14;
          doc.fillColor(accentColor).fontSize(10).text(e.company, MX, ry);
          ry += 15;
          if (e.description) {
            setFont(); doc.fillColor('#475569').fontSize(9.5).text(e.description, MX, ry, { width: MW, lineGap: 2 });
            ry += doc.heightOfString(e.description, { width: MW, lineGap: 2 }) + 10;
          }
          ry += 5;
        });
      }

      // Education Table
      if (educations?.length) {
        mHead('ED', 'শিক্ষাগত যোগ্যতা');
        const cols = [90, 150, 80, 80];
        const heads = ['পরীক্ষার নাম', 'প্রতিষ্ঠানের নাম', 'পাশের সাল', 'বোর্ড/বিভাগ'];
        doc.rect(MX, ry, MW, 20).fill('#f8fafc');
        let cx = MX;
        heads.forEach((h, i) => {
          setFont(true); doc.fillColor(accentColor).fontSize(9).text(h, cx + 5, ry + 6, { width: cols[i] - 5 });
          cx += cols[i];
        });
        ry += 20;
        educations.forEach((e, i) => {
          checkPage(22);
          if (i % 2 === 1) doc.rect(MX, ry, MW, 20).fill('#f1f5f9');
          const data = [e.type || '', e.institution || '', e.passingYear || '', e.board || ''];
          cx = MX;
          data.forEach((d, j) => {
            setFont(); doc.fillColor('#1e293b').fontSize(9).text(d.toString(), cx + 5, ry + 6, { width: cols[j] - 5 });
            cx += cols[j];
          });
          ry += 22;
        });
        ry += 15;
      }

      // References (2 Column)
      if (profile?.references?.length) {
        mHead('R', 'রেফারেন্স');
        const refW = MW / 2 - 10;
        let startRY = ry;
        profile.references.slice(0, 2).forEach((ref, i) => {
          let rx = MX + (i * (refW + 20));
          let tempY = startRY;
          doc.rect(rx, tempY, refW, 90).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
          tempY += 8;
          setFont(true); doc.fillColor(accentColor).fontSize(9.5).text(`রেফারেন্স ${i + 1}`, rx + 10, tempY); tempY += 15;
          const rKV = (k, v) => {
            setFont(); doc.fillColor('#64748b').fontSize(8.5).text(k + ' :', rx + 10, tempY, { width: 45 });
            doc.fillColor('#1e293b').text(v || '', rx + 60, tempY, { width: refW - 70 });
            tempY += 14;
          };
          rKV('নাম', ref.name);
          rKV('পদবি', ref.designation);
          rKV('মোবাইল', ref.phone);
          rKV('সম্পর্ক', ref.relationship);
          if (tempY > ry) ry = tempY;
        });
        ry += 20;
      }

      // Declaration
      mHead('D', 'ঘোষণা');
      const dec = 'আমি এ মর্মে ঘোষণা করছি যে, উপরে বর্ণিত তথ্যসমূহ আমার জ্ঞান অনুযায়ী সঠিক ও সত্য। কোন তথ্য ভুল প্রমাণিত হলে কর্তৃপক্ষ যা সিদ্ধান্ত নিবেন, তা আমি মেনে নেব।';
      setFont(); doc.fillColor('#475569').fontSize(9.5).text(dec, MX, ry, { width: MW, align: 'justify' });
      ry += 40;

      // Footer
      setFont(); doc.fillColor('#1e293b').fontSize(10).text('তারিখ: ___/___/___', MX, ry);
      doc.text('স্বাক্ষর', W - 120, ry, { align: 'center' });
      setFont(true); doc.text(`(${user?.fullName || ''})`, W - 120, ry + 15, { align: 'center' });

      doc.end();
    } catch (err) { reject(err); }
  });
};
