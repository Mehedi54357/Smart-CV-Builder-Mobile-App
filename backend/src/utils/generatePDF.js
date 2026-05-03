const PDFDocument=require('pdfkit');
const Profile=require('../models/Profile.model');
const Education=require('../models/Education.model');
const Experience=require('../models/Experience.model');
const Skills=require('../models/Skills.model');
const Project=require('../models/Project.model');
const User=require('../models/User.model');

const generatePDF=async(userId)=>{
  const [user,profile,educations,experiences,skills,projects]=await Promise.all([
    User.findById(userId),
    Profile.findOne({user:userId}),
    Education.find({user:userId}).sort('order'),
    Experience.find({user:userId}).sort('order'),
    Skills.findOne({user:userId}),
    Project.find({user:userId}).sort('order'),
  ]);

  return new Promise((resolve,reject)=>{
    const doc=new PDFDocument({size:'A4',margin:0});
    const buffers=[];
    doc.on('data',b=>buffers.push(b));
    doc.on('end',()=>resolve(Buffer.concat(buffers)));
    doc.on('error',reject);

    const W=595.28,M=45;
    const bodyW=W-M*2;

    // ── Navy Header ────────────────────────────────────────────────
    doc.rect(0,0,W,130).fill('#0F2044');
    doc.rect(0,126,W,4).fill('#3B82F6');

    // Name
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
       .text((user.fullName||'').toUpperCase(),0,30,{align:'center',width:W,characterSpacing:1});
    // Contact line
    const contacts=[];
    if(user.phone) contacts.push(`📞 ${user.phone}`);
    if(user.email) contacts.push(`✉ ${user.email}`);
    if(profile?.linkedin) contacts.push(`in ${profile.linkedin}`);
    doc.fontSize(9).font('Helvetica').fillColor('#93C5FD')
       .text(contacts.join('   '),0,58,{align:'center',width:W});
    if(profile?.presentAddress)
      doc.fontSize(8.5).fillColor('#BFDBFE').text(`📍 ${profile.presentAddress}`,0,74,{align:'center',width:W});

    // ── Section helper ────────────────────────────────────────────
    let y=148;
    const section=(title,color='#0F2044')=>{
      doc.rect(M,y,bodyW,18).fill(color);
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
         .text(title.toUpperCase(),M+8,y+4,{characterSpacing:1.5});
      y+=24;
    };
    const kv2=(k,v)=>{
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748B').text(k+':',M,y,{continued:true,width:120});
      doc.font('Helvetica').fillColor('#1E293B').text(v||'N/A',M+120,y,{width:bodyW-120});
      y+=16;
    };
    const subHead=(title,right='')=>{
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1E293B').text(title,M,y,{continued:!!right,width:bodyW-100});
      if(right) doc.fontSize(9).font('Helvetica').fillColor('#64748B').text(right,{align:'right'});
      y+=15;
    };
    const bodyP=(text)=>{
      doc.fontSize(9).font('Helvetica').fillColor('#475569').text(text,M,y,{width:bodyW,align:'justify'});
      y+=doc.heightOfString(text,{width:bodyW})+6;
    };
    const HR=()=>{doc.moveTo(M,y).lineTo(W-M,y).strokeColor('#E2E8F0').lineWidth(0.5).stroke();y+=8;};

    // ── Objective ─────────────────────────────────────────────────
    if(profile?.objective){
      section('Career Objective','#1E3A8A');
      bodyP(profile.objective);
      y+=6;
    }

    // ── Personal Information ──────────────────────────────────────
    section('Personal Information');
    const half=bodyW/2;
    const leftInfo=[['Father\'s Name',profile?.fatherName],['Mother\'s Name',profile?.motherName],['Date of Birth',profile?.dob?new Date(profile.dob).toLocaleDateString('en-BD'):null],['NID No.',profile?.nid]];
    const rightInfo=[['Gender',profile?.gender],['Nationality',profile?.nationality],['Religion',profile?.religion],['Marital Status',profile?.maritalStatus]];
    const maxRows=Math.max(leftInfo.length,rightInfo.length);
    for(let i=0;i<maxRows;i++){
      const startY=y;
      if(leftInfo[i]&&leftInfo[i][1]){
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748B').text(leftInfo[i][0]+':',M,y,{width:70});
        doc.font('Helvetica').fillColor('#1E293B').text(leftInfo[i][1]||'',M+72,y,{width:half-80});
      }
      if(rightInfo[i]&&rightInfo[i][1]){
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#64748B').text(rightInfo[i][0]+':',M+half,y,{width:70});
        doc.font('Helvetica').fillColor('#1E293B').text(rightInfo[i][1]||'',M+half+72,y,{width:half-80});
      }
      y+=15;
    }
    if(profile?.presentAddress){kv2('Present Address',profile.presentAddress);}
    if(profile?.permanentAddress){kv2('Permanent Address',profile.permanentAddress);}
    y+=6;

    // ── Education ─────────────────────────────────────────────────
    if(educations.length){
      section('Educational Qualification');
      // Table header
      doc.rect(M,y,bodyW,16).fill('#F1F5F9');
      ['Exam','Institute','Board/Univ','Group','GPA','Year'].forEach((h,i)=>{
        const widths=[60,150,120,70,50,50];
        const xpos=[M,M+60,M+210,M+330,M+400,M+450];
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#334155').text(h,xpos[i],y+3,{width:widths[i]});
      });
      y+=18;
      educations.forEach((edu,i)=>{
        if(i%2===0) doc.rect(M,y,bodyW,15).fill('#FAFAFA');
        const cells=[edu.type||'',edu.institution||'',edu.board||'',edu.subject||'',edu.gpa?.toString()||'',edu.passingYear?.toString()||''];
        const widths=[60,150,120,70,50,50];
        const xpos=[M,M+60,M+210,M+330,M+400,M+450];
        cells.forEach((c,j)=>{
          doc.fontSize(8.5).font(j===0?'Helvetica-Bold':'Helvetica').fillColor('#1E293B').text(c,xpos[j],y+3,{width:widths[j]});
        });
        y+=16;
      });
      y+=6;
    }

    // ── Experience ────────────────────────────────────────────────
    if(experiences.length){
      section('Work Experience','#065F46');
      experiences.forEach(exp=>{
        subHead(exp.title,`${exp.fromDate||''} — ${exp.isCurrent?'Present':exp.toDate||''}`);
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E3A8A').text(exp.company,M,y);
        y+=14;
        if(exp.description){
          bodyP(exp.description);
        }
        HR();
      });
    }

    // ── Projects ─────────────────────────────────────────────────
    if(projects.length){
      section('Projects','#7C3AED');
      projects.forEach(proj=>{
        subHead(proj.title);
        if(proj.technologies?.length){
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#1E3A8A').text('Tech: '+(Array.isArray(proj.technologies)?proj.technologies.join(', '):proj.technologies),M,y);
          y+=13;
        }
        if(proj.description){bodyP(proj.description);}
        if(proj.githubLink){
          doc.fontSize(8).fillColor('#3B82F6').text('GitHub: '+proj.githubLink,M,y);
          y+=11;
        }
        y+=4;
      });
    }

    // ── Skills ────────────────────────────────────────────────────
    if(skills){
      section('Skills & Competencies','#92400E');
      if(skills.technical?.length){
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('Technical:',M,y,{continued:true});
        doc.font('Helvetica').fillColor('#475569').text('  '+skills.technical.join(' • '),{width:bodyW-70});
        y+=14;
      }
      if(skills.soft?.length){
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('Soft Skills:',M,y,{continued:true});
        doc.font('Helvetica').fillColor('#475569').text('  '+skills.soft.join(' • '),{width:bodyW-70});
        y+=14;
      }
      if(skills.languages?.length){
        section('Language Proficiency','#0F766E');
        skills.languages.forEach(lang=>{
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#1E293B').text(lang.name+':',M,y,{continued:true,width:80});
          doc.font('Helvetica').fillColor('#475569').text(`Reading: ${lang.reading}  Writing: ${lang.writing}  Speaking: ${lang.speaking}`,{width:bodyW-80});
          y+=14;
        });
      }
    }

    // ── Footer ────────────────────────────────────────────────────
    const pageH=doc.page.height;
    doc.rect(0,pageH-30,W,30).fill('#0F2044');
    doc.fontSize(7.5).fillColor('#93C5FD').font('Helvetica')
       .text(`Generated by SmartCV Builder Pro  •  ${new Date().toLocaleDateString('en-BD')}  •  Confidential`,0,pageH-20,{align:'center',width:W});

    doc.end();
  });
};

module.exports=generatePDF;
