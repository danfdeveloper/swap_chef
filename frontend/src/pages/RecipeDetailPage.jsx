import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApiError, forkRecipe, getRecipe } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { getRecipeById } from '../data/mockRecipes'

function formatIngredient(ingredient) {
  const unit = ingredient.unit ? ` ${ingredient.unit}` : ''
  return `${ingredient.quantity}${unit} ${ingredient.name}`
}

function RecipeDetailPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedVersion = searchParams.get('version')
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [recipe, setRecipe] = useState(null)
  const [source, setSource] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [forkError, setForkError] = useState('')
  const [forking, setForking] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setSource('loading')
      setErrorMessage('')
      setForkError('')
      setShowLoginPrompt(false)

      try {
        const data = await getRecipe(id, requestedVersion ?? undefined)
        if (cancelled) return
        setRecipe(data.recipe)
        setSource('api')
      } catch (error) {
        if (cancelled) return
        const mock = getRecipeById(id)
        if (mock) {
          const versionNumber = requestedVersion ? Number(requestedVersion) : mock.version
          setRecipe({
            ...mock,
            version: Number.isFinite(versionNumber) ? versionNumber : mock.version,
          })
          setSource('mock')
          if (error instanceof ApiError && error.status === 501) {
            setErrorMessage('Recipe detail API is not implemented yet — showing mock data.')
          } else if (error instanceof TypeError) {
            setErrorMessage('Could not reach the API — showing mock data.')
          } else if (!(error instanceof ApiError && error.status === 404)) {
            setErrorMessage(`${error.message || 'Failed to load recipe'} — showing mock data.`)
          }
        } else {
          setRecipe(null)
          setSource('missing')
          setErrorMessage(
            error instanceof ApiError ? error.message : 'Recipe not found.',
          )
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, requestedVersion])

  const isAuthor = Boolean(user && recipe && user.id === recipe.author.id)
  const viewingHistorical =
    recipe &&
    recipe.versions?.length > 0 &&
    Number(requestedVersion) > 0 &&
    Number(requestedVersion) !== recipe.versions[recipe.versions.length - 1]?.version

  async function handleFork() {
    setForkError('')
    if (authLoading) return

    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setForking(true)
    try {
      const data = await forkRecipe(id)
      navigate(`/recipes/${data.recipe.id}/edit`, {
        state: { fromFork: true, parentTitle: recipe.title },
      })
    } catch (error) {
      if (source === 'mock' && recipe) {
        // Local fallback so the editor reuse flow can be demoed without the fork API.
        navigate('/recipes/new', {
          state: {
            forkDraft: {
              title: `${recipe.title} (fork)`,
              description: recipe.description,
              prepMinutes: recipe.prepMinutes,
              cookMinutes: recipe.cookMinutes,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              parent: {
                recipeId: recipe.id,
                version: recipe.version,
                title: recipe.title,
              },
            },
          },
        })
        return
      }

      setForkError(
        error instanceof ApiError
          ? error.message
          : 'Could not fork this recipe. Is the backend running?',
      )
    } finally {
      setForking(false)
    }
  }

  function selectVersion(versionNumber) {
    const latest = recipe?.versions?.[recipe.versions.length - 1]?.version
    if (latest != null && versionNumber === latest) {
      setSearchParams({})
    } else {
      setSearchParams({ version: String(versionNumber) })
    }
  }

  if (source === 'loading') {
    return (
      <section className="page">
        <p className="muted">Loading recipe…</p>
      </section>
    )
  }

  if (!recipe) {
    return (
      <section className="page">
        <h1>Recipe not found</h1>
        <p className="page-lede">{errorMessage || 'No recipe with that id.'}</p>
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
        {errorMessage && (
          <p className="banner banner--info" role="status">
            {errorMessage}
          </p>
        )}
        {viewingHistorical && (
          <p className="banner banner--info" role="status">
            Viewing a historical version. Forking uses this version once the API supports it.
          </p>
        )}
      </header>

      <div className="action-row">
        <button type="button" className="button" onClick={handleFork} disabled={forking}>
          {forking ? 'Forking…' : 'Fork recipe'}
        </button>
        {isAuthor && (
          <Link className="button button--secondary" to={`/recipes/${recipe.id}/edit`}>
            Edit recipe
          </Link>
        )}
        {recipe.parent && (
          <Link className="button button--secondary" to={`/recipes/${recipe.id}/compare`}>
            Compare with parent
          </Link>
        )}
        <Link className="button button--secondary" to={`/recipes/${recipe.id}/lineage`}>
          Family tree
        </Link>
      </div>

      {showLoginPrompt && (
        <div className="banner banner--warn" role="status">
          <p>
            Log in to fork this recipe.{' '}
            <Link to="/login" state={{ from: `/recipes/${recipe.id}` }}>
              Log in
            </Link>{' '}
            or{' '}
            <Link to="/register" state={{ from: `/recipes/${recipe.id}` }}>
              register
            </Link>
            .
          </p>
        </div>
      )}

      {forkError && (
        <div className="form-alert" role="alert">
          <p className="form-alert__message">{forkError}</p>
        </div>
      )}

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
              <li key={`${ingredient.name}-${ingredient.unit}-${ingredient.quantity}`}>
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
        <p className="muted">
          Select a version to view its ingredients and steps
          {source === 'api' ? ' (loaded via ?version=).' : ' (mock list).'}
        </p>
        <ul className="plain-list version-list">
          {[...(recipe.versions ?? [])]
            .slice()
            .reverse()
            .map((version) => {
              const active = version.version === recipe.version
              return (
                <li key={version.version}>
                  <button
                    type="button"
                    className={`version-link${active ? ' version-link--active' : ''}`}
                    onClick={() => selectVersion(version.version)}
                  >
                    Version {version.version}
                    {active ? ' (showing)' : ''} —{' '}
                    {new Date(version.createdAt).toLocaleString()}
                  </button>
                </li>
              )
            })}
        </ul>
      </section>
    </section>
  )
}

export default RecipeDetailPage
