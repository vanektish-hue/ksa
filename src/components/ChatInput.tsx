import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) => (
  <View style={styles.bar}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="Напиши сообщение..."
      placeholderTextColor="#7a7a9a"
      multiline
      editable={!disabled}
    />
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onSend}
      disabled={disabled}>
      <Text style={styles.btnText}>➤</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    paddingBottom: 14,
    backgroundColor: '#12122a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 11,
    color: '#e8e8f0',
    fontSize: 15,
    maxHeight: 120,
  },
  btn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7c5cfc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.3 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
