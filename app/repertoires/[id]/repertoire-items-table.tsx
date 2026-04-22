import { Button } from "@/components/ui/button"
import { removeRepertoireItemAction, reorderRepertoireItemAction } from "./actions"

export type RepertoireItemRow = {
  id: string
  position: number
  songTitle: string
  artistName: string
  keyLabel: string
  notes: string
}

type RepertoireItemsTableProps = {
  repertoireId: string
  items: RepertoireItemRow[]
}

function ReorderButton({
  repertoireId,
  itemId,
  direction,
  disabled,
}: {
  repertoireId: string
  itemId: string
  direction: "up" | "down"
  disabled: boolean
}) {
  const label = direction === "up" ? "Mover música para cima" : "Mover música para baixo"

  return (
    <form action={reorderRepertoireItemAction}>
      <input type="hidden" name="repertoireId" value={repertoireId} />
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="direction" value={direction} />
      <Button
        type="submit"
        variant="outline"
        size="icon-sm"
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {direction === "up" ? "↑" : "↓"}
      </Button>
    </form>
  )
}

function RemoveButton({ repertoireId, itemId }: { repertoireId: string; itemId: string }) {
  return (
    <form action={removeRepertoireItemAction}>
      <input type="hidden" name="repertoireId" value={repertoireId} />
      <input type="hidden" name="itemId" value={itemId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label="Remover música do repertório"
        title="Remover música"
      >
        Remover
      </Button>
    </form>
  )
}

function EmptyItems() {
  return (
    <div className="mt-4 rounded-md border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm text-(--text-muted)">Nenhuma música adicionada ainda.</p>
    </div>
  )
}

export function RepertoireItemsTable({ repertoireId, items }: RepertoireItemsTableProps) {
  if (items.length === 0) {
    return <EmptyItems />
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className="h-10 w-28 px-4 text-left align-middle font-medium text-(--text-muted)">
              Ordem
            </th>
            <th className="h-10 w-24 px-4 text-left align-middle font-medium text-(--text-muted)">
              Posição
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
              Música
            </th>
            <th className="h-10 w-32 px-4 text-left align-middle font-medium text-(--text-muted)">
              Tom
            </th>
            <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
              Observações
            </th>
            <th className="h-10 w-28 px-4 text-right align-middle font-medium text-(--text-muted)">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, itemIndex) => {
            const isFirstItem = itemIndex === 0
            const isLastItem = itemIndex === items.length - 1

            return (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-4 py-4 align-middle">
                  <div className="flex gap-2">
                    <ReorderButton
                      repertoireId={repertoireId}
                      itemId={item.id}
                      direction="up"
                      disabled={isFirstItem}
                    />
                    <ReorderButton
                      repertoireId={repertoireId}
                      itemId={item.id}
                      direction="down"
                      disabled={isLastItem}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-middle text-(--text-muted)">
                  {item.position}
                </td>
                <td className="max-w-0 px-4 py-4 align-middle">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-(--text)">{item.songTitle}</p>
                    {item.artistName ? (
                      <p className="mt-1 truncate text-sm text-(--text-muted)">
                        {item.artistName}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 align-middle font-mono text-(--accent)">
                  {item.keyLabel || "-"}
                </td>
                <td className="max-w-0 px-4 py-4 align-middle text-(--text-muted)">
                  <p className="truncate">{item.notes || "-"}</p>
                </td>
                <td className="px-4 py-4 align-middle">
                  <div className="flex justify-end">
                    <RemoveButton repertoireId={repertoireId} itemId={item.id} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
