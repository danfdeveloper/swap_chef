import { Link, useParams } from 'react-router-dom'
import { getRecipeLineage } from '../data/mockRecipes'

function FamilyTreePage() {
  const { id } = useParams()
  const lineage = getRecipeLineage(id)

  if (!lineage) {
    return (
      <section className="page">
        <h1>Recipe not found</h1>
        <p>
          <Link to="/">Back to browse</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Family tree</h1>
        <p className="page-lede">
          Ancestry chain and direct forks for {lineage.current.title}. Nodes link to
          recipe detail pages.
        </p>
      </header>

      <section>
        <h2>Ancestry</h2>
        {lineage.ancestors.length === 0 ? (
          <p className="muted">This is an original recipe (no parents).</p>
        ) : (
          <ol className="tree-list">
            {lineage.ancestors.map((node) => (
              <li key={node.id}>
                <Link to={`/recipes/${node.id}`}>
                  {node.title} (v{node.version}) — {node.author.username}
                </Link>
              </li>
            ))}
          </ol>
        )}
        <p className="tree-current">
          Current:{' '}
          <Link to={`/recipes/${lineage.current.id}`}>{lineage.current.title}</Link>
        </p>
      </section>

      <section>
        <h2>Direct forks</h2>
        {lineage.forks.length === 0 ? (
          <p className="muted">No direct forks yet.</p>
        ) : (
          <ul className="plain-list">
            {lineage.forks.map((node) => (
              <li key={node.id}>
                <Link to={`/recipes/${node.id}`}>
                  {node.title} — {node.author.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default FamilyTreePage
