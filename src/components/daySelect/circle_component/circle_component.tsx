import * as React from "react";
import "./circle_component.css";

import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/material.css";

import { useState, useEffect } from "react";

export const CircleComponent = (props: any) => {

  const dates = [
    "September 5, 2022 00:00:00",
    "September 5, 2022 23:59:59",
    "October 18, 2022 00:00:00",
    "October 23, 2022 23:59:59",
    "November 18, 2022 00:00:00",
    "November 27, 2022 23:59:59",
    "December 21, 2022 00:00:00",
    "January 15, 2023 23:59:59",
    "January 16, 2023 00:00:00",
    "January 16, 2023 23:59:59",
    "March 10, 2023 00:00:00",
    "March 27, 2023 23:59:59",
  ];

  const holidays = dates.map((item) => new Date(item));

  const [active, toggleActive] = useState((props.isActive ? "active-circle" : "not-active-circle"));

  const handleToggleActive = () => {
    if (active.localeCompare("not-active-circle") === 0) {
      toggleActive("active-circle");
      props.add(props.date);
    } else {
      toggleActive("not-active-circle");
      props.remove(props.date);
    }
  };

    // useEffect(() => {
  //   tippy("#laborDay", {
  //     content: "Labor Day",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });

  //   tippy("#octoberRecess", {
  //     content: "October Recess",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });

  //   tippy("#novemberRecess", {
  //     content: "November Recess",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });

  //   tippy("#winterRecess", {
  //     content: "Winter Recess",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });

  //   tippy("#mlkDay", {
  //     content: "MLK Day",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });

  //   tippy("#springRecess", {
  //     content: "Spring Recess",
  //     trigger: "mouseenter focus",
  //     theme: "material",
  //   });
  // }, [props.date, props.selectedDays]);

  return (
    <div className={`circle ${active}`}>
           {(() => {
        if (holidays[0] <= props.date && props.date <= holidays[1]) {
          return (
            <button
              id="laborDay"
              className={active}
              onClick={handleToggleActive}
            >
              {props.date.getDate()}
            </button>
          );
        } else if (holidays[2] <= props.date && props.date <= holidays[3]) {
          return (
            <button
              id="octoberRecess"
              className={active}
              onClick={handleToggleActive}
            >
              {props.date.getDate()}
            </button>
          );
        } else if (holidays[4] <= props.date && props.date <= holidays[5]) {
          return (
            <button
              id="novemberRecess"
              className={active}
              onClick={handleToggleActive}
            >
              {props.date.getDate()}
            </button>
          );
        } else if (holidays[6] <= props.date && props.date <= holidays[7]) {
          return (
            <button
              id="winterRecess"
              className={active}
              onClick={handleToggleActive}
            >
              {props.date.getDate()}
            </button>
          );
        } else if (holidays[8] <= props.date && props.date <= holidays[9]) {
          return (
            <button id="mlkDay" className={active} onClick={handleToggleActive}>
              {props.date.getDate()}
            </button>
          );
        } else if (holidays[10] <= props.date && props.date <= holidays[11]) {
          return (
            <button
              id="springRecess"
              className={active}
              onClick={handleToggleActive}
            >
              {props.date.getDate()}
            </button>
          );
        } else {
          return (
            <button className={active} onClick={handleToggleActive}>
              {props.date.getDate()}
            </button>
          );
        }
      })()}
    </div>
  );
};