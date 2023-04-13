import React, { useState } from 'react';
import SelectComponent from "./SelectComponent";


const DisplayScreen = ({startDate, endDate, startTime, endTime, availability, 
   setArray3D, currIndex}) => {

    //Loads calendar based on availability
      for(let i = 1; i <= availability.length; i++) {
        for(let j = 1; j <= availability[0].length; j++) {
          
          let box = document.querySelector(`[row_id="${j}"][col_id="${i}"]`)

          if(availability[i-1][j-1] === 0) {
            if(box) {
              box.style.backgroundColor = 'white';
            }
          } else {
            if(box) {
              const lightness = 100 - (availability[i-1][j-1] * 10);
          
              box.style.backgroundColor = `hsl(210, 100%, ${lightness}%)`;
            }
          }
        }
      }


    //Number of columns
    const width_range = endDate - startDate + 1;

    //Number of rows
    const length_range = ((endTime - startTime)/15); 

  
    const columns = document.querySelectorAll(".column")
    const rows = document.querySelectorAll(".box")
    const dates = document.querySelectorAll(".date")
    const times = document.querySelectorAll("#time")
    
    //Displays correct hour labels (on leftmost column)
    let hourStartTime;
    let AM;
    times.forEach((time, index) => {
      hourStartTime = (startTime/60) + index;
      if(hourStartTime < 12) {
        AM = 'AM'
      } else {
        AM = 'PM'
      }
      hourStartTime = hourStartTime % 12
      if (hourStartTime === 0) {
        hourStartTime = 12
      }
      time.innerHTML = `${hourStartTime} ${AM}` ;
    })

    dates.forEach((date, index) => {
      date.innerHTML = index + startDate
    })

    
    //--------------------------------DISPLAYS GRID BASED ON END/START TIME/DATE----------------------------------------
    
    columns.forEach(column => {
      if(column.getAttribute('id') > width_range) {
        column.classList.add("invisible")
     
      }
      else {
        column.classList.remove("invisible")
      
      }
    })
  
    rows.forEach(row => {
      if(row.getAttribute('row_id') > length_range) {
        row.classList.add("invisible")

      }
      else {
        row.classList.remove("invisible")
   
      }
    })

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('row_id'));
      if (id % 4 === 0) {
        row.classList.add('is-divisible-by-4');
      }
    });



    times.forEach(time => {
      if(time.getAttribute('id2') > 1 + (length_range)/4) {
        time.classList.add("invisible")
      }
      else {
        time.classList.remove("invisible")
      }
    })
  //------------------------------------------------------------------------------------------------------------------------------------


  //------------------------------------------Code for dragging/click interaction-------------------------------------------------------
    const [isDragging, setIsDragging] = useState(false);

    //"Down" refers to mouse being pressed 'down', not vertical movement
    const handleMouseDown = (event) => {
      setIsDragging(true);
    };
  
    //"Up" refers to mouse button is released
    const handleMouseUp = (event) => {
      setIsDragging(false);
    };
    

    
    const handleMouseMove = (event) => {
      //If mouse is moving but not being dragged, don't do anything
      if (!isDragging) return;
  
      //If dragging down, change to blue, set position in availablity array to 1
      if (event.movementY > 0) {
        const box = event.target.closest('.box');
        const column = event.target.closest('.column');
        if (box) {
            const y_coord = box.getAttribute('row_id') - 1;
            const x_coord = column.getAttribute('id') - 1;
            box.style.backgroundColor = '#BEDEFF';
            
            //Updates the 3D array
            setArray3D(prevState => {
              const newArray = [...prevState]; 
              newArray[currIndex][x_coord][y_coord] = 1; 
              return newArray;
            });

            
           }
      }
      //Else change color to white, change position to 0
      if (event.movementY < 0) {
        const box = event.target.closest('.box');
        const column = event.target.closest('.column');
        if (box) {
            const y_coord = box.getAttribute('row_id') - 1;
            const x_coord = column.getAttribute('id') - 1;
             box.style.backgroundColor = 'white';
           
              //Updates the 3D array
             setArray3D(prevState => {
              const newArray = [...prevState]; 
              newArray[currIndex][x_coord][y_coord] = 0; 
              
              return newArray;
            });
           }
      }

    };
    
    //Same function as dragging, but instead for clicking
    const handleClick = (event) => {
      const box = event.target.closest('.box');
      const column = event.target.closest('.column');
      if (box) {
        const y_coord = box.getAttribute('row_id') - 1;
          const x_coord = column.getAttribute('id') - 1;
        if (box.style.backgroundColor !== 'white') {
          box.style.backgroundColor = 'white';


         
            setArray3D(prevState => {
              const newArray = [...prevState]; 
              newArray[currIndex][x_coord][y_coord] = 0;              
              return newArray;
            });
       
        }
        else {
         
          box.style.backgroundColor = '#BEDEFF';

            setArray3D(prevState => {
              const newArray = [...prevState]; 
              newArray[currIndex][x_coord][y_coord] = 1; 
              return newArray;
            });
      
        }
      }

    };

  
    return (
    <div class="container" style={{ fontFamily: 'Roboto, sans-serif', cursor: 'pointer' }}>
     
      <div class="column" id = "0">
        <div class="TimeColumn">
        <div className="label timezone">
          </div>
          <div class="box" id = "time" id2 = "1">8 AM</div>
          <div class="box" id = "time" id2 = "2">9 AM</div>
          <div class="box" id = "time" id2 = "3">10 AM</div>
          <div class="box" id = "time" id2 = "4">11 AM</div>
          <div class="box" id = "time" id2 = "5">12 AM</div>
          <div class="box" id = "time" id2 = "6">1 PM</div>
          <div class="box" id = "time" id2 = "7">2 PM</div>
          <div class="box" id = "time" id2 = "8">3 PM</div>
          <div class="box" id = "time" id2 = "9">4 PM</div>
          <div class="box" id = "time" id2 = "10">8 AM</div>
          <div class="box" id = "time" id2 = "11">9 AM</div>
          <div class="box" id = "time" id2 = "12">10 AM</div>
          <div class="box" id = "time" id2 = "13">11 AM</div>
          <div class="box" id = "time" id2 = "14">12 AM</div>
          <div class="box" id = "time" id2 = "15">1 PM</div>
          <div class="box" id = "time" id2 = "16">2 PM</div>
          <div class="box" id = "time" id2 = "17">3 PM</div>
          <div class="box" id = "time" id2 = "18">4 PM</div>
          <div class="box" id = "time" id2 = "19">8 AM</div>
          <div class="box" id = "time" id2 = "20">9 AM</div>
          <div class="box" id = "time" id2 = "21">10 AM</div>
          <div class="box" id = "time" id2 = "22">11 AM</div>
          <div class="box" id = "time" id2 = "23">12 AM</div>
          <div class="box" id = "time" id2 = "24">1 PM</div>

          
        </div>
      </div>
      <div className="column" id="1">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">MON
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "1" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="2">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">TUE
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "2" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="3">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">WED
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "3" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="4">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">THU
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "4" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="5">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">FRI
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "5" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="6">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">SAT
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "6" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column" id="7">
        <div className="Weekday"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onClick={handleClick}>
          <div className="label">SUN
            <p className="date">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box" row_id={index + 1} col_id = "7" key={index}></div>
          ))}
        </div>
      </div>
    </div>
    );
}

export default DisplayScreen