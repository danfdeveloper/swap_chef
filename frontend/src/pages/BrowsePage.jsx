import { Link } from 'react-router-dom'
import { getBrowseRecipes } from '../data/mockRecipes'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function BrowsePage() {
  const recipes = getBrowseRecipes()

  return (
    <section className="page">
      <header className="page-header">
        <h1>Browse recipes</h1>
        <p className="page-lede">
          Newest published recipes first. Showing mock data until the API is ready.
        </p>
      </header>

      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-list__item">
            <Link to={`/recipes/${recipe.id}`} className="recipe-list__link">
              <span className="recipe-list__title">{recipe.title}</span>
              <span className="recipe-list__meta">
                by {recipe.author.username} · {recipe.forkCount} fork
                {recipe.forkCount === 1 ? '' : 's'} · {formatDate(recipe.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BrowsePage
