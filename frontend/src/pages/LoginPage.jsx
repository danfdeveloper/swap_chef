import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import FormErrors from '../components/FormErrors'

function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const nextFieldErrors = {}
    if (!username.trim()) nextFieldErrors.username = 'Username is required'
    if (!password) nextFieldErrors.password = 'Password is required'
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
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
    <section className="page page--narrow">
      <header className="page-header">
        <h1>Log in</h1>
        <p className="page-lede">
          Sign in with your username and password to publish recipes.
        </p>
      </header>

      <FormErrors error={error} fieldErrors={fieldErrors} />

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="form__field">
          <span>Username</span>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          {fieldErrors.username && (
            <span className="field-error">{fieldErrors.username}</span>
          )}
        </label>
        <label className="form__field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}
        </label>
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="form-footer">
        Need an account? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}

export default LoginPage
