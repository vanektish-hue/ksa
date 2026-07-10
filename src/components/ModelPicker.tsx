import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MODELS } from '@/lib/models';

export const ModelPicker = ({
  selected,
  onSelect,
  onLoad,
  disabled,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onLoad: () => void;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === selected) ?? MODELS[0];

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.select}
        onPress={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}>
        <Text style={styles.selectText} numberOfLines={1}>
          {current.label}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={onLoad}
        disabled={disabled}>
        <Text style={styles.btnText}>Запустить</Text>
      </TouchableOpacity>

      {open && !disabled && (
        <View style={styles.dropdown}>
          {MODELS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.option,
                m.id === selected && styles.optionActive,
              ]}
              onPress={() => {
                onSelect(m.id);
                setOpen(false);
              }}>
              <Text style={styles.optionText}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#12122a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  select: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  selectText: { color: '#e8e8f0', fontSize: 13 },
  btn: {
    backgroundColor: '#7c5cfc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    backgroundColor: '#1a1a3a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    zIndex: 100,
    elevation: 5,
  },
  option: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a4a' },
  optionActive: { backgroundColor: 'rgba(124,92,252,0.15)' },
  optionText: { color: '#e8e8f0', fontSize: 13 },
});
