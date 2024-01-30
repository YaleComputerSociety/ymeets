import React from 'react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-sky-100">
      <div className="text-center">
        <p className='text-9xl mb-10'>:(</p>
        <p className='text-3xl font-bold'>This page does not exist. You probably entered a code wrong or used a malformed URL.</p>
      </div>
    </div>
  );
}
