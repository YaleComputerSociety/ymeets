import './App.css';
import AvailCal from "./components/AvailCal"
import GroupAvailCal from "./components/GroupAvailCal"
import { useState, useEffect } from "react"
import { generateTimeBlocks } from "./utils/generateTimeBlocks"
import { getDatesFromRange } from "./utils/getDatesFromRange"
import { getDateWithDay } from "./utils/getDateWithDay"
import SelectComponent from "./SelectComponent";
import { Link, useNavigate, useParams } from 'react-router-dom';

//import "semantic-ui-css/semantic.min.css";


function App() {

    const [calendarState, setCalendarState] = useState({});

    const [calendarFramework, setCalendarFramework] = useState({
        theInputtedDates : ["2023-08-20", "2023-08-21", "2023-08-22", "2023-08-23", "2023-08-24", "2023-08-25", "2023-08-26",],
        theDates : [], // the day,  date object pair
        startTime : "10:00:00", 
        endTime : "23:32:00",
        numberOfColumns : 0
    })

    let numberOfBlocks = generateTimeBlocks(calendarFramework.startTime, calendarFramework.endTime).length;

    const handleColumnDataUpdate = (colIndex) => {
        setCalendarState((prevDayColumnDockState) => ({
        ...prevDayColumnDockState,
        [colIndex]: Array.from({ length: numberOfBlocks }, (_, index) => undefined),
        }));
    };

    useEffect(() => {
        let dates = [];
        let curColIndex = 0;

        for (let i = 0; i < calendarFramework.theInputtedDates.length; i++) {
            let newDateWithDay = getDateWithDay(calendarFramework.theInputtedDates[i]);
            
            handleColumnDataUpdate(curColIndex);
            curColIndex += 1;
         
            dates.push(newDateWithDay);
        }

        console.log(dates);

        let oldFramework = {...calendarFramework};
        oldFramework.numberOfColumns = dates.length;
        oldFramework.theDates = dates;
        setCalendarFramework(oldFramework);
    }, []);


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
        "ARTHUR K. WATSON HALL": 0,
        "BASS LIBRARY": 0,
        "BECTON CENTER": 0,
        "DOW HALL": 0,
        "DUNHAM LABORATORY": 0,
        "HAAS FAMILY ARTS LIBRARY": 0,
        "HENRY R. LUCE HALL": 0,
        "HUMANITIES QUADRANGLE": 0,
        "KROON HALL": 0,
        "LEET OLIVER MEMORIAL HALL": 0,
        "LINSLY-CHITTENDEN HALL": 0,
        "LORIA CENTER": 0,
        "OTHER": 0,
        "ROSENKRANZ HALL": 0,
        "SSS": 0,
        "STERLING MEMORIAL LIBRARY": 0,
        "TSAI CENTER": 0,
        "WATSON CENTER": 0,
        "WILLIAM L. HARKNESS HALL": 0,
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
        { key: "ARTHUR K. WATSON HALL", value: "ARTHUR K. WATSON HALL" },
        { key: "BASS LIBRARY", value: "BASS LIBRARY" },
        { key: "BECTON CENTER", value: "BECTON CENTER" },
        { key: "DOW HALL", value: "DOW HALL" },
        { key: "DUNHAM LABORATORY", value: "DUNHAM LABORATORY" },
        { key: "HAAS FAMILY ARTS LIBRARY", value: "HAAS FAMILY ARTS LIBRARY" },
        { key: "HENRY R. LUCE HALL", value: "HENRY R. LUCE HALL" },
        { key: "HUMANITIES QUADRANGLE", value: "HUMANITIES QUADRANGLE" },
        { key: "KROON HALL", value: "KROON HALL" },
        { key: "LEET OLIVER MEMORIAL HALL", value: "LEET OLIVER MEMORIAL HALL" },
        { key: "LINSLY-CHITTENDEN HALL", value: "LINSLY-CHITTENDEN HALL" },
        { key: "LORIA CENTER", value: "LORIA CENTER" },
        { key: "OTHER", value: "OTHER" },
        { key: "ROSENKRANZ HALL", value: "ROSENKRANZ HALL" },
        { key: "SSS", value: "SSS" },
        { key: "STERLING MEMORIAL LIBRARY", value: "STERLING MEMORIAL LIBRARY" },
        { key: "TSAI CENTER", value: "TSAI CENTER" },
        { key: "WATSON CENTER", value: "WATSON CENTER" },
        { key: "WILLIAM L. HARKNESS HALL", value: "WILLIAM L. HARKNESS HALL" },
        { key: "YALE SCHOOL OF MANAGEMENT", value: "YALE SCHOOL OF MANAGEMENT" },
        { KEY: "YALE SCIENCE BUILDING", value: "YALE SCIENCE BUILDING" }
    ];
    
    const [clickedLocation, setClickedLocation] = useState(null);
    
        const handleRowClick = (location) => {
        setClickedLocation(location);
        };
        
    const [selectedOption, setSelectedOption] = useState("");

    return (
        <div>

            <div className="grid grid-cols-2 grid-rows-1 font-roboto mx-8">
                <div className="grid col-span-1"> 
                <AvailCal 
                    calendarState={[calendarState, setCalendarState]}
                    calendarFramework={[calendarFramework, setCalendarFramework] }
                />
                </div>
                <div className="grid col-span-1"> 

                <GroupAvailCal 
                    calendarState={ [calendarState, setCalendarState]}
                    calendarFramework={[calendarFramework, setCalendarFramework]}
                />
                </div>

            </div>

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
                        <Link to='/groupview'>
                        <button onClick={() => {console.log("hi");
                            //Firebase Push (individual availability and preferred location, updating group availability)     
                            }}>Submit</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App;
