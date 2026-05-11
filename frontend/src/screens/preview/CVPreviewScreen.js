import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { generateCV } from '../../redux/slices/cvSlice';
import { cvAPI } from '../../api/cv.api';
import { COLORS } from '../../theme/colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ── CV Section Helper ──────────────────────────────────────────────
const CVSection = ({ title, children }) => (
  <View style={cv.section}>
    <Text style={cv.sectionTitle}>{title}</Text>
    <View style={cv.sectionLine} />
    {children}
  </View>
);

const InfoRow = ({ label, value }) => value ? (
  <View style={cv.infoRow}>
    <Text style={cv.infoLabel}>{label}:</Text>
    <Text style={cv.infoValue}>{value}</Text>
  </View>
) : null;

// ── Real-time CV Paper ─────────────────────────────────────────────
const CVPaper = ({ user, profile, educations, experiences, projects, skills, languages }) => (
  <View style={cv.paper}>
    {/* Header */}
    <View style={cv.header}>
      <View style={cv.avatar}>
        {profile?.profilePhoto ? (
          <Image source={{ uri: profile.profilePhoto }} style={{ width: 64, height: 64, borderRadius: 32 }} />
        ) : (
          <Text style={cv.avatarTxt}>{(user?.fullName || 'U')[0]}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={cv.name}>{(user?.fullName || '').toUpperCase()}</Text>
        <View style={cv.contactRow}>
          {user?.phone  ? <Text style={cv.contact}>📞 {user.phone}</Text> : null}
          {user?.email  ? <Text style={cv.contact}>✉ {user.email}</Text>  : null}
          {profile?.linkedin ? <Text style={cv.contact}>🔗 LinkedIn</Text> : null}
        </View>
        {profile?.presentAddress ? <Text style={cv.address}>📍 {profile.presentAddress}</Text> : null}
      </View>
    </View>

    {/* Objective */}
    {profile?.objective ? (
      <CVSection title="Career Objective">
        <Text style={cv.body}>{profile.objective}</Text>
      </CVSection>
    ) : null}

    {/* Personal */}
    <CVSection title="Personal Information">
      <View style={cv.twoCol}>
        <View style={{ flex: 1 }}>
          <InfoRow label="Father's Name"  value={profile?.fatherName} />
          <InfoRow label="Date of Birth"  value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-BD') : null} />
          <InfoRow label="Nationality"    value={profile?.nationality} />
          <InfoRow label="NID No."        value={profile?.nid} />
        </View>
        <View style={{ flex: 1 }}>
          <InfoRow label="Mother's Name"  value={profile?.motherName} />
          <InfoRow label="Gender"         value={profile?.gender} />
          <InfoRow label="Religion"       value={profile?.religion} />
          <InfoRow label="Marital Status" value={profile?.maritalStatus} />
        </View>
      </View>
      <InfoRow label="Permanent Address" value={profile?.permanentAddress} />
    </CVSection>

    {/* Education */}
    {educations?.length > 0 && (
      <CVSection title="Educational Qualification">
        {educations.map((edu, i) => (
          <View key={i} style={[cv.item, i % 2 === 1 && { backgroundColor: '#F8FAFF' }]}>
            <View style={cv.itemHead}>
              <View style={cv.eduBadge}><Text style={cv.eduBadgeTxt}>{edu.type}</Text></View>
              <Text style={cv.itemYear}>{edu.passingYear}</Text>
            </View>
            <Text style={cv.itemTitle}>{edu.degree}</Text>
            <Text style={cv.itemSub}>{edu.institution}  |  GPA: {edu.gpa}</Text>
          </View>
        ))}
      </CVSection>
    )}

    {/* Experience */}
    {experiences?.length > 0 && (
      <CVSection title="Work Experience">
        {experiences.map((exp, i) => (
          <View key={i} style={cv.expItem}>
            <View style={cv.itemHead}>
              <Text style={cv.itemTitle}>{exp.title}</Text>
              <Text style={cv.itemYear}>{exp.fromDate} – {exp.isCurrent ? 'Present' : exp.toDate}</Text>
            </View>
            <Text style={[cv.itemSub, { color: '#1E3A8A' }]}>{exp.company}</Text>
            {exp.description ? <Text style={cv.body}>{exp.description}</Text> : null}
          </View>
        ))}
      </CVSection>
    )}

    {/* Projects */}
    {projects?.length > 0 && (
      <CVSection title="Projects">
        {projects.map((proj, i) => (
          <View key={i} style={cv.projItem}>
            <Text style={cv.itemTitle}>{proj.title}</Text>
            {proj.technologies?.length > 0 && (
              <Text style={cv.projTech}>Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</Text>
            )}
            {proj.description ? <Text style={cv.body}>{proj.description}</Text> : null}
            {proj.githubLink ? <Text style={cv.projLink}>🔗 {proj.githubLink}</Text> : null}
          </View>
        ))}
      </CVSection>
    )}

    {/* Skills */}
    {skills && (skills.technical?.length > 0 || skills.soft?.length > 0) && (
      <CVSection title="Skills">
        {skills.technical?.length > 0 && (
          <View style={cv.skillRow}>
            <Text style={cv.skillCat}>Technical: </Text>
            <View style={cv.skillTags}>
              {skills.technical.map((sk, i) => (
                <View key={i} style={cv.skillTag}><Text style={cv.skillTagTxt}>{sk}</Text></View>
              ))}
            </View>
          </View>
        )}
        {skills.soft?.length > 0 && (
          <View style={cv.skillRow}>
            <Text style={cv.skillCat}>Soft Skills: </Text>
            <Text style={cv.body}>{skills.soft.join(' • ')}</Text>
          </View>
        )}
      </CVSection>
    )}

    {/* Languages */}
    {languages?.length > 0 && (
      <CVSection title="Language Proficiency">
        {languages.map((lang, i) => (
          <View key={i} style={cv.langRow}>
            <Text style={cv.langName}>{lang.name}</Text>
            <Text style={cv.langLevel}>R: {lang.reading}  W: {lang.writing}  S: {lang.speaking}</Text>
          </View>
        ))}
      </CVSection>
    )}

    {/* Footer */}
    <View style={cv.footer}>
      <Text style={cv.footerTxt}>Generated by SmartCV Builder Pro  •  {new Date().toLocaleDateString('en-BD')}</Text>
    </View>
  </View>
);

export default function CVPreviewScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user }          = useSelector(s => s.auth);
  const { data: profile } = useSelector(s => s.profile);
  const { current: cvRec } = useSelector(s => s.cv);
  const builder           = useSelector(s => s.builder);
  const { formData, educations, experiences, projects, skills, languages, selectedTemplate } = builder;
  const [downloading, setDownloading] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);

  const mergedProfile = { ...formData, ...profile };

  const handleDownload = async (format) => {
    setDownloading(true); setActiveFormat(format);
    try {
      let targetCvId = cvRec?._id;
      
      // Generate on-demand if missing
      if (!targetCvId) {
        const title = `My CV — ${new Date().toLocaleDateString('en-BD')}`;
        const genRes = await dispatch(generateCV({ template: selectedTemplate, title }));
        if (generateCV.fulfilled.match(genRes)) {
          targetCvId = genRes.payload.cv._id;
        } else {
          const errMsg = typeof genRes.payload === 'string' ? genRes.payload : (genRes.payload?.message || 'Failed to generate CV. Please try again later.');
          Alert.alert('Server Error', errMsg);
          setDownloading(false); setActiveFormat(null);
          return;
        }
      }

      const res = format === 'pdf'
        ? await cvAPI.downloadPDF(targetCvId)
        : await cvAPI.downloadDOCX(targetCvId);
      const url = res.data.url;
      // Download file locally
      const ext = format === 'pdf' ? 'pdf' : 'docx';
      const dest = `${FileSystem.cacheDirectory}SmartCV_${Date.now()}.${ext}`;
      const downloadRes = await FileSystem.downloadAsync(url, dest);
      
      if (downloadRes.status !== 200) {
        throw new Error('Download failed');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dest, { 
          dialogTitle: 'Share your CV',
          UTI: format === 'pdf' ? 'com.adobe.pdf' : 'com.microsoft.word.dotx'
        });
      } else {
        Alert.alert('Downloaded!', `Your CV has been saved.`);
      }
    } catch (e) {
      Alert.alert('Error', 'Download failed. Please try again.');
    } finally { setDownloading(false); setActiveFormat(null); }
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out my professional CV built with SmartCV Builder Pro!\n${cvRec?.shareUrl || ''}` });
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>CV Preview</Text>
        <TouchableOpacity onPress={handleShare} style={s.shareBtn}>
          <Text style={s.shareTxt}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* CV Paper */}
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.paperWrap}>
          <CVPaper
            user={user}
            profile={mergedProfile}
            educations={educations}
            experiences={experiences}
            projects={projects}
            skills={skills}
            languages={languages}
          />
        </View>

        {/* Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreTitle}>📊 CV Score</Text>
          <Text style={s.scoreVal}>{cvRec?.score || '—'}<Text style={s.scoreMax}>/100</Text></Text>
          <Text style={s.scoreSub}>Complete more sections to improve your score</Text>
        </View>

        {/* Download Buttons */}
        <View style={s.dlRow}>
          <TouchableOpacity style={[s.dlBtn, s.dlDocx]} onPress={() => handleDownload('docx')} disabled={downloading}>
            {downloading && activeFormat === 'docx' ? <ActivityIndicator color={COLORS.accent} size="small" /> : <Text style={s.dlDocxTxt}>📝 Download DOCX</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[s.dlBtn, s.dlPdf]} onPress={() => handleDownload('pdf')} disabled={downloading}>
            {downloading && activeFormat === 'pdf' ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={s.dlPdfTxt}>📄 Download PDF</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.shareFullBtn} onPress={handleShare}>
          <Text style={s.shareFullTxt}>🔗 Share CV Link</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { backgroundColor: '#0F2044', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: COLORS.white, fontSize: 20 },
  topTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  shareBtn: { backgroundColor: COLORS.accentSoft, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: COLORS.borderActive },
  shareTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  paperWrap: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 12, marginBottom: 16 },
  scoreCard: { backgroundColor: '#1E1B4B', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.violet + '40' },
  scoreTitle: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 6 },
  scoreVal: { fontSize: 48, fontWeight: '900', color: COLORS.violet },
  scoreMax: { fontSize: 20, color: COLORS.textMuted },
  scoreSub: { fontSize: 12, color: '#A5B4FC', marginTop: 4, textAlign: 'center' },
  dlRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dlBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dlDocx: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderActive },
  dlPdf:  { backgroundColor: COLORS.accent },
  dlDocxTxt: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  dlPdfTxt:  { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  shareFullBtn: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  shareFullTxt: { color: COLORS.textDim, fontWeight: '600', fontSize: 14 },
});

// ── CV Paper Styles ────────────────────────────────────────────────
const cv = StyleSheet.create({
  paper: { backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#0F2044', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  name: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5, marginBottom: 4 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contact: { fontSize: 10, color: '#93C5FD' },
  address: { fontSize: 9, color: '#BFDBFE', marginTop: 3 },
  section: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionTitle: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: '#0F2044', marginBottom: 4 },
  sectionLine: { height: 2, backgroundColor: '#0F2044', marginBottom: 8 },
  body: { fontSize: 10, color: '#475569', lineHeight: 16 },
  twoCol: { flexDirection: 'row', gap: 8 },
  infoRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  infoLabel: { fontSize: 9, fontWeight: '700', color: '#64748B', width: 90 },
  infoValue: { fontSize: 9, color: '#1E293B', flex: 1 },
  item: { padding: 6, borderRadius: 4, marginBottom: 6 },
  expItem: { marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  projItem: { backgroundColor: '#F0F4FF', borderRadius: 6, padding: 8, marginBottom: 6 },
  projTech: { fontSize: 9, color: '#1E3A8A', fontWeight: '600', marginBottom: 3 },
  projLink: { fontSize: 9, color: '#3B82F6', marginTop: 3 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 11, fontWeight: '700', color: '#1E293B', flex: 1 },
  itemYear: { fontSize: 9, color: '#64748B', fontStyle: 'italic' },
  itemSub: { fontSize: 10, color: '#475569', fontWeight: '600', marginBottom: 3 },
  eduBadge: { backgroundColor: '#1E3A8A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  eduBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#FFFFFF' },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 6, gap: 4 },
  skillCat: { fontSize: 9, fontWeight: '700', color: '#334155' },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillTag: { backgroundColor: '#E8EFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  skillTagTxt: { fontSize: 8, color: '#1E3A8A', fontWeight: '600' },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  langName: { fontSize: 10, fontWeight: '700', color: '#1E293B' },
  langLevel: { fontSize: 9, color: '#64748B' },
  footer: { backgroundColor: '#0F2044', padding: 8 },
  footerTxt: { fontSize: 8, color: '#93C5FD', textAlign: 'center' },
});
