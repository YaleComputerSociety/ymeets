import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './Root';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/*Change this to Root */}
    <Root />
  </React.StrictMode>
);
