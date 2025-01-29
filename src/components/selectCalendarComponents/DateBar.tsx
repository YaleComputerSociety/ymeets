import { calandarDate } from '../../types';

interface DateBarProps {
  dates: calandarDate[];
  isGeneralDays: boolean;
}

export default function DateBar({ dates, isGeneralDays }: DateBarProps) {
  return (
    <div
      className={`grid grid-cols-${dates.length} w-full text-outline dark:text-text-dark`}
    >
      {dates.map((d, index) => (
        <div key={index} className="flex-1">
          <center>
            <p className="text-sm">{d.shortenedWeekDay}</p>
            {!isGeneralDays ? (
              <p className="text-xs">
                {d.month} {d.calanderDay}
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
