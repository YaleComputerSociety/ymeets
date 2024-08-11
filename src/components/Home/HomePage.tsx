import * as React from "react";
// import background from '../landingpage/landingbackground.jpg'
import {useNavigate} from 'react-router-dom';
import { checkIfLoggedIn, getEventById } from '../../firebase/events';
import graphic from './calendargraphic.png';
import LoginPopup from "../utils/components/LoginPopup";
import Footer from "../utils/components/Footer";
import Button from "../utils/components/Button";
import ButtonSmall from "../utils/components/ButtonSmall";
import Banner from "../utils/components/Banner";
import InformationPopup from "../utils/components/InformationPopup";
export default function HomePage()  {
    const navigate = useNavigate();
    const [showInput, setShowInput] = React.useState(true)
    const [eventCode, setEventCode] = React.useState("");
    const [showLoginPopup, setShowLoginPopup] = React.useState<boolean>(false);
    const [showFormValidation, setShowFormValidation] = React.useState<boolean>(false);
    const [formErrorMessage, setFormErrorMessage] = React.useState("")

    function formValidationPopup(message : string){
        setShowFormValidation(true);
        setFormErrorMessage(message);
    }
    const showEventInput = () => {
        setShowInput(!showInput)
    }  
    const updateEventCode = (event: React.BaseSyntheticEvent<KeyboardEvent>) => {
        setEventCode(event.target.value)
    }
    const handleKeyPress = (e: any) => {
        if (e.key == 'Enter') {
            signInAndGoToEvent();
        }
    }
    const goToEvent = () => {
        getEventById(eventCode).then((result) => {
            navigate('/timeselect/' + eventCode);

        }).catch((err) => {
            console.log(err);
            formValidationPopup('Code is invalid.');
        });
    }
    const signInAndGoToEvent = () => {
        if (eventCode.length != 6){
            formValidationPopup("Codes are 6 characters long.")
        }
        else if (checkIfLoggedIn()) {
            goToEvent();
        } else {
            setShowLoginPopup(true);
        }
    }
    const handleLoginPopupClose = (successFlag?: boolean) => {
        setShowLoginPopup(false);
        if (successFlag) { // instead of checkIfLoggedIn because login is async
            goToEvent();
        }
    };

    return (
        <>
        <div className="md:h-6"></div>
        <div className="h-fit w-full overflow-auto bg-sky-100 p-8 sm:p-14 pt-0 \
                        md:px-16 md:pt-14 lg:px-40 xl:px-60">
            <div className='flex-col-reverse justify-center \ 
                            md:flex-row flex md:h-1/2 mb-8'>
                <div className='justify-center self-center space-y-8 md:space-y-12 mt-3 max-w-full mb-4 min-w-[70%] md:w-[90%]'>
                    <div className='flex flex-col space-y-3 md:space-y-7 w-full md:justify-end'>
                        <h1 className='font-bold text-center text-4xl sm:text-5xl md:text-left xl:text-5xl md:pr-8'>A cleaner, faster way to schedule meetings.</h1>
                        <h3 className='text-gray-600 text-center text-xl sm:text-3xl md:text-left xl:text-3xl md:pr-8'>ymeets is a platform to plan gatherings at Yale more efficiently</h3>
                    </div>
                    <div className='flex flex-col justify-center items-center space-y-5 \
                                    md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0'>
                        <Button bgColor="blue-500" textColor="white" onClick={() => navigate("/dayselect")}>I'm a Host</Button> 
                        <button className={!showInput ? "hidden" : 'font-bold rounded-full bg-white text-black py-4 px-7 text-md transform transition-transform hover:scale-90 active:scale-100 mb-4'} onClick={() => {showEventInput()}}>I'm a Participant</button>
                        <div className={showInput ? "hidden" : "flex flex-nowrap relative"}>
                            <label className="hidden" htmlFor="eventCode">Event Code</label>
                            <input className="rounded-l-full text-center py-4 px-4 text-lg focus:outline-blue-500"
                                    placeholder="Enter your event code"
                                    name="eventCode"
                                    onInput={updateEventCode}
                                    onKeyDown={handleKeyPress}
                                    autoComplete="off"/>
                            <button className="rounded-r-full font-bold bg-white text-black py-4 px-4 text-lg hover:text-blue-500"
                                    onClick={signInAndGoToEvent}> 
                                Join 
                            </button>
                            <div className={!showFormValidation ? "hidden" : "text-blue-500 absolute -bottom-10 text-center w-full"}>Try Again: {formErrorMessage}</div>
                        </div>
                    </div>
                </div>
                <div className='flex md:w-[40%] justify-center pb-1 md:pb-4 sm:pb-7 md:pb-0 md:pl-0'>
                    <img src={graphic} alt="graphic" className=' w-[75%] sm:w-2/3 max-w-xs sm:h-auto sm:w-full self-center lg:w-[100%]'/>
                </div>
            </div>
            {showLoginPopup && <LoginPopup onClose={handleLoginPopupClose} enableAnonymousSignIn={true} />}
            <Footer />
        </div>
        </>
    );
}

