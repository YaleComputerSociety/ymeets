
import React, { useState } from 'react';

const DisplayScreenCombine = ({startDate, endDate, startTime, endTime, availability, currIndex}) => {
    console.log(availability)
    //Loads calendar based on availability
      for(let i = 1; i <= availability.length; i++) {
        for(let j = 1; j <= availability[0].length; j++) {
          
          let box_combined = document.querySelector(`[row_id_combined="${j}"][col_id_combined="${i}"]`)

          if(availability[i-1][j-1] === 0) {
            if(box_combined) {
              box_combined.style.backgroundColor = 'white';
            }
          } else {
            if(box_combined) {
              const lightness = 100 - (availability[i-1][j-1] * 10);
                console.log(lightness, "lightness")
              box_combined.style.backgroundColor = `hsl(210, 100%, ${lightness}%)`;
            }
          }
        }
      }


    //Number of columns
    const width_range = endDate - startDate + 1;

    //Number of rows
    const length_range = ((endTime - startTime)/15); 

  
    const columns = document.querySelectorAll(".column_combined")
    const rows = document.querySelectorAll(".box_combined")
    const dates = document.querySelectorAll(".date_combined")
    const times = document.querySelectorAll("#time_combined")
    
    //Displays correct hour labels (on leftmost column_combined)
    let hourStartTime;
    let AM;
    times.forEach((time_combined, index) => {
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
      time_combined.innerHTML = `${hourStartTime} ${AM}` ;
    })

    dates.forEach((date_combined, index) => {
      date_combined.innerHTML = index + startDate
    })

    
    //--------------------------------DISPLAYS GRID BASED ON END/START TIME/DATE----------------------------------------
    
    columns.forEach(column_combined => {
      if(column_combined.getAttribute('id') > width_range) {
        column_combined.classList.add("invisible")
     
      }
      else {
        column_combined.classList.remove("invisible")
      
      }
    })
  
    rows.forEach(row => {
      if(row.getAttribute('row_id_combined') > length_range) {
        row.classList.add("invisible")

      }
      else {
        row.classList.remove("invisible")
   
      }
    })

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('row_id_combined'));
      if (id % 4 === 0) {
        row.classList.add('is-divisible-by-4');
      }
    });

    times.forEach(time_combined => {
      if(time_combined.getAttribute('id2') > 1 + (length_range)/4) {
        time_combined.classList.add("invisible")
      }
      else {
        time_combined.classList.remove("invisible")
      }
    })
  //------------------------------------------------------------------------------------------------------------------------------------


  
   
  
    return (
    <div class="container" style={{ fontFamily: 'Roboto, sans-serif', cursor: 'pointer' }}>
     
      <div class="column_combined" id = "0">
        <div class="TimeColumn">
        <div className="label timezone">EST
          </div>
          <div class="box_combined" id = "time_combined" id2 = "1">8 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "2">9 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "3">10 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "4">11 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "5">12 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "6">1 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "7">2 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "8">3 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "9">4 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "10">8 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "11">9 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "12">10 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "13">11 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "14">12 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "15">1 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "16">2 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "17">3 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "18">4 PM</div>
          <div class="box_combined" id = "time_combined" id2 = "19">8 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "20">9 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "21">10 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "22">11 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "23">12 AM</div>
          <div class="box_combined" id = "time_combined" id2 = "24">1 PM</div>

          
        </div>
      </div>
      <div className="column_combined" id="1">
        <div className="Weekday">
          <div className="label">MON
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "1" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="2">
        <div className="Weekday">
          <div className="label">TUE
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "2" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="3">
        <div className="Weekday">
          <div className="label">WED
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "3" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="4">
        <div className="Weekday">
          <div className="label">THU
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "4" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="5">
        <div className="Weekday">
          <div className="label">FRI
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "5" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="6">
        <div className="Weekday">
          <div className="label">SAT
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "6" key={index}></div>
          ))}
        </div>
      </div>
      <div className="column_combined" id="7">
        <div className="Weekday">
          <div className="label">SUN
            <p className="date_combined">10</p>
          </div>
          {Array.from({ length: 96 }, (_, index) => (
            <div className="box_combined" row_id_combined={index + 1} col_id_combined = "7" key={index}></div>
          ))}
        </div>
      </div>

  
    </div>
    );
}

export default DisplayScreenCombine