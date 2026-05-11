import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { STEP_NAMES } from '../../utils/constants';

// ── Progress Bar ──────────────────────────────────────────────────
export function ProgressBar({ percent, color = COLORS.accent, height = 4, showLabel = false }) {
  return (
    <View>
      {showLabel && (
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={[styles.progressPct, { color }]}>{percent}%</Text>
        </View>
      )}
      <View style={[styles.trackBar, { height }]}>
        <View style={[styles.fillBar, { width: `${percent}%`, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

// ── Step Indicator (horizontal) ───────────────────────────────────
export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const n = i + 1;
        const isActive = n === currentStep;
        const isDone = n < currentStep;
        return (
          <React.Fragment key={n}>
            <View style={[
              styles.dot,
              isActive && styles.dotActive,
              isDone && styles.dotDone,
            ]}>
              {isDone ? (
                <Text style={styles.dotCheck}>✓</Text>
              ) : (
                <Text style={[styles.dotNum, isActive && { color: COLORS.white }]}>{n}</Text>
              )}
            </View>
            {n < totalSteps && (
              <View style={[styles.connector, isDone && styles.connectorDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

import { useSelector } from 'react-redux';

// ── Step Header ───────────────────────────────────────────────────
export function StepHeader({ step, totalSteps }) {
  const completionPct = useSelector(s => s.builder.completionPct);

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <ProgressBar percent={Math.round((step / totalSteps) * 100)} showLabel={false} height={4} />
      </View>
      <View style={styles.headerBottom}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step}</Text>
          </View>
          <View>
            <Text style={styles.stepTitle}>{STEP_NAMES[step - 1]}</Text>
            <Text style={styles.stepSub}>Step {step} of {totalSteps}</Text>
          </View>
        </View>
        {completionPct > 0 && (
          <View style={styles.pctBadge}>
            <Text style={styles.pctBadgeText}>🚀 {completionPct}%</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 11, color: COLORS.textMuted },
  progressPct: { fontSize: 11, fontWeight: '700' },
  trackBar: { backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  fillBar: { borderRadius: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  dotDone: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald },
  dotNum: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700' },
  dotCheck: { fontSize: 11, color: COLORS.white, fontWeight: '700' },
  connector: { flex: 1, height: 2, backgroundColor: COLORS.border, maxWidth: 20 },
  connectorDone: { backgroundColor: COLORS.emerald },

  header: { padding: 16, backgroundColor: COLORS.bgCard, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerBottom: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  stepBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  stepBadgeText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  stepSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  pctBadge: {
    backgroundColor: COLORS.emerald + '20',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    borderWidth: 1, borderColor: COLORS.emerald + '40',
  },
  pctBadgeText: { color: COLORS.emerald, fontWeight: '800', fontSize: 12 },
});
