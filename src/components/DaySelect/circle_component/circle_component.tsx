import * as React from 'react'
import './circle_component.css'

import { useState, useEffect } from 'react'

type Holidays = Record<string, Date | Date[]>

export const CircleComponent = (props: any) => {
  // Holidays found here: https://your.yale.edu/work-yale/benefits/paid-time/official-yale-holidays
  const holidays: Holidays = {
    'New Year\'s Day': new Date(2000, 0, 1),
    'MLK Jr Day': new Date(2000, 0, 15),
    'Spring Break': Array.from({ length: 16 }, (_, i) => new Date(2000, 2, 9 + i)),
    // 'Good Friday': new Date(2000, 2, 29),
    // 'Memorial Day': new Date(2000, 4, 27),
    // 'Juneteenth': new Date(2000, 5, 19),
    'Fourth of July': new Date(2000, 6, 4),
    'Labor Day': new Date(2000, 8, 2),
    'October Break': Array.from({ length: 5 }, (_, i) => new Date(2000, 9, 16 + i)),
    'Thanksgiving Day': new Date(2000, 10, 28),
    'November Break': Array.from({ length: 9 }, (_, i) => new Date(2000, 10, 23 + i)),
    'Christmas Day': new Date(2000, 11, 25)
  }

  const isHoliday = (date: Date) => {
    const month = date.getMonth()
    const day = date.getDate()

    for (const holiday in holidays) {
      const holidayDate = holidays[holiday]
      if (Array.isArray(holidayDate)) {
        if (holidayDate.some(hd => hd.getMonth() === month && hd.getDate() === day)) {
          return {
            isHoliday: true,
            holidayName: holiday
          }
        }
      } else if (holidayDate.getMonth() === month && holidayDate.getDate() === day) {
        return {
          isHoliday: true,
          holidayName: holiday
        }
      }
    }

    return {
      isHoliday: false,
      holidayName: null
    }
  }

  const holidayMetadata = isHoliday(props.date)

  const [isSelected, setIsSelected] = useState(false)

  const [active, toggleActive] = useState((props.isActive ? 'active-circle' : 'not-active-circle'))

  const handleToggleActive = () => {
    if (active.localeCompare('not-active-circle') === 0) {
      toggleActive('active-circle')
      props.add(props.date)
      setIsSelected(true)
    } else {
      toggleActive('not-active-circle')
      props.remove(props.date)
      setIsSelected(false)
    }
  }

  return (
    <div className={`circle ${active}`}>
      {
        holidayMetadata.isHoliday
          ? <button className={`circle-button ${active}`} onClick={handleToggleActive} data-tooltip-id="holiday-tooltip" data-tooltip-content={`${holidayMetadata.holidayName}`} >
          {props.date.getDate()}
        </button>
          : <button className={`circle-button ${active}`} onClick={handleToggleActive} >
        {props.date.getDate()}
        </button>
      }
      {
        holidayMetadata.isHoliday
          ? <div className={`holiday-indicator ${isSelected ? 'selected' : ''}`}></div>
          : null
      }
    </div>
  )
}
