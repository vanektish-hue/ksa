import { useCallback, useRef, useState } from 'react';
import { initLlama, type LlamaContext, type TokenData } from '@pocketpalai/llama.rn';
import RNFS from 'react-native-fs';
import { MODELS, type ModelOption } from '@/lib/models';

const CONFIG_FILE = `${RNFS.DocumentDirectoryPath}/ksa_config.json`;

async function loadConfig(): Promise<{ modelId?: string }> {
  try {
    if (await RNFS.exists(CONFIG_FILE)) {
      const raw = await RNFS.readFile(CONFIG_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

async function saveConfig(config: { modelId?: string }) {
  try {
    await RNFS.writeFile(CONFIG_FILE, JSON.stringify(config), 'utf8');
  } catch {}
}

export function useLlama() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('выбери модель');
  const ctxRef = useRef<LlamaContext | null>(null);

  const getModelPath = (model: ModelOption) => {
    const name = model.url.split('/').pop() || `${model.id}.gguf`;
    return `${RNFS.DocumentDirectoryPath}/${name}`;
  };

  const isModelDownloaded = async (modelId: string): Promise<boolean> => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return false;
    const dest = getModelPath(model);
    return await RNFS.exists(dest);
  };

  const getLastModelId = async (): Promise<string | null> => {
    const config = await loadConfig();
    return config.modelId ?? null;
  };

  const downloadModel = async (model: ModelOption): Promise<string> => {
    const dest = getModelPath(model);
    if (await RNFS.exists(dest)) return dest;

    setStatusText(`скачиваю ${model.size}...`);
    const job = RNFS.downloadFile({
      fromUrl: model.url,
      toFile: dest,
      begin: () => setProgress(0),
      progress: (res: { bytesWritten: number; contentLength: number }) => {
        if (res.contentLength > 0) setProgress(res.bytesWritten / res.contentLength);
      },
    });
    await job.promise;
    return dest;
  };

  const loadModel = useCallback(async (modelId: string) => {
    const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
    setStatus('loading');
    setProgress(0);
    try {
      const path = await downloadModel(model);
      setStatusText('инициализация модели...');

      const ctx = await initLlama(
        {
          model: path,
          n_ctx: 1024,
          n_gpu_layers: 0,
          use_mlock: false,
          use_mmap: true,
          n_threads: 4,
        },
        (p: number) => {
          if (p > 0 && p < 1) setProgress(p);
        },
      );
      ctxRef.current = ctx;
      await saveConfig({ modelId });
      setStatus('ready');
      setStatusText(model.label.split(' ')[0]);
      setProgress(1);
    } catch (e) {
      console.log('[KSA] Load error:', e);
      setStatus('error');
      setStatusText('ошибка: ' + String(e).substring(0, 50));
    }
  }, []);

  const generate = useCallback(
    async (
      messages: { role: string; content: string }[],
      onToken: (token: string) => void,
    ): Promise<string> => {
      if (!ctxRef.current) throw new Error('Model not loaded');

      let full = '';
      const result = await ctxRef.current.completion(
        {
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          n_predict: 1024,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['</s>', '<|end|>', '<|im_end|>'],
        },
        (data: TokenData) => {
          const t = data.token ?? data.content ?? '';
          if (t) {
            full += t;
            onToken(t);
          }
        },
      );
      return full || result.text || '';
    },
    [],
  );

  return { status, progress, statusText, loadModel, generate, isModelDownloaded, getLastModelId };
}
