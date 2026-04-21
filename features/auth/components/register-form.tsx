'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RegisterFormState {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

const initialFormState: RegisterFormState = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
}

export function RegisterForm() {
  const [formState, setFormState] = useState<RegisterFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  function updateField(field: keyof RegisterFormState, value: string) {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [field]: value,
    }))
    setError(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      setFormState(initialFormState)
      setSuccessMessage('Cadastro realizado. Verifique seu e-mail para confirmar a conta.')
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Erro ao cadastrar usuário.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-(--bg2) p-5 shadow-xs"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-(--text)">Criar conta</h1>
        <p className="text-sm text-(--text-muted)">
          Cadastre-se para preparar o acesso às ferramentas de edição.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-name" className="text-sm font-medium text-(--text-muted)">
          Nome
        </label>
        <Input
          id="register-name"
          name="name"
          autoComplete="name"
          value={formState.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-email" className="text-sm font-medium text-(--text-muted)">
          E-mail
        </label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={formState.email}
          onChange={(event) => updateField('email', event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-sm font-medium text-(--text-muted)">
          Senha
        </label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={formState.password}
          onChange={(event) => updateField('password', event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password-confirm" className="text-sm font-medium text-(--text-muted)">
          Confirmar senha
        </label>
        <Input
          id="register-password-confirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          value={formState.passwordConfirm}
          onChange={(event) => updateField('passwordConfirm', event.target.value)}
        />
      </div>

      {error && <p className="text-sm text-(--danger)">{error}</p>}
      {successMessage && <p className="text-sm text-(--success)">{successMessage}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>

      <p className="text-sm text-(--text-muted)">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-(--accent) hover:text-(--accent2)">
          Entrar
        </Link>
      </p>
    </form>
  )
}
