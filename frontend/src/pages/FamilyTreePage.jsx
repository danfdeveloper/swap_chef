import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getRecipeLineage } from '../api/client'
import LoadingBlock from '../components/LoadingBlock'
import StatusBanner from '../components/StatusBanner'
import { getRecipeLineage as getMockLineage } from '../data/mockRecipes'

function FamilyTreePage() {
  const { id } = useParams()
  const [lineage, setLineage] = useState(null)
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
        const data = await getRecipeLineage(id)
        if (cancelled) return
        setLineage(data.lineage)
        setSource('api')
      } catch (error) {
        if (cancelled) return
        const mock = getMockLineage(id)
        if (mock) {
          setLineage(mock)
          setSource('mock')
          if (error instanceof ApiError && error.status === 501) {
            setMessage('Lineage API is not implemented yet — showing mock family tree.')
          } else if (error instanceof TypeError) {
            setMessage('Could not reach the API — showing mock family tree.')
          } else {
            setMessage(`${error.message || 'Failed to load lineage'} — showing mock family tree.`)
          }
        } else {
          setLineage(null)
          setSource('missing')
          setFatal(error instanceof ApiError ? error.message : 'Recipe not found.')
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
        <LoadingBlock label="Loading family tree…" />
      </section>
    )
  }

  if (!lineage) {
    return (
      <section className="page">
        <header className="page-header">
          <h1>Recipe not found</h1>
          <p className="page-lede">{fatal || 'No lineage is available for this recipe.'}</p>
        </header>
        <p>
          <Link className="button button--secondary" to="/">
            Back to browse
          </Link>
        </p>
      </section>
    )
  }

  const ancestors = lineage.ancestors ?? []
  const forks = lineage.forks ?? []
  const current = lineage.current

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Read-only lineage</p>
        <h1>Family tree</h1>
        <p className="page-lede">
          Ancestry chain and direct forks for {current.title}. Every node links to its recipe
          detail page.
        </p>
        <StatusBanner>{message}</StatusBanner>
        {source === 'api' && <p className="muted">Loaded from the live API.</p>}
      </header>

      <section className="tree-panel">
        <h2>Ancestry</h2>
        {ancestors.length === 0 ? (
          <p className="muted">This is an original recipe (no parents).</p>
        ) : (
          <ol className="tree-chain">
            {ancestors.map((node, index) => (
              <li key={node.id} className="tree-chain__item">
                <Link className="tree-node" to={`/recipes/${node.id}`}>
                  <span className="tree-node__title">{node.title}</span>
                  <span className="tree-node__meta">
                    by {node.author.username}
                    {node.version != null ? ` · forked as v${node.version}` : ''}
                  </span>
                </Link>
                {index < ancestors.length - 1 && (
                  <span className="tree-chain__connector" aria-hidden="true">
                    ↓
                  </span>
                )}
              </li>
            ))}
            <li className="tree-chain__item">
              <span className="tree-chain__connector" aria-hidden="true">
                ↓
              </span>
            </li>
          </ol>
        )}

        <div className="tree-node tree-node--current">
          <span className="tree-node__eyebrow">Current recipe</span>
          <Link to={`/recipes/${current.id}`} className="tree-node__title-link">
            {current.title}
          </Link>
          <span className="tree-node__meta">by {current.author.username}</span>
        </div>
      </section>

      <section className="tree-panel">
        <h2>Direct forks</h2>
        {forks.length === 0 ? (
          <p className="muted">No direct forks yet.</p>
        ) : (
          <ul className="tree-forks">
            {forks.map((node) => (
              <li key={node.id}>
                <Link className="tree-node" to={`/recipes/${node.id}`}>
                  <span className="tree-node__title">{node.title}</span>
                  <span className="tree-node__meta">by {node.author.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="action-row">
        <Link className="button button--secondary" to={`/recipes/${current.id}`}>
          Back to recipe
        </Link>
        <Link className="button button--secondary" to={`/recipes/${current.id}/compare`}>
          Compare with parent
        </Link>
      </div>
    </section>
  )
}

export default FamilyTreePage
