import { Archive, ExternalLink } from "lucide-react";

import { pruneArchivedStaysAction } from "@/app/admin/room-actions";
import { getArchiveAfterDays } from "@/lib/archive";
import { getHistorySheetUrl } from "@/lib/sheets";

/**
 * Server-rendered toolbar above the room board: opens the full booking
 * history in Google Sheets, and lets the manager prune old archived
 * stays from the database with one big button.
 */
export function HistoryToolbar({ pruned }: { pruned?: number }) {
  const historyUrl = getHistorySheetUrl();
  const afterDays = getArchiveAfterDays();

  return (
    <div className="flex flex-col gap-3">
      {pruned !== undefined && pruned > 0 ? (
        <p className="rounded-xl border border-pine/20 bg-pine/5 px-4 py-3 text-sm font-medium text-pine">
          {pruned} old {pruned === 1 ? "stay" : "stays"} removed from the
          database — {pruned === 1 ? "it is" : "they are"} still safe in
          Google Sheets.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        {historyUrl ? (
          <a
            href={historyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5"
          >
            <ExternalLink className="size-4" />
            View full booking history
          </a>
        ) : null}
        <form action={pruneArchivedStaysAction}>
          <button
            type="submit"
            title={`Removes checked-out stays older than ${afterDays} days that are already saved in Google Sheets`}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-5 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
          >
            <Archive className="size-4" />
            Clean up old records
          </button>
        </form>
      </div>
    </div>
  );
}
