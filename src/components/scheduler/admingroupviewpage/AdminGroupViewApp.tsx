import SelectCalander from "../../scheduleComponents/calendarComponents/SelectCalendar";
import { useState } from "react";
import { calanderState, userData } from "../../scheduleComponents/calendarComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/calendarComponents/scheduletypes";
import eventAPI from "../../../eventAPI";
import Calendar from "../../scheduleComponents/calendarComponents/CalendarApp"

export default function AdminGroupViewApp() {
    const testData = eventAPI.getTestData()
    const [calendarState, setCalendarState] = useState<calanderState>({...testData.scheduleDataFull});
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)
  
    return (
      <>
         <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                <Calendar 
                  title={"Avalaibility - Admin"}
                  theCalendarState={[calendarState, setCalendarState]}
                  theCalendarFramework={[calendarFramework, setCalendarFramework]}
                  draggable={true}
                  isAdmin={true}
                  user={0}
                />
                </div>
        </div>
      </>
    )

}