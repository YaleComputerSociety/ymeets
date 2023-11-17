import * as React from "react";
import graphic from './calendargraphic.png';
// import background from '../landingpage/landingbackground.jpg'
import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/firebase";

export const LoginPageButtons = () => {
    const navigate = useNavigate();

    const handleSignInWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate('./landingpage');
        });
    }

    const handleSignInAnonymous = () => {
        signInAnonymously(auth).then(() => {
            navigate('./landingpage');
        });
    }
    return (
        <div className="min-h-screen h-fit w-screen bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 p-14 md:pt-32">
            <div className='flex-col-reverse md:flex-row flex md:h-1/2 justify-center'>
                <div className='justify-center mt-3 max-w-full min-w-[70%] md:w-[90%] self-center'>
                    <div className='flex flex-col w-full md:justify-end'>
                        <h1 className='flex text-2xl justify-center md:text-3xl md:mb-3 lg:text-4xl'><b>Group meetings made easy.</b></h1>
                        <h3 className='flex justify-start p-2 pb-0 md:w-12/12 md:ml-[11%] lg:ml-[24%] lg:text-xl'>Find the optimal meeting time and location with ease with ymeets!</h3>
                        <h3 className='flex justify-start p-2 pb-0 md:w-12/12 md:ml-[11%] lg:ml-[24%] lg:text-xl'>Now featuring:</h3>
                        <ul className='list-disc pl-4 md:ml-[13%] lg:ml-[26%]'>
                            <li className="p-1 md:p-0 lg:text-xl">Aggregated availabilities and location preferences for your group</li>
                            <li className="p-1 md:p-0 lg:text-xl">Yale-specific location preference options</li>
                            <li className="p-1 md:p-0 lg:text-xl">Integrated key academic dates and holidays on the calendar</li>
                        </ul>
                    </div>
                    <div className='flex flex-col md:flex-row justify-center items-center w-full my-8'>
                        <div className='flex text-center w-full justify-center lg:ml-[12%]'>
                            <button className='flex shadow-custom bg-blue-900 text-white justify-center rounded-lg cursor-pointer min-w-[80%] text-lg p-2 md:p-3 md:w-11/12 lg:min-w-[0%] lg:w-[80%] transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none' onClick={() => {handleSignInWithGoogle()}}>Sign In with Google</button>
                        </div>
                        <div className='flex text-center w-full justify-center mt-8 md:mt-0'>
                            <button className='flex shadow-custom bg-blue-900 text-white justify-center rounded-lg cursor-pointer min-w-[80%] text-lg p-2 md:p-3 md:w-11/12 lg:min-w-[0%] lg:w-[80%] transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none' onClick={() => {handleSignInAnonymous()}}>Continue without Login</button>
                        </div>
                    </div>
                </div>
                <div className='flex md:w-[40%] justify-center pb-7 md:pb-0 md:pl-7'>
                    <img src={graphic} alt="graphic" className='w-1/2 max-w-xs md:h-auto md:w-full self-center transform transition-transform hover:scale-90 active:scale-100'/>
                </div>
        </div>
        </div>
    );
}

