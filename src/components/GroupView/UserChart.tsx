/* eslint-disable */

import React from 'react';
import ChartRow from './UserChartRow';
import { userData } from '../../types';
import {
  IconAdjustments,
  IconAdjustmentsFilled,
  IconSquare,
  IconSquareCheck,
  IconSquareFilled,
} from '@tabler/icons-react';

interface UserChartProps {
  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  allPeople: string[];
  thePeopleStatus: [
    Record<string, boolean>,
    React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  ];
  theParticipantToggleClicked: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ];
}

/**
 *
 * Renders who is available during certain time blocks
 *
 * @param UserChart
 * @returns Page Support Component - Admin View
 */
const UserChart: React.FC<UserChartProps> = ({
  chartedUsersData,
  allPeople,
  thePeopleStatus,
  theParticipantToggleClicked,
}) => {
  const [chartedUsers, setChartedUsers] = chartedUsersData || [
    { available: [], unavailable: [] },
    () => {},
  ];

  const [peoepleStatus, setPeopleStatus] = thePeopleStatus;

  const [participantToggleClicked, setParticipantToggleClicked] =
    theParticipantToggleClicked;

  const numRows = Math.max(
    chartedUsers.available.length,
    chartedUsers.unavailable.length
  );

  const rows: Array<[string, string]> = Array.from(
    { length: numRows },
    (_, i) => [
      chartedUsers.available[i]?.name || '',
      chartedUsers.unavailable[i]?.name || '',
    ]
  );

  return (
    <div className="relative">
      <div className="flex flex-row text-md justify-center z-[9999] items-center text-center bg-white dark:bg-secondary_background-dark rounded-lg mb-3 md:mb-4 w-full overflow-y-auto">
        {participantToggleClicked ? (
          <table className="table-fixed border-collapse w-full">
            <thead>
              <tr>
                <th className="border-b p-3 text-primary">Available</th>
                <th className="border-b p-3 text-text dark:text-text-dark">
                  Unavailable
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([available, unavailable], idx) => (
                <ChartRow
                  available={available}
                  key={idx}
                  unavailable={unavailable}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col">
            <div className="m-2 text-md font-bold dark:text-text-dark">
              Edit Participants
            </div>
            {allPeople?.map((name, idx) => (
              <div className="flex flex-row justify-between items-center dark:text-text-dark">
                <div
                  key={idx}
                  className={`p-2 ${peoepleStatus[name] === true ? 'opacity-100' : 'opacity-50'}`}
                >
                  {name}
                </div>
                {!peoepleStatus[name] ? (
                  <IconSquare
                    className="cursor-pointer"
                    onClick={() =>
                      setPeopleStatus((prev) => ({
                        ...prev,
                        [name]: !prev[name],
                      }))
                    }
                  />
                ) : (
                  <IconSquareCheck
                    className="cursor-pointer"
                    onClick={() => {
                      if (
                        allPeople.filter((person) => peoepleStatus[person])
                          .length === 1 &&
                        peoepleStatus[name]
                      ) {
                        alert("You can't remove the last participant");
                        return;
                      }
                      setPeopleStatus((prev) => ({
                        ...prev,
                        [name]: !prev[name],
                      }));
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChart;
