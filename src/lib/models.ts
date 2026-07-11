export interface ModelOption {
  id: string;
  label: string;
  url: string;
  size: string;
  recommended?: boolean;
}

export const MODELS: ModelOption[] = [
  {
    id: 'qwen2.5-0.5b',
    label: 'Qwen 0.5B (350 МБ) ⭐',
    url: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf',
    size: '350 МБ',
    recommended: true,
  },
  {
    id: 'smollm-360m',
    label: 'SmolLM 360M (250 МБ)',
    url: 'https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct-GGUF/resolve/main/smollm-360m-instruct-q4_k_m.gguf',
    size: '250 МБ',
  },
  {
    id: 'qwen2.5-1.5b',
    label: 'Qwen 1.5B (1 ГБ)',
    url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    size: '1 ГБ',
  },
];
