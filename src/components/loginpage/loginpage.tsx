import * as React from "react";
// import background from '../landingpage/landingbackground.jpg'
import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";
import { checkIfLoggedIn, getEventById } from '../../firebase/events';
import graphic from './calendargraphic.png';
import LoginPopup from "../loginpopup";
import Footer from "../footer/Footer";

export const LoginPageButtons = () => {
    const navigate = useNavigate();
    const [showInput, setShowInput] = React.useState(true)
    const [eventCode, setEventCode] = React.useState("");
    const [showLoginPopup, setShowLoginPopup] = React.useState<boolean>(false);

    const handleSignInWithGoogle = () => {
        // if (!checkIfLoggedIn()) {
        //     signInWithGoogle().then(() => {
        //         navigate('./dayselect');
        //         return;
        //     });
        // }
        navigate('./dayselect');      
    }

    const showEventInput = () => {
        setShowInput(!showInput)
    }  
    const updateEventCode = (event: React.BaseSyntheticEvent<KeyboardEvent>) => {
        setEventCode(event.target.value)
    }
    const goToEvent = () => {
        getEventById(eventCode).then((result) => {
            navigate('/timeselect/' + eventCode);

        }).catch((err) => {
            console.log(err);
            console.log('Code is invalid.');
            navigate("/notfound")
        });
    }
    const signInAndGoToEvent = () => {
        if (eventCode.length != 6){
            alert("Codes are 6 characters long.")
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
        <div className="min-h-screen h-fit w-screen overflow-auto bg-sky-100 p-14 pt-0 \
                        md:px-16 md:pt-14 lg:px-40 xl:px-60">
            <div className='flex-col-reverse justify-center \ 
                            md:flex-row flex md:h-1/2'>
                <div className='justify-center self-center space-y-12 mt-3 max-w-full min-w-[70%] md:w-[90%]'>
                    <div className='flex flex-col space-y-10 w-full md:justify-end'>
                        <h1 className='font-bold text-center text-5xl md:text-left xl:text-5xl md:pr-8'>A cleaner, faster way to schedule meetings.</h1>
                        <h3 className='text-gray-600 text-center text-3xl md:text-left xl:text-3xl md:pr-8'>ymeets is a platform to plan gatherings at Yale more efficiently</h3>
                    </div>
                    <div className='flex flex-col justify-center items-center space-y-5 \
                                    md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0'>
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg \
                                           transform transition-transform hover:scale-90 active:scale-100e' 
                                           onClick={() => {handleSignInWithGoogle()}}>I'm a Host</button>
                        <button className={!showInput ? "hidden" : 'font-bold rounded-full bg-white text-black py-4 px-7 text-lg transform transition-transform hover:scale-90 active:scale-100 mb-4'} onClick={() => {showEventInput()}}>I'm a Participant</button>
                        <div className={showInput ? "hidden" : "flex flex-nowrap"}>
                            <label className="hidden" htmlFor="eventCode">Event Code</label>
                            <input className="rounded-l-full text-center py-4 px-4 text-lg focus:outline-blue-500"
                                    placeholder="Enter your event code"
                                    name="eventCode"
                                    onInput={updateEventCode}
                                    autoComplete="off"/>
                            <button className="rounded-r-full font-bold bg-white text-black py-4 px-4 text-lg hover:text-blue-500"
                                    onClick={signInAndGoToEvent}> 
                                Join 
                            </button>
                        </div>
                    </div>
                </div>
                <div className='flex md:w-[40%] justify-center pb-7 md:pb-0 md:pl-0'>
                    <img src={graphic} alt="graphic" className='w-2/3 max-w-xs sm:h-auto sm:w-full self-center lg:w-[100%]'/>
                </div>
            </div>
            {showLoginPopup && <LoginPopup onClose={handleLoginPopupClose} enableAnonymousSignIn={true} />}
            <Footer />
        </div>
    );
}

