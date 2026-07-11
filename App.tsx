import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Header } from '@/components/Header';
import { ModelPicker } from '@/components/ModelPicker';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { SearchIndicator } from '@/components/SearchIndicator';
import { useLlama } from '@/hooks/useLlama';
import { KSA_SYSTEM_PROMPT } from '@/lib/prompts';
import {
  webSearch,
  formatSearchContext,
  extractSearchQuery,
  stripSearchTags,
} from '@/lib/search';
import { MODELS } from '@/lib/models';
import type { ChatMessage, SearchIndicatorState } from '@/types';

const App = () => {
  const {
    status, progress, statusText, loadModel, generate,
    isModelDownloaded, getLastModelId,
  } = useLlama();
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchInd, setSearchInd] = useState<SearchIndicatorState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const flatRef = useRef<FlatList>(null);
  const autoLoadDone = useRef(false);

  useEffect(() => {
    if (autoLoadDone.current) return;
    autoLoadDone.current = true;
    (async () => {
      const lastId = await getLastModelId();
      if (lastId && (await isModelDownloaded(lastId))) {
        setSelectedModel(lastId);
        loadModel(lastId);
      }
    })();
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages, searchInd]);

  const handleLoad = useCallback((modelId: string) => {
    setSelectedModel(modelId);
    loadModel(modelId);
  }, [loadModel]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isGenerating || status !== 'ready') return;

    setIsGenerating(true);
    setInput('');
    setSearchInd(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
    };
    setMessages((prev) => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: msg });

    const botId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botId, role: 'assistant', content: '' }]);

    const updateBot = (text: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === botId ? { ...m, content: text } : m)),
      );
    };

    try {
      let full = '';
      await generate(
        [{ role: 'system', content: KSA_SYSTEM_PROMPT }, ...historyRef.current],
        (token: string) => {
          full += token;
          updateBot(stripSearchTags(full));
        },
      );

      const query = extractSearchQuery(full);
      if (query) {
        setSearchInd({ type: 'searching', text: `🔍 Ищу: ${query}` });
        const results = await webSearch(query);
        if (results && results.length > 0) {
          setSearchInd({ type: 'found', text: `✅ Найдено ${results.length}` });
          setTimeout(() => setSearchInd(null), 2500);

          historyRef.current.push({ role: 'assistant', content: stripSearchTags(full) });
          historyRef.current.push({ role: 'user', content: formatSearchContext(results, msg) });

          let second = '';
          await generate(
            [{ role: 'system', content: KSA_SYSTEM_PROMPT }, ...historyRef.current],
            (token: string) => {
              second += token;
              updateBot(stripSearchTags(second));
            },
          );
          second = stripSearchTags(second);
          historyRef.current.push({ role: 'assistant', content: second });
          updateBot(second);
        } else {
          setSearchInd({ type: 'error', text: '⚠️ Ничего не найдено' });
          setTimeout(() => setSearchInd(null), 3000);
          const clean = stripSearchTags(full);
          historyRef.current.push({ role: 'assistant', content: clean });
          updateBot(clean);
        }
      } else {
        full = stripSearchTags(full);
        historyRef.current.push({ role: 'assistant', content: full });
        updateBot(full);
      }
    } catch (e) {
      updateBot('⚠️ Ошибка: ' + String(e).substring(0, 100));
    }

    setIsGenerating(false);
  };

  const badge =
    status === 'ready'
      ? 'готово'
      : status === 'loading'
        ? 'загрузка'
        : status === 'error'
          ? 'ошибка'
          : 'выкл';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding" keyboardVerticalOffset={0}>
      <Header statusText={statusText} badge={badge} />
      <ModelPicker
        selected={selectedModel}
        onSelect={setSelectedModel}
        onLoad={handleLoad}
        disabled={status === 'loading' || status === 'ready'}
      />

      {status === 'loading' && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        renderItem={({ item }) =>
          item.content || item.role === 'assistant' ? (
            <ChatBubble role={item.role} content={item.content} />
          ) : (
            <View />
          )
        }
        ListFooterComponent={
          searchInd ? (
            <SearchIndicator type={searchInd.type} text={searchInd.text} />
          ) : null
        }
      />

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={status !== 'ready' || isGenerating}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  progressWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#2a2a4a', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c5cfc' },
  progressText: { fontSize: 11, color: '#7a7a9a', textAlign: 'center', marginTop: 4 },
  chat: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8 },
});

export default App;
