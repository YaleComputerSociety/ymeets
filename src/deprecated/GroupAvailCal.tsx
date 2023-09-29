// import TimeColumn from "../components/scheduleComponents/calendarComponents/TimeColumn"
// import SelectCalander from "../components/scheduleComponents/calendarComponents/SelectCalendar";

// export default function GroupAvailCal(props: any) {

//     const [calendarFramework, setCalendarFramework] = props.calendarFramework;
//     const [calendarState, setCalendarState] = props.calendarState;
    
//     return (

//         <>
//          <h1 className="text-4xl m-5 mb-0 font-bold">Group Availibility</h1>
//             <div className="border border-1 border-gray-600 m-5 w-fit">
//             <div className="flex">
//                 <TimeColumn 
//                     startTime={calendarFramework.startTime}
//                     endTime={calendarFramework.endTime}
//                 />
//                 <SelectCalander            
//                     calendarState={[calendarState, setCalendarState]}
//                     calendarFramework={[calendarFramework, setCalendarFramework]}
//                     startTime={calendarFramework.startTime}
//                     endTime={calendarFramework.endTime}
//                 />
//             </div>
//         </div>
//         </>
        
//     )

// }