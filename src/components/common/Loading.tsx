interface LoadingProps {
  message?: string
}

export function Loading({ message = '加载中...' }: LoadingProps) {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  )
}
