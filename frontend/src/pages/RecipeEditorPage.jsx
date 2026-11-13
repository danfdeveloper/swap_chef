import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError, publishRecipe } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import FormErrors from '../components/FormErrors'
import { INGREDIENT_UNITS } from '../data/shapes'

function emptyIngredient() {
  return { quantity: '', unit: 'tsp', name: '' }
}

function RecipeEditorPage() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepMinutes, setPrepMinutes] = useState('10')
  const [cookMinutes, setCookMinutes] = useState('20')
  const [ingredients, setIngredients] = useState([emptyIngredient()])
  const [steps, setSteps] = useState([''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const unitOptions = useMemo(
    () => [
      { value: '', label: '(none / counted)' },
      ...INGREDIENT_UNITS.map((unit) => ({ value: unit, label: unit })),
    ],
    [],
  )

  if (loading) {
    return (
      <section className="page page--narrow">
        <p className="muted">Checking login…</p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/recipes/new' }} />
  }

  function updateIngredient(index, patch) {
    setIngredients((current) =>
      current.map((ingredient, i) => (i === index ? { ...ingredient, ...patch } : ingredient)),
    )
  }

  function updateStep(index, value) {
    setSteps((current) => current.map((step, i) => (i === index ? value : step)))
  }

  function validate() {
    const next = {}
    if (!title.trim()) next.title = 'Title is required'
    if (title.trim().length > 120) next.title = 'Title must be at most 120 characters'
    if (description.length > 2000) next.description = 'Description must be at most 2000 characters'

    const prep = Number(prepMinutes)
    const cook = Number(cookMinutes)
    if (!Number.isInteger(prep) || prep < 0) next.prepMinutes = 'Prep time must be a whole number ≥ 0'
    if (!Number.isInteger(cook) || cook < 0) next.cookMinutes = 'Cook time must be a whole number ≥ 0'

    const filledIngredients = ingredients.filter(
      (ingredient) => ingredient.name.trim() || ingredient.quantity !== '',
    )
    if (filledIngredients.length === 0) {
      next.ingredients = 'Add at least one ingredient'
    } else {
      filledIngredients.forEach((ingredient, index) => {
        const quantity = Number(ingredient.quantity)
        if (!(quantity > 0)) {
          next[`ingredients.${index}.quantity`] = 'Quantity must be greater than 0'
        }
        if (!ingredient.name.trim()) {
          next[`ingredients.${index}.name`] = 'Ingredient name is required'
        }
      })
    }

    const filledSteps = steps.map((step) => step.trim()).filter(Boolean)
    if (filledSteps.length === 0) next.steps = 'Add at least one step'

    return { next, filledIngredients, filledSteps, prep, cook }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    const { next, filledIngredients, filledSteps, prep, cook } = validate()
    setFieldErrors(next)
    if (Object.keys(next).length > 0) return

    const payload = {
      title: title.trim(),
      description: description.trim(),
      prepMinutes: prep,
      cookMinutes: cook,
      ingredients: filledIngredients.map((ingredient) => ({
        quantity: Number(ingredient.quantity),
        unit: ingredient.unit === '' ? null : ingredient.unit,
        name: ingredient.name.trim(),
      })),
      steps: filledSteps,
    }

    setSubmitting(true)
    try {
      const data = await publishRecipe(payload)
      navigate(`/recipes/${data.recipe.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
        if (err.status === 401) {
          navigate('/login', { replace: true, state: { from: '/recipes/new' } })
        }
      } else {
        setError({
          message:
            'Could not reach the API. Start the backend on port 3000, then try again.',
          details: [],
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page page--narrow page--editor">
      <header className="page-header">
        <h1>Publish a recipe</h1>
        <p className="page-lede">
          Add a title, times, ingredient quantities/units, and ordered steps.
        </p>
      </header>

      <FormErrors error={error} fieldErrors={fieldErrors} />

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="form__field">
          <span>Title</span>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
          />
          {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
        </label>

        <label className="form__field">
          <span>Description</span>
          <textarea
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </label>

        <div className="form__row form__row--two">
          <label className="form__field">
            <span>Prep time (minutes)</span>
            <input
              type="number"
              name="prepMinutes"
              min="0"
              step="1"
              value={prepMinutes}
              onChange={(event) => setPrepMinutes(event.target.value)}
              required
            />
            {fieldErrors.prepMinutes && (
              <span className="field-error">{fieldErrors.prepMinutes}</span>
            )}
          </label>
          <label className="form__field">
            <span>Cook time (minutes)</span>
            <input
              type="number"
              name="cookMinutes"
              min="0"
              step="1"
              value={cookMinutes}
              onChange={(event) => setCookMinutes(event.target.value)}
              required
            />
            {fieldErrors.cookMinutes && (
              <span className="field-error">{fieldErrors.cookMinutes}</span>
            )}
          </label>
        </div>

        <fieldset className="form__fieldset">
          <legend>Ingredients</legend>
          {fieldErrors.ingredients && (
            <span className="field-error">{fieldErrors.ingredients}</span>
          )}
          {ingredients.map((ingredient, index) => (
            <div key={`ingredient-${index}`} className="repeat-row">
              <div className="form__row">
                <label className="form__field">
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingredient.quantity}
                    onChange={(event) =>
                      updateIngredient(index, { quantity: event.target.value })
                    }
                  />
                </label>
                <label className="form__field">
                  <span>Unit</span>
                  <select
                    value={ingredient.unit}
                    onChange={(event) =>
                      updateIngredient(index, { unit: event.target.value })
                    }
                  >
                    {unitOptions.map((option) => (
                      <option key={option.value || 'none'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form__field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(event) =>
                      updateIngredient(index, { name: event.target.value })
                    }
                  />
                </label>
              </div>
              {(fieldErrors[`ingredients.${index}.quantity`] ||
                fieldErrors[`ingredients.${index}.name`]) && (
                <span className="field-error">
                  {fieldErrors[`ingredients.${index}.quantity`] ||
                    fieldErrors[`ingredients.${index}.name`]}
                </span>
              )}
              {ingredients.length > 1 && (
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={() =>
                    setIngredients((current) => current.filter((_, i) => i !== index))
                  }
                >
                  Remove ingredient
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setIngredients((current) => [...current, emptyIngredient()])}
          >
            Add ingredient
          </button>
        </fieldset>

        <fieldset className="form__fieldset">
          <legend>Steps (in order)</legend>
          {fieldErrors.steps && <span className="field-error">{fieldErrors.steps}</span>}
          {steps.map((step, index) => (
            <div key={`step-${index}`} className="repeat-row">
              <label className="form__field">
                <span>Step {index + 1}</span>
                <textarea
                  rows={2}
                  value={step}
                  onChange={(event) => updateStep(index, event.target.value)}
                />
              </label>
              {steps.length > 1 && (
                <button
                  type="button"
                  className="button button--secondary button--small"
                  onClick={() => setSteps((current) => current.filter((_, i) => i !== index))}
                >
                  Remove step
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setSteps((current) => [...current, ''])}
          >
            Add step
          </button>
        </fieldset>

        <div className="action-row">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish recipe'}
          </button>
          <Link className="button button--secondary" to="/">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

export default RecipeEditorPage
