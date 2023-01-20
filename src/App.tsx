import React from 'react';
import logo from './logo.svg';
import './App.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function App() {
  return (
    <div className="App">
      <Calendar showNeighboringMonth={false} minDetail="month" onClickDay={(value, event) => alert('Clicked day: ' + value)} />
    </div>
  );
}

export default App;
