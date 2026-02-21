import React, { useEffect, useState, useRef, useCallback } from 'react';
import { calendar_v3 } from 'googleapis';
import {
  calanderState,
  userData,
  user,
  calendarDimensions,
  dragProperties,
} from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import _ from 'lodash';

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
  chartedUsersData?: [userData, React.Dispatch<React.SetStateAction<userData>>];
  draggable: boolean;
  isAdmin?: boolean;
  user: number;
  is30Minute: boolean;
  theDragState: [
    dragProperties,
    React.Dispatch<React.SetStateAction<dragProperties>>,
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

interface BoundingBox {
  minCol: number;
  maxCol: number;
  minBlock: number;
  maxBlock: number;
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
  const [calendarFramework, setCalendarFramework] = theCalendarFramework;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [showUserChart, setShowUserChart] = theShowUserChart ?? [null, null];
  const [chartedUsers, setChartedUsers] = chartedUsersData || [null, null];
  const dragRef = useRef<HTMLDivElement>(null);
  const lastDragPoint = useRef<[number, number] | null>(null);
  const previousBoundingBox = useRef<BoundingBox | null>(null);
  const dragStartTime = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPointRef = useRef<readonly [number, number] | null>(null);
  const selectionModeRef = useRef(false);
  const hasDraggedRef = useRef(false);

  // Initialize chartedUsers
  useEffect(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        userIDs: chartedUsers.userIDs,
        available: [],
        unavailable: [...chartedUsers.users],
        hovering : false,
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

  // Helper functions for selection and color calculations
  const isBlockSelected = useCallback((): boolean => {
    if (blockID == -1) return false;
    return calendarState[user]?.[columnID]?.[blockID] === true;
  }, [calendarState, user, columnID, blockID]);

  const isInSelection = useCallback((): boolean => {
    if (blockID == -1) return false;

    if (dragState.isSelecting && dragState.startPoint && dragState.endPoint) {
      const currentBox = getBoundingBox(
        dragState.startPoint,
        dragState.endPoint
      );
      if (isInBox(columnID, blockID, currentBox)) {
        return dragState.selectionMode;
      }
    }

    if (isAdmin && dragState.completedSelections) {
      return dragState.completedSelections.some((box) =>
        isInBox(columnID, blockID, box)
      );
    }

    return calendarState[user]?.[columnID]?.[blockID] || false;
  }, [dragState, columnID, blockID, isAdmin, calendarState, user]);

  const getDefaultColor = useCallback(() => {
    if (!draggable) {
      return chartedUsers ? 'white' : theme === 'light' ? '#a8a8a8' : '#404040';
    }
    return theme === 'light' ? 'white' : '#2d3748';
  }, [theme, calendarFramework]);

  const getGroupPercentageColor = useCallback(() => {
    if (blockID == -1) {
      return getDefaultColor();
    }
    let selectedCount = 0;
    const totalUsers = chartedUsers?.users.length || 0;

    for (let i = 0; i < calendarState.length; i++) {
      if (
        calendarState[i]?.[columnID]?.[blockID] === true &&
        chartedUsers?.users.some((u) => u.id === i)
      ) {
        selectedCount += 1;
      }
    }

    if (selectedCount === 0) {
      return getDefaultColor();
    }

    const percentageSelected = selectedCount / totalUsers;
    return interpolateColor('#bbd5fc', '#4b86de', percentageSelected);
  }, [calendarState, columnID, blockID, getDefaultColor, chartedUsers?.users]);

  const [shadeColor, setShadeColor] = useState(getDefaultColor);

  // Update shade color when relevant props change
  useEffect(() => {
    if (blockID == -1) {
      setShadeColor(getDefaultColor());
      return;
    }

    if (!isAdmin && draggable) {
      setShadeColor(isBlockSelected() ? '#afcdfa' : getDefaultColor());
    } else {
      if (
        isAdmin &&
        dragState.startPoint &&
        dragState.endPoint &&
        isInBox(
          columnID,
          blockID,
          getBoundingBox(dragState.startPoint, dragState.endPoint)
        )
      ) {
        setShadeColor('#73dd64');
      } else {
        setShadeColor(getGroupPercentageColor());
      }
    }
  }, [
    isAdmin,
    draggable,
    dragState.isSelecting,
    isInSelection,
    isBlockSelected,
    getGroupPercentageColor,
    getDefaultColor,
    calendarFramework,
  ]);

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

  // Selection box utilities
  const getBoundingBox = (
    start: readonly [number, number],
    end: readonly [number, number]
  ): BoundingBox => {
    const [startCol, startBlock] = start;
    const [endCol, endBlock] = end;
    return {
      minCol: Math.min(startCol, endCol),
      maxCol: Math.max(startCol, endCol),
      minBlock: Math.min(startBlock, endBlock),
      maxBlock: Math.max(startBlock, endBlock),
    };
  };

  const isInBox = (col: number, block: number, box: BoundingBox): boolean => {
    return (
      col >= box.minCol &&
      col <= box.maxCol &&
      block >= box.minBlock &&
      block <= box.maxBlock
    );
  };

  const handleBlockClick = (e: any, fromTouch = false) => {
    if (blockID == -1) return;
    if (hasDraggedRef.current) return; 
    onClick(e);

    if (draggable && !isAdmin) {
      const oldData = { ...calendarState };
      oldData[user][columnID][blockID] = !oldData[user][columnID][blockID];
      setCalendarState(oldData);
    }
  };

  const handleDesktopHoverChartedUser = useCallback(() => {
    if (!chartedUsers || !setChartedUsers) return;

    if (blockID == -1) {
      return;
    }

    const availableUsers: user[] = [];
    const unavailableUsers: user[] = [];

    chartedUsers.users.forEach((user) => {
      if (calendarState[user.id]?.[columnID]?.[blockID] === true) {
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
      hovering : true,
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
        if (
          calendarState[user.id]?.[obtainedColumnID]?.[obtainedBlockID] === true
        ) {
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
        hovering : true,
      });
    },
    [chartedUsers, setChartedUsers, calendarState]
  );

  const handleMouseOrTouchLeaveBlock = useCallback(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        userIDs: chartedUsers.userIDs,
        available: [],
        unavailable: [...chartedUsers.users],
        hovering : true,
      });
    }
  }, [chartedUsers, setChartedUsers]);

  const debouncedSetDragState = useCallback(
    _.debounce((newState) => {
      setDragState(newState);
    }, 16),
    []
  );

  const updateCalendarForBoundingBoxes = useCallback(
    (
      currentBox: BoundingBox,
      prevBox: BoundingBox | null,
      selectionMode: boolean
    ) => {
      setCalendarState((prev) => {
        const newState = { ...prev };
        if (!newState[user]) newState[user] = [];

        for (let col = currentBox.minCol; col <= currentBox.maxCol; col++) {
          if (!newState[user][col]) newState[user][col] = [];
          for (
            let block = currentBox.minBlock;
            block <= currentBox.maxBlock;
            block++
          ) {
            newState[user][col][block] = selectionMode;
          }
        }

        if (prevBox) {
          for (let col = prevBox.minCol; col <= prevBox.maxCol; col++) {
            if (!newState[user][col]) newState[user][col] = [];
            for (
              let block = prevBox.minBlock;
              block <= prevBox.maxBlock;
              block++
            ) {
              if (!isInBox(col, block, currentBox)) {
                newState[user][col][block] = !selectionMode;
              }
            }
          }
        }

        return newState;
      });
    },
    [user, setCalendarState]
  );

  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (
        !isDraggingRef.current ||
        !lastDragPoint.current ||
        !previousBoundingBox.current ||
        !dragStartPointRef.current
      )
        return;

      const element = document.elementFromPoint(event.clientX, event.clientY);
      if (!element?.id?.includes('-')) return;
      const [newCol, newBlock] = element.id.split('-').map(Number);
      const [lastCol, lastBlock] = lastDragPoint.current;
      if (newCol === lastCol && newBlock === lastBlock) return;
      hasDraggedRef.current = true;

      const startPoint = dragStartPointRef.current;
      const mode = selectionModeRef.current;

      const intermediateBox = getBoundingBox(
        [lastCol, lastBlock],
        [newCol, newBlock]
      );

      const currentBox = getBoundingBox(startPoint, [newCol, newBlock]);
      if (!isAdmin) {
        updateCalendarForBoundingBoxes(intermediateBox, null, mode);
        updateCalendarForBoundingBoxes(
          currentBox,
          previousBoundingBox.current,
          mode
        );
      }

      previousBoundingBox.current = currentBox;

      debouncedSetDragState((prev: dragProperties) => ({
        ...prev,
        endPoint: [newCol, newBlock],
        lastPosition: [newCol, newBlock],
      }));

      lastDragPoint.current = [newCol, newBlock];
    },
    [isAdmin, debouncedSetDragState, updateCalendarForBoundingBoxes]
  );

  const handleDragEnd = useCallback(
    () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      isDraggingRef.current = false;

      if (isAdmin && dragStartPointRef.current) {
        setDragState((prev) => {
          if (prev.startPoint && prev.endPoint) {
            const currentBox = getBoundingBox(prev.startPoint, prev.endPoint);
            return {
              ...prev,
              isSelecting: false,
              completedSelections: [
                ...(prev.completedSelections || []),
                currentBox,
              ],
            };
          }
          return { ...prev, isSelecting: false };
        });
      } else {
        setDragState((prev) => ({ ...prev, isSelecting: false }));
      }
      lastDragPoint.current = null;
      previousBoundingBox.current = null;
      dragStartTime.current = null;
      dragStartPointRef.current = null;
      debouncedSetDragState.cancel();
    },
    [isAdmin, setDragState, debouncedSetDragState, handleGlobalMouseMove]
  );

  const handleSelectionStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!draggable) return;
      if (blockID == -1) return;

      event.preventDefault();

      dragStartTime.current = Date.now();

      const newSelectionMode = !isInSelection();

      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      dragStartPointRef.current = [columnID, blockID];
      selectionModeRef.current = newSelectionMode;

      setDragState({
        isSelecting: true,
        startPoint: [columnID, blockID],
        endPoint: [columnID, blockID],
        selectionMode: newSelectionMode,
        lastPosition: [columnID, blockID],
        completedSelections: dragState.completedSelections || [],
      });

      previousBoundingBox.current = {
        minCol: columnID,
        maxCol: columnID,
        minBlock: blockID,
        maxBlock: blockID,
      };

      lastDragPoint.current = [columnID, blockID];
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', () => handleDragEnd(), { once: true });
    },
    [
      draggable,
      isAdmin,
      isInSelection,
      columnID,
      blockID,
      setDragState,
      setCalendarState,
      user,
      dragState.completedSelections,
      handleDragEnd,
      handleGlobalMouseMove,
    ]
  );

  const handleSelectionMove = useCallback(
    (event: React.TouchEvent) => {
      if (
        !isDraggingRef.current ||
        !lastDragPoint.current ||
        !previousBoundingBox.current ||
        !dragStartPointRef.current
      )
        return;

      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);

      if (!element?.id?.includes('-')) return;

      const [newCol, newBlock] = element.id.split('-').map(Number);
      const [lastCol, lastBlock] = lastDragPoint.current;

      if (newCol === lastCol && newBlock === lastBlock) return;

      const startPoint = dragStartPointRef.current;
      const mode = selectionModeRef.current;

      const intermediateBox = getBoundingBox(
        [lastCol, lastBlock],
        [newCol, newBlock]
      );

      const currentBox = getBoundingBox(startPoint, [newCol, newBlock]);

      if (!isAdmin) {
        updateCalendarForBoundingBoxes(intermediateBox, null, mode);
        updateCalendarForBoundingBoxes(
          currentBox,
          previousBoundingBox.current,
          mode
        );
      }

      previousBoundingBox.current = currentBox;

      debouncedSetDragState((prev: dragProperties) => ({
        ...prev,
        endPoint: [newCol, newBlock],
        lastPosition: [newCol, newBlock],
      }));

      lastDragPoint.current = [newCol, newBlock];
    },
    [isAdmin, debouncedSetDragState, updateCalendarForBoundingBoxes]
  );

  // ${isInSelection() && is30Minute ? 'border-t-white' : ''}

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
      onClick={handleBlockClick}
      onMouseDown={handleSelectionStart}
      onMouseOver={() => {
        if (isOnGcal) {
          setShowTooltip(true);
        }

        handleDesktopHoverChartedUser();
      }}
      onMouseEnter={() => isOnGcal && setShowTooltip(true)}
      onMouseLeave={() => {
        handleMouseOrTouchLeaveBlock();
        setShowTooltip(false);
      }}
      onTouchStart={(e) => {
        if (blockID == -1) return;

        const touch = e.touches[0];
        dragStartTime.current = Date.now();
        lastDragPoint.current = [touch.clientX, touch.clientY];
        handleMobileHoverChartedUser(e);
        onClick(e as any);
      }}
      onTouchMove={(e) => {
        if (blockID == -1) return;

        if (theShowUserChart !== undefined) {
          setShowUserChart?.(false);
        }

        const touch = e.touches[0];
        const [startX, startY] = lastDragPoint.current || [0, 0];
        const hasMoved =
          Math.abs(touch.clientX - startX) > 10 ||
          Math.abs(touch.clientY - startY) > 10;

        if (hasMoved && !dragState.isSelecting) {
          handleSelectionStart(e);
        }

        if (dragState.isSelecting) {
          handleSelectionMove(e);
        }

        handleMobileHoverChartedUser(e);

        if (isOnGcal && hasMoved) {
          setShowTooltip(false);
        }
      }}
      onTouchEnd={(e) => {
        if (blockID == -1) return;

        e.preventDefault();

        const touchDuration = Date.now() - (dragStartTime.current || 0);
        const wasTap = touchDuration < 300 && !dragState.isSelecting;

        if (wasTap) {
          if (draggable && !isAdmin) {
            setCalendarState((prev) => {
              const newState = { ...prev };
              if (!newState[user]) newState[user] = [];
              if (!newState[user][columnID]) newState[user][columnID] = [];
              newState[user][columnID][blockID] =
                !newState[user][columnID][blockID];
              return newState;
            });
            onClick(e as any);
          }
        } else if (dragState.isSelecting) {
          handleDragEnd();
          onClick(e as any);
        }

        dragStartTime.current = null;
        lastDragPoint.current = null;
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
