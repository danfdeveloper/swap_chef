import { Link, useParams } from 'react-router-dom'
import { getRecipeById } from '../data/mockRecipes'

function formatIngredient(ingredient) {
  const unit = ingredient.unit ? ` ${ingredient.unit}` : ''
  return `${ingredient.quantity}${unit} ${ingredient.name}`
}

function RecipeDetailPage() {
  const { id } = useParams()
  const recipe = getRecipeById(id)

  if (!recipe) {
    return (
      <section className="page">
        <h1>Recipe not found</h1>
        <p className="page-lede">
          Detail API wiring arrives in Milestone 3. Mock recipes still work from browse.
        </p>
        <p>
          <Link to="/">Back to browse</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">
          Version {recipe.version}
          {recipe.parent
            ? ` · forked from ${recipe.parent.title} (v${recipe.parent.version})`
            : ' · original recipe'}
        </p>
        <h1>{recipe.title}</h1>
        <p className="page-lede">{recipe.description}</p>
        <p className="recipe-meta">
          by {recipe.author.username} · prep {recipe.prepMinutes} min · cook{' '}
          {recipe.cookMinutes} min · {recipe.forkCount}{' '}
          {recipe.forkCount === 1 ? 'fork' : 'forks'}
        </p>
      </header>

      <div className="action-row">
        <Link className="button" to={`/recipes/${recipe.id}/edit`}>
          Edit / fork editor
        </Link>
        {recipe.parent && (
          <Link className="button button--secondary" to={`/recipes/${recipe.id}/compare`}>
            Compare with parent
          </Link>
        )}
        <Link className="button button--secondary" to={`/recipes/${recipe.id}/lineage`}>
          Family tree
        </Link>
      </div>

      {recipe.parent && (
        <p className="parent-link">
          Parent:{' '}
          <Link to={`/recipes/${recipe.parent.recipeId}`}>
            {recipe.parent.title} (version {recipe.parent.version})
          </Link>
        </p>
      )}

      <div className="detail-grid">
        <section>
          <h2>Ingredients</h2>
          <ul className="plain-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={`${ingredient.name}-${ingredient.unit}`}>
                {formatIngredient(ingredient)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Steps</h2>
          <ol className="step-list">
            {recipe.steps.map((step, index) => (
              <li key={`${index}-${step.slice(0, 24)}`}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="version-history">
        <h2>Version history</h2>
        <ul className="plain-list">
          {recipe.versions.map((version) => (
            <li key={version.version}>
              Version {version.version} — {new Date(version.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}

export default RecipeDetailPage
