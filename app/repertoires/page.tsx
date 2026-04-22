import { getRepertoireListUseCase } from "@/application/use-cases/repertoires/get-repertoire-list"
import { requireAuthenticatedUser } from "@/app/auth/require-authenticated-user"
import { Button } from "@/components/ui/button"
import { RepertoiresList } from "@/features/repertoires/components/repertoires-list"
import { toRepertoireRows } from "@/features/repertoires/mappers/repertoire-row.mapper"
import {
  createPocketbaseRepertoireItemRepository,
  createPocketbaseRepertoireMemberRepository,
  createPocketbaseRepertoireRepository,
} from "@/infrastructure/pocketbase/pocketbase-repertoire.repository"
import { cookies } from "next/headers"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function RepertoiresPage() {
  const user = await requireAuthenticatedUser("/repertoires")
  const cookieStore = await cookies()
  const repositoryOptions = {
    serializedSession: cookieStore.toString(),
  }
  const repertoireRepo = createPocketbaseRepertoireRepository(repositoryOptions)
  const itemRepo = createPocketbaseRepertoireItemRepository(repositoryOptions)
  const memberRepo = createPocketbaseRepertoireMemberRepository(repositoryOptions)
  const getRepertoireList = getRepertoireListUseCase(repertoireRepo, itemRepo, memberRepo)
  const repertoires = await getRepertoireList(user.id)
  const repertoireRows = toRepertoireRows(repertoires)

  return (
    <main className="max-w-215 mx-auto my-0 px-6 pb-20 pt-0">
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-(--text)">Repertórios</h1>
          <p className="text-base text-(--text-muted)">
            Listas de músicas preparadas para missas e celebrações.
          </p>
        </div>
        <Button asChild>
          <Link href="/repertoires/create">Novo repertório</Link>
        </Button>
      </div>

      <RepertoiresList repertoires={repertoireRows} />
    </main>
  )
}
