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

  // Initialize chartedUsers
  useEffect(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        available: [],
        unavailable: [...chartedUsers.users],
      });
    }
  }, []);

  const showTooltipWithTimeout = () => {
    setShowTooltip(true);
    setIsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setShowTooltip(false), 300);
    }, 2000);
  };

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
    return calendarState[user]?.[columnID]?.[blockID] === true;
  }, [calendarState, user, columnID, blockID]);

  const isInSelection = useCallback((): boolean => {
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
    return isOnGcal ? '#6B7280' : theme === 'light' ? 'white' : '#2d3748';
  }, [isOnGcal, theme]);

  const getGroupPercentageColor = useCallback(() => {
    let selectedCount = 0;
    const totalUsers = Object.keys(calendarState).length;

    for (let i = 0; i < totalUsers; i++) {
      if (calendarState[i]?.[columnID]?.[blockID] === true) {
        selectedCount += 1;
      }
    }

    if (selectedCount === 0) {
      return getDefaultColor();
    }

    const percentageSelected = selectedCount / totalUsers;
    return interpolateColor('#bbd5fc', '#4b86de', percentageSelected);
  }, [calendarState, columnID, blockID, getDefaultColor]);

  const [shadeColor, setShadeColor] = useState(getDefaultColor);

  // Update shade color when relevant props change
  useEffect(() => {
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

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!draggable || isAdmin) return;

      setCalendarState((prev) => {
        const newState = { ...prev };
        if (!newState[user]) newState[user] = [];
        if (!newState[user][columnID]) newState[user][columnID] = [];
        newState[user][columnID][blockID] = !newState[user][columnID][blockID];
        return newState;
      });

      onClick(event as any);
    },
    [draggable, isAdmin, user, columnID, blockID, setCalendarState, onClick]
  );

  const handleBlockClick = (e: any, fromTouch = false) => {
    onClick(e);

    if (draggable && !isAdmin) {
      const oldData = { ...calendarState };
      oldData[user][columnID][blockID] = !oldData[user][columnID][blockID];
      setCalendarState(oldData);
    }
  };

  const handleDesktopHoverChartedUser = useCallback(() => {
    if (!chartedUsers || !setChartedUsers) return;

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
      available: availableUsers,
      unavailable: unavailableUsers,
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

      console.log('here');

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

      console.log(availableUsers);
      console.log(unavailableUsers);

      setChartedUsers({
        users: chartedUsers.users,
        available: availableUsers,
        unavailable: unavailableUsers,
      });
    },
    [chartedUsers, setChartedUsers, calendarState]
  );

  const handleMouseOrTouchLeaveBlock = useCallback(() => {
    if (chartedUsers && setChartedUsers) {
      setChartedUsers({
        users: chartedUsers.users,
        available: [],
        unavailable: [...chartedUsers.users],
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

  const handleSelectionStart = useCallback(
    (event: any) => {
      if (!draggable) return;

      if ('dataTransfer' in event) {
        const crt = event.target.cloneNode(true);
        crt.style.position = 'absolute';
        crt.style.left = '-9999px';
        crt.style.opacity = '0';
        document.body.appendChild(crt);
        event.dataTransfer.setDragImage(crt, 0, 0);
      }

      dragStartTime.current = Date.now();

      const newSelectionMode = !isInSelection();

      if (!isAdmin) {
        setCalendarState((prev) => {
          const newState = { ...prev };
          if (!newState[user]) newState[user] = [];
          if (!newState[user][columnID]) newState[user][columnID] = [];
          newState[user][columnID][blockID] = newSelectionMode;
          return newState;
        });
      }

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
    ]
  );

  const handleSelectionMove = useCallback(
    (event: React.DragEvent | React.TouchEvent) => {
      if (
        !dragState.isSelecting ||
        !lastDragPoint.current ||
        !previousBoundingBox.current
      )
        return;

      const point = 'touches' in event ? event.touches[0] : event;
      const element = document.elementFromPoint(point.clientX, point.clientY);

      if (!element?.id?.includes('-')) return;

      const [newCol, newBlock] = element.id.split('-').map(Number);
      const [lastCol, lastBlock] = lastDragPoint.current;

      if (newCol === lastCol && newBlock === lastBlock) return;

      if (!dragState.startPoint) return;

      const currentBox = getBoundingBox(dragState.startPoint, [
        newCol,
        newBlock,
      ]);

      if (!isAdmin) {
        updateCalendarForBoundingBoxes(
          currentBox,
          previousBoundingBox.current,
          dragState.selectionMode
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
    [dragState, isAdmin, debouncedSetDragState, updateCalendarForBoundingBoxes]
  );

  const handleDragEnd = useCallback(
    (event: React.DragEvent | React.TouchEvent) => {
      if (dragStartTime.current && Date.now() - dragStartTime.current < 200) {
        handleClick(event as any);
      }

      if (isAdmin && dragState.startPoint && dragState.endPoint) {
        setDragState((prev) => {
          const currentBox = getBoundingBox(
            dragState.startPoint!,
            dragState.endPoint!
          );
          return {
            ...prev,
            isSelecting: false,
            completedSelections: [
              ...(prev.completedSelections || []),
              currentBox,
            ],
          };
        });
      } else {
        setDragState((prev) => ({ ...prev, isSelecting: false }));
      }
      lastDragPoint.current = null;
      previousBoundingBox.current = null;
      dragStartTime.current = null;
      debouncedSetDragState.cancel();
    },
    [isAdmin, setDragState, debouncedSetDragState, handleClick]
  );

  return (
    <div
      id={`${columnID}-${blockID}`}
      className={`
        cursor-pointer flex-1 w-full p-0 h-4 touch-none relative
        border-r border-[#7E7E7E]
        ${is30Minute ? 'border-t border-dotted border-t-[#7E7E7E]' : ''}
        transition-colors duration-200 ease-in-out
      `}
      style={{
        backgroundColor: shadeColor,
      }}
      draggable={draggable}
      onClick={handleBlockClick}
      onDragStart={handleSelectionStart}
      onDrag={handleSelectionMove}
      onDragEnd={handleDragEnd}
      onMouseOver={handleDesktopHoverChartedUser}
      onMouseEnter={() => isOnGcal && showTooltipWithTimeout()}
      onMouseLeave={() => {
        handleMouseOrTouchLeaveBlock();
      }}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        dragStartTime.current = Date.now();
        lastDragPoint.current = [touch.clientX, touch.clientY];
        handleMobileHoverChartedUser(e);
        handleSelectionStart(e);

        if (isOnGcal) {
          showTooltipWithTimeout();
        }
      }}
      onTouchMove={(e) => {
        if (theShowUserChart !== undefined) {
          setShowUserChart?.(false);
        }
        handleSelectionMove(e);
        handleMobileHoverChartedUser(e);

        if (isOnGcal) {
          const touch = e.touches[0];
          const [startX, startY] = lastDragPoint.current || [0, 0];
          if (
            Math.abs(touch.clientX - startX) > 10 ||
            Math.abs(touch.clientY - startY) > 10
          ) {
            setShowTooltip(false);
          }
        }
      }}
      onTouchEnd={(e) => {
        if (!isOnGcal) {
          handleDragEnd(e);
        } else {
          e.preventDefault();
          if (
            dragStartTime.current &&
            Date.now() - dragStartTime.current < 200
          ) {
            showTooltipWithTimeout();
            setCalendarState((prev) => {
              const newState = { ...prev };
              if (!newState[user]) newState[user] = [];
              if (!newState[user][columnID]) newState[user][columnID] = [];
              newState[user][columnID][blockID] =
                !newState[user][columnID][blockID];
              return newState;
            });
          }
        }
        dragStartTime.current = null;
        lastDragPoint.current = null;
      }}
    >
      {showTooltip && associatedEvents && associatedEvents.length > 0 && (
        <div
          className={`
            absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-48 max-w-64 left-0 -top-2 
            transform -translate-y-full transition-all duration-300 ease-in-out
            ${isVisible ? 'opacity-100' : 'opacity-0'}
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
