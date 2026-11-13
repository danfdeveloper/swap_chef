import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import FormErrors from '../components/FormErrors'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function validate() {
    const next = {}
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      next.username = 'Username must be 3–30 characters'
    } else if (!USERNAME_PATTERN.test(trimmedUsername)) {
      next.username = 'Letters, numbers, and underscores only'
    }
    if (!email.trim() || !email.includes('@')) {
      next.email = 'Enter a valid email address'
    }
    if (password.length < 8 || password.length > 72) {
      next.password = 'Password must be 8–72 characters'
    }
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    const nextFieldErrors = validate()
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      })
      navigate('/', { replace: true })
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
        <h1>Register</h1>
        <p className="page-lede">
          Create an account with a username, email, and password.
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
            minLength={3}
            maxLength={30}
            required
          />
          {fieldErrors.username && (
            <span className="field-error">{fieldErrors.username}</span>
          )}
        </label>
        <label className="form__field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>
        <label className="form__field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}
        </label>
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="form-footer">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  )
}

export default RegisterPage
