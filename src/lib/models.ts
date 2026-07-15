export interface ModelOption {
  id: string;
  label: string;
  url: string;
  size: string;
  recommended?: boolean;
  embedded?: boolean;
}

export const MODELS: ModelOption[] = [
  {
    id: 'folk-qwen-0.5b',
    label: '🎯 KSA Folk Qwen 0.5B (встроенная)',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    size: 'в APK',
    recommended: true,
    embedded: true,
  },
  {
    id: 'qwen2.5-0.5b',
    label: 'Qwen 0.5B (350 МБ)',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    size: '350 МБ',
  },
  {
    id: 'smollm-360m',
    label: 'SmolLM 360M (250 МБ)',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct-GGUF/resolve/main/smollm-360m-instruct-q4_k_m.gguf',
    size: '250 МБ',
  },
];
