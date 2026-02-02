import { useLanguage } from '../../contexts/LanguageContext'

interface LoadingProps {
  message?: string
}

export function Loading({ message }: LoadingProps) {
  const { t } = useLanguage()
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{message ?? t('common.loading')}</p>
    </div>
  )
}
