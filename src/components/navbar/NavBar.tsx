import React from 'react'
import NavLogo from './NavLogo'
import { checkIfLoggedIn, getAccountName } from '../../firebase/events'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconUser } from '@tabler/icons-react'
import { signInWithGoogle } from '../../firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebase/firebase'
import { GAPIContext } from '../../firebase/gapiContext'
import { useContext } from 'react'
import { FaCog } from 'react-icons/fa'
import { logout } from '../../firebase/auth'
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaSignInAlt,
  FaSignOutAlt,
} from 'react-icons/fa'
import { MdFeedback } from 'react-icons/md'

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [menuState, setMenuState] = useState('closed')

  const nav = useNavigate()

  const { gapi, handleIsSignedIn } = useContext(GAPIContext)

  // const handleGearClick = () => {
  //     setIsOpen(!isOpen)
  // };

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  const handleGearClick = () => {
    if (menuState === 'closed') {
      setMenuState('opening')
      setTimeout(() => setMenuState('open'), 10)
    } else {
      setMenuState('closed')
    }
  }

  useEffect(() => {
    return onAuthStateChanged(auth, () => {
      let obtainedName = getAccountName().split(' ')[0]

      // console.log(obtainedName)

      if (obtainedName.length >= 11) {
        setName(obtainedName.slice(0, 10) + '...')
      } else {
        setName(obtainedName)
      }
    })
  })

  return (
    <>
      <div className="flex flex-col w-full mt-6 justify-center z-40 items-center">
        <div className="flex bg-white rounded-xl h-16 w-[90%] px-5 sm:px-8 items-center justify-between shadow-lg">
          <NavLogo />
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              {name && (
                <div className="relative inline-block">
                  <div
                    className={`text-gray-500 flex flex-row border border-gray-500 rounded-full w-fit h-fit px-2 lg:px-3 py-1 self-center transition drop-shadow-2xl text-xs lg:text-sm`}
                  >
                    {/* Welcome, {name}                              */}
                    <span className="mx-auto">Welcome, {name}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button className="menu-button" onClick={handleGearClick}>
                <FaCog className="text-gray-500 mt-1" size={25} />
              </button>
              {menuState !== 'closed' && (
                <div
                  className={`absolute z-10 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 right-0 transition-all duration-200 ease-out transform origin-top-right 
                                    ${menuState === 'opening' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                >
                  <div
                    className="py-1 border border-gray-400 rounded-lg"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <a
                      href="#"
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200"
                      onClick={() => {
                        nav('/about-us')
                        setMenuState('closed')
                      }}
                    >
                      <FaInfoCircle className="mr-2" /> About Us
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <a
                      href="#"
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200"
                      onClick={() => {
                        nav('/useraccount')
                        setMenuState('closed')
                      }}
                    >
                      <FaCalendarAlt className="mr-2" /> Events
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <a
                      href="https://ymeets.canny.io"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200"
                      onClick={() => {
                        setMenuState('closed')
                      }}
                    >
                      <MdFeedback className="mr-2" /> Feedback
                    </a>
                    <div className="border-t border-gray-200"></div>
                    {checkIfLoggedIn() ? (
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200"
                        onClick={() => {
                          logout(gapi)
                          setMenuState('closed')
                          nav('/')
                        }}
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </a>
                    ) : (
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200"
                        onClick={() => {
                          signInWithGoogle(
                            undefined,
                            gapi,
                            handleIsSignedIn
                          ).then((loginSuccessful) => {
                            if (loginSuccessful) {
                              window.location.reload()
                            }
                          })
                          setMenuState('closed')
                        }}
                      >
                        <FaSignInAlt className="mr-2" /> Login
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {name.length > 0 && (
          <div className="sm:hidden w-[90%] flex justify-center">
            <div className="inline-block bg-blue-500 text-white rounded-b-lg px-4 py-1 text-center text-xs whitespace-nowrap">
              Welcome, {name}
            </div>
          </div>
        )}
      </div>
      <div className="h-8 md:h-10"></div>
    </>
  )
}
