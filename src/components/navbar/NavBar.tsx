import React from 'react';
import NavLogo from './NavLogo';
import { checkIfLoggedIn, getAccountName } from '../../firebase/events';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { GAPIContext } from '../../firebase/gapiContext';
import { useContext } from 'react';
import { FaBars } from 'react-icons/fa';
import { logout } from '../../firebase/auth';

import {
  FaInfoCircle,
  FaCalendarAlt,
  FaSignInAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import { MdFeedback, MdDarkMode, MdOutlineDarkMode } from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';
import { TiWeatherSunny } from 'react-icons/ti';

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [menuState, setMenuState] = useState('closed');

  const nav = useNavigate();

  const { gapi, handleIsSignedIn } = useContext(GAPIContext);

  // const handleGearClick = () => {
  //     setIsOpen(!isOpen)
  // };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleGearClick = () => {
    if (menuState === 'closed') {
      setMenuState('opening');
      setTimeout(() => setMenuState('open'), 10);
    } else {
      setMenuState('closed');
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, () => {
      let obtainedName = getAccountName().split(' ')[0];

      if (obtainedName.length >= 11) {
        setName(obtainedName.slice(0, 10) + '...');
      } else {
        setName(obtainedName);
      }
    });
  });

  return (
    <>
      <div className="flex flex-col w-full pt-6 justify-center z-40 items-center">
        <div className="flex bg-secondary_background dark:bg-secondary_background-dark rounded-xl h-16 w-[94%] px-5 sm:px-8 items-center justify-between shadow-lg">
          <NavLogo />
          <div className="flex items-center space-x-4">
            <div onClick={toggleTheme}>
              {theme === 'dark' ? (
                <MdDarkMode
                  className="cursor-pointer"
                  color={'#f8f9fa'}
                  size={25}
                />
              ) : (
                <TiWeatherSunny
                  className="cursor-pointer"
                  color={'#595e69'}
                  size={25}
                />
              )}
            </div>
            <div className="hidden sm:block">
              {name && (
                <div className="relative inline-block">
                  <div
                    className={`text-text dark:text-text-dark flex flex-row border border-outline dark:border-text-dark rounded-full w-fit h-fit px-2 lg:px-3 py-1 self-center transition drop-shadow-2xl text-xs lg:text-sm`}
                  >
                    {/* Welcome, {name}                              */}
                    <span className="mx-auto">Welcome, {name}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Change by Julien Dang, 2/15/25; relocated Events to navbar */}
            <div className="hidden sm:flex items-center">
              <a href="#"
                 className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:text-primary transition hover:scale-x-105"
                 onClick={() => {
                 nav('/useraccount');
                }}
                    >
                      <FaCalendarAlt className="mr-2" /> My Events
                    </a>
            </div>
            <div className="relative">
              <button className="menu-button" onClick={handleGearClick}>
                <FaBars
                  className="text-text dark:text-text-dark mt-1"
                  size={25}
                />
              </button>
              {menuState !== 'closed' && (
                <div
                  className={`absolute z-[9999] mt-2 w-44 rounded-md shadow-lg bg-white dark:bg-secondary_background-dark ring-1 ring-black ring-opacity-5 right-0 transition-all duration-200 ease-out transform origin-top-right 
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
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                      onClick={() => {
                        nav('/about-us');
                        setMenuState('closed');
                      }}
                    >
                      <FaInfoCircle className="mr-2" /> About Us
                    </a>
                    {/* Change by Julien Dang, 2/15/25; removed Events from hamburger menu
                    <div className="border-t border-gray-200"></div>
                    <a
                      href="#"
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                      onClick={() => {
                        nav('/useraccount');
                        setMenuState('closed');
                      }}
                    >
                      <FaCalendarAlt className="mr-2" /> Events
                    </a> */}
                    <div className="border-t border-gray-200"></div>
                    <a
                      href="https://ymeets.canny.io"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                      onClick={() => {
                        setMenuState('closed');
                      }}
                    >
                      <MdFeedback className="mr-2" /> Feedback
                    </a>
                    <div className="border-t border-gray-200"></div>
                    {checkIfLoggedIn() ? (
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                        onClick={() => {
                          logout(gapi);
                          setMenuState('closed');
                          nav('/');
                        }}
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </a>
                    ) : (
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                        onClick={() => {
                          signInWithGoogle(
                            undefined,
                            undefined,
                            handleIsSignedIn
                          ).then((loginSuccessful) => {
                            if (loginSuccessful) {
                              window.location.reload();
                            }
                          });
                          setMenuState('closed');
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
            <div className="inline-block bg-primary text-white rounded-b-lg px-4 py-1 text-center text-xs whitespace-nowrap">
              Welcome, {name}
            </div>
          </div>
        )}
      </div>
      <div className="h-8 md:h-10"></div>
    </>
  );
}
