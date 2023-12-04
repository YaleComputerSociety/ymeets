import * as React from "react";
// import background from '../landingpage/landingbackground.jpg'
import {useNavigate} from 'react-router-dom';
import { signInWithGoogle } from "../../firebase/auth";
import { signInAnonymously } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import graphic from './calendargraphic.png';

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
        <div className="min-h-screen h-fit w-screen bg-sky-100 p-14 pt-32 md:pt-48 md:px-16 lg:px-40 xl:px-60">
            <div className='flex-col-reverse md:flex-row flex md:h-1/2 justify-center'>
                <div className='justify-center self-center space-y-12 mt-3 max-w-full min-w-[70%] md:w-[90%]'>
                    <div className='flex flex-col space-y-10 w-full md:justify-end'>
                        <h1 className='font-bold text-center text-5xl md:text-left xl:text-6xl'>A cleaner, faster way to schedule meetings.</h1>
                        <h3 className='text-gray-600 text-center text-3xl md:text-left xl:text-4xl'>y/meets is a platform to plan gatherings in an efficent and Yale-specific manner. </h3>
                    </div>
                    <div className='flex flex-col justify-center items-center space-y-5 md:flex-row md:justify-start md:items-left md:space-x-12 md:space-y-0'>
                        <button className='font-bold rounded-full bg-blue-500 text-white py-4 px-7 text-lg transform transition-transform hover:scale-90 active:scale-100e' onClick={() => {handleSignInWithGoogle()}}>I'm a Host</button>
                        <button className='font-bold rounded-full bg-white text-black py-4 px-7 text-lg transform transition-transform hover:scale-90 active:scale-100' onClick={() => {handleSignInAnonymous()}}>I'm a Participant</button>
                    </div>
                </div>
                <div className='flex md:w-[40%] justify-center pb-7 md:pb-0 md:pl-7'>
                    <img src={graphic} alt="graphic" className='w-1/2 max-w-xs md:h-auto md:w-full self-center'/>
                </div>
            </div>
        </div>
    );
}

