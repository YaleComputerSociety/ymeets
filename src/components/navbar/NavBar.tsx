import React from 'react';
import NavLogo from './NavLogo';
import { checkIfLoggedIn, getAccountName } from '../../firebase/events';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

import {
  IconMenu2,
  IconInfoCircleFilled,
  IconInfoCircle,
  IconCalendarWeek,
  IconCalendarFilled,
  IconCalendarEvent,
  IconLogin2,
  IconLogout,
  IconMessageReport,
  IconMoonFilled,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import { useAuth } from '../../firebase/authContext';
import { useTheme } from '../../contexts/ThemeContext';
import { log } from 'console';

export default function NavBar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [menuState, setMenuState] = useState('closed');

  const nav = useNavigate();

  const { login, logout, currentUser } = useAuth();

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
                <IconMoonFilled
                  className="cursor-pointer text-text dark:text-text-dark"
                  size={25}
                />
              ) : (
                <IconSun
                  className="cursor-pointer text-text dark:text-text-dark"
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
            <div>
              <a
                href="#"
                className="flex items-center px-4 text-text dark:text-text-dark hover:text-primary transition hover:scale-105"
                onClick={() => {
                  nav('/useraccount');
                }}
              >
                <IconCalendarEvent
                  size={25}
                  className="opacity-80 dark:opacity-100"
                />{' '}
                <span className="text-sm hidden sm:block ml-2">My Events</span>
              </a>
            </div>
            <div className="relative">
              <button
                className="menu-button flex items-center"
                onClick={handleGearClick}
              >
                <IconMenu2
                  className="text-text dark:text-text-dark"
                  size={30}
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
                      <IconInfoCircle className="mr-2" size={17} /> About Us
                    </a>

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
                      <IconMessageReport className="mr-2" size={17} /> Feedback
                    </a>
                    <div className="border-t border-gray-200"></div>
                    {checkIfLoggedIn() ? (
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                        onClick={() => {
                          logout();
                          setMenuState('closed');
                          nav('/');
                        }}
                      >
                        <IconLogout className="mr-2" size={17} /> Logout
                      </a>
                    ) : (
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      <a
                        href="#"
                        className="flex items-center justify-start px-4 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-primary hover:text-white transition-colors duration-200"
                        onClick={() => {
                          login();
                          setMenuState('closed');
                        }}
                      >
                        <IconLogin2 className="mr-2" size={17} /> Login
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
