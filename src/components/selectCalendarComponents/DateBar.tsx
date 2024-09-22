import React from 'react';
import { calandarDate } from '../../types';

interface DateBarProps {
  dates: calandarDate[];
}

export default function DateBar({ dates }: DateBarProps) {
  return (
    <div className="flex flex-row">
      {dates.map((d, index) => (
        <div key={index} className="flex-1 w-16">
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
