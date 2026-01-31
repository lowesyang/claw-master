interface StatusMessageProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export function StatusMessage({ message, type }: StatusMessageProps) {
  if (!message) return null
  
  return (
    <div className={`status ${type}`}>
      {message}
    </div>
  )
}
