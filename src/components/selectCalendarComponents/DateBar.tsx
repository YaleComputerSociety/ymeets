import { calandarDate } from '../../types';

interface DateBarProps {
  dates: calandarDate[];
}

export default function DateBar({ dates }: DateBarProps) {
  return (
    <div className={`grid grid-cols-${dates.length} w-full`}>
      {dates.map((d, index) => (
        <div key={index} className="flex-1">
          <center>
            <p className="text-sm">{d.shortenedWeekDay}</p>
            <p className="text-xs">
              {d.month} {d.calanderDay}
            </p>
          </center>
        </div>
      ))}
    </div>
  );
}
