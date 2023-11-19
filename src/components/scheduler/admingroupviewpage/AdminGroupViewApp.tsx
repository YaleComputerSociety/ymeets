import SelectCalander from "../../scheduleComponents/calendarComponents/SelectCalendar";
import AdminCal from "../../schedulee/AdminCal";
import { useState } from "react";
import { calanderState, userData } from "../../scheduleComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/scheduletypes";
import eventAPI from "../../../eventAPI";

export default function AdminGroupViewApp() {
    const testData = eventAPI.getTestData()
    const [calendarState, setCalendarState] = useState<calanderState>(testData.scheduleDataFull);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)

    return (
      <>
         <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                  <AdminCal 
                      theCalendarState={[calendarState, setCalendarState]}
                      theCalendarFramework={[calendarFramework, setCalendarFramework] }
                      draggable={true}
                      isAdmin={true}
                  />
                </div>
        </div>
      </>
    )

}