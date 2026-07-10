import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const SearchIndicator = ({
  type,
  text,
}: {
  type: 'searching' | 'found' | 'error';
  text: string;
}) => (
  <View style={[styles.indicator, styles[type]]}>
    {type === 'searching' && <ActivityIndicator size="small" color="#06b6d4" />}
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    padding: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  searching: { backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' },
  found: { backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  error: { backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  text: { fontSize: 13 },
});
