// import SelectCalander from "./SelectCalendar";
// import TimeColumn from "./TimeColumn"

// export default function AvailCal(props: any) {

//     const [calendarFramework, setCalendarFramework] = props.calendarFramework;
//     const [calendarState, setCalendarState] = props.calendarState;

//     return (
//         <>
//         <h1 className="text-4xl m-5 mb-0 font-bold">Your Availibility</h1>
//         <div className="border border-1 border-gray-600 m-5 w-fit">
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