import SelectCalander from "../../scheduleComponents/calendarComponents/SelectCalendar";
import GroupAvailCal from "../GroupAvailCal";
import { useState } from "react";
import UserChart from "../../scheduleComponents/hoverViewComponents/UserChart";
import { calanderState, userData } from "../../scheduleComponents/scheduletypes";
import { calendarDimensions } from "../../scheduleComponents/scheduletypes";
import eventAPI from "../../../eventAPI";

export default function GroupViewApp() {
    const testData = eventAPI.getTestData()
    const [chartedUsers, setChartedUsers] = useState<userData>(testData.userData)
    const [calendarState, setCalendarState] = useState<calanderState>(testData.scheduleData);
    const [calendarFramework, setCalendarFramework] = useState<calendarDimensions>(testData.dateData)

    return (
      <>
         <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-start-1 col-span-1"> 
                  <GroupAvailCal 
                      theCalendarState={[calendarState, setCalendarState]}
                      theCalendarFramework={[calendarFramework, setCalendarFramework] }
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                      draggable={false}
                  />
                </div>
                <div className="grid col-start-2 col-span-1">
                    <UserChart 
                      chartedUsersData={[chartedUsers, setChartedUsers]}
                    />
                </div>
        </div>
      </>
    )

}