import React from 'react';
import logo from './logo.svg';
import './App.css';
import DaySelectComponent from './components/daySelect/day_select_component';

function App() {
  return (
    <div className="App">
      {/* Render root instead */}
      <DaySelectComponent />
    </div>
  );
}

export default App;
