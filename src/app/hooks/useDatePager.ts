import * as React from "react";
import { addDays, differenceInCalendarDays, formatISO, startOfDay } from "date-fns";

type Direction = 1 | -1 | 0;

export function useDatePager(initial: Date = new Date()) {
  const [active, setActive] = React.useState<Date>(startOfDay(initial));
  const [direction, setDirection] = React.useState<Direction>(0);

  const go = (next: Date) => {
    const d = startOfDay(next);
    const delta = Math.sign(differenceInCalendarDays(d, active)) as Direction;
    setDirection(delta === 0 ? 0 : delta);
    setActive(d);
  };

  const goPrev = () => go(addDays(active, -1));
  const goNext = () => go(addDays(active, 1));
  const pick = (d: Date) => go(d);
  const goToDate = (targetDate: Date) => go(targetDate);

  return {
    active,
    activeISO: formatISO(active, { representation: "date" }),
    direction,
    goPrev,
    goNext,
    pick,
    goToDate,
  };
} 