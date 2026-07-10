import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const Header = ({
  statusText,
  badge,
}: {
  statusText: string;
  badge: string;
}) => (
  <View style={styles.header}>
    <Text style={styles.logo}>🧠</Text>
    <View style={styles.info}>
      <Text style={styles.title}>KSA</Text>
      <Text style={styles.sub}>{statusText}</Text>
    </View>
    <View
      style={[
        styles.badge,
        badge === 'ready' && styles.badgeReady,
        badge === 'loading' && styles.badgeLoading,
        badge === 'error' && styles.badgeError,
      ]}>
      <Text style={styles.badgeText}>{badge}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    paddingTop: 24,
    backgroundColor: '#12122a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  logo: { fontSize: 28 },
  info: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: '#e8e8f0' },
  sub: { fontSize: 11, color: '#7a7a9a', marginTop: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#3d0a0a',
  },
  badgeReady: { backgroundColor: '#0a3d2a' },
  badgeLoading: { backgroundColor: '#4a3800' },
  badgeError: { backgroundColor: '#3d0a0a' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#fff' },
});
