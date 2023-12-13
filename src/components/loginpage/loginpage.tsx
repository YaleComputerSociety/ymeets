import * as React from "react";
import graphic from './calendargraphic.png';
import './loginpage.css';

import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import GoogleCalendarButton from "./GoogleCalendarButton";
import { getEventById } from "../../firebase/events";

export const LoginPageButtons = () => {
    const navigate = useNavigate();
    const [showInput, setShowInput] = React.useState(true)
    const [eventCode, setEventCode] = React.useState("")

    const handleSignInWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate('./dayselect');
        });
    }

    const showEventInput = () => {
        setShowInput(!showInput)
    }  
    const updateEventCode = (event: React.BaseSyntheticEvent<KeyboardEvent>) => {
        setEventCode(event.target.value)
    }
    const goToEvent = () => {
        if(eventCode.length != 6){
            alert("Codes are 6 characters long.")
        }
        else{
            getEventById(eventCode).then((result) => {
                navigate('/timeselect/' + eventCode);
    
            }).catch((err) => {
                console.log(err);
                alert('Code is invalid.');
            });
        }
    } 

    return (
        <div className='homepage'>
            {/* <h1 className='appName'>StudyBuddy</h1> */}
            <div className='aboutinfo'>
                <div className='slogan'>
                    <h1 className='slogantext'><b>Group meetings made easy.</b></h1>
                    <h3 className='moreinfo'>Find the optimal meeting time and location with ease with ymeets!</h3>
                    <h3 className='moreinfolistintro'>Now featuring:</h3>
                    <li className='moreinfolist'>Aggregated availabilities and location preferences for your group</li>
                    <li className='moreinfolist'>Yale-specific location preference options</li>
                    <li className='moreinfolist'>Integrated key academic dates and holidays on the calendar</li>
                </div>
                <div className='buttonslog'>
                    <div className='flex flex-col justify-center items-center space-y-5 \
                                    md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0'>
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg \
                                           transform transition-transform hover:scale-90 active:scale-100e' 
                                           onClick={() => {handleSignInWithGoogle()}}>I'm a Host</button>
                        <button className={!showInput ? "hidden" : 'font-bold rounded-full bg-white text-black py-4 px-7 text-lg transform transition-transform hover:scale-90 active:scale-100'} onClick={() => {showEventInput()}}>I'm a Participant</button>
                        <GoogleCalendarButton />
                        <div className={showInput ? "hidden" : "flex flex-nowrap"}>
                            <label className="hidden" htmlFor="eventCode">Event Code</label>
                            <input className="rounded-l-full text-center py-4 px-4 text-lg focus:outline-blue-500"
                                    placeholder="Enter your event code"
                                    name="eventCode"
                                    onInput={updateEventCode}
                                    autoComplete="off"/>
                            <button className="rounded-r-full font-bold bg-white text-black py-4 px-4 text-lg hover:text-blue-500"
                                    onClick={goToEvent}> 
                                Join 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='graphic'>
                <img src={graphic} className='graphicpic'></img>
            </div>
        </div>
    );
}

