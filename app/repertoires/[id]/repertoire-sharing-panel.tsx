import { Button } from "@/components/ui/button"
import type { RepertoireMember } from "@/domain/entities/repertoire"
import { removeRepertoireMemberAction } from "./actions"
import { RepertoireSharingForm } from "./repertoire-sharing-form"

type RepertoireSharingPanelProps = {
  repertoireId: string
  members: RepertoireMember[]
  canManageSharing: boolean
}

function MembersList({
  repertoireId,
  members,
  canManageSharing,
}: RepertoireSharingPanelProps) {
  if (members.length === 0) {
    return (
      <p className="mt-4 rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-(--text-muted)">
        Nenhum usuário compartilhado ainda.
      </p>
    )
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-border">
          <tr>
            <th className="h-10 px-4 text-left align-middle font-medium text-(--text-muted)">
              Usuário
            </th>
            <th className="h-10 w-32 px-4 text-left align-middle font-medium text-(--text-muted)">
              Papel
            </th>
            {canManageSharing ? (
              <th className="h-10 w-28 px-4 text-right align-middle font-medium text-(--text-muted)">
                Ações
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-border last:border-0">
              <td className="px-4 py-4 align-middle text-(--text)">
                {member.userId}
              </td>
              <td className="whitespace-nowrap px-4 py-4 align-middle text-(--text-muted)">
                {member.role}
              </td>
              {canManageSharing ? (
                <td className="px-4 py-4 align-middle">
                  <form action={removeRepertoireMemberAction} className="flex justify-end">
                    <input type="hidden" name="repertoireId" value={repertoireId} />
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button type="submit" variant="destructive" size="sm">
                      Remover
                    </Button>
                  </form>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RepertoireSharingPanel({
  repertoireId,
  members,
  canManageSharing,
}: RepertoireSharingPanelProps) {
  return (
    <section className="mt-4 rounded-lg border border-border bg-(--bg2) p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-(--text)">Compartilhamento</h2>
        <p className="text-sm text-(--text-muted)">
          Acesso V1 por associação explícita. Usuários compartilhados podem editar por enquanto.
        </p>
      </div>

      {canManageSharing ? <RepertoireSharingForm repertoireId={repertoireId} /> : null}
      <MembersList
        repertoireId={repertoireId}
        members={members}
        canManageSharing={canManageSharing}
      />
    </section>
  )
}
