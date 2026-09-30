interface TableSkeletonProps {
  rows?: number;
  columns?: string[];
}

const TableSkeleton = ({
  rows = 10,
  columns = [],
}: TableSkeletonProps) => {
  return (
    <div className="animate-pulse">
      {/* TABLE */}
      <div className="overflow-x-auto">
        {/* HEADER */}
        <div
          className="grid border-b bg-slate-50 px-4 py-3"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column, index) => (
            <div
              key={index}
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              {column}
            </div>
          ))}
        </div>

        {/* ROWS */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid items-center px-4 py-4"
              style={{
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              }}
            >
              {columns.map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 rounded bg-slate-200 ${
                    colIndex === columns.length - 1
                      ? "w-16"
                      : "w-24"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="h-4 w-52 rounded bg-slate-200" />

        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-lg bg-slate-200" />
          <div className="h-9 w-9 rounded-lg bg-slate-200" />
          <div className="h-9 w-9 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;