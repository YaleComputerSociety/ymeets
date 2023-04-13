
import './App.css';
import React, { useState } from 'react';
import DisplayScreen from './DisplayScreen';
import DisplayScreenCombine from './DisplayScreenCombine';
import SelectComponent from "./SelectComponent";
import { Link } from 'react-router-dom';
// import DisplayScreenAdmin from '../DisplayScreenAdmin'; split


function App() {
  //Index of the current contigious chunk being displayed
  const[currIndex, setCurrentIndex] = useState(0)
  
  //-------------------------------------------------------------------------------------------------------------------------------------------
  //Hardcoded availability 3d array: List of 2d arrays, each 2d array representing one contigious chunk of time. 
  //The first array is 3x44, the second is 3x8. There are 3 of these 3D arrays for each hardcoded participant
  let listOfArrays = [];
  for (let k = 0; k < 2 ; k++) {
        if (k === 0) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 44; j++) {
              array2D[i][j] = 0;
            }    
        }
        listOfArrays.push(array2D);
        }
        if (k === 1) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 8; j++) {
              array2D[i][j] = 1;
            }    
        }
        listOfArrays.push(array2D);
        }   
  }

  let listOfArrays2 = [];
  for (let k = 0; k < 2 ; k++) {
        if (k === 0) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 44; j++) {
              array2D[i][j] = 1;
            }    
        }
        listOfArrays2.push(array2D);
        }
        if (k === 1) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 8; j++) {
              array2D[i][j] = 1;
            }    
        }
        listOfArrays2.push(array2D);
        }  
  }

  let listOfArrays3 = [];
  for (let k = 0; k < 2 ; k++) {
        if (k === 0) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 44; j++) {
              array2D[i][j] = 0;
            }    
        }
        listOfArrays3.push(array2D);
        }
        if (k === 1) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 8; j++) {
              array2D[i][j] = 1;
            }    
        }
        listOfArrays3.push(array2D);
        }  
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------


  //Turning availability 3D arrays to states for dynamic updating
  const [array3D] = useState(listOfArrays)
  const [array3D2] = useState(listOfArrays2)
  const [array3D3] = useState(listOfArrays3)
  //const [array3D, setArray3D] = useState(listOfArrays)
  //const [array3D2, setArray3D2] = useState(listOfArrays)
  //const [array3D3, setArray3D3] = useState(listOfArrays)



  //Hardcoded Event, should get this from backend
  const event = {
    details: {startDate: [10, 14], endDate: [17, 16], startTime: [60, 0], endTime: [720, 120], location: "location"}, 
    participants: [{availability: array3D, name: "Eric"}, {availability: array3D2, name: "Tam"}, {availability: array3D3, name: "Burt"}]
  }

  //Array of Participant availabilities, this is a 4D array (list of 3D arrays)
  const arrayOfAvailabilities = []
  event.participants.forEach(p => {
    arrayOfAvailabilities.push(p.availability)
  })

 
  //Extracting event details 
  const {startDate, endDate, startTime, endTime, location} = event.details;

  //Index of current participant 
  const currParticipant = 1


  //"currParticipantAvailability" is the 3D array corresponding of the current participant
  const [currParticipantAvailability, setCurrParticipantAvailability] = useState(event.participants[currParticipant].availability)


  //"passingInAvailability" is the current chunk (2D array) that will be displayed. This changes when we click "next"/"prev"
  const passingInAvailability = currParticipantAvailability[currIndex]
  //Start/End date/time
  const passingInStartDate = startDate[currIndex]
  const passingInEndDate = endDate[currIndex]
  const passingInStartTime = startTime[currIndex]
  const passingInEndTime = endTime[currIndex]




  //3D array of merged availability 3D arrays (for group calendar view)
  let mergedAvailabilities = [];

  for (let a = 0; a < arrayOfAvailabilities.length; a++) {
    let arr = arrayOfAvailabilities[a];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[i].length; j++) {
        let arraySize = arr[i][j].length;
        if (!mergedAvailabilities[i]) mergedAvailabilities[i] = []; 
        if (!mergedAvailabilities[i][j]) mergedAvailabilities[i][j] = new Array(arraySize).fill(0); 
        for (let k = 0; k < arraySize; k++) {
          mergedAvailabilities[i][j][k] += arr[i][j][k]; 
        }
      }
    }
  }


  //Availability 3D array initiazlied with empty arrays instead of 0 or 1. This will be dynamically filled with the participants that select the corresponding time slots
  //For hover feature (displaying list of available people when hovering over a time slot)
  let listOfArraysNames = [];
  for (let k = 0; k < 2 ; k++) {
        if (k === 0) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 44; j++) {
              array2D[i][j] = [];
            }    
        }
        listOfArraysNames.push(array2D);
        }
        if (k === 1) {
          const array2D = [];
          for (let i = 0; i < 3; i++) {
            array2D[i] = [];
            for (let j = 0; j < 8; j++) {
              array2D[i][j] = [];
            }    
        }
        listOfArraysNames.push(array2D);
        }
        
  }
  
  for (let a = 0; a < arrayOfAvailabilities.length; a++) {

    let currParticipantName = event.participants[a].name;
    for (let b = 0; b < arrayOfAvailabilities[a].length; b++) {
      for (let c = 0; c < arrayOfAvailabilities[a][b].length; c++) {
        for (let d = 0; d < arrayOfAvailabilities[a][b][c].length; d++) {
          if (arrayOfAvailabilities[a][b][c][d] === 1) {
            listOfArraysNames[b][c][d].push(currParticipantName)
          }
        }
      }
    }
  }

  //console.log("names", listOfArraysNames);

  //For group view
  const passingInMergedAvailability = mergedAvailabilities[currIndex]

//---------------Code for location select component------------------
//Won't need from here to after var totalvotes = []; line since this is just hardcoded data
class Person {
  constructor(vote) {
    this.vote = vote;
  }
}

const Nicholas = new Person("STERLING LIBRARY");
const Ethan = new Person("SSS");
const Jiakang = new Person("BASS LIBRARY");
const Lailah = new Person("STERLING LIBRARY");

//Make group a class once we have more 
const group = [
  Nicholas,
  Ethan,
  Jiakang,
  Lailah
]

var totalVotes = [];
//We would fill this with all the possible meeting locations
var voteArray = {
  "17 HILLHOUSE": 0,
  "ARTHUR K. WATSON HALL (AKW)": 0,
  "BASS LIBRARY": 0,
  "BECTON CENTER": 0,
  "DOW HALL": 0,
  "DUNHAM LABORATORY": 0,
  "HAAS FAMILY ARTS LIBRARY": 0,
  "HENRY R. LUCE HALL": 0,
  "HUMANITIES QUADRANGLE": 0,
  "KROON HALL": 0,
  "LEET OLIVER MEMORIAL HALL (LOM)": 0,
  "LINSLY-CHITTENDEN HALL (LC)": 0,
  "LORIA CENTER": 0,
  "OTHER": 0,
  "ROSENKRANZ HALL": 0,
  "SSS": 0,
  "STERLING MEMORIAL LIBRARY": 0,
  "TSAI CENTER": 0,
  "WATSON CENTER": 0,
  "WILLIAM L. HARKNESS HALL (WLH)": 0,
  "YALE SCHOOL OF MANAGEMENT": 0,
  "YALE SCIENCE BUILDING": 0
}

group.forEach(member => {
  auxtopasscorrvars(member);
});

function auxtopasscorrvars(member) {
  voteArray[member.vote]++;
}

const sortedVotes = Object.entries(voteArray).sort((a, b) => b[1] - a[1])

//We would fill this with all the possible meeting locations
const options = [
  { key: "17 HILLHOUSE", value: "17 HILLHOUSE" },
  { key: "ARTHUR K. WATSON HALL (AKW)", value: "ARTHUR K. WATSON HALL (AKW)" },
  { key: "BASS LIBRARY", value: "BASS LIBRARY" },
  { key: "BECTON CENTER", value: "BECTON CENTER" },
  { key: "DOW HALL", value: "DOW HALL" },
  { key: "DUNHAM LABORATORY", value: "DUNHAM LABORATORY" },
  { key: "HAAS FAMILY ARTS LIBRARY", value: "HAAS FAMILY ARTS LIBRARY" },
  { key: "HENRY R. LUCE HALL", value: "HENRY R. LUCE HALL" },
  { key: "HUMANITIES QUADRANGLE", value: "HUMANITIES QUADRANGLE" },
  { key: "KROON HALL", value: "KROON HALL" },
  { key: "LEET OLIVER MEMORIAL HALL (LOM)", value: "LEET OLIVER MEMORIAL HALL (LOM)" },
  { key: "LINSLY-CHITTENDEN HALL (LC)", value: "LINSLY-CHITTENDEN HALL (LC)" },
  { key: "LORIA CENTER", value: "LORIA CENTER" },
  { key: "OTHER", value: "OTHER" },
  { key: "ROSENKRANZ HALL", value: "ROSENKRANZ HALL" },
  { key: "SSS", value: "SSS" },
  { key: "STERLING MEMORIAL LIBRARY", value: "STERLING MEMORIAL LIBRARY" },
  { key: "TSAI CENTER", value: "TSAI CENTER" },
  { key: "WATSON CENTER", value: "WATSON CENTER" },
  { key: "WILLIAM L. HARKNESS HALL (WLH)", value: "WILLIAM L. HARKNESS HALL (WLH)" },
  { key: "YALE SCHOOL OF MANAGEMENT", value: "YALE SCHOOL OF MANAGEMENT" },
  { KEY: "YALE SCIENCE BUILDING", value: "YALE SCIENCE BUILDING" }
];

const [clickedLocation, setClickedLocation] = useState(null);

  const handleRowClick = (location) => {
    setClickedLocation(location);
  };
  
const [selectedOption, setSelectedOption] = useState("");
  

  return (
    <>
    <div className='schedulesdiv'>
      <div className='schedulee'>
        <h1 className='scheduleetitle'>Your Availability</h1>
        <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
        <DisplayScreen className='scheduleedays'
      startDate={passingInStartDate} 
      endDate={passingInEndDate} startTime={passingInStartTime} 
      endTime={passingInEndTime} availability={passingInAvailability} 
      setArray3D={setCurrParticipantAvailability} currIndex={currIndex} 
      />
      <button className = "next button" onClick={() => {console.log(startDate); if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
      </div>
        
      {/* <div className='combine' style={{marginTop: "20rem"}}> */}
      <div className='combine'>
        <h1 className='combinetitle'>Group Availability</h1>
        <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
        <DisplayScreenCombine
      startDate={passingInStartDate} 
      endDate={passingInEndDate} startTime={passingInStartTime} 
      endTime={passingInEndTime} availability={passingInMergedAvailability} 
      currIndex={currIndex} />
          <button className = "next button" onClick={() => {if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
      </div>
    </div>

    {/* - - - - - - Location Select Component - - - - - - */}
    <div className='memberselectdiv'>
      <div className='dropdownandbutton'>
        <div className = "memberselect">
          <SelectComponent
            options={options}
            onChange={(item) => setSelectedOption(item)}
            selectedKey={selectedOption}
            placeholder={"Select your preferred location"}
          />
        </div>
        <div className="next-button-wrapper1">
          <Link to='/dayselect'>
            <button onClick={() => {console.log("hi");
                //Firebase Push (availability and preferred location)             
              }}>Submit</button>
          </Link>
        </div>

      </div>
    </div>


      
    {/* <div className='admin' style={{marginTop: "20rem"}}>
      <button className = "prev button" onClick={() => {if(currIndex !== 0) {setCurrentIndex(currIndex - 1)}}}>{"<"}</button> 
      <DisplayScreenAdmin
    startDate={passingInStartDate} 
    endDate={passingInEndDate} startTime={passingInStartTime} 
    endTime={passingInEndTime} availability={passingInMergedAvailability} 
    currIndex={currIndex} 
    listOfArraysNames = {listOfArraysNames}/>
       <button className = "next button" onClick={() => {if(currIndex !== arrayOfAvailabilities.length - 2) {setCurrentIndex(currIndex + 1)}}}>{">"}</button>
    </div> split */}

    </>
  )
}

export default App;