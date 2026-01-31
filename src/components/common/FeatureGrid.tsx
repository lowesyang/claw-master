import { useNavigate } from 'react-router-dom'

interface FeatureItem {
  icon: string
  title: string
  desc: string
  path?: string
  onClick?: () => void
}

interface FeatureGridProps {
  items: FeatureItem[]
}

export function FeatureGrid({ items }: FeatureGridProps) {
  const navigate = useNavigate()

  const handleClick = (item: FeatureItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (item.path) {
      if (item.path.startsWith('http')) {
        window.open(item.path, '_blank')
      } else {
        navigate(item.path)
      }
    }
  }

  return (
    <div className="feature-grid">
      {items.map((item, index) => (
        <div key={index} className="feature-card" onClick={() => handleClick(item)}>
          <div className="feature-icon">{item.icon}</div>
          <div className="feature-title">{item.title}</div>
          <div className="feature-desc">{item.desc}</div>
        </div>
      ))}
    </div>
  )
}
