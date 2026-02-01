import { useLanguage } from '../../contexts/LanguageContext'

export const AI_MODELS = [
  { value: 'google/gemini-3-flash', labelKey: 'model.gemini3Flash', provider: 'Google' },
  { value: 'google/gemini-3-pro', labelKey: 'model.gemini3Pro', provider: 'Google' },
  { value: 'anthropic/claude-sonnet-4.5', labelKey: 'model.claudeSonnet45', provider: 'Anthropic' },
  { value: 'openai/gpt-5.2', labelKey: 'model.gpt52', provider: 'OpenAI' },
  { value: 'openai/gpt-4o', labelKey: 'model.gpt4o', provider: 'OpenAI' },
  { value: 'deepseek/deepseek-v3.2', labelKey: 'model.deepseekV32', provider: 'DeepSeek' },
]

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
  showProvider?: boolean
  className?: string
}

export function ModelSelector({ value, onChange, showProvider = false, className }: ModelSelectorProps) {
  const { t } = useLanguage()

  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: '0.9rem',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 0.2s ease',
      }}
    >
      {AI_MODELS.map((model) => (
        <option key={model.value} value={model.value}>
          {showProvider 
            ? `${t(model.labelKey as any)} (${model.provider})`
            : t(model.labelKey as any)
          }
        </option>
      ))}
    </select>
  )
}
