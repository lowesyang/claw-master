export interface StatusMessageProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
}

export function StatusMessage({ message, type, onClose }: StatusMessageProps) {
  if (!message) return null
  
  return (
    <div className={`status ${type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
