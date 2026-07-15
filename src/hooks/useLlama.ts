import { useCallback, useRef, useState, Platform } from 'react';
import { initLlama, type LlamaContext, type TokenData } from '@pocketpalai/llama.rn';
import RNFS from 'react-native-fs';
import { MODELS, type ModelOption } from '@/lib/models';

const CONFIG_FILE = `${RNFS.DocumentDirectoryPath}/ksa_config.json`;
const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/models`;

// Embedded model file (shipped inside APK assets)
const EMBEDDED_BASE = 'models/qwen2.5-0.5b-instruct-q4_k_m.gguf';

async function ensureModelsDir() {
  if (!(await RNFS.exists(MODELS_DIR))) {
    await RNFS.mkdir(MODELS_DIR);
  }
}

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
    if (model.embedded) {
      return `${MODELS_DIR}/qwen2.5-0.5b-instruct-q4_k_m.gguf`;
    }
    const name = model.url.split('/').pop() || `${model.id}.gguf`;
    return `${RNFS.DocumentDirectoryPath}/${name}`;
  };

  const isModelDownloaded = async (modelId: string): Promise<boolean> => {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return false;
    if (model.embedded) return true;
    return await RNFS.exists(getModelPath(model));
  };

  const getLastModelId = async (): Promise<string | null> => {
    const config = await loadConfig();
    return config.modelId ?? null;
  };

  // Copy embedded model from APK assets → documents
  const extractEmbeddedModel = async (): Promise<string> => {
    await ensureModelsDir();
    const modelPath = `${MODELS_DIR}/qwen2.5-0.5b-instruct-q4_k_m.gguf`;

    if (await RNFS.exists(modelPath)) return modelPath;

    if (Platform.OS === 'android') {
      await RNFS.copyFileAssets(EMBEDDED_BASE, modelPath);
    }

    return modelPath;
  };

  const downloadModel = async (model: ModelOption): Promise<string> => {
    // Embedded model: extract from APK assets
    if (model.embedded) {
      return await extractEmbeddedModel();
    }

    // Regular model: download from URL
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
    const result = await job.promise;
    if (result.statusCode !== 200) {
      throw new Error(`Ошибка скачивания: код ${result.statusCode}`);
    }
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
          n_ctx: 512,
          n_gpu_layers: 0,
          use_mlock: false,
          use_mmap: false,
          n_threads: 2,
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
    } catch (e: any) {
      console.log('[KSA] Load error:', e);
      setStatus('error');
      const msg = String(e?.message || e || 'неизвестная ошибка').substring(0, 60);
      setStatusText('ошибка: ' + msg);
    }
  }, []);

  const generate = useCallback(
    async (
      messages: { role: string; content: string }[],
      onToken: (token: string) => void,
    ): Promise<string> => {
      if (!ctxRef.current) throw new Error('Модель не загружена');

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
