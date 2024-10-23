/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import {
  calanderState,
  userData,
  user,
  calendarDimensions,
  calandarDate,
} from '../../types';
import { dragProperties } from './CalendarApp';
import { generateTimeBlocks } from '../utils/functions/generateTimeBlocks';
import { useCallback } from 'react';
import { checkIfLoggedIn, getChosenDayAndTime } from '../../firebase/events';
import { dateObjectToHHMM } from '../utils/functions/dateObjecToHHMM';

interface CalBlockProps {
  blockID: number;
  columnID: number;
  theCalendarState:
    | [calanderState, React.Dispatch<React.SetStateAction<calanderState>>]
    | undefined;
  theCalendarFramework:
    | [
        calendarDimensions,
        React.Dispatch<React.SetStateAction<calendarDimensions>>,
      ]
    | undefined;
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
  theSelectedDate:
    | [calandarDate, React.Dispatch<React.SetStateAction<calandarDate>>]
    | undefined;
  isOnGcal: boolean;
  associatedEvents?: any;
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
  theSelectedDate,
  isOnGcal,
  associatedEvents = undefined,
}: CalBlockProps) {
  const dragRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const elementId = `${columnID}-${blockID}`;

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

  function checkIfBlockIsAdminSelection() {
    const chosenDates = getChosenDayAndTime();
    // check if a selection has been made by the admin, locking the users from editing their
    // availability
    if (
      chosenDates !== undefined &&
      chosenDates[0] instanceof Date &&
      chosenDates[0].getFullYear() != 1970
    ) {
      setIsDraggable(false);

      const startTimeHHMM = dateObjectToHHMM(chosenDates[0]);
      const endTimeHHMM = dateObjectToHHMM(chosenDates[1]);

      const times = [].concat(
        //@ts-expect-error
        ...generateTimeBlocks(
          calendarFramework.startTime,
          calendarFramework.endTime
        )
      );
      const dates = [].concat(...calendarFramework.dates);

      // @ts-expect-error
      const startBlockID = times.indexOf(startTimeHHMM);

      // @ts-expect-error
      const endBlockID = times.indexOf(endTimeHHMM);

      let startColumnID = -1;

      let endColumnID = -1;

      for (let i = 0; i < dates?.length; i++) {
        // @ts-expect-error
        if (dates[i].calanderDay == chosenDates[0].getDate()) {
          startColumnID = i;
        }
        // @ts-expect-error
        if (dates[i].calanderDay == chosenDates[1].getDate()) {
          endColumnID = i;
        }
      }
      // if this block falls within the selected region of the admin, then set the color of that block to be selection colored
      if (
        columnID >= startColumnID &&
        columnID <= endColumnID &&
        startBlockID <= blockID &&
        endBlockID >= blockID
      ) {
        if (blockID == endBlockID) {
          // for that last one, based on how blocks are coded.
          return '';
        }
        return 'green-700';
      }
    }
    return '';
  }

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

  function getDefaultShadeColor() {
    let selectedCount = 0;

    for (let i = 0; i < calendarState.length; i++) {
      if (calendarState[i][columnID][blockID] === true) {
        selectedCount += 1;
      }
    }

    // if its not draggable -> just a participant group view
    // if it is draggble and is an admin -> admin group view
    // all other cases must just be a timeselect.
    const res = checkIfBlockIsAdminSelection();

    if (res != '') {
      return res;
    }

    if (!isDraggable || (isDraggable && isAdmin)) {
      // one of the groupviews

      const percentageSelected = selectedCount / calendarState.length;
      // green-200
      // const start_shade = '#A7F3D0'
      const start_shade = '#A0F4E4';
      // green-500
      // const end_shade = '#10B981'
      const end_shade = '#4D7C0F';

      if (selectedCount === 0) {
        return 'white';
      } else {
        return interpolateColor(start_shade, end_shade, percentageSelected);
      }
    } else {
      // timeselect - shade color is just going to be sky
      return 'sky-200';
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

  // @ts-expect-error
  const [calendarState, setCalanderState] = theCalendarState;
  const [isDottedBorder, setIsDottedBorder] = useState(false);
  const [dragState, setDragState] = theDragState;
  // @ts-expect-error
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
    return isOnGcal ? 'gray-500' : 'white'; // always white unless it is a gcal block
  });

  // need this for some reason as well, investigate
  useEffect(() => {
    setUnshadeColor(isOnGcal ? 'gray-500' : 'white');
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
      (blockID == 0 || blockID == NUM_OF_TIME_BLOCKS)
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
        setShadeColor('#94D22E');
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

    // @ts-expect-error
    const [obtainedColumnID, obtainedBlockID] = touchedElement?.id
      ?.split('-')
      .map(Number);
    //

    if (obtainedBlockID === undefined) {
      return;
    }

    if (!isDraggable) {
      return;
    }

    setDragState((oldState) => ({
      ...oldState,
      dragEndedOnID: [obtainedColumnID, obtainedBlockID],
    }));
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

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  const handleBlockClick = () => {
    if (isTouchDevice()) {
      setGcalEventActive(!gCalEventActive);
      setTimeout(() => {
        setGcalEventActive(false);
      }, 3000);
    }

    if (isDraggable) {
      if (isAdmin === true) {
        return;
      }

      if (calendarState[user][columnID][blockID] === true) {
        const oldData = { ...calendarState };
        oldData[user][columnID][blockID] = false;
        setCalanderState(oldData);
      } else {
        const oldData = { ...calendarState };
        oldData[user][columnID][blockID] = true;
        setCalanderState(oldData);
      }
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

    // @ts-expect-error
    const [obtainedColumnID, obtainedBlockID] = touchedElement?.id
      ?.split('-')
      .map(Number);
    if (chartedUsers != undefined) {
      for (let i = 0; i < chartedUsers.users.length; i++) {
        const user = chartedUsers.users[i];
        const oldData = { ...calendarState };

        const indexOfCol = obtainedColumnID;

        if (
          oldData[user.id][indexOfCol][obtainedBlockID] == true ||
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

  const borderTop = is30Minute ? '1px dotted #000' : 'none';

  return (
    <>
      {/* Container for relative positioning */}
      <div style={{ position: 'relative' }}>
        {/* Main draggable content */}
        <div
          draggable="true"
          id={elementId}
          ref={dragRef}
          onClick={handleBlockClick}
          onDragStart={handleDragStart}
          onDragEnter={handleDesktopAvailabilitySelect}
          onDragOver={handleDesktopAvailabilitySelect}
          onMouseOver={handleDesktopHoverChartedUser}
          onMouseEnter={() => {
            setGcalEventActive(true);
          }}
          onTouchStart={() => {
            setGcalEventActive(true);
            if (!isDraggable) {
              return;
            }

            const dragStartEvent = new DragEvent('dragstart', {
              bubbles: true,
              cancelable: true,
              dataTransfer: new DataTransfer(),
            });

            // This will trigger the dragStart handler.
            if (dragRef.current) {
              dragRef.current.dispatchEvent(dragStartEvent);
            }

            handleDesktopHoverChartedUser();
          }}
          onTouchMove={(e) => {
            handleMobileAvailabilitySelect(e);
            handleMobileHoverChartedUser(e);
          }}
          onTouchEnd={() => {
            setGcalEventActive(false);
            handleMouseOrTouchLeaveBlock();
          }}
          onMouseLeave={() => {
            setGcalEventActive(false);
            setIsDottedBorder(false);
            handleMouseOrTouchLeaveBlock();
          }}
          className={
            (!isDraggable || (isDraggable && isAdmin)) === false
              ? calendarState?.[user]?.[columnID]?.[blockID]
                ? `bg-${shadeColor} flex-1 w-16 p-0 h-3 touch-none`
                : `bg-${unShadeColor} flex-1 w-16 p-0 h-3 touch-none`
              : `bg-${shadeColor} flex-1 w-16 p-0 h-3 touch-none`
          }
          style={{
            borderRight: '1px solid #000',
            borderTop,
            backgroundColor: shadeColor,
            transition: 'background-color 0.2s ease',
          }}
        ></div>
        {gCalEventActive && associatedEvents?.length > 0 && (
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
            // style={{ minWidth: '150px', opacity: gCalEventActive ? 1 : 0 }}
          >
            {associatedEvents.map((gEvent: any) => {
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
