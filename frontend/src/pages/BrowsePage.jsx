import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, listRecipes } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import LoadingBlock from '../components/LoadingBlock'
import StatusBanner from '../components/StatusBanner'
import { getBrowseRecipes } from '../data/mockRecipes'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function BrowsePage() {
  const { isAuthenticated } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [source, setSource] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setSource('loading')
      try {
        const data = await listRecipes()
        if (cancelled) return
        const sorted = [...(data.recipes ?? [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )
        setRecipes(sorted)
        setSource('api')
        setErrorMessage('')
      } catch (error) {
        if (cancelled) return
        setRecipes(getBrowseRecipes())
        setSource('mock')
        if (error instanceof ApiError && error.status === 501) {
          setErrorMessage('Recipe list API is not implemented yet — showing mock data.')
        } else if (error instanceof TypeError) {
          setErrorMessage(
            'Could not reach the API — showing mock data. Start the backend on port 3000 when ready.',
          )
        } else {
          setErrorMessage(
            `${error.message || 'Failed to load recipes'} — showing mock data.`,
          )
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page">
      <header className="page-header page-header--split">
        <div>
          <h1>Browse recipes</h1>
          <p className="page-lede">
            Newest published recipes first, with title, author, and fork count. Guests can
            browse freely.
          </p>
        </div>
        <Link className="button" to={isAuthenticated ? '/recipes/new' : '/login'} state={!isAuthenticated ? { from: '/recipes/new' } : undefined}>
          {isAuthenticated ? 'Publish recipe' : 'Log in to publish'}
        </Link>
      </header>

      {source === 'loading' && <LoadingBlock label="Loading recipes…" />}
      <StatusBanner>{errorMessage}</StatusBanner>
      {source === 'api' && <p className="muted">Loaded from the live API.</p>}

      {source !== 'loading' && recipes.length === 0 ? (
        <div className="empty-state">
          <h2>No recipes yet</h2>
          <p className="muted">Be the first to publish something the team can fork.</p>
          <Link className="button" to={isAuthenticated ? '/recipes/new' : '/register'}>
            {isAuthenticated ? 'Publish a recipe' : 'Create an account'}
          </Link>
        </div>
      ) : source !== 'loading' ? (
        <ul className="recipe-list">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="recipe-list__item">
              <Link to={`/recipes/${recipe.id}`} className="recipe-list__link">
                <span className="recipe-list__title">{recipe.title}</span>
                <span className="recipe-list__meta">
                  by {recipe.author.username} · {recipe.forkCount}{' '}
                  {recipe.forkCount === 1 ? 'fork' : 'forks'} ·{' '}
                  {formatDate(recipe.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default BrowsePage
