export interface ModelOption {
  id: string;
  label: string;
  url: string;
  size: string;
  recommended?: boolean;
}

// Модели в формате GGUF, совместимые с llama.cpp / llama.rn
export const MODELS: ModelOption[] = [
  {
    id: 'qwen2.5-0.5b',
    label: 'Qwen 2.5 0.5B (~350 МБ) ⭐ быстрая',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    size: '350 МБ',
    recommended: true,
  },
  {
    id: 'qwen2.5-1.5b',
    label: 'Qwen 2.5 1.5B (~1 ГБ) — золотая середина',
    url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    size: '1 ГБ',
  },
  {
    id: 'gemma2-2b',
    label: 'Gemma 2 2B (~1.5 ГБ)',
    url: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
    size: '1.5 ГБ',
  },
  {
    id: 'smollm-360m',
    label: 'SmolLM 360M (~250 МБ) — для слабых',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct-GGUF/resolve/main/smollm-360m-instruct-q4_k_m.gguf',
    size: '250 МБ',
  },
];
