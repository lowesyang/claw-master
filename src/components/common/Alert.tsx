import { ReactNode } from 'react'

interface AlertProps {
  icon: string
  title: string
  children: ReactNode
  type?: 'warning' | 'info'
}

export function Alert({ icon, title, children, type = 'info' }: AlertProps) {
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icon}</span>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        <div className="alert-text">{children}</div>
      </div>
    </div>
  )
}
