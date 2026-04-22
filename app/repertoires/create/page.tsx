import Link from "next/link"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { RepertoireCreateForm } from "./repertoire-create-form"

export const dynamic = "force-dynamic"

export default async function CreateRepertoirePage() {
  await requireAuthenticatedUser("/repertoires/create")

  return (
    <main className="mx-auto my-0 max-w-3xl px-6 pb-20 pt-0">
      <div className="flex flex-col gap-3 py-6">
        <Link href="/repertoires" className="text-sm font-medium text-(--text-muted) hover:text-(--text)">
          Voltar para repertórios
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">Novo repertório</h1>
          <p className="text-base text-(--text-muted)">
            Crie os dados iniciais do repertório. As músicas serão adicionadas depois.
          </p>
        </div>
      </div>

      <RepertoireCreateForm />
    </main>
  )
}
