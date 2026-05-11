import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import { documentsAPI } from '../../api/cv.api';
import { COLORS } from '../../theme/colors';
import { DOC_TYPES } from '../../utils/constants';
import { formatFileSize, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';

const statusColors = {
  uploaded: COLORS.emerald,
  pending: COLORS.gold,
  missing: COLORS.rose,
};

const DocCard = ({ doc, onDelete }) => {
  const color = statusColors[doc.status] || COLORS.textMuted;
  return (
    <View style={styles.docCard}>
      <View style={[styles.docIcon, { backgroundColor: color + '20' }]}>
        <Text style={{ fontSize: 22 }}>📄</Text>
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName}>{doc.name}</Text>
        {doc.uploadedAt
          ? <Text style={styles.docMeta}>Uploaded: {formatDate(doc.uploadedAt)}</Text>
          : <Text style={[styles.docMeta, { color: COLORS.rose }]}>Not uploaded</Text>
        }
        {doc.fileSize && <Text style={styles.docSize}>{formatFileSize(doc.fileSize)}</Text>}
      </View>
      <View style={styles.docRight}>
        <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.statusTxt, { color }]}>
            {doc.status === 'uploaded' ? '✓ Done' : doc.status === 'pending' ? '⏳' : '✕'}
          </Text>
        </View>
        {doc.status === 'uploaded' && (
          <TouchableOpacity onPress={() => Alert.alert('Delete Document?', '', [
            { text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => onDelete(doc._id) }
          ])} style={styles.deleteBtn}>
            <Text style={{ fontSize: 14 }}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const UploadSlot = ({ docType, onUpload }) => (
  <TouchableOpacity style={styles.uploadSlot} onPress={() => onUpload(docType.id)}>
    <Text style={{ fontSize: 28, marginBottom: 6 }}>⬆</Text>
    <Text style={styles.slotLabel}>{docType.label}</Text>
    <Text style={styles.slotSub}>Tap to upload</Text>
  </TouchableOpacity>
);

export default function DocumentVaultScreen() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await documentsAPI.getAll();
      setDocs(res.data.documents || []);
    } catch (e) {
      // offline fallback
    }
  };

  const handleUpload = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert('File too large', 'Maximum file size is 5MB');
        return;
      }
      setLoading(true);
      const formData = new FormData();
      formData.append('document', { uri: file.uri, name: file.name, type: file.mimeType });
      formData.append('docType', docType);
      await documentsAPI.upload(formData);
      Alert.alert('Success', 'Document uploaded successfully!');
      fetchDocs();
    } catch (e) {
      Alert.alert('Upload Failed', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentsAPI.delete(id);
      setDocs(prev => prev.filter(d => d._id !== id));
    } catch (e) {
      Alert.alert('Error', 'Could not delete document');
    }
  };

  const uploadedTypes = docs.map(d => d.docType);
  const missingSlots = DOC_TYPES.filter(dt => !uploadedTypes.includes(dt.id));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Vault</Text>
        <Text style={styles.sub}>Upload and manage your documents</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={COLORS.accent}
          onRefresh={async () => { setRefreshing(true); await fetchDocs(); setRefreshing(false); }} />}
      >
        {/* Storage bar */}
        <View style={styles.storageCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.storageTxt}>Storage Used</Text>
            <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13 }}>
              {docs.length} / {DOC_TYPES.length} files
            </Text>
          </View>
          <View style={styles.storageTrack}>
            <View style={[styles.storageFill, { width: `${(docs.length / DOC_TYPES.length) * 100}%` }]} />
          </View>
          <View style={styles.storageStats}>
            {[
              [docs.filter(d => d.status === 'uploaded').length.toString(), 'Uploaded', COLORS.emerald],
              [missingSlots.length.toString(), 'Missing', COLORS.rose],
            ].map(([v, l, c]) => (
              <View key={l} style={{ alignItems: 'center' }}>
                <Text style={[styles.statNum, { color: c }]}>{v}</Text>
                <Text style={styles.statLbl}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Uploaded docs */}
        {docs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Uploaded Documents</Text>
            {docs.map(doc => (
              <DocCard key={doc._id} doc={doc} onDelete={handleDelete} />
            ))}
          </View>
        )}

        {/* Upload slots */}
        {missingSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📤 Upload Required Documents</Text>
            <View style={styles.slotsGrid}>
              {missingSlots.map(dt => (
                <UploadSlot key={dt.id} docType={dt} onUpload={handleUpload} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#0F2044', padding: 24, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  sub: { fontSize: 13, color: '#93C5FD', marginTop: 4 },
  storageCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  storageTxt: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  storageTrack: { height: 6, backgroundColor: COLORS.surface, borderRadius: 3 },
  storageFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  storageStats: { flexDirection: 'row', gap: 24, marginTop: 12 },
  statNum: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 11, color: COLORS.textMuted },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  docCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  docIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1 },
  docName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  docMeta: { fontSize: 11, color: COLORS.textMuted },
  docSize: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  docRight: { alignItems: 'center', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusTxt: { fontSize: 10, fontWeight: '800' },
  deleteBtn: { padding: 4 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  uploadSlot: {
    width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  slotLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 2 },
  slotSub: { fontSize: 10, color: COLORS.accent },
});
