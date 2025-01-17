import React, { useEffect, useState, useRef } from 'react';
import { calendar_v3 } from 'googleapis';
import 'tailwindcss/tailwind.css';
import { calanderState, userData, user, calendarDimensions } from '../../types';
import { dragProperties } from './CalendarApp';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import { useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CalBlockProps {
  blockID: number;
  columnID: number;
  theCalendarState: [
    calanderState,
    React.Dispatch<React.SetStateAction<calanderState>>,
  ];
  theCalendarFramework: [
    calendarDimensions,
    React.Dispatch<React.SetStateAction<calendarDimensions>>,
  ];

  chartedUsersData:
    | [userData, React.Dispatch<React.SetStateAction<userData>>]
    | undefined;
  draggable: boolean;
  isAdmin?: boolean;
  user: number;
  theDragStartedOn?: any;
  is30Minute: boolean;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
  ];

  isOnGcal: boolean;
  associatedEvents?: calendar_v3.Schema$Event[];
  theShowUserChart:
    | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    | undefined;

  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function CalBlock({
  blockID,
  columnID,
  theCalendarState,
  theCalendarFramework,
  chartedUsersData,
  draggable,
  isAdmin,
  user,
  is30Minute,
  theDragState,
  isOnGcal,
  associatedEvents = undefined,
  onClick,
  theShowUserChart,
}: CalBlockProps) {
  const [showUserChart, setShowUserChart] = theShowUserChart ?? [];
  const { theme } = useTheme();

  const dragRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const elementId = `${columnID}-${blockID}`;
  const [lastToggleTime, setLastToggleTime] = useState(0);
  const [touchHandled, setTouchHandled] = useState(false);

  const [isDraggable, setIsDraggable] = useState(draggable);
  const [gCalEventActive, setGcalEventActive] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (gCalEventActive && dragRef.current && popupRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const timesColumnWidth =
        document.querySelector('.sticky.left-0')?.getBoundingClientRect()
          .width || 0;

      let left = rect.left + rect.width / 2 - popupRect.width / 2;
      const top = rect.bottom + window.scrollY;

      // Ensure the popup doesn't overlap with the times column
      left = Math.max(left, timesColumnWidth);

      setPopupPosition({ left, top });
    }
  }, [gCalEventActive]);

  function interpolateColor(
    color1: string,
    color2: string,
    factor: number
  ): string {
    const result = color1
      .slice(1)
      .match(/.{2}/g)!
      .map((hex: string, index: number) => {
        const c1 = parseInt(hex, 16);
        const c2 = parseInt(color2.slice(1).match(/.{2}/g)![index], 16);
        const value = Math.round(c1 + factor * (c2 - c1)).toString(16);
        return value.padStart(2, '0');
      });

    return `#${result.join('')}`;
  }

  function getDefaultShadeColor(): string {
    let selectedCount = 0;

    // if (shadeColor === '#73dd64') {
    //   return shadeColor;
    // }

    for (let i = 0; i < Object.keys(calendarState).length; i++) {
      if (calendarState[i][columnID][blockID] === true) {
        selectedCount += 1;
      }
    }

    if (!isDraggable || (isDraggable && isAdmin)) {
      const percentageSelected =
        selectedCount / Object.keys(calendarState).length;
      const start_shade = '#bbd5fc';
      const end_shade = '#4b86de';

      if (selectedCount === 0) {
        return theme === 'light' ? 'white' : '#2d3748';
      } else {
        return interpolateColor(start_shade, end_shade, percentageSelected);
      }
    } else {
      return 'select';
    }
  }

  const [chartedUsers, setChartedUsers] = chartedUsersData || [null, null];

  // Set all users as unavailable on initial render
  useEffect(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        available: [],
        unavailable: [...chartedUsers.users],
      });
    }
  }, []);

  const [calendarState, setCalanderState] = theCalendarState;
  const [isDottedBorder, setIsDottedBorder] = useState(false);
  const [dragState, setDragState] = theDragState;
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const prevDragState = useRef(dragState);

  // handles the color that is created when the user drags over the block and it is unselected (value of block is initfalse)
  const [shadeColor, setShadeColor] = useState(() => {
    return getDefaultShadeColor();
  });

  // when the admin is making a selection, the shade color needs to be overwritten.
  // this stores the original shade color in case the admin unselects and selects something
  // different
  const [originalShadeColor, setOriginalShadeColor] = useState(() => {
    return getDefaultShadeColor();
  });

  // handles the color that is created when the user drags over the block and it IS selected (value of the block init true)
  const [unShadeColor, setUnshadeColor] = useState(() => {
    return isOnGcal ? 'gray-500' : theme === 'light' ? 'white' : '#2d3748'; // always white unless it is a gcal block
  });

  // need this for some reason as well, investigate
  useEffect(() => {
    setUnshadeColor(
      isOnGcal ? 'gray-500' : theme === 'light' ? 'white' : '#2d3748'
    );
  }, [isOnGcal]);

  const NUM_OF_TIME_BLOCKS =
    generateTimeBlocks(calendarFramework.startTime, calendarFramework.endTime)
      .length * 4;

  // handles drag update logic
  useEffect(() => {
    if (!isDraggable) {
      return;
    }

    const [startCol, startBlock] = dragState.dragStartedOnID;
    const [endCol, endBlock] = dragState.dragEndedOnID;

    let curAffectedBlocks: any[] = [];

    const oldDragState = { ...dragState };

    prevDragState.current = dragState;

    for (
      let col = Math.min(startCol, endCol);
      col <= Math.max(startCol, endCol);
      col++
    ) {
      for (
        let block = Math.min(startBlock, endBlock);
        block <= Math.max(startBlock, endBlock);
        block++
      ) {
        curAffectedBlocks.push([col, block]);
        oldDragState.blocksAffectedDuringDrag.add(`${col}-${block}`);
      }
    }

    if (
      startCol === endCol &&
      startBlock === endBlock &&
      (blockID === 0 || blockID === NUM_OF_TIME_BLOCKS)
    ) {
      curAffectedBlocks = [];
    }

    const oldCalState = { ...calendarState };

    if (!isAdmin) {
      if (dragState.dragStartedOn) {
        if (
          curAffectedBlocks.some(([c, b]) => c === columnID && b === blockID)
        ) {
          oldCalState[user][columnID][blockID] = false;
        } else {
          if (
            dragState.blocksAffectedDuringDrag?.has(`${columnID}-${blockID}`)
          ) {
            oldCalState[user][columnID][blockID] = true;
          }
        }
      } else {
        if (
          curAffectedBlocks.some(([c, b]) => c === columnID && b === blockID)
        ) {
          oldCalState[user][columnID][blockID] = true;
        } else {
          if (
            dragState.blocksAffectedDuringDrag?.has(`${columnID}-${blockID}`)
          ) {
            oldCalState[user][columnID][blockID] = false;
          }
        }
      }
    } else {
      if (curAffectedBlocks.some(([c, b]) => c === columnID && b === blockID)) {
        setShadeColor('#73dd64');
      } else {
        setShadeColor(originalShadeColor);
      }
    }

    setDragState(oldDragState);

    setCalanderState(oldCalState);
  }, [
    isDraggable,
    dragState.dragStartedOn,
    dragState.dragStartedOnID,
    dragState.dragEndedOnID,
  ]);

  const createNewDrag = () => {
    setGcalEventActive(false);
    const oldState = dragState;

    if (calendarState[user][columnID][blockID] === true) {
      oldState.dragStartedOnID = [columnID, blockID];
      oldState.dragEndedOnID = [columnID, blockID];
      oldState.dragStartedOn = true;
      oldState.blocksAffectedDuringDrag = new Set();
    } else {
      const oldState = dragState;

      oldState.dragStartedOnID = [columnID, blockID];
      oldState.dragEndedOnID = [columnID, blockID];
      oldState.dragStartedOn = false;
      oldState.blocksAffectedDuringDrag = new Set();
    }

    setDragState(oldState);
  };

  const handleMobileAvailabilitySelect = (event: any) => {
    const touch = event.touches[0];
    const touchedElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    const touchedEleId = touchedElement?.id;

    if (!touchedEleId?.includes('-')) {
      return;
    }

    const [obtainedColumnID, obtainedBlockID] = touchedElement?.id
      ? touchedElement.id.split('-').map(Number)
      : [undefined, undefined];

    if (obtainedBlockID === undefined) {
      return;
    }

    if (!isDraggable) {
      return;
    }

    if (obtainedColumnID !== undefined && obtainedBlockID !== undefined) {
      setDragState((oldState) => ({
        ...oldState,
        dragEndedOnID: [obtainedColumnID, obtainedBlockID],
      }));
    }
  };

  const handleDragStart = (event: any) => {
    const crt = event.target.cloneNode(true);
    crt.style.position = 'absolute';
    crt.style.left = '-9999px';
    crt.style.opacity = '0';
    document.body.appendChild(crt);
    event.dataTransfer.setDragImage(crt, 0, 0);

    if (!isDraggable) {
      return;
    }

    try {
      createNewDrag();
    } catch {
      return;
    }
  };

  const handleBlockClick = (e: any, fromTouch = false) => {
    onClick(e);

    const now = Date.now();
    if (now - lastToggleTime < 300) {
      // 300ms debounce
      return;
    }
    setLastToggleTime(now);

    if (!fromTouch && touchHandled) {
      setTouchHandled(false);
      return;
    }

    if (isDraggable && !isAdmin) {
      const oldData = { ...calendarState };
      oldData[user][columnID][blockID] = !oldData[user][columnID][blockID];
      setCalanderState(oldData);
    }
  };

  const handleDesktopAvailabilitySelect = () => {
    if (!isDraggable) {
      return;
    }

    setDragState((oldState) => ({
      ...oldState,
      dragEndedOnID: [columnID, blockID],
    }));
  };

  const handleDesktopHoverChartedUser = () => {
    const availableUsers: user[] = [];
    const unavailableUsers: user[] = [];

    if (chartedUsers != undefined) {
      for (let i = 0; i < chartedUsers.users.length; i++) {
        const user = chartedUsers.users[i];
        const oldData = { ...calendarState };

        const indexOfCol = columnID;

        if (oldData[user.id][indexOfCol][blockID] == true) {
          availableUsers.push(user);
        } else {
          unavailableUsers.push(user);
        }
      }
      setChartedUsers({
        users: chartedUsers.users,
        available: availableUsers,
        unavailable: unavailableUsers,
      });
    }
  };

  // New logic for resetting availability on mouse leave
  const handleMouseOrTouchLeaveBlock = () => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        available: [],
        unavailable: [...chartedUsers.users],
      });
    }
  };

  const handleMobileHoverChartedUser = (event: any) => {
    const availableUsers: user[] = [];
    const unavailableUsers: user[] = [];

    const touch = event.touches[0];

    const touchedElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    const touchedEleId = touchedElement?.id;

    if (!touchedEleId?.includes('-')) {
      return;
    }

    const [obtainedColumnID, obtainedBlockID] =
      touchedElement && touchedElement.id
        ? touchedElement.id.split('-').map(Number)
        : [undefined, undefined];

    if (chartedUsers != undefined) {
      for (let i = 0; i < chartedUsers.users.length; i++) {
        const user = chartedUsers.users[i];
        const oldData = { ...calendarState };

        const indexOfCol = obtainedColumnID;

        if (
          (indexOfCol !== undefined &&
            obtainedBlockID !== undefined &&
            oldData[user.id][indexOfCol][obtainedBlockID] === true) ||
          shadeColor == 'green-700'
        ) {
          availableUsers.push(user);
        } else {
          unavailableUsers.push(user);
        }
      }
      setChartedUsers({
        users: chartedUsers.users,
        available: availableUsers,
        unavailable: unavailableUsers,
      });
    }
  };

  const borderTop = is30Minute ? '1px dotted #7E7E7E' : 'none';

  // pagination updates
  const updateShadeColors = useCallback(() => {
    setShadeColor(getDefaultShadeColor());
    setOriginalShadeColor(getDefaultShadeColor());
    setUnshadeColor(
      isOnGcal ? 'gray-500' : theme === 'light' ? 'white' : '#2d3748'
    );
  }, [columnID, blockID, theme]);

  useEffect(() => {
    updateShadeColors();
  }, [updateShadeColors, calendarFramework, columnID, theme]);

  const containerRef = useRef<HTMLElement | null>(null);

  // Find and store reference to scrollable container
  useEffect(() => {
    const findScrollContainer = (
      element: HTMLElement | null
    ): HTMLElement | null => {
      while (element) {
        const overflowY = window.getComputedStyle(element).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return element;
        }
        element = element.parentElement;
      }
      return null;
    };

    if (dragRef.current) {
      containerRef.current = findScrollContainer(dragRef.current);
    }
  }, []);

  return (
    <>
      <div>
        <div
          draggable="true"
          id={elementId}
          ref={dragRef}
          onClick={(e) => {
            handleBlockClick(e);
          }}
          onDragStart={handleDragStart}
          onDragEnter={handleDesktopAvailabilitySelect}
          onDragOver={handleDesktopAvailabilitySelect}
          onMouseOver={handleDesktopHoverChartedUser}
          onMouseEnter={() => {
            setGcalEventActive(true);
          }}
          onTouchStart={(event) => {
            if (!isDraggable) {
              return;
            }

            setTouchHandled(true);

            const dragStartEvent = new DragEvent('dragstart', {
              bubbles: true,
              cancelable: true,
              dataTransfer: new DataTransfer(),
            });

            if (dragRef.current) {
              dragRef.current.dispatchEvent(dragStartEvent);
            }

            handleDesktopHoverChartedUser();

            // Create a synthetic click event
            const clickEvent = {
              ...event,
              type: 'click',
              preventDefault: () => {},
              stopPropagation: () => {},
            };

            // Call handleBlockClick directly with the synthetic event
            handleBlockClick(clickEvent);
          }}
          onTouchMove={(e) => {
            if (theShowUserChart !== undefined) {
              setShowUserChart?.(false);
            }

            handleMobileAvailabilitySelect(e);
            handleMobileHoverChartedUser(e);
          }}
          onMouseLeave={() => {
            setGcalEventActive(false);
            setIsDottedBorder(false);
            handleMouseOrTouchLeaveBlock();
          }}
          // Remove the className bg-color reference and only use the inline style
          className={
            (!isDraggable || (isDraggable && isAdmin)) === false
              ? calendarState?.[user]?.[columnID]?.[blockID]
                ? `bg-${shadeColor} cursor-pointer flex-1 w-full p-0 h-4 touch-none`
                : `bg-${unShadeColor} cursor-pointer flex-1 w-full p-0 h-4 touch-none`
              : `bg-${shadeColor} cursor-pointer flex-1 w-full p-0 h-4 touch-none`
          }
          style={{
            borderRight: '1px solid #7E7E7E',
            borderTop,
            backgroundColor: shadeColor,
            transition: 'background-color 0.2s ease',
          }}
        ></div>
        {gCalEventActive && (associatedEvents?.length ?? 0) > 0 && (
          <div
            ref={popupRef}
            className={`fixed z-50 bg-gray-800 text-white text-sm rounded-lg p-2 shadow-lg pointer-events-none transition-opacity duration-300 ${
              gCalEventActive ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              minWidth: '150px',
              opacity: gCalEventActive ? 1 : 0,
              left: `${popupPosition.left}px`,
              top: `${popupPosition.top}px`,
            }}
          >
            {associatedEvents
              ?.filter(
                (gEvent: any, index: number, self: any[]) =>
                  index === self.findIndex((e) => e.summary === gEvent.summary)
              )
              .map((gEvent: any) => {
                return (
                  <div className="w-full mb-1 z-1 last:mb-0" key={gEvent.id}>
                    {gEvent.summary}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}
