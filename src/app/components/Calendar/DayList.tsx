import * as React from "react";
import { format } from "date-fns";

export function DayList({
  groups,
  activeISO,
  renderItem,
}: {
  groups: Array<{ dateISO: string; items: unknown[] }>;
  activeISO: string;
  renderItem: (x: unknown) => React.ReactNode;
}) {
  const refs = React.useRef<Record<string, HTMLElement | null>>({});

  React.useEffect(() => {
    const el = refs.current[activeISO];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeISO]);

  return (
    <div className="h-[60vh] overflow-auto pr-2">
      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-gray-400">
          No items found for the selected date
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.dateISO} ref={(node) => { refs.current[g.dateISO] = node; }} className="mb-8">
            <h3 className="sticky top-0 z-10 mb-4 bg-white/95 py-4 backdrop-blur text-xs xs:text-sm font-semibold text-gray-600 border-b border-gray-200 shadow-sm">
              {format(new Date(g.dateISO), "EEEE, MMMM d, yyyy")}
            </h3>
            <div className="space-y-2">
              {g.items.length ? g.items.map(renderItem) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-gray-400">
                  No items found for this date
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
} 