import React from "react";

type HeatmapProps = {
  days: Array<{ date: string; total: number; count: number }>;
  onDateClick: (date: string) => void;
};

function getIntensityLevel(total: number): string {
  if (total <= 0) return "";
  if (total < 10) return "intensity-low";
  if (total < 30) return "intensity-medium";
  if (total < 60) return "intensity-high";
  return "intensity-very-high";
}

export default function Heatmap({ days, onDateClick }: HeatmapProps) {
  return (
    <div className="heatmap" role="grid" aria-label="Reading heatmap">
      {days.map((day) => (
        <div
          key={day.date}
          className={`heatmapCell ${getIntensityLevel(day.total)}`}
          title={`${day.date} • ${day.count} log(s)`}
          onClick={() => onDateClick(day.date)}
          role="button"
          tabIndex={0}
        />
      ))}
    </div>
  );
}
