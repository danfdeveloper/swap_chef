import { Link, useParams } from 'react-router-dom'
import { getRecipeDiff } from '../data/mockRecipes'

function formatIngredient(ingredient) {
  const unit = ingredient.unit ? ` ${ingredient.unit}` : ''
  return `${ingredient.quantity}${unit} ${ingredient.name}`
}

function ComparePage() {
  const { id } = useParams()
  const diff = getRecipeDiff(id)

  if (!diff) {
    return (
      <section className="page">
        <h1>No comparison available</h1>
        <p>This recipe has no parent fork to compare against, or it was not found.</p>
        <p>
          <Link to={`/recipes/${id}`}>Back to recipe</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Version comparison</h1>
        <p className="page-lede">
          Read-only mock diff of {diff.to.title} against {diff.from.title} (v
          {diff.from.version}).
        </p>
      </header>

      <div className="detail-grid">
        <section>
          <h2>Ingredients added</h2>
          <DiffIngredientList items={diff.ingredients.added} empty="None" />
          <h2>Ingredients removed</h2>
          <DiffIngredientList items={diff.ingredients.removed} empty="None" />
          <h2>Ingredients changed</h2>
          {diff.ingredients.changed.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {diff.ingredients.changed.map((change) => (
                <li key={change.to.name}>
                  {formatIngredient(change.from)} → {formatIngredient(change.to)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Steps added</h2>
          {diff.steps.added.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ol className="step-list">
              {diff.steps.added.map((step) => (
                <li key={step.position}>{step.text}</li>
              ))}
            </ol>
          )}
          <h2>Steps changed</h2>
          {diff.steps.changed.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {diff.steps.changed.map((change) => (
                <li key={change.position}>
                  <strong>Step {change.position}</strong>
                  <div className="diff-before">{change.from}</div>
                  <div className="diff-after">{change.to}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p>
        <Link to={`/recipes/${id}`}>Back to recipe</Link>
      </p>
    </section>
  )
}

function DiffIngredientList({ items, empty }) {
  if (items.length === 0) {
    return <p className="muted">{empty}</p>
  }

  return (
    <ul className="plain-list">
      {items.map((ingredient) => (
        <li key={`${ingredient.name}-${ingredient.unit}`}>
          {formatIngredient(ingredient)}
        </li>
      ))}
    </ul>
  )
}

export default ComparePage
