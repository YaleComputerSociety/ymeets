import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { calendar_v3 } from 'googleapis';
import {
  BoundingBox,
  DraggedSelection,
  calendarState,
  copyAndReplace,
  userData,
  user,
  calendarDimensions,
} from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface CalBlockProps {
  blockID: number;
  columnID: number;
  theCalendarState: [
    calendarState,
    React.Dispatch<React.SetStateAction<calendarState>>,
  ];
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>];
  draggable: boolean;
  isAdmin?: boolean;
  user: number;
  is30Minute: boolean;
  theDragState: [
    DraggedSelection | undefined,
    React.Dispatch<React.SetStateAction<DraggedSelection | undefined>>,
  ];
  theMostRecentSelection: [
    BoundingBox | undefined,
    React.Dispatch<React.SetStateAction<BoundingBox | undefined>>,
  ];
  isOnGcal: boolean;
  associatedEvents?: calendar_v3.Schema$Event[];
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  theShowUserChart?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  isEventStart: boolean;
  isEventEnd: boolean;
  eventName: string | null;
  additionalEventCount: number;
}

export default function CalBlock({
  blockID,
  columnID,
  theCalendarState,
  theCalendarFramework,
  draggable,
  isAdmin,
  user,
  theDragState,
  theMostRecentSelection: [mostRecentSelection, setMostRecentSelection],
  isOnGcal,
  associatedEvents,
  onClick,
  is30Minute,
  chartedUsersData,
  theShowUserChart,
  isEventStart,
  isEventEnd,
  eventName,
  additionalEventCount,
}: CalBlockProps) {
  const { theme } = useTheme();
  const [calendarState, setCalendarState] = theCalendarState;
  const [dragState, setDragState] = theDragState;
  const [calendarFramework] = theCalendarFramework;
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [, setShowUserChart] = theShowUserChart ?? [null, null];
  const [chartedUsers, setChartedUsers] = chartedUsersData || [null, null];

  // Initialize chartedUsers
  useEffect(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        userIDs: chartedUsers.userIDs,
        available: [],
        unavailable: [...chartedUsers.users],
        hovering: false,
      });
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Returns `true` if this block is selected (even if it's not saved) for the current user's calendar. Returns `false`
   * if it's not selected or if the block is -1.
   */
  const isBlockSelected = useCallback((): boolean => {
    if (blockID === -1) return false;
    return calendarState[user]?.[columnID]?.[blockID];
  }, [user, columnID, blockID, calendarState]);

  /**
   * Determines the default color for an unselected block.
   */
  const getDefaultColor = useCallback(() => {
    if (draggable || chartedUsers) {
      return theme === 'light' ? 'white' : '#2d3748';
    }
    return theme === 'light' ? '#a8a8a8' : '#404040';
  }, [chartedUsers, draggable, theme]);

  /**
   * Determine the maximum number of users currently available during the same block in the calendar.
   */
  // use Memo should ensure it only runs when calendarState changes
  const maxUsers = useMemo<number>(() => {
    let maxCount = 0;

    // define counts array
    const counts: number[][] = [];

    // iterate through all blocks and find number of users on each
    for (let i = 0; i < calendarState.length; i++) {
      for (let j = 0; j < calendarState[i].length; j++) {
        // create row if needed
        if (!counts[j]) {
          counts[j] = new Array(calendarState[i][j].length).fill(0);
        }

        for (let k = 0; k < calendarState[i][j].length; k++) {
          // check if user is on block
          if (calendarState[i][j][k]) {
            // update to new value
            const newVal = (counts[j][k] ?? 0) + 1;
            counts[j][k] = newVal;

            // update max
            if (newVal > maxCount) {
              maxCount = newVal;
            }
          }
        }
      }
    }
    return maxCount;
  }, [calendarState]);

  /**
   * Picks a shade of blue based on how many users are available during this block relative to the maximum.
   */
  const getGroupPercentageColor = useCallback(() => {
    if (blockID == -1) {
      return getDefaultColor();
    }
    let selectedCount = 0;
    // const totalUsers = chartedUsers?.users.length || 0;

    for (let i = 0; i < calendarState.length; i++) {
      if (
        calendarState[i]?.[columnID]?.[blockID] &&
        chartedUsers?.users.some((u) => u.id === i)
      ) {
        selectedCount += 1;
      }
    }

    if (selectedCount === 0) {
      return getDefaultColor();
    }

    const percentageSelected = selectedCount / maxUsers; //selectedCount / totalUsers;

    return interpolateColor('#bbd5fc', '#4b86de', percentageSelected);
  }, [calendarState, columnID, blockID, getDefaultColor, chartedUsers?.users]);

  const [shadeColor, setShadeColor] = useState(getDefaultColor);

  // Update shade color when relevant props change
  useEffect(() => {
    if (blockID == -1) {
      setShadeColor(getDefaultColor());
      return;
    }

    if (isAdmin) {
      const inRecentSelection = mostRecentSelection?.contains({
        col: columnID,
        block: blockID,
      });
      setShadeColor(inRecentSelection ? '#73dd64' : getGroupPercentageColor());
    } else {
      setShadeColor(isBlockSelected() ? '#afcdfa' : getDefaultColor());
    }
  }, [isAdmin, isBlockSelected, getGroupPercentageColor, getDefaultColor]);

  const handleDesktopHoverChartedUser = useCallback(() => {
    if (!chartedUsers || !setChartedUsers) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (blockID == -1) {
      return;
    }

    const availableUsers: user[] = [];
    const unavailableUsers: user[] = [];

    chartedUsers.users.forEach((user) => {
      if (calendarState[user.id]?.[columnID]?.[blockID]) {
        availableUsers.push(user);
      } else {
        unavailableUsers.push(user);
      }
    });

    setChartedUsers({
      users: chartedUsers.users,
      userIDs: chartedUsers.userIDs,
      available: availableUsers,
      unavailable: unavailableUsers,
      hovering: true,
    });
  }, [chartedUsers, setChartedUsers, calendarState, columnID, blockID]);

  const handleMobileHoverChartedUser = useCallback(
    (event: React.TouchEvent) => {
      if (!chartedUsers || !setChartedUsers) return;

      const touch = event.touches[0];
      const touchedElement = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      const touchedEleId = touchedElement?.id;

      if (!touchedEleId?.includes('-')) return;

      const parts = touchedEleId.split('-');
      if (parts.length !== 2) return;

      const obtainedColumnID = parseInt(parts[0]);
      const obtainedBlockID = parseInt(parts[1]);

      if (isNaN(obtainedColumnID) || isNaN(obtainedBlockID)) return;

      const availableUsers: user[] = [];
      const unavailableUsers: user[] = [];

      chartedUsers.users.forEach((user) => {
        if (calendarState[user.id]?.[obtainedColumnID]?.[obtainedBlockID]) {
          availableUsers.push(user);
        } else {
          unavailableUsers.push(user);
        }
      });

      setChartedUsers({
        users: chartedUsers.users,
        userIDs: chartedUsers.userIDs,
        available: availableUsers,
        unavailable: unavailableUsers,
        hovering: true,
      });
    },
    [chartedUsers, setChartedUsers, calendarState]
  );

  /**
   * Starts a new drag, updating the `dragState`, `mostRecentSelection`, and `calendarState` state variables as needed.
   * Special-cased to reject `calendarState` updates on group calendars.
   */
  const handleSelectionStart = useCallback(
    (event: React.PointerEvent) => {
      if (!draggable) return;
      if (blockID == -1) return;

      event.preventDefault();

      const coords = { col: columnID, block: blockID };
      const { drag, selection, newAvailability } = DraggedSelection.create(
        calendarState[user],
        coords
      );
      setDragState(drag);
      setMostRecentSelection(selection);
      // Right now, `!isAdmin` is the most stable way to confirm that we're looking at a personal calendar.
      if (!isAdmin) {
        setCalendarState(copyAndReplace(calendarState, user, newAvailability));
      }
    },
    [draggable, user, columnID, blockID, calendarState, setCalendarState]
  );

  /**
   * Updates `calendarState` and `mostRecentSelection` to reflect the drag ending on this block. Special-cased to reject
   * `calendarState` updates on group calendars.
   */
  const handleSelectionMove = useCallback(
    (drag: DraggedSelection) => {
      const { selection, newAvailability } = drag.computeSelection({
        col: columnID,
        block: blockID,
      });
      setMostRecentSelection(selection);
      // Right now, `!isAdmin` is the most stable way to confirm that we're looking at a personal calendar.
      if (!isAdmin) {
        setCalendarState(copyAndReplace(calendarState, user, newAvailability));
      }
    },
    [dragState, setCalendarState, setMostRecentSelection]
  );

  /**
   * Ends the current drag.
   */
  const endDrag = useCallback(
    (event: React.PointerEvent): void => {
      if (blockID == -1) return;

      event.preventDefault();
      setDragState(undefined);

      setShowTooltip(false);
    },
    [blockID, setDragState, setShowTooltip]
  );

  return (
    <div
      id={`${columnID}-${blockID}`}
      className={`cursor-pointer select-none flex-1 w-full p-0 h-4 touch-none relative border-r border-[#7E7E7E] ${
        is30Minute ? 'border-t border-t-[#7E7E7E]' : ''
      } transition-colors duration-200 ease-in-out`}
      style={{
        borderTopStyle: is30Minute ? 'dashed' : 'solid',
        backgroundColor: shadeColor,
        ...(isEventStart || isOnGcal || isEventEnd
          ? {
              position: 'relative',
              zIndex: 2,
            }
          : {}),
      }}
      // This cast is probably wrong, but fixing it is out of scope.
      onClick={onClick as any}
      onPointerDown={handleSelectionStart}
      onPointerEnter={(event) => {
        if (isOnGcal) {
          setShowTooltip(true);
        }
        if (dragState === undefined) {
          return;
        }
        // onPointerUp doesn't catch pointerup on non-block elements, addEventHandler doesn't work with once: true, and
        // onPointerCancel is redundant if this is present.
        if (event.buttons === 0) {
          endDrag(event);
          return;
        }
        handleSelectionMove(dragState);
      }}
      onMouseEnter={handleDesktopHoverChartedUser}
      onTouchMove={(e) => {
        setShowUserChart?.(false);
        handleMobileHoverChartedUser(e);
      }}
      onPointerOut={() => {
        setShowTooltip(false);
      }}
    >
      {(isEventStart || isOnGcal || isEventEnd) && (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 4,
            boxShadow: [
              isEventEnd ? 'inset 0 -2px 0 0 #5191f2' : '',
              isEventStart ? 'inset 0 2px 0 0 #5191f2' : '',
              'inset -2px 0 0 0 #5191f2',
              'inset 2px 0 0 0 #5191f2',
            ]
              .filter(Boolean)
              .join(', '),
            backgroundColor: isEventStart
              ? 'rgba(59, 130, 246, 0.1)'
              : 'transparent',
          }}
        />
      )}

      {isEventStart && eventName && (
        <div
          className="absolute top-0 left-1 text-xs font-bold text-[#5191f2] dark:text-white overflow-visible whitespace-normal"
          style={{
            zIndex: 10,
          }}
        >
          {eventName}
          {additionalEventCount > 0 && ` +${additionalEventCount}`}
        </div>
      )}

      {showTooltip && associatedEvents && associatedEvents.length > 0 && (
        <div
          className={`
          absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-48 max-w-64 left-0 -top-2 
          transform -translate-y-full transition-all duration-300 ease-in-out
        `}
        >
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {associatedEvents.map((event, index) => (
              <div key={index} className="mb-1 last:mb-0 truncate">
                {event.summary}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800" />
        </div>
      )}
    </div>
  );
}

/**
 * Picks a color between the lower and upper bound.
 *
 * @param color1 - The "lower bound" for the color.
 * @param color2 - The "upper bound" for the color.
 * @param factor - Which color to pick. 0 means color1, 1 means color2, anything else is a mix.
 */
// Color interpolation helper
function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const c1 = color1.match(/\w\w/g)?.map((hex) => parseInt(hex, 16)) || [];
  const c2 = color2.match(/\w\w/g)?.map((hex) => parseInt(hex, 16)) || [];

  const result = c1.map((value, index) => {
    const hex = Math.round(value + factor * (c2[index] - value)).toString(16);
    return hex.padStart(2, '0');
  });

  return `#${result.join('')}`;
}
