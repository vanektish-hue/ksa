import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

export const ChatBubble = ({
  role,
  content,
}: {
  role: 'user' | 'assistant';
  content: string;
}) => (
  <View
    style={[
      styles.bubble,
      role === 'user' ? styles.user : styles.bot,
    ]}>
    {role === 'user' ? (
      <Text style={styles.userText}>{content}</Text>
    ) : (
      <Markdown style={markdownStyles}>{content}</Markdown>
    )}
  </View>
);

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '88%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 14,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#7c5cfc',
    borderBottomRightRadius: 6,
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: '#2a2a4a',
    borderBottomLeftRadius: 6,
  },
  userText: { color: '#fff', fontSize: 15, lineHeight: 22 },
});

const markdownStyles = StyleSheet.create({
  body: { color: '#e8e8f0', fontSize: 15, lineHeight: 22 },
  code_block: {
    backgroundColor: '#0a0a14',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: 'rgba(124,92,252,0.15)',
    color: '#a78bfa',
    borderRadius: 5,
    paddingHorizontal: 6,
  },
  fence: { backgroundColor: '#0a0a14', borderRadius: 10 },
  strong: { fontWeight: '600', color: '#fff' },
});
