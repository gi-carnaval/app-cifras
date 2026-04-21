import type { Category } from "@/domain/entities/category"
import { useEffect, useState } from "react"

export default function useSongCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) throw new Error("Erro ao carregar categorias.")
        setCategories(await res.json())
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao carregar categorias.")
      } finally {
        setIsLoading(false)
      }
    }
    getCategories()
  }, [])

  async function createCategory(name: string) {
    setIsCreating(true)
    setCreateError(null)

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error(await res.text())

      const createdCategory = await res.json() as Category

      setCategories((currentCategories) => {
        const categoryExists = currentCategories.some((category) => category.id === createdCategory.id)
        if (categoryExists) return currentCategories

        return [...currentCategories, createdCategory].sort((a, b) => a.name.localeCompare(b.name))
      })

      return createdCategory
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao criar categoria."
      setCreateError(message)
      return null
    } finally {
      setIsCreating(false)
    }
  }

  return {
    categories,
    isLoading,
    isCreating,
    error,
    createError,
    createCategory,
  }
}
