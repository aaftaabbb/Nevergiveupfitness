import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  /** Hidden on small screens, where the phone layout uses stacked cards. */
  hideOnMobile?: boolean;
  align?: "left" | "right" | "center";
  cell: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState: ReactNode;
  onRowClick?: (row: T) => void;
  /** Rendered above the scroll container on mobile. */
  mobileCard: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
  onRowClick,
  mobileCard,
}: DataTableProps<T>) {
  if (rows.length === 0) return <>{emptyState}</>;

  return (
    <>
      {/* Phone layout: one card per record, no horizontal scrolling on the gym floor. */}
      <div className="space-y-2 lg:hidden">{rows.map((row) => <div key={rowKey(row)}>{mobileCard(row)}</div>)}</div>

      <div className="scrollbar-thin hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted ${
                    column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-line/60 last:border-0 ${
                  onRowClick ? "cursor-pointer transition-colors hover:bg-surface-raised" : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 align-middle ${
                      column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
                    }`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
