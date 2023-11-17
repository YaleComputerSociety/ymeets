import * as React from "react";
import { Link } from 'react-router-dom';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '../../firebase/events';
import graphic from '../loginpage/calendargraphic.png';

export const LandingPageButtons = () => {
    const navigate = useNavigate();
    const [showEventCode, setShowEventCode] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleJoinClick: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (input.length !== 6) {
            alert('Please enter a valid code.');
        } else {
            setError('');
            getEventById(input).then((result) => {
                navigate('/timeselect/' + input);

            }).catch((err) => {
                console.log(err);
                alert('Please enter a valid code.');
            });
        }
    }
    return (
        <>
        <div className='hidden md:flex h-screen bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 justify-center flex-row'>
            <div className='w-4/5 sm:w-4/6 md:w-[70%] ml-10 mx-auto '>
                 <div className='text-center h-30 mb-16 mt-[160px] xl:mt-[200px]'>
                    <Link to='/dayselect'>
                         <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-custom' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                 </div>
                 <div className='text-center h-30'>
                     <Link to='/landingpage'>
                         <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-custom' onClick={() => {setShowEventCode(!showEventCode);}}>{!showEventCode ? "Use Event Code": "Using Event Code"}</button>
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
            <div className='hidden md:flex w-4/5 sm:w-4/6 md:w-1/2 mx-auto h-[70%] justify-center items-center lg:justify-start lg:items-start'>
                    <img src={graphic} alt="graphic" className='object-scale-down mt-0 lg:mt-[70px] md:ml-[-70px]'></img>
            </div>
        </div>
        <div className='md:hidden bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 h-screen w-screen flex flex-col'>
            <div className='w-4/5 sm:w-4/6 md:w-1/2 mx-auto flex justify-center items-center mt-[40px] h-2/5'>
                    <img src={graphic} alt="graphic" className='w-[100] h-5/6 sm:w-[140] sm:h-full'></img>
            </div>
            <div className='w-4/5 sm:w-4/6 md:w-1/2 m-0 mx-auto'>
                <div className='text-center h-30 mb-16 mt-2'>
                    <Link to='/dayselect'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-custom' onClick={() => {console.log("Hilogin")}}>Create New Event</button>
                    </Link>
                </div>
                <div className='text-center h-30'>
                    <Link to='/landingpage'>
                        <button className='bg-blue-900 text-white border-none rounded-lg cursor-pointer text-base w-4/5 h-16 sm:w-4/5 sm:h-14 md:text-lg md:w-6/12 transform transition-transform hover:scale-95 active:scale-100 hover:shadow-none shadow-custom' onClick={() => {setShowEventCode(!showEventCode);}}>{!showEventCode ? "Use Event Code": "Using Event Code"}</button>
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

        </>
    );
    }
