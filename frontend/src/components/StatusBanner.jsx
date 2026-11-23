function StatusBanner({ children, tone = 'info', role = 'status' }) {
  if (!children) return null
  return (
    <p className={`banner banner--${tone}`} role={role}>
      {children}
    </p>
  )
}

export default StatusBanner
