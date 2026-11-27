function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <span className="loading-block__dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingBlock
