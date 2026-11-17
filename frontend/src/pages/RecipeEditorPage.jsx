import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, getRecipe, publishRecipe, updateRecipe } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import FormErrors from '../components/FormErrors'
import { getRecipeById } from '../data/mockRecipes'
import { INGREDIENT_UNITS } from '../data/shapes'

function emptyIngredient() {
  return { quantity: '', unit: 'tsp', name: '' }
}

function toFormIngredients(list) {
  if (!list?.length) return [emptyIngredient()]
  return list.map((ingredient) => ({
    quantity: String(ingredient.quantity ?? ''),
    unit: ingredient.unit ?? '',
    name: ingredient.name ?? '',
  }))
}

function toFormSteps(list) {
  if (!list?.length) return ['']
  return list.map((step) => step)
}

function applyRecipeToForm(recipe, setters) {
  setters.setTitle(recipe.title ?? '')
  setters.setDescription(recipe.description ?? '')
  setters.setPrepMinutes(String(recipe.prepMinutes ?? 0))
  setters.setCookMinutes(String(recipe.cookMinutes ?? 0))
  setters.setIngredients(toFormIngredients(recipe.ingredients))
  setters.setSteps(toFormSteps(recipe.steps))
}

function RecipeEditorPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const forkDraft = location.state?.forkDraft
  const fromFork = Boolean(location.state?.fromFork)
  const parentTitle = location.state?.parentTitle

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepMinutes, setPrepMinutes] = useState('10')
  const [cookMinutes, setCookMinutes] = useState('20')
  const [ingredients, setIngredients] = useState([emptyIngredient()])
  const [steps, setSteps] = useState([''])
  const [submitting, setSubmitting] = useState(false)
  const [loadingRecipe, setLoadingRecipe] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [forkBanner, setForkBanner] = useState('')

  const unitOptions = useMemo(
    () => [
      { value: '', label: '(none / counted)' },
      ...INGREDIENT_UNITS.map((unit) => ({ value: unit, label: unit })),
    ],
    [],
  )

  useEffect(() => {
    if (!forkDraft) return
    applyRecipeToForm(forkDraft, {
      setTitle,
      setDescription,
      setPrepMinutes,
      setCookMinutes,
      setIngredients,
      setSteps,
    })
    if (forkDraft.parent) {
      setForkBanner(
        `Editing a fork draft of ${forkDraft.parent.title} (v${forkDraft.parent.version}). Publishing creates a new recipe once the API is ready.`,
      )
    }
  }, [forkDraft])

  useEffect(() => {
    if (fromFork && parentTitle) {
      setForkBanner(`Fork of “${parentTitle}” loaded. Save edits to create a new version when the API is ready.`)
    }
  }, [fromFork, parentTitle])

  useEffect(() => {
    if (!isEditMode) {
      setLoadingRecipe(false)
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoadingRecipe(true)
      setLoadError('')
      try {
        const data = await getRecipe(id)
        if (cancelled) return
        applyRecipeToForm(data.recipe, {
          setTitle,
          setDescription,
          setPrepMinutes,
          setCookMinutes,
          setIngredients,
          setSteps,
        })
      } catch (err) {
        if (cancelled) return
        const mock = getRecipeById(id)
        if (mock) {
          applyRecipeToForm(mock, {
            setTitle,
            setDescription,
            setPrepMinutes,
            setCookMinutes,
            setIngredients,
            setSteps,
          })
          setLoadError(
            err instanceof ApiError && err.status === 501
              ? 'Edit API is not implemented yet — loaded mock recipe into the editor.'
              : 'Could not reach the API — loaded mock recipe into the editor.',
          )
        } else {
          setLoadError(err instanceof ApiError ? err.message : 'Recipe not found.')
        }
      } finally {
        if (!cancelled) setLoadingRecipe(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, isEditMode])

  if (authLoading || loadingRecipe) {
    return (
      <section className="page page--narrow">
        <p className="muted">{authLoading ? 'Checking login…' : 'Loading recipe…'}</p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: isEditMode ? `/recipes/${id}/edit` : '/recipes/new' }}
      />
    )
  }

  if (isEditMode && loadError && !title) {
    return (
      <section className="page page--narrow">
        <h1>Cannot edit recipe</h1>
        <p className="page-lede">{loadError}</p>
        <p>
          <Link to="/">Back to browse</Link>
        </p>
      </section>
    )
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
      const data = isEditMode
        ? await updateRecipe(id, payload)
        : await publishRecipe(payload)
      navigate(`/recipes/${data.recipe.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
        if (err.status === 401) {
          navigate('/login', {
            replace: true,
            state: { from: isEditMode ? `/recipes/${id}/edit` : '/recipes/new' },
          })
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

  const heading = isEditMode
    ? fromFork
      ? 'Edit your fork'
      : 'Edit recipe'
    : forkDraft
      ? 'Publish forked recipe'
      : 'Publish a recipe'

  const lede = isEditMode
    ? 'Title, description, and times update the recipe record. Ingredient or step changes create a new saved version.'
    : 'Add a title, times, ingredient quantities/units, and ordered steps. The same editor is used for originals and forks.'

  return (
    <section className="page page--narrow page--editor">
      <header className="page-header">
        <h1>{heading}</h1>
        <p className="page-lede">{lede}</p>
        {user && <p className="muted">Signed in as {user.username}</p>}
        {forkBanner && (
          <p className="banner banner--info" role="status">
            {forkBanner}
          </p>
        )}
        {loadError && title && (
          <p className="banner banner--info" role="status">
            {loadError}
          </p>
        )}
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
            {submitting
              ? isEditMode
                ? 'Saving…'
                : 'Publishing…'
              : isEditMode
                ? 'Save changes'
                : 'Publish recipe'}
          </button>
          <Link
            className="button button--secondary"
            to={isEditMode ? `/recipes/${id}` : '/'}
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  )
}

export default RecipeEditorPage
