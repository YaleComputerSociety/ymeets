
// import './App.css';
// import React, { useState } from 'react';
// // import DisplayScreen from './DisplayScreen'; was split
// import DisplayScreenCombine from './timeselectpage/DisplayScreenCombine';
// import DisplayScreenAdmin from '../DisplayScreenAdmin';


// function App() {
//   //Index of the current contigious chunk being displayed
//   const[currIndex, setCurrentIndex] = useState(0)
  
//   //-------------------------------------------------------------------------------------------------------------------------------------------
//   //Hardcoded availability 3d array: List of 2d arrays, each 2d array representing one contigious chunk of time. 
//   //The first array is 3x44, the second is 3x8. There are 3 of these 3D arrays for each hardcoded participant
//   let listOfArrays = [];
//   for (let k = 0; k < 2 ; k++) {
//         if (k === 0) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 44; j++) {
//               array2D[i][j] = 0;
//             }    
//         }
//         listOfArrays.push(array2D);
//         }
//         if (k === 1) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 8; j++) {
//               array2D[i][j] = 1;
//             }    
//         }
//         listOfArrays.push(array2D);
//         }   
//   }

//   let listOfArrays2 = [];
//   for (let k = 0; k < 2 ; k++) {
//         if (k === 0) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 44; j++) {
//               array2D[i][j] = 1;
//             }    
//         }
//         listOfArrays2.push(array2D);
//         }
//         if (k === 1) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 8; j++) {
//               array2D[i][j] = 1;
//             }    
//         }
//         listOfArrays2.push(array2D);
//         }  
//   }

//   let listOfArrays3 = [];
//   for (let k = 0; k < 2 ; k++) {
//         if (k === 0) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 44; j++) {
//               array2D[i][j] = 0;
//             }    
//         }
//         listOfArrays3.push(array2D);
//         }
//         if (k === 1) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 8; j++) {
//               array2D[i][j] = 1;
//             }    
//         }
//         listOfArrays3.push(array2D);
//         }  
//   }
//   //-------------------------------------------------------------------------------------------------------------------------------------------


//   //Turning availability 3D arrays to states for dynamic updating
//   const [array3D] = useState(listOfArrays)
//   const [array3D2] = useState(listOfArrays2)
//   const [array3D3] = useState(listOfArrays3)
//   //const [array3D, setArray3D] = useState(listOfArrays)
//   //const [array3D2, setArray3D2] = useState(listOfArrays)
//   //const [array3D3, setArray3D3] = useState(listOfArrays)



//   //Hardcoded Event, should get this from backend
//   const event = {
//     details: {startDate: [10, 14], endDate: [12, 16], startTime: [60, 0], endTime: [720, 120], location: "location"}, 
//     participants: [{availability: array3D, name: "Eric"}, {availability: array3D2, name: "Tam"}, {availability: array3D3, name: "Burt"}]
//   }

//   //Array of Participant availabilities, this is a 4D array (list of 3D arrays)
//   const arrayOfAvailabilities = []
//   event.participants.forEach(p => {
//     arrayOfAvailabilities.push(p.availability)
//   })

 
//   //Extracting event details 
//   const {startDate, endDate, startTime, endTime, location} = event.details;

//   //Index of current participant 
//   const currParticipant = 1


//   //"currParticipantAvailability" is the 3D array corresponding of the current participant
//   const [currParticipantAvailability, setCurrParticipantAvailability] = useState(event.participants[currParticipant].availability)


//   //"passingInAvailability" is the current chunk (2D array) that will be displayed. This changes when we click "next"/"prev"
//   const passingInAvailability = currParticipantAvailability[currIndex]
//   //Start/End date/time
//   const passingInStartDate = startDate[currIndex]
//   const passingInEndDate = endDate[currIndex]
//   const passingInStartTime = startTime[currIndex]
//   const passingInEndTime = endTime[currIndex]




//   //3D array of merged availability 3D arrays (for group calendar view)
//   let mergedAvailabilities = [];

//   for (let a = 0; a < arrayOfAvailabilities.length; a++) {
//     let arr = arrayOfAvailabilities[a];
//     for (let i = 0; i < arr.length; i++) {
//       for (let j = 0; j < arr[i].length; j++) {
//         let arraySize = arr[i][j].length;
//         if (!mergedAvailabilities[i]) mergedAvailabilities[i] = []; 
//         if (!mergedAvailabilities[i][j]) mergedAvailabilities[i][j] = new Array(arraySize).fill(0); 
//         for (let k = 0; k < arraySize; k++) {
//           mergedAvailabilities[i][j][k] += arr[i][j][k]; 
//         }
//       }
//     }
//   }


//   //Availability 3D array initiazlied with empty arrays instead of 0 or 1. This will be dynamically filled with the participants that select the corresponding time slots
//   //For hover feature (displaying list of available people when hovering over a time slot)
//   let listOfArraysNames = [];
//   for (let k = 0; k < 2 ; k++) {
//         if (k === 0) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 44; j++) {
//               array2D[i][j] = [];
//             }    
//         }
//         listOfArraysNames.push(array2D);
//         }
//         if (k === 1) {
//           const array2D = [];
//           for (let i = 0; i < 3; i++) {
//             array2D[i] = [];
//             for (let j = 0; j < 8; j++) {
//               array2D[i][j] = [];
//             }    
//         }
//         listOfArraysNames.push(array2D);
//         }
        
//   }
  
//   for (let a = 0; a < arrayOfAvailabilities.length; a++) {

//     let currParticipantName = event.participants[a].name;
//     for (let b = 0; b < arrayOfAvailabilities[a].length; b++) {
//       for (let c = 0; c < arrayOfAvailabilities[a][b].length; c++) {
//         for (let d = 0; d < arrayOfAvailabilities[a][b][c].length; d++) {
//           if (arrayOfAvailabilities[a][b][c][d] === 1) {
//             listOfArraysNames[b][c][d].push(currParticipantName)
//           }
//         }
//       }
//     }
//   }

//   //console.log("names", listOfArraysNames);

//   //For group view
//   const passingInMergedAvailability = mergedAvailabilities[currIndex]

//   return (
//     <>
    
//     {/* <div className='schedulee'>
//       <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
//       <DisplayScreen 
//     startDate={passingInStartDate} 
//     endDate={passingInEndDate} startTime={passingInStartTime} 
//     endTime={passingInEndTime} availability={passingInAvailability} 
//     setArray3D={setCurrParticipantAvailability} currIndex={currIndex} 
//     />
//      <button className = "next button" onClick={() => {if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
//     </div> split*/} 
      
//     <div className='combine' style={{marginTop: "20rem"}}>
//       <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
//       <DisplayScreenCombine
//     startDate={passingInStartDate} 
//     endDate={passingInEndDate} startTime={passingInStartTime} 
//     endTime={passingInEndTime} availability={passingInMergedAvailability} 
//     currIndex={currIndex} />
//         <button className = "next button" onClick={() => {if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
//     </div>
      
//     <div className='admin' style={{marginTop: "20rem"}}>
//       <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
//       <DisplayScreenAdmin
//     startDate={passingInStartDate} 
//     endDate={passingInEndDate} startTime={passingInStartTime} 
//     endTime={passingInEndTime} availability={passingInMergedAvailability} 
//     currIndex={currIndex} 
//     listOfArraysNames = {listOfArraysNames}/>
//        <button className = "next button" onClick={() => {if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
//     </div>

//     </>
//   )
// }

// export default App;

export {}