import React, { useState, useEffect } from 'react';
import { checkIfAdmin } from '../../firebase/events';
import { Location } from '../../types';
import { IoIosCheckmarkCircle } from 'react-icons/io';

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
  const [selectedLocation, setSelectedLocation] = theSelectedLocation || [
    '',
    () => {},
  ];
  const [isClicked, setIsClicked] = useState(selectedLocation !== '');
  const [showInput, setShowInput] = useState(false);
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setRoomNumber(event.target.value);
  }

  function handleInputSubmit(event: React.FormEvent) {
    event.preventDefault();
    setRoomNumber(roomNumber);
    setSelectedLocation(building + ' ' + roomNumber);
    setShowInput(false);
    setIsClicked(true);
  }

  function handleClose() {
    setShowInput(false);
  }

  // Function to handle key presses
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  function getBookingLink(building: string): string {
    const roomNumberInt = parseInt(roomNumber, 10);
    if (building === 'TSAI City') {
      return 'https://city.yale.edu/tsai-city-rooms';
    } else if (building === 'Bass') {
      return 'https://schedule.yale.edu/reserve/spaces/basslibrary';
    } else if (building === 'Sterling') {
      return 'https://schedule.yale.edu/spaces?lid=9060';
    } else if (building === '17 Hillhouse' && roomNumberInt === 7) {
      return 'https://schedule.yale.edu/spaces?lid=14618';
    } else {
      return 'https://25live.collegenet.com/pro/yale#!/home/event/form';
    }
  }

  // Set up and clean up the keydown event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      {roomNumber && <div>Chosen Room Number: {roomNumber}</div>}
      {locationOptions && (
        <div className="relative flex justify-center items-center text-center bg-white rounded-lg">
          <table className="table-fixed border-collapse w-full">
            <tbody>
              <tr>
                <th className="border-b p-3 text-steelgray">Location</th>
                <th className="border-b p-3 text-steelgray">Votes</th>
              </tr>
              {locationOptions?.map((loc: Location, idx: number) => {
                return (
                  <tr
                    key={idx}
                    onClick={() => handleRowClick(loc)}
                    className={`group p-4 cursor-pointer ${
                      checkIfAdmin() && !selectionMade
                        ? 'hover:scale-102 transition-transform duration-200'
                        : ''
                    } ${
                      isClicked && selectedLocation?.includes(loc)
                        ? 'bg-ymeets-light-blue'
                        : 'bg-white'
                    } transition-colors duration-300`}
                  >
                    <td className="p-3">{loc}</td>
                    <td className="p-3">{locationVotes[idx]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {showInput && (
            <form
              onSubmit={handleInputSubmit}
              className="absolute top-4 right-4 flex flex-col items-center bg-white border rounded p-4 shadow-lg"
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-2 right-2 text-steelgray hover:text-gray-800"
              >
                &times;
              </button>
              <input
                type="text"
                value={roomNumber}
                onChange={handleInputChange}
                placeholder={`Enter ${building} room number`}
                className="border p-2 rounded mb-2"
                maxLength={10}
              />
              <div className="flex flex-row gap-2">
                <button
                  className="bg-primary gp text-white p-2 rounded"
                  type="button"
                  onClick={() => {
                    window.open(getBookingLink(building), '_blank');
                  }}
                >
                  Book Room
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white p-2 rounded"
                >
                  <IoIosCheckmarkCircle />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
