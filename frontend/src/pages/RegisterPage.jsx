function RegisterPage() {
  return (
    <section className="page page--narrow">
      <header className="page-header">
        <h1>Register</h1>
        <p className="page-lede">
          Create an account with username, email, and password. Connected in Milestone 2.
        </p>
      </header>

      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label className="form__field">
          <span>Username</span>
          <input type="text" name="username" autoComplete="username" disabled />
        </label>
        <label className="form__field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" disabled />
        </label>
        <label className="form__field">
          <span>Password</span>
          <input type="password" name="password" autoComplete="new-password" disabled />
        </label>
        <button type="submit" className="button" disabled>
          Register (coming in Milestone 2)
        </button>
      </form>
    </section>
  )
}

export default RegisterPage
