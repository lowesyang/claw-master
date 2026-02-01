import { useLanguage } from '../../contexts/LanguageContext'
import { Select, SelectOption } from './Select'

// OpenRouter model IDs - see https://openrouter.ai/models
export const AI_MODELS = [
  { value: 'google/gemini-3-flash-preview', labelKey: 'model.gemini3Flash', provider: 'Google' },
  { value: 'google/gemini-3-pro-preview', labelKey: 'model.gemini3Pro', provider: 'Google' },
  { value: 'anthropic/claude-sonnet-4.5', labelKey: 'model.claudeSonnet45', provider: 'Anthropic' },
  { value: 'openai/gpt-5.2', labelKey: 'model.gpt52', provider: 'OpenAI' },
  { value: 'openai/gpt-4o', labelKey: 'model.gpt4o', provider: 'OpenAI' },
  { value: 'deepseek/deepseek-v3.2', labelKey: 'model.deepseekV32', provider: 'DeepSeek' },
]

// Map legacy/invalid model IDs to current valid ones
export const MODEL_ID_MIGRATION: Record<string, string> = {
  'google/gemini-3-flash': 'google/gemini-3-flash-preview',
  'google/gemini-3-pro': 'google/gemini-3-pro-preview',
}

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
  showProvider?: boolean
  className?: string
}

export function ModelSelector({ value, onChange, showProvider = false, className }: ModelSelectorProps) {
  const { t } = useLanguage()

  const options: SelectOption[] = AI_MODELS.map((model) => ({
    value: model.value,
    label: showProvider
      ? `${t(model.labelKey as any)} (${model.provider})`
      : t(model.labelKey as any)
  }))

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      className={className}
    />
  )
}
