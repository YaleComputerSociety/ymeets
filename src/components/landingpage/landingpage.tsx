import * as React from "react";
import { Link } from 'react-router-dom';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '../../firebase/events';
import graphic from '../loginpage/calendargraphic.png';

export const LandingPageButtons = () => {
    const [showEventCode, setShowEventCode] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleJoinClick = () => {
        console.log(input);
        if (input.length !== 6) {
            alert('Please enter a valid code.');
        } else {
            setError('');
            getEventById(input).then((result) => {
                // @ts-ignore
                if (result) {
                    // @ts-ignore
                    navigate('/timeselect', { code: input });
                } else {
                    alert('Please enter a valid code.');
                }
            }).catch(() => {
                alert('Please enter a valid code.');
            });
        }
    }

    return (
        <div className='bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 h-screen w-screen flex flex-col justify-center'>
            <div className='w-4/5 sm:w-4/6 md:w-1/2 mt-0 mx-auto flex justify-center items-center'>
                    <img src={graphic} alt="graphic" className='w-[120] h-64'></img>
            </div>
            <div className='w-4/5 sm:w-4/6 md:w-1/2 m-0 mx-auto'>
                <div className='text-center h-30 mb-16 mt-2'>
                    <Link to='/dayselect'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                </div>
                <div className='text-center h-30'>
                    <Link to='/landingpage'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-lg' onClick={() => {setShowEventCode(!showEventCode);}}>{!showEventCode ? "Use Event Code": "Using Event Code"}</button>
                    </Link>
                </div>
                {showEventCode && 
                <form onSubmit= {handleJoinClick} className='text-center h-30 flex flex-col mt-10 justify-center items-center'>
                    <input
                        type="text"
                        className="p-2 px-4 rounded-full text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-5/12 mx-auto"
                        placeholder="Enter Event Code"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className='mt-5 bg-blue-900 text-white border-none rounded-full cursor-pointer text-base w-3/5 h-14 sm:w-2/5 sm:h-12 md:text-lg md:w-4/12 transform transition-transform hover:scale-90 active:scale-100 hover:shadow-none shadow-lg mx-auto'>
                    Join
                    </button>
                </form>
                    
                }

            </div>
        </div>
    );
}
