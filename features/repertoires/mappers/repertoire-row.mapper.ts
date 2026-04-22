import type { RepertoireListItem } from "@/application/use-cases/repertoires/get-repertoire-list"
import type { RepertoireRow } from "../types/repertoire-row"

function formatRepertoireDate(date: string) {
  if (!date) return "Sem data"

  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(Number(year), Number(month) - 1, Number(day)))
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

function formatItemsCount(count: number) {
  return `${count} ${count === 1 ? "música" : "músicas"}`
}

export function toRepertoireRow(item: RepertoireListItem): RepertoireRow {
  return {
    id: item.repertoire.id,
    name: item.repertoire.name || "Sem nome",
    dateLabel: formatRepertoireDate(item.repertoire.date),
    description: item.repertoire.description,
    itemsCount: item.itemsCount,
    itemsCountLabel: formatItemsCount(item.itemsCount),
    isArchived: item.repertoire.isArchived,
    statusLabel: item.repertoire.isArchived ? "Arquivado" : "Ativo",
  }
}

export function toRepertoireRows(items: RepertoireListItem[]) {
  return items.map(toRepertoireRow)
}
