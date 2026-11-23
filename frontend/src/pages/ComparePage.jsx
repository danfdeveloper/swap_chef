import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getRecipeDiff } from '../api/client'
import LoadingBlock from '../components/LoadingBlock'
import StatusBanner from '../components/StatusBanner'
import { getRecipeDiff as getMockDiff } from '../data/mockRecipes'

function formatIngredient(ingredient) {
  const unit = ingredient.unit ? ` ${ingredient.unit}` : ''
  return `${ingredient.quantity}${unit} ${ingredient.name}`
}

function fieldLabel(field) {
  switch (field) {
    case 'prepMinutes':
      return 'Prep time (minutes)'
    case 'cookMinutes':
      return 'Cook time (minutes)'
    case 'title':
      return 'Title'
    case 'description':
      return 'Description'
    default:
      return field
  }
}

function ComparePage() {
  const { id } = useParams()
  const [diff, setDiff] = useState(null)
  const [source, setSource] = useState('loading')
  const [message, setMessage] = useState('')
  const [fatal, setFatal] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setSource('loading')
      setMessage('')
      setFatal('')
      try {
        const data = await getRecipeDiff(id)
        if (cancelled) return
        setDiff(data.diff)
        setSource('api')
      } catch (error) {
        if (cancelled) return
        const mock = getMockDiff(id)
        if (mock) {
          setDiff(mock)
          setSource('mock')
          if (error instanceof ApiError && error.status === 501) {
            setMessage('Diff API is not implemented yet — showing mock comparison.')
          } else if (error instanceof ApiError && error.status === 400) {
            setFatal(error.message || 'This recipe cannot be compared.')
            setDiff(null)
            setSource('missing')
          } else if (error instanceof TypeError) {
            setMessage('Could not reach the API — showing mock comparison.')
          } else {
            setMessage(`${error.message || 'Failed to load diff'} — showing mock comparison.`)
          }
        } else {
          setDiff(null)
          setSource('missing')
          setFatal(
            error instanceof ApiError
              ? error.message
              : 'No comparison available for this recipe.',
          )
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (source === 'loading') {
    return (
      <section className="page">
        <LoadingBlock label="Loading comparison…" />
      </section>
    )
  }

  if (!diff) {
    return (
      <section className="page">
        <header className="page-header">
          <h1>No comparison available</h1>
          <p className="page-lede">
            {fatal || 'This recipe has no parent fork to compare against, or it was not found.'}
          </p>
        </header>
        <p>
          <Link className="button button--secondary" to={`/recipes/${id}`}>
            Back to recipe
          </Link>
        </p>
      </section>
    )
  }

  const ingredients = diff.ingredients ?? { added: [], removed: [], changed: [] }
  const steps = diff.steps ?? { added: [], removed: [], changed: [] }
  const fields = diff.fields ?? []

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Read-only comparison</p>
        <h1>Version comparison</h1>
        <p className="page-lede">
          Changes from{' '}
          <Link to={`/recipes/${diff.from.recipeId}`}>
            {diff.from.title} (v{diff.from.version})
          </Link>{' '}
          to{' '}
          <Link to={`/recipes/${diff.to.recipeId}`}>
            {diff.to.title} (v{diff.to.version})
          </Link>
          .
        </p>
        <StatusBanner>{message}</StatusBanner>
        {source === 'api' && <p className="muted">Loaded from the live API.</p>}
      </header>

      <section className="compare-section">
        <h2>Recipe fields</h2>
        {fields.length === 0 ? (
          <p className="muted">No title, description, or time changes.</p>
        ) : (
          <ul className="plain-list">
            {fields.map((change) => (
              <li key={change.field}>
                <strong>{fieldLabel(change.field)}</strong>
                <div className="diff-before">{String(change.from)}</div>
                <div className="diff-after">{String(change.to)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="detail-grid">
        <section className="compare-section">
          <h2>Ingredients added</h2>
          <DiffIngredientList items={ingredients.added} empty="None" tone="after" />
          <h2>Ingredients removed</h2>
          <DiffIngredientList items={ingredients.removed} empty="None" tone="before" />
          <h2>Ingredients changed</h2>
          {ingredients.changed.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {ingredients.changed.map((change) => (
                <li key={`${change.to.name}-${change.to.unit}`}>
                  <div className="diff-before">{formatIngredient(change.from)}</div>
                  <div className="diff-after">{formatIngredient(change.to)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="compare-section">
          <h2>Steps added</h2>
          {steps.added.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {steps.added.map((step) => (
                <li key={`added-${step.position}`}>
                  <strong>Step {step.position}</strong>
                  <div className="diff-after">{step.text}</div>
                </li>
              ))}
            </ul>
          )}
          <h2>Steps removed</h2>
          {steps.removed.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {steps.removed.map((step) => (
                <li key={`removed-${step.position}`}>
                  <strong>Step {step.position}</strong>
                  <div className="diff-before">{step.text}</div>
                </li>
              ))}
            </ul>
          )}
          <h2>Steps changed</h2>
          {steps.changed.length === 0 ? (
            <p className="muted">None</p>
          ) : (
            <ul className="plain-list">
              {steps.changed.map((change) => (
                <li key={`changed-${change.position}`}>
                  <strong>Step {change.position}</strong>
                  <div className="diff-before">{change.from}</div>
                  <div className="diff-after">{change.to}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="action-row">
        <Link className="button button--secondary" to={`/recipes/${id}`}>
          Back to recipe
        </Link>
        <Link className="button button--secondary" to={`/recipes/${id}/lineage`}>
          View family tree
        </Link>
      </div>
    </section>
  )
}

function DiffIngredientList({ items, empty, tone }) {
  if (!items?.length) {
    return <p className="muted">{empty}</p>
  }

  return (
    <ul className="plain-list">
      {items.map((ingredient) => (
        <li key={`${ingredient.name}-${ingredient.unit}-${ingredient.quantity}`}>
          <div className={tone === 'before' ? 'diff-before' : 'diff-after'}>
            {formatIngredient(ingredient)}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ComparePage
