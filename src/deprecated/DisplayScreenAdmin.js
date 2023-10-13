
import React, { useState } from 'react';

const DisplayScreenAdmin = ({startDate, endDate, startTime, endTime, availability, currIndex, listOfArraysNames}) => {
    console.log(availability)
    //Loads calendar based on availability
      for(let i = 1; i <= availability.length; i++) {
        for(let j = 1; j <= availability[0].length; j++) {
          
          let box_admin = document.querySelector(`[row_id_admin="${j}"][col_id_admin="${i}"]`)

          if(availability[i-1][j-1] === 0) {
            if(box_admin) {
              box_admin.style.backgroundColor = 'white';
            }
          } else {
            if(box_admin) {
              const lightness = 100 - (availability[i-1][j-1] * 10);
                console.log(lightness, "lightness")
              box_admin.style.backgroundColor = `hsl(210, 100%, ${lightness}%)`;
            }
          }
        }
      }


    //Number of columns
    const width_range = endDate - startDate + 1;

    //Number of rows
    const length_range = ((endTime - startTime)/15); 

  
    const columns = document.querySelectorAll(".column_admin")
    const rows = document.querySelectorAll(".box_admin")
    const dates = document.querySelectorAll(".date_admin")
    const times = document.querySelectorAll("#time_admin")
    const tooltips = document.querySelectorAll(".tooltiptext")
    
    //Displays correct hour labels (on leftmost column_admin)
    let hourStartTime;
    let AM;
    times.forEach((time_admin, index) => {
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
      time_admin.innerHTML = `${hourStartTime} ${AM}` ;
    })

    dates.forEach((date_admin, index) => {
      date_admin.innerHTML = index + startDate
    })
    const handleHover = (event) => {

      const currBox = event.target.closest('.box_admin');
      const column = event.target.closest('.column_admin');
        if (currBox) {
            const y_coord = currBox.getAttribute('row_id_admin') - 1;
            const x_coord = column.getAttribute('id') - 1;
            currBox.children[0].innerHTML = listOfArraysNames[currIndex][x_coord][y_coord]
            if (listOfArraysNames[currIndex][x_coord][y_coord].length == 0) {
              currBox.children[0].style.visibility = 'hidden'
            }
            //console.log(listOfArraysNames);
        }
        
    }
    
    //--------------------------------DISPLAYS GRID BASED ON END/START TIME/DATE----------------------------------------
    
    columns.forEach(column_admin => {
      if(column_admin.getAttribute('id') > width_range) {
        column_admin.classList.add("invisible")
     
      }
      else {
        column_admin.classList.remove("invisible")
      
      }
    })
  
    rows.forEach(row => {
      if(row.getAttribute('row_id_admin') > length_range) {
        row.classList.add("invisible")

      }
      else {
        row.classList.remove("invisible")
   
      }
    })

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('row_id_admin'));
      if (id % 4 === 0) {
        row.classList.add('is-divisible-by-4');
      }
    });

    times.forEach(time_admin => {
      if(time_admin.getAttribute('id2') > 1 + (length_range)/4) {
        time_admin.classList.add("invisible")
      }
      else {
        time_admin.classList.remove("invisible")
      }
    })
  //------------------------------------------------------------------------------------------------------------------------------------


  
   
  
    return (
    <div class="container" style={{ fontFamily: 'Roboto, sans-serif', cursor: 'pointer' }}>
     
      <div class="column_admin" id = "0">
        <div class="TimeColumn">
        <div className="label timezone">EST
          </div>
          <div class="box_admin" id = "time_admin" id2 = "1">8 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "2">9 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "3">10 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "4">11 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "5">12 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "6">1 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "7">2 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "8">3 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "9">4 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "10">8 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "11">9 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "12">10 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "13">11 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "14">12 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "15">1 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "16">2 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "17">3 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "18">4 PM</div>
          <div class="box_admin" id = "time_admin" id2 = "19">8 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "20">9 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "21">10 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "22">11 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "23">12 AM</div>
          <div class="box_admin" id = "time_admin" id2 = "24">1 PM</div>

          
        </div>
      </div>
      <div className="column_admin" id="1">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">MON
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "1" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="2">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">TUE
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "2" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="3">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">WED
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "3" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="4">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">THU
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "4" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="5">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">FRI
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "5" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="6">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">SAT
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "6" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>
      <div className="column_admin" id="7">
        <div className="Weekday" onMouseOver={handleHover}>
          <div className="label">SUN
            <p className="date_admin">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_admin" row_id_admin={index + 1} col_id_admin = "7" key={index}>
              <span class="tooltiptext">Tooltip text</span>
            </div>
          ))}
        </div>
      </div>

  
    </div>
    );
}

export default DisplayScreenAdmin