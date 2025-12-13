import React from "react";
import dayjs from "dayjs";

type CalendarGridProps = {
  calendarDays: (string | null)[];
  logsByDate: Map<string, string[]>;
  bookMap: Map<string, any>;
  onDateClick: (date: string) => void;
};

export default function CalendarGrid({
  calendarDays,
  logsByDate,
  bookMap,
  onDateClick,
}: CalendarGridProps) {
  return (
    <div className="monthCalendar" role="grid" aria-label="Monthly calendar">
      {calendarDays.map((date, index) => {
        if (!date) {
          return <div key={`empty-${index}`} className="calendarDay calendarDayEmpty" />;
        }

        const bookIds = logsByDate.get(date) || [];
        const coverUrls = bookIds
          .map((id) => bookMap.get(id)?.coverUrl)
          .filter(Boolean)
          .slice(0, 3) as string[];

        return (
          <button
            key={date}
            className="calendarDay"
            onClick={() => onDateClick(date)}
            type="button"
            title={date}
          >
            <div className="calendarDayNumber">{dayjs(date).date()}</div>
            <div className="calendarDayCovers">
              {coverUrls.map((coverUrl, i) => (
                <img
                  key={`${date}-cover-${i}`}
                  className="calendarDayCover"
                  src={coverUrl}
                  alt=""
                />
              ))}
              {bookIds.length > 3 && (
                <span className="calendarDayOverflow">+{bookIds.length - 3}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
