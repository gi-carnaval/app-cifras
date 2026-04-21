import { LiturgicalMoment } from "@/domain/entities/liturgicalMoment"
import { useEffect, useRef, useState } from "react"

export default function useSongLiturgicalMoments() {
  const [liturgicalMoments, setLiturgicalMoments] = useState<LiturgicalMoment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const getLiturgicalMoments = async () => {
      setError(null)
      setIsLoading(true)

      try {
        const res = await fetch("/api/liturgical-moments", {
          signal: controller.signal
        })

        if (!res.ok) throw new Error("Erro ao carregar momentos da liturgia.")

        const data = await res.json() as LiturgicalMoment[]

        setLiturgicalMoments(data)
        setError(null)
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
          return
        }

        setError(
          e instanceof Error ? e.message : "Erro ao carregar momentos da liturgia."
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    getLiturgicalMoments()

    return () => {
      controller.abort()
    }
  }, [])

  async function createLiturgicalMoment(name: string) {
    setIsCreating(true)
    setCreateError(null)

    try {
      const res = await fetch("/api/liturgical-moment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error(await res.text())

      const createdLiturgicalMoment = await res.json() as LiturgicalMoment

      setLiturgicalMoments((currentLiturgicalMoments) => {
        const categoryExists = currentLiturgicalMoments.some((liturgicalMoment) => liturgicalMoment.id === createdLiturgicalMoment.id)
        if (categoryExists) return currentLiturgicalMoments

        return [...currentLiturgicalMoments, createdLiturgicalMoment].sort((a, b) => a.name.localeCompare(b.name))
      })

      return createdLiturgicalMoment
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao criar momento liturgico."
      setCreateError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }

  return {
    liturgicalMoments,
    isLoading,
    isCreating,
    error,
    createError,
    createLiturgicalMoment,
  }
}
