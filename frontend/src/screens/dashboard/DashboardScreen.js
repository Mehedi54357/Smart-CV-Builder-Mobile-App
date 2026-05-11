import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../redux/slices/profileSlice';
import { fetchCVs, setCurrent } from '../../redux/slices/cvSlice';
import { COLORS } from '../../theme/colors';
import { ProgressBar } from '../../components/common/StepIndicator';
import { getInitials, formatDate, getCompletionColor } from '../../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StatCard = ({ label, value, icon, color }) => (
  <View style={[styles.statCard, { borderTopWidth: 0, borderColor: COLORS.border }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CVCard = ({ cv, onPress, onDownload }) => (
  <TouchableOpacity style={styles.cvCard} onPress={onPress}>
    <View style={[styles.cvIcon, { backgroundColor: COLORS.accentSoft }]}>
      <Text style={{ fontSize: 22 }}>📄</Text>
    </View>
    <View style={styles.cvInfo}>
      <Text style={styles.cvTitle}>{cv.title}</Text>
      <Text style={styles.cvMeta}>{cv.template?.toUpperCase()} • {formatDate(cv.updatedAt)}</Text>
    </View>
    <View style={styles.cvScore}>
      <Text style={[styles.cvScoreNum, { color: COLORS.accent }]}>{cv.score || 80}</Text>
      <Text style={styles.cvScoreLabel}>Score</Text>
    </View>
    <TouchableOpacity onPress={onDownload} style={styles.downloadBtn}>
      <Text style={{ fontSize: 18 }}>⬇</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { data: profile, completion } = useSelector(s => s.profile);
  const { user } = useSelector(s => s.auth);
  const { list: cvList, isLoading: cvLoading } = useSelector(s => s.cv);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { 
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    loadData(); 
  }, []);

  const loadData = async () => {
    await Promise.all([dispatch(fetchProfile()), dispatch(fetchCVs())]);
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const completionColor = getCompletionColor(completion);

  return (
    <ScrollView style={styles.root} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greet}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'User'} ✨</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
           <View style={styles.avatar}>
             <Text style={styles.avatarText}>{getInitials(user?.fullName || 'U')}</Text>
           </View>
        </TouchableOpacity>
      </View>

      {/* CV Health Score - Master Class Visualization */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
             <View style={[styles.ringBase, { borderColor: completionColor + '20' }]}>
                <Text style={[styles.scoreNum, { color: completionColor }]}>{completion}%</Text>
             </View>
          </View>
          <View style={styles.scoreRight}>
             <Text style={styles.scoreTitle}>CV Strength Score</Text>
             <Text style={styles.scoreDesc}>
               {completion < 50 ? 'Your CV needs more details to stand out.' : completion < 90 ? 'Looking good! Almost professional.' : 'Master Class! Your CV is perfect.'}
             </Text>
             <TouchableOpacity style={[styles.improveBtn, { backgroundColor: completionColor + '20' }]} onPress={() => navigation.navigate('Builder')}>
                <Text style={[styles.improveText, { color: completionColor }]}>Improve Now →</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <StatCard label="Total CVs" value={cvList.length.toString()} icon="📄" color={COLORS.accent} />
        <StatCard label="Downloads" value="24" icon="📥" color={COLORS.emerald} />
        <StatCard label="Views" value="156" icon="👁" color={COLORS.violet} />
      </View>

      {/* Master Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Master Tools</Text>
        <View style={styles.toolGrid}>
          {[
            { label: 'AI Builder', icon: '🪄', color: COLORS.accent, action: () => navigation.navigate('Builder') },
            { label: 'Templates', icon: '🎨', color: COLORS.gold, action: () => navigation.navigate('Templates') },
            { label: 'Job Tracker', icon: '💼', color: COLORS.emerald, action: () => {} },
            { label: 'Settings', icon: '⚙️', color: COLORS.textMuted, action: () => navigation.navigate('Settings') },
          ].map((t, i) => (
            <TouchableOpacity key={i} style={styles.toolCard} onPress={t.action}>
              <View style={[styles.toolIcon, { backgroundColor: t.color + '15' }]}>
                <Text style={{ fontSize: 24 }}>{t.icon}</Text>
              </View>
              <Text style={styles.toolLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent CVs */}
      <View style={styles.section}>
        <View style={styles.secHeader}>
          <Text style={styles.sectionTitle}>Recent Creations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyCVs')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {cvList.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => navigation.navigate('Builder')}>
            <Text style={{ fontSize: 40, marginBottom: 15 }}>➕</Text>
            <Text style={styles.emptyTitle}>Create Your First CV</Text>
            <Text style={styles.emptyText}>Start building your professional identity</Text>
          </TouchableOpacity>
        ) : (
          cvList.slice(0, 3).map(cv => (
            <CVCard key={cv._id} cv={cv}
              onPress={() => { dispatch(setCurrent(cv)); navigation.navigate('Preview'); }}
              onDownload={() => { dispatch(setCurrent(cv)); navigation.navigate('Preview'); }} />
          ))
        )}
      </View>

      {/* Pro Banner */}
      <TouchableOpacity style={styles.aiBanner}>
        <View style={{ flex: 1 }}>
           <Text style={styles.aiTitle}>Upgrade to PRO</Text>
           <Text style={styles.aiText}>Unlock all templates & AI features</Text>
        </View>
        <View style={[styles.aiBtn, { backgroundColor: COLORS.gold }]}>
           <Text style={styles.aiBtnText}>GO PRO</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 
  },
  greet: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  userName: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginTop: 2 },
  avatar: { 
    width: 50, height: 50, borderRadius: 25, 
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center' 
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  
  scoreContainer: { paddingHorizontal: 20, marginBottom: 20 },
  scoreCard: { 
    backgroundColor: COLORS.bgCard, borderRadius: 28, padding: 24, 
    flexDirection: 'row', alignItems: 'center', gap: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  ringBase: { 
    width: 80, height: 80, borderRadius: 40, borderWeight: 6, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center' 
  },
  scoreNum: { fontSize: 22, fontWeight: '900' },
  scoreRight: { flex: 1 },
  scoreTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  scoreDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 18 },
  improveBtn: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  improveText: { fontSize: 12, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 25 },
  statCard: { 
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 16, 
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border 
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, marginBottom: 16 },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  toolCard: { 
    width: '48%', backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 20, 
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 10
  },
  toolIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textDim },

  cvCard: { 
    backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 16, 
    flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border 
  },
  cvIcon: { width: 50, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cvInfo: { flex: 1, gap: 4 },
  cvTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  cvMeta: { fontSize: 11, color: COLORS.textMuted },
  cvScore: { alignItems: 'center' },
  cvScoreNum: { fontSize: 18, fontWeight: '900' },
  cvScoreLabel: { fontSize: 9, color: COLORS.textMuted },
  downloadBtn: { padding: 8 },

  emptyCard: { 
    backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 40, 
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' 
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, marginBottom: 6 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },

  aiBanner: { 
    marginHorizontal: 20, backgroundColor: '#0F172A', borderRadius: 24, padding: 24, 
    flexDirection: 'row', alignItems: 'center', gap: 15,
    borderWidth: 1, borderColor: COLORS.accent + '30'
  },
  aiTitle: { fontSize: 18, fontWeight: '900', color: COLORS.white },
  aiText: { fontSize: 13, color: COLORS.textDim, marginTop: 4 },
  aiBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  aiBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 13 },
});
