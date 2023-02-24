import * as React from "react";
import './circle_component.css';

import { useState } from "react";

export const CircleComponent = (props:any) => {

    var initialActive = "not-active-circle";

    if (props.selectedDays.filter((obj:any) => obj[0] === props.date.getFullYear() && obj[1] === props.date.getMonth() && obj[2] === props.date.getDate()).length === 1) {
        initialActive = "active-circle";
    }

    const [active, toggleActive] = useState(initialActive);

    const handleToggleActive = () => {
        if (active.localeCompare("not-active-circle") === 0) {
            toggleActive("active-circle");
            props.add(props.date);
        } else {
            toggleActive("not-active-circle");
            props.remove(props.date);
        }
    };

    return (
        <div className={`circle ${active}`}>
            <button className={active} onClick={handleToggleActive}>
                {props.date.getDate()}
            </button>
        </div>
    );
}