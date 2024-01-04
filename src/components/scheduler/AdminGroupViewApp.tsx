import SelectCalander from "../selectCalendarComponents/SelectCalendar";
import { useState } from "react";
import { calanderState, userData } from "../../types"
import { calendarDimensions } from  "../../types"
import eventAPI from "../../firebase/eventAPI";
import Calendar from "../selectCalendarComponents/CalendarApp"

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
                  chartedUsersData={undefined}
                />
                </div>
        </div>
      </>
    )

}