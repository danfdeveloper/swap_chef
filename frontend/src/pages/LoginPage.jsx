function LoginPage() {
  return (
    <section className="page page--narrow">
      <header className="page-header">
        <h1>Log in</h1>
        <p className="page-lede">
          Auth UI scaffold for Milestone 1. Wired to the API in Milestone 2.
        </p>
      </header>

      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label className="form__field">
          <span>Email or username</span>
          <input type="text" name="identifier" autoComplete="username" disabled />
        </label>
        <label className="form__field">
          <span>Password</span>
          <input type="password" name="password" autoComplete="current-password" disabled />
        </label>
        <button type="submit" className="button" disabled>
          Log in (coming in Milestone 2)
        </button>
      </form>
    </section>
  )
}

export default LoginPage
