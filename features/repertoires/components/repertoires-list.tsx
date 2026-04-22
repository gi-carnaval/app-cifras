import Link from "next/link"
import type { RepertoireRow } from "../types/repertoire-row"

interface RepertoiresListProps {
  repertoires: RepertoireRow[]
}

function RepertoireStatusBadge({ repertoire }: { repertoire: RepertoireRow }) {
  return (
    <span
      className={
        repertoire.isArchived
          ? "inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs font-medium text-(--text-dim)"
          : "inline-flex min-h-7 items-center rounded-md border border-border bg-(--bg3) px-2.5 text-xs font-medium text-(--accent)"
      }
    >
      {repertoire.statusLabel}
    </span>
  )
}

function EmptyRepertoires() {
  return (
    <div className="rounded-lg border border-border bg-(--bg2) px-4 py-12 text-center">
      <h2 className="text-base font-semibold text-(--text)">Nenhum repertório encontrado.</h2>
      <p className="mt-2 text-sm text-(--text-muted)">
        Seus repertórios aparecerão aqui quando forem criados.
      </p>
    </div>
  )
}

function RepertoireMobileList({ repertoires }: RepertoiresListProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      <p className="px-1 text-sm text-(--text-muted)">
        {repertoires.length} {repertoires.length === 1 ? "repertório" : "repertórios"}
      </p>

      {repertoires.map((repertoire) => (
        <Link
          key={repertoire.id}
          href={`/repertoires/${repertoire.id}`}
          className="rounded-lg border border-border bg-(--bg2) p-4 shadow-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold leading-tight text-(--text)">
                {repertoire.name}
              </h2>
              <p className="mt-1 text-sm text-(--text-muted)">{repertoire.dateLabel}</p>
            </div>
            <RepertoireStatusBadge repertoire={repertoire} />
          </div>

          {repertoire.description ? (
            <p className="mt-3 line-clamp-2 text-sm text-(--text-muted)">
              {repertoire.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-7 items-center rounded-md border border-border bg-(--surface) px-2.5 text-xs font-medium text-(--text-muted)">
              {repertoire.itemsCountLabel}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

function RepertoireDesktopTable({ repertoires }: RepertoiresListProps) {
  return (
    <div className="hidden md:block">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-(--text-muted)">
          {repertoires.length} {repertoires.length === 1 ? "repertório" : "repertórios"}
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-(--bg2)">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
                Repertório
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
                Data
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
                Músicas
              </th>
              <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {repertoires.map((repertoire) => (
              <tr key={repertoire.id} className="border-b border-border last:border-0">
                <td className="max-w-0 px-4 py-4 align-middle">
                  <div className="min-w-0">
                    <h2 className="truncate font-medium text-(--text)">
                      <Link href={`/repertoires/${repertoire.id}`} className="hover:text-(--accent)">
                        {repertoire.name}
                      </Link>
                    </h2>
                    {repertoire.description ? (
                      <p className="mt-1 truncate text-sm text-(--text-muted)">
                        {repertoire.description}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-middle text-(--text-muted)">
                  {repertoire.dateLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-middle text-(--text-muted)">
                  {repertoire.itemsCountLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-middle">
                  <RepertoireStatusBadge repertoire={repertoire} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RepertoiresList({ repertoires }: RepertoiresListProps) {
  if (repertoires.length === 0) {
    return <EmptyRepertoires />
  }

  return (
    <>
      <RepertoireMobileList repertoires={repertoires} />
      <RepertoireDesktopTable repertoires={repertoires} />
    </>
  )
}
