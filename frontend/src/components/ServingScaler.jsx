function ServingScaler({
  baseServings,
  desiredServings,
  onBaseChange,
  onDesiredChange,
  scale,
}) {
  function setQuickMultiplier(multiplier) {
    const base = Number(baseServings) > 0 ? Number(baseServings) : 4
    onDesiredChange(String(Math.round(base * multiplier * 100) / 100))
  }

  return (
    <div className="serving-scaler">
      <div className="serving-scaler__row">
        <label className="form__field serving-scaler__field">
          <span>As written (servings)</span>
          <input
            type="number"
            min="1"
            step="1"
            value={baseServings}
            onChange={(event) => onBaseChange(event.target.value)}
          />
        </label>
        <label className="form__field serving-scaler__field">
          <span>Make this many</span>
          <input
            type="number"
            min="1"
            step="1"
            value={desiredServings}
            onChange={(event) => onDesiredChange(event.target.value)}
          />
        </label>
      </div>
      <div className="serving-scaler__quick">
        <span className="muted">Quick multiply:</span>
        <button type="button" className="button button--secondary button--small" onClick={() => setQuickMultiplier(0.5)}>
          ½×
        </button>
        <button type="button" className="button button--secondary button--small" onClick={() => setQuickMultiplier(1)}>
          1×
        </button>
        <button type="button" className="button button--secondary button--small" onClick={() => setQuickMultiplier(2)}>
          2×
        </button>
        <button type="button" className="button button--secondary button--small" onClick={() => setQuickMultiplier(3)}>
          3×
        </button>
      </div>
      <p className="muted serving-scaler__note">
        Ingredients scaled by {formatScale(scale)}×
        {scale === 1 ? ' (as written)' : ''}. Does not change the saved recipe.
      </p>
    </div>
  )
}

export function formatScale(scale) {
  if (!Number.isFinite(scale)) return '1'
  return String(Math.round(scale * 100) / 100)
}

export function formatScaledQuantity(quantity, scale) {
  const value = Number(quantity) * scale
  if (!Number.isFinite(value)) return String(quantity ?? '')
  return String(Math.round(value * 100) / 100)
}

export function computeServingScale(baseServings, desiredServings) {
  const base = Number(baseServings)
  const desired = Number(desiredServings)
  if (!(base > 0) || !(desired > 0)) return 1
  return desired / base
}

export default ServingScaler
