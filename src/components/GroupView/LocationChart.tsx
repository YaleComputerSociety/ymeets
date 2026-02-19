import { useState, useEffect } from 'react';
import React from 'react';
import { checkIfAdmin } from '../../backend/events';
import { Location } from '../../types';

interface LocationChartProps {
  theSelectedLocation?:
    | [
        string | undefined,
        React.Dispatch<React.SetStateAction<string | undefined>>,
      ]
    | undefined;
  locationOptions: any;
  locationVotes: any;
  selectionMade: boolean;
}

/**
 *
 * Contains information on the vote count for each location.
 *
 * @param LocationChartProps
 * @returns Page Support Component - Admin
 */
export default function LocationChart({
  theSelectedLocation,
  locationOptions,
  locationVotes,
  selectionMade,
}: LocationChartProps) {
  const [selectedLocation] = theSelectedLocation || ['', () => {}];
  const [isClicked, setIsClicked] = useState(selectedLocation !== '');
  const [showInput, setShowInput] = useState(false);
  const [building, setBuilding] = useState('');

  const combined = locationOptions.map((loc: any, idx: any) => {
    return { location: loc, votes: locationVotes[idx] };
  });
  combined.sort((a: any, b: any) => b.votes - a.votes);
  locationOptions = combined.map((item: any) => item.location);
  locationVotes = combined.map((item: any) => item.votes);

  function handleRowClick(loc: string) {
    if (!checkIfAdmin() || selectionMade) {
      return;
    }

    setBuilding(loc);

    if (showInput) {
      setShowInput(false);
      setIsClicked(true);
    } else {
      setShowInput(true);
    }
  }

  function getBookingLink(building: string): string {
    if (building === 'TSAI City') {
      return 'https://city.yale.edu/tsai-city-rooms';
    } else if (building === 'Bass') {
      return 'https://schedule.yale.edu/reserve/spaces/basslibrary';
    } else if (building === 'Sterling') {
      return 'https://schedule.yale.edu/spaces?lid=9060';
    } else if (building === '17 Hillhouse') {
      return 'https://schedule.yale.edu/spaces?lid=14618';
    } else {
      return 'https://25live.collegenet.com/pro/yale#!/home/event/form';
    }
  }

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowInput(false);
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      {locationOptions && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
          <div className="space-y-1">
            {locationOptions?.map((loc: Location, idx: number) => (
              <div
                key={idx}
                onClick={() => handleRowClick(loc)}
                className={`flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                  checkIfAdmin() && !selectionMade
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : ''
                } ${
                  isClicked && selectedLocation?.includes(loc)
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : ''
                }`}
              >
                <span
                  className="text-gray-700 dark:text-gray-300 break-words flex-1 min-w-0 pr-2"
                  style={{ wordBreak: 'break-word' }}
                >
                  {loc}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                  {locationVotes[idx]}
                </span>
              </div>
            ))}
          </div>
          {showInput && building && (
            <button
              className="mt-2 w-full bg-primary text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(getBookingLink(building), '_blank');
              }}
            >
              Book Room
            </button>
          )}
        </div>
      )}
    </>
  );
}
