import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="h-3"></div>
      <footer className="text-text dark:text-text-dark bg-white dark:bg-secondary_background-dark w-full flex items-center justify-center text-sm sm:text-md md:p-3.5 xs:p-3 pl-8 pr-8 pt-1 pb-1 mt-auto">
        <div className="flex flex-col lg:flex-row md:flex-row sm:flex-row">
          <div className="items-center justify-center px-2 m-1">
            <p className="px-2 text-center hover:text-blue-700 font-bold">
              <a href="https://yalecomputersociety.org/">
                &copy; {currentYear} &ndash; A y/cs product
              </a>
            </p>
          </div>
          <div className="items-center text-center justify-center x-2 m-1">
            <p className="px-2 hover:text-blue-700">
              <a href="/privacy">Privacy Policy + Limited Use Agreement</a>
            </p>
          </div>

          <div className="flex items-center justify-center px-2 m-1 space-x-3">
            <img
              src="/HudsonRiverTrading.png"
              alt="Hudson River Trading"
              className="h-6 w-auto object-contain inline-block"
            />
            <img
              src="/MiniMax.png"
              alt="MiniMax"
              className="h-6 w-auto object-contain inline-block"
            />
          </div>
        </div>
      </footer>
    </>
  );
}
