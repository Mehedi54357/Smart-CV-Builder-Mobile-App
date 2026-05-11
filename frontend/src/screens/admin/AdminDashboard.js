import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { COLORS } from '../../theme/colors';

const StatBox = ({ label, value, icon, color }) => (
  <View style={[s.statBox, { borderTopColor: color }]}>
    <Text style={{ fontSize: 26, marginBottom: 4 }}>{icon}</Text>
    <Text style={[s.statVal, { color }]}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

export default function AdminDashboard({ navigation }) {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]       = useState('overview');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        axiosInstance.get('/admin/analytics'),
        axiosInstance.get('/admin/users?page=1&limit=20'),
      ]);
      setStats(sRes.data.analytics);
      setUsers(uRes.data.users);
    } catch (e) {
      Alert.alert('Error', 'Failed to load admin data');
    } finally { setLoading(false); setRefreshing(false); }
  };

  const toggleUser = async (id, isActive) => {
    Alert.alert(isActive ? 'Deactivate User?' : 'Activate User?', 'This will change the user status.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
        try {
          await axiosInstance.patch(`/admin/users/${id}/toggle`);
          setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
        } catch (e) { Alert.alert('Error', 'Failed to update user'); }
      }},
    ]);
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading admin panel...</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>⚙️ Admin Panel</Text>
          <Text style={s.headerSub}>SmartCV Builder Pro</Text>
        </View>
        <TouchableOpacity style={s.refreshBtn} onPress={() => { setRefreshing(true); load(); }}>
          <Text style={{ color: COLORS.accent, fontSize: 20 }}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {['overview', 'users'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t === 'overview' ? '📊 Overview' : '👥 Users'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' ? (
        <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.accent} />}>
          {/* Stats */}
          <View style={s.statsGrid}>
            <StatBox label="Total Users"    value={stats?.totalUsers    || 0} icon="👥" color={COLORS.accent} />
            <StatBox label="Total CVs"      value={stats?.totalCVs      || 0} icon="📄" color={COLORS.emerald} />
            <StatBox label="Premium Users"  value={stats?.premiumUsers  || 0} icon="⭐" color={COLORS.gold} />
            <StatBox label="New This Week"  value={stats?.recentUsers   || 0} icon="🆕" color={COLORS.violet} />
          </View>

          {/* Charts placeholder */}
          <View style={s.chartBox}>
            <Text style={s.chartTitle}>📈 Growth Overview</Text>
            <View style={s.barChart}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                const h = [40, 65, 55, 80, 70, 90, 75][i];
                return (
                  <View key={day} style={s.barCol}>
                    <View style={[s.bar, { height: h, backgroundColor: i === 5 ? COLORS.accent : COLORS.accent + '50' }]} />
                    <Text style={s.barLabel}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent users preview */}
          <View style={s.sectionBox}>
            <Text style={s.sectionTitle}>Recent Registrations</Text>
            {users.slice(0, 5).map(u => (
              <View key={u._id} style={s.userRow}>
                <View style={s.userAvatar}>
                  <Text style={s.userAvatarTxt}>{u.fullName?.[0] || 'U'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userName}>{u.fullName}</Text>
                  <Text style={s.userMeta}>{u.email} • {u.plan}</Text>
                </View>
                <View style={[s.statusDot, { backgroundColor: u.isActive ? COLORS.emerald : COLORS.rose }]} />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={users}
          keyExtractor={u => u._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.accent} />}
          contentContainerStyle={s.content}
          renderItem={({ item: u }) => (
            <View style={s.userCard}>
              <View style={s.userCardTop}>
                <View style={s.userAvatarLg}>
                  <Text style={s.userAvatarLgTxt}>{u.fullName?.[0] || 'U'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.userCardName}>{u.fullName}</Text>
                  <Text style={s.userCardEmail}>{u.email}</Text>
                  <Text style={s.userCardPhone}>{u.phone}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[s.planBadge, { backgroundColor: u.plan === 'premium' ? COLORS.gold + '30' : COLORS.surface }]}>
                    <Text style={[s.planBadgeTxt, { color: u.plan === 'premium' ? COLORS.gold : COLORS.textMuted }]}>
                      {u.plan === 'premium' ? '⭐ PRO' : 'FREE'}
                    </Text>
                  </View>
                  <View style={[s.verifiedBadge, { backgroundColor: u.isVerified ? COLORS.emerald + '20' : COLORS.rose + '20' }]}>
                    <Text style={[s.verifiedTxt, { color: u.isVerified ? COLORS.emerald : COLORS.rose }]}>
                      {u.isVerified ? '✓ Verified' : '✕ Unverified'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={s.userCardActions}>
                <Text style={s.joinDate}>Joined: {new Date(u.createdAt).toLocaleDateString('en-BD')}</Text>
                <TouchableOpacity
                  style={[s.toggleBtn, { backgroundColor: u.isActive ? COLORS.rose + '20' : COLORS.emerald + '20' }]}
                  onPress={() => toggleUser(u._id, u.isActive)}
                >
                  <Text style={[s.toggleBtnTxt, { color: u.isActive ? COLORS.rose : COLORS.emerald }]}>
                    {u.isActive ? '🚫 Deactivate' : '✅ Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#0F2044', padding: 20, paddingTop: 54, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white },
  headerSub: { fontSize: 11, color: '#93C5FD', marginTop: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  tabTxt: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  tabTxtActive: { color: COLORS.accent },
  content: { padding: 16, paddingBottom: 30 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statBox: { width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  chartBox: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  chartTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4 },
  sectionBox: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  userAvatarTxt: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  userName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  userMeta: { fontSize: 11, color: COLORS.textMuted },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  userCard: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  userCardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  userAvatarLg: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accentSoft, borderWidth: 2, borderColor: COLORS.borderActive, alignItems: 'center', justifyContent: 'center' },
  userAvatarLgTxt: { fontSize: 20, fontWeight: '900', color: COLORS.accent },
  userCardName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  userCardEmail: { fontSize: 12, color: COLORS.textDim, marginTop: 1 },
  userCardPhone: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  planBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  planBadgeTxt: { fontSize: 10, fontWeight: '800' },
  verifiedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  verifiedTxt: { fontSize: 10, fontWeight: '700' },
  userCardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  joinDate: { fontSize: 11, color: COLORS.textMuted },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleBtnTxt: { fontSize: 12, fontWeight: '700' },
});
