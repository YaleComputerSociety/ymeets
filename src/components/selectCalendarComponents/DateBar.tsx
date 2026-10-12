import { calendarDate } from '../../types';

interface DateBarProps {
  dates: calendarDate[];
  isGeneralDays: boolean;
}

export default function DateBar({ dates, isGeneralDays }: DateBarProps) {
  return (
    <div
      className={`grid grid-cols-${dates.length} w-full text-outline border-[#7E7E7E] border-y-[#7E7E7E] dark:text-text-dark`}
    >
      {dates.map((d, index) => (
        <div key={index} className="flex-1">
          <center>
            <p className="text-sm">{d.shortenedWeekDay}</p>
            {!isGeneralDays ? (
              <p className="text-xs">
                {d.month} {d.calendarDay}
              </p>
            ) : (
              <p>
                {' '}
                <>&nbsp;</>
              </p>
            )}
          </center>
        </div>
      ))}
    </div>
  );
}
