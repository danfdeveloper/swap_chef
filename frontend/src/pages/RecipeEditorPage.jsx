import { INGREDIENT_UNITS } from '../data/shapes'

function RecipeEditorPage() {
  return (
    <section className="page page--narrow">
      <header className="page-header">
        <h1>Recipe editor</h1>
        <p className="page-lede">
          Layout for creating originals and editing forks. Publishing and versioning
          land in later milestones.
        </p>
      </header>

      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label className="form__field">
          <span>Title</span>
          <input type="text" name="title" placeholder="Recipe title" disabled />
        </label>
        <label className="form__field">
          <span>Description</span>
          <textarea name="description" rows={3} placeholder="Short description" disabled />
        </label>
        <div className="form__row">
          <label className="form__field">
            <span>Prep time (minutes)</span>
            <input type="number" name="prepTimeMinutes" min="0" disabled />
          </label>
          <label className="form__field">
            <span>Cook time (minutes)</span>
            <input type="number" name="cookTimeMinutes" min="0" disabled />
          </label>
        </div>

        <fieldset className="form__fieldset" disabled>
          <legend>Ingredient (example row)</legend>
          <div className="form__row">
            <label className="form__field">
              <span>Quantity</span>
              <input type="number" name="quantity" min="0" step="any" />
            </label>
            <label className="form__field">
              <span>Unit</span>
              <select name="unit" defaultValue="tsp">
                {INGREDIENT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className="form__field">
              <span>Name</span>
              <input type="text" name="ingredientName" />
            </label>
          </div>
        </fieldset>

        <fieldset className="form__fieldset" disabled>
          <legend>Step (example row)</legend>
          <label className="form__field">
            <span>Instruction</span>
            <textarea name="step" rows={2} />
          </label>
        </fieldset>

        <button type="submit" className="button" disabled>
          Save (coming in Milestone 2 / 3)
        </button>
      </form>
    </section>
  )
}

export default RecipeEditorPage
