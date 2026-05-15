import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTemplate } from '../../redux/slices/builderSlice';
import { COLORS } from '../../theme/colors';
import { CV_TEMPLATES } from '../../utils/constants';
import Button from '../../components/common/Button';

// Visual mini-preview per template
const TemplateMockup = ({ t }) => {
  if (t.id === 'creative' || t.id === 'corporate' || t.id === 'smart-pro' || t.id === 'bengali-pro' || t.id === 'modern-tech' || t.id === 'classic-minimal' || t.id === 'classic-centered' || t.id === 'student-vibrant') {
    // Two-column layout preview
    const isSmart = t.id === 'smart-pro';
    const isBengali = t.id === 'bengali-pro';
    const isModern = t.id === 'modern-tech';
    const isMinimal = t.id === 'classic-minimal';
    const isCentered = t.id === 'classic-centered';
    const isStudent = t.id === 'student-vibrant';
    
    if (isStudent) {
       return (
         <View style={[mk.twoCol, { backgroundColor: '#fff', flexDirection: 'column' }]}>
            <View style={{width:'100%', height:20, backgroundColor:t.color, padding:4, flexDirection:'row', alignItems:'center'}}>
               <View style={{width:12, height:12, borderRadius:6, backgroundColor:'#fff'}}/>
               <View style={{width:'50%', height:4, backgroundColor:'#fff', marginLeft:6, borderRadius:2}}/>
            </View>
            <View style={{flexDirection:'row', flex:1}}>
               <View style={{width:'30%', height:'100%', backgroundColor:'#f0fdfa'}}/>
               <View style={{flex:1, padding:6}}>
                  <View style={{width:'80%', height:2, backgroundColor:'#e2e8f0', marginBottom:4}}/>
                  <View style={{width:'40%', height:2, backgroundColor:'#14b8a6', marginBottom:8}}/>
               </View>
            </View>
         </View>
       );
    }
    
    if (isMinimal || isCentered) {
      return (
        <View style={[mk.twoCol, { backgroundColor: '#fff', flexDirection: 'column', padding: 8, alignItems: isCentered ? 'center' : 'stretch' }]}>
           <View style={{flexDirection: isCentered ? 'column' : 'row', justifyContent:'space-between', alignItems: isCentered ? 'center' : 'stretch', marginBottom:8, width: '100%'}}>
              <View style={{width:'60%', height:4, backgroundColor:'#334155', borderRadius:2, marginBottom: isCentered ? 4 : 0}}/>
              {!isCentered && <View style={{width:16, height:16, backgroundColor:'#e2e8f0', borderRadius:2}}/>}
              {isCentered && <View style={{width:'40%', height:2, backgroundColor:'#3b82f6', borderRadius:1}}/>}
           </View>
           <View style={{width:'100%', height:2, backgroundColor:'#f1f5f9', marginBottom:4}}/>
           <View style={{width:'100%', height:2, backgroundColor:'#f1f5f9', marginBottom:4}}/>
        </View>
      );
    }
    const leftBg = isBengali || isModern ? (isModern ? '#ffffff' : '#0F2044') : (isSmart ? '#f8fafc' : (t.id === 'creative' ? '#1a202c' : '#0f2d5c'));
    const rightBg = isBengali || isModern ? '#ffffff' : (isSmart ? '#ffffff' : (t.id === 'creative' ? '#2d3748' : '#1a365d'));
    
    return (
      <View style={[mk.twoCol, { backgroundColor: rightBg }]}>
        {/* Sidebar */}
        <View style={[mk.sidebar, { backgroundColor: leftBg }]}>
          <View style={[mk.circle, { borderColor: t.color, backgroundColor: isSmart ? t.color : '#ffffff20' }]} />
          <View style={[mk.line, { width: '80%', backgroundColor: t.color }]} />
          {[70, 55, 65, 50].map((w, i) => (
            <View key={i} style={[mk.line, { width: w + '%', marginTop: 4, backgroundColor: isSmart ? '#cbd5e1' : '#ffffff30' }]} />
          ))}
        </View>
        {/* Main */}
        <View style={mk.main}>
          {isSmart && (
            <View style={{ width: '100%', height: 16, backgroundColor: t.color, borderRadius: 3, marginBottom: 8 }} />
          )}
          {!isSmart && <View style={[mk.line, { width: '90%', height: 5, backgroundColor: t.color, marginBottom: 6 }]} />}
          
          <View style={[mk.line, { width: '60%', backgroundColor: isSmart ? '#94a3b8' : '#ffffffcc' }]} />
          {[85, 70, 75, 60, 65].map((w, i) => (
            <View key={i} style={[mk.line, { width: w + '%', marginTop: 5, backgroundColor: isSmart ? '#cbd5e1' : '#ffffff50' }]} />
          ))}
        </View>
      </View>
    );
  }
  if (t.id === 'europass') {
    return (
      <View style={[mk.single, { backgroundColor: '#f0f4ff' }]}>
        <View style={[mk.euroHeader, { backgroundColor: '#003399' }]}>
          <Text style={{ fontSize: 7, color: '#ffd700', letterSpacing: 1 }}>★ ★ ★ ★ ★ ★</Text>
        </View>
        <View style={[mk.line, { width: '70%', height: 5, backgroundColor: '#003399', marginTop: 6, marginBottom: 4 }]} />
        {[['Contact','#003399'], ['Experience','#003399'], ['Education','#003399']].map(([lbl, c], i) => (
          <View key={i} style={mk.euroRow}>
            <View style={[mk.euroLabel, { backgroundColor: c }]}>
              <Text style={{ fontSize: 5, color: '#fff', fontWeight: '700' }}>{lbl.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={[mk.line, { width: '80%' }]} />
              <View style={[mk.line, { width: '60%' }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (t.id === 'tech') {
    return (
      <View style={[mk.single, { backgroundColor: '#0f172a' }]}>
        <View style={[mk.line, { width: '75%', height: 5, backgroundColor: '#f43f5e', marginBottom: 6 }]} />
        <View style={[mk.line, { width: '45%', backgroundColor: '#f43f5e', opacity: 0.6 }]} />
        <View style={[mk.line, { width: '65%', backgroundColor: '#ffffff30', marginTop: 5 }]} />
        {['// SKILLS', '// EXPERIENCE', '// PROJECTS'].map((lbl, i) => (
          <View key={i} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 5, color: '#f43f5e', fontFamily: 'monospace' }}>{lbl}</Text>
            <View style={[mk.line, { width: '90%', marginTop: 3, backgroundColor: '#f43f5e', height: 0.8, opacity: 0.5 }]} />
            <View style={[mk.line, { width: '70%', backgroundColor: '#ffffff30', marginTop: 3 }]} />
          </View>
        ))}
      </View>
    );
  }
  if (t.id === 'academic') {
    return (
      <View style={[mk.single, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' }]}>
        <View style={[mk.line, { width: '65%', height: 5, backgroundColor: '#0891b2', alignSelf: 'center', marginBottom: 4 }]} />
        <View style={[mk.line, { width: '80%', height: 4, backgroundColor: '#0c4a6e', alignSelf: 'center', marginBottom: 6 }]} />
        {['Research Interests', 'Academic Qualifications', 'Publications', 'Skills'].map((s, i) => (
          <View key={i} style={{ marginBottom: 6 }}>
            <View style={[mk.line, { width: '50%', height: 3, backgroundColor: '#0891b2', marginBottom: 3 }]} />
            <View style={[mk.line, { width: '85%', backgroundColor: '#64748b' }]} />
            <View style={[mk.line, { width: '70%', backgroundColor: '#94a3b8', marginTop: 2 }]} />
          </View>
        ))}
      </View>
    );
  }
  // Default (govt) — teal header single column
  return (
    <View style={[mk.single, { backgroundColor: '#f0fdfa' }]}>
      <View style={[mk.tealHeader, { backgroundColor: t.color }]}>
        <View style={[mk.line, { width: '70%', height: 4, backgroundColor: '#ffffff', alignSelf: 'center' }]} />
        <View style={[mk.line, { width: '50%', height: 2.5, backgroundColor: '#ffffff80', alignSelf: 'center', marginTop: 4 }]} />
      </View>
      {['Personal Info', 'Education', 'Experience', 'Skills'].map((s, i) => (
        <View key={i} style={{ marginBottom: 5 }}>
          <View style={[mk.line, { width: '40%', height: 3, backgroundColor: t.color, marginBottom: 3 }]} />
          <View style={[mk.line, { width: '80%', backgroundColor: '#64748b' }]} />
          <View style={[mk.line, { width: '65%', backgroundColor: '#94a3b8', marginTop: 2 }]} />
        </View>
      ))}
    </View>
  );
};

export default function TemplateSelectScreen({ navigation }) {
  const dispatch = useDispatch();
  const selected = useSelector(s => s.builder.selectedTemplate);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>CV Templates</Text>
        <Text style={styles.sub}>Select a format — then build your CV</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
        <View style={styles.grid}>
          {CV_TEMPLATES.map(t => (
            <TouchableOpacity key={t.id}
              style={[styles.card, selected === t.id && { borderColor: t.color, borderWidth: 2.5 }]}
              onPress={() => dispatch(setTemplate(t.id))}>
              {/* Selected badge */}
              {selected === t.id && (
                <View style={[styles.selBadge, { backgroundColor: t.color }]}>
                  <Text style={styles.selTxt}>✓</Text>
                </View>
              )}
              {/* Visual preview */}
              <View style={styles.previewWrap}>
                <TemplateMockup t={t} />
              </View>
              {/* Info */}
              <View style={styles.info}>
                <View style={[styles.tag, { backgroundColor: t.color + '22' }]}>
                  <Text style={[styles.tagTxt, { color: t.color }]}>{t.tag}</Text>
                </View>
                <Text style={styles.cardTitle}>{t.name}</Text>
                <Text style={styles.cardDesc}>{t.desc}</Text>
                <TouchableOpacity
                  style={[styles.useBtn, { backgroundColor: selected === t.id ? t.color : COLORS.surface, borderColor: t.color }]}
                  onPress={() => { dispatch(setTemplate(t.id)); navigation?.navigate('Builder'); }}>
                  <Text style={[styles.useBtnTxt, { color: selected === t.id ? '#fff' : t.color }]}>
                    {selected === t.id ? '✓ Selected — Build CV' : 'Use This Template'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const mk = StyleSheet.create({
  twoCol: { height: 130, flexDirection: 'row', borderRadius: 6, overflow: 'hidden' },
  sidebar: { width: '38%', padding: 8, alignItems: 'center' },
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, marginBottom: 6, backgroundColor: '#ffffff20' },
  main: { flex: 1, padding: 8 },
  line: { height: 3, borderRadius: 2, backgroundColor: '#e2e8f0', marginBottom: 2 },
  single: { height: 130, borderRadius: 6, padding: 8, overflow: 'hidden' },
  tealHeader: { borderRadius: 4, padding: 10, marginBottom: 8, alignItems: 'center' },
  euroHeader: { borderRadius: 4, padding: 5, marginBottom: 4, alignItems: 'center' },
  euroRow: { flexDirection: 'row', gap: 6, marginBottom: 5, alignItems: 'flex-start' },
  euroLabel: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2 },
});

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.bg, padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 24, fontWeight: '900', color: '#fff' },
  sub: { fontSize: 13, color: '#93C5FD', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: {
    width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  selBadge: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  selTxt: { fontSize: 11, fontWeight: '900', color: '#fff' },
  previewWrap: { margin: 8, borderRadius: 6, overflow: 'hidden' },
  info: { padding: 10 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, marginBottom: 5 },
  tagTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardDesc: { fontSize: 10, color: COLORS.textMuted, lineHeight: 14, marginBottom: 8 },
  useBtn: {
    borderWidth: 1.5, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 8, alignItems: 'center',
  },
  useBtnTxt: { fontSize: 11, fontWeight: '700' },
});
