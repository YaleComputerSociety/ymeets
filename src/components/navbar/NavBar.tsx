import React from "react"
import NavLogo from "./NavLogo"
import { checkIfLoggedIn, getAccountName } from "../../firebase/events"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IconUser } from "@tabler/icons-react"
import { signInWithGoogle } from "../../firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { GAPIContext } from "../../firebase/gapiContext"
import { useContext } from "react"
import { FaCog } from 'react-icons/fa';
import { logout } from "../../firebase/auth"


export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("")

    const nav = useNavigate()

    const { gapi, handleIsSignedIn } = useContext(GAPIContext);

    const handleGearClick = () => {
        setIsOpen(!isOpen)
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };


    useEffect(() => {
        return onAuthStateChanged(auth, () => {
            setName(getAccountName().split(' ')[0]);
        });  
    }) 

    return (
        <>
            <div className="flex flex-col w-full mt-6 justify-center z-40 items-center">
                <div className="flex bg-white rounded-xl h-16 w-[90%] px-5 sm:px-8 items-center justify-between shadow-lg">
                    <NavLogo />
                    <div className="flex items-center space-x-4">
                        {name && <div 
                                    className="relative inline-block" 
                                >
                                    <div 
                                        className={`text-gray-500 flex flex-row border border-gray-500 rounded-full w-fit h-fit px-3 py-1 self-center transition drop-shadow-2xl text-xs lg:text-sm`}
                                    >
                                        Welcome, {name}                             
                                    </div>
                        </div> 
                        }
                        <div className="relative">
                            <button className="menu-button" onClick={handleGearClick}>
                                <FaCog className="text-gray-500 mt-1" size={25} />
                            </button>
                            {isOpen && (
                                <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 left-auto">
                                    <div className="py-1 border border-gray-400 rounded-lg" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <a href="#" className="block px-4 text-right py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { nav("/about-us"); setIsOpen(false) }}>About Us</a>
                                        <a href="#" className="block px-4 text-right py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { nav("/useraccount"); setIsOpen(false) }}>Events</a>
                                        {checkIfLoggedIn() ? (
                                            <a href="#" className="block px-4 text-right py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => { logout(gapi); setIsOpen(false) }}>Logout</a>
                                        ) : (
                                            <a href="#" className="block px-4 text-right py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => {
                                                signInWithGoogle(undefined, gapi, handleIsSignedIn).then((loginSuccessful) => {
                                                    if (loginSuccessful) {
                                                        window.location.reload();
                                                    }
                                                })
                                            }}>Login</a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-10"></div>
        </>
    )
}
