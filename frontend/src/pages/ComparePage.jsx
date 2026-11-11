import { Link, useParams } from 'react-router-dom'
import { getRecipeDiff } from '../data/mockRecipes'

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
          Read-only mock diff of recipe #{diff.forkId} against parent recipe #
          {diff.parentRecipeId} version {diff.parentVersionNumber}.
        </p>
      </header>

      <div className="detail-grid">
        <section>
          <h2>Ingredients added</h2>
          <DiffIngredientList items={diff.ingredientsAdded} empty="None" />
          <h2>Ingredients removed</h2>
          <DiffIngredientList items={diff.ingredientsRemoved} empty="None" />
          <h2>Ingredients changed</h2>
          {diff.ingredientsChanged.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {diff.ingredientsChanged.map((change) => (
                <li key={change.after.name}>
                  {formatIngredient(change.before)} → {formatIngredient(change.after)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Steps added</h2>
          {diff.stepsAdded.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ol className="step-list">
              {diff.stepsAdded.map((step) => (
                <li key={step.order}>{step.instruction}</li>
              ))}
            </ol>
          )}
          <h2>Steps changed</h2>
          {diff.stepsChanged.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {diff.stepsChanged.map((change) => (
                <li key={change.order}>
                  <strong>Step {change.order}</strong>
                  <div className="diff-before">{change.before}</div>
                  <div className="diff-after">{change.after}</div>
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

function formatIngredient(ingredient) {
  return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
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
