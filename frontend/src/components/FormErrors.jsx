function FormErrors({ error, fieldErrors = {} }) {
  const detailMessages = error?.details?.length
    ? error.details
    : Object.entries(fieldErrors).map(([field, message]) => ({ field, message }))

  if (!error && detailMessages.length === 0) return null

  return (
    <div className="form-alert" role="alert">
      {error?.message && <p className="form-alert__message">{error.message}</p>}
      {detailMessages.length > 0 && (
        <ul className="form-alert__list">
          {detailMessages.map((detail) => (
            <li key={`${detail.field}-${detail.message}`}>
              {detail.field ? <strong>{detail.field}: </strong> : null}
              {detail.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FormErrors
