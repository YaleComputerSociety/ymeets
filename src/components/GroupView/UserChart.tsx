import React, { useState } from 'react';
import ChartRow from './UserChartRow';
import { userData } from '../../types';
import {
  IconAdjustments,
  IconAdjustmentsFilled,
  IconSquare,
  IconSquareCheck,
  IconSquareFilled,
} from '@tabler/icons-react';
import AlertPopup from '../utils/components/AlertPopup';

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
  calendarHeight: number | null;
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
  calendarHeight,
}) => {
  const [chartedUsers, setChartedUsers] = chartedUsersData || [
    { available: [], unavailable: [] },
    () => {},
  ];

  const [peoepleStatus, setPeopleStatus] = thePeopleStatus;

  const [participantToggleClicked, setParticipantToggleClicked] =
    theParticipantToggleClicked;

  const [rowHeight, setRowHeight] = useState<number | null>(null);
  const maxRows = Math.max(
    chartedUsers.available.length,
    chartedUsers.unavailable.length
  );
  const numRows =
    rowHeight && calendarHeight
      ? Math.min(maxRows, Math.max(1, Math.floor(calendarHeight / rowHeight)))
      : maxRows;

  const rows: Array<[string, string]> = Array.from(
    { length: numRows },
    (_, i) => [
      chartedUsers.available[i]?.name || '',
      chartedUsers.unavailable[i]?.name || '',
    ]
  );

  // if (chartedUsers.available.length > numRows || chartedUsers.unavailable.length > numRows) {
  //   rows.push([
  //     ((chartedUsers.available.length - numRows) > 0) ? `...and ${(chartedUsers.available.length - numRows)} more` : '',
  //     ((chartedUsers.unavailable.length - numRows) > 0) ? `...and ${(chartedUsers.unavailable.length - numRows)} more` : '',
  //   ]);
  // }

  if (chartedUsers.available.length > numRows) {
    rows[numRows - 1][0] = `...and ${
      chartedUsers.available.length - (numRows - 1)
    } more`;
  }

  if (chartedUsers.unavailable.length > numRows) {
    rows[numRows - 1][1] = `...and ${
      chartedUsers.unavailable.length - (numRows - 1)
    } more`;
  }

  const [alertMessage, setAlertMessage] = useState<string | null>(null); // Add state for AlertPopup

  return (
    <div className="relative">
      {alertMessage && (
        <AlertPopup
          title="Alert"
          message={alertMessage}
          isOpen={!!alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <div className="flex flex-row text-sm justify-center z-[9999] items-center text-center bg-white dark:bg-secondary_background-dark rounded-lg mb-3 md:mb-4 w-full overflow-y-auto">
        <table className="table-fixed border-collapse w-full">
          <thead>
            <tr>
              <th
                className="border-b p-3 text-primary"
                dangerouslySetInnerHTML={{
                  __html:
                    'Available (' + String(chartedUsers.available.length) + ')',
                }}
              ></th>
              <th
                className="border-b p-3 text-text dark:text-text-dark"
                dangerouslySetInnerHTML={{
                  __html:
                    'Unvailable (' +
                    String(chartedUsers.unavailable.length) +
                    ')',
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([available, unavailable], idx) => (
              <ChartRow
                available={available}
                key={idx} // Correctly placed key
                onHeightMeasured={
                  idx === 0
                    ? (height) => {
                        if (rowHeight === null) setRowHeight(height);
                      }
                    : undefined
                }
                unavailable={unavailable}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserChart;
