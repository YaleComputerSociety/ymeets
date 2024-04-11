import React from "react"
import NavLogo from "./NavLogo"
import { getAccountName } from "../../firebase/events"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { IconUser } from "@tabler/icons-react"
import { signInWithGoogle } from "../../firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { GAPIContext } from "../../firebase/gapiContext"
import { useContext } from "react"

export default function NavBar() {
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [name, setName] = useState("")

    const nav = useNavigate()
    
    const navToggle = () => {
        setMenuOpen(menuOpen ? false : true)
    }

    const { gapi, handleIsSignedIn } = useContext(GAPIContext);


    useEffect(() => {
        return onAuthStateChanged(auth, () => {
            setName(getAccountName().split(' ')[0]);
        });  
    }) 

    return (
        <>
            <div className="flex flex-col w-full mt-6 justify-center z-40 items-center">
            <div className="flex bg-white rounded-xl h-16 w-[90%] px-5 sm:px-8 items-center justify-between shadow-lg">
                <NavLogo></NavLogo>
                <div className="inline-flex justify-self-end items-center space-x-4 order-2">
                    <a href="/about-us" className="hidden hover:text-blue-700 md:inline-block flex items-center">About Us</a>                    
                    {name != "" ? <div 
                                    className="relative inline-block" 
                                >
                                    <button 
                                        onClick={() => nav("/useraccount")} 
                                        className={`text-gray-500 flex flex-row border border-gray-500 rounded-full w-fit h-fit px-3 py-1 self-center hover:bg-gray-500 transition hover:scale-102 drop-shadow-2xl hover:text-white text-sm`}
                                    >
                                        Welcome, {name}                             
                                    </button>
                        </div> : <button onClick={() => {
                                signInWithGoogle(undefined, gapi, handleIsSignedIn).then((loginSuccessful) => {
                                    if (loginSuccessful) {
                                        window.location.reload();
                                    }
                                })}}>
                            <IconUser/>
                            </button>
                            }
                        </div>
            </div>
        </div>
        <div className="h-10"></div>
        </>
    )
}