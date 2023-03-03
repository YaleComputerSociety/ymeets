import * as React from "react";
import './time_select_component.css';
import Select from "react-dropdown-select";

import { useState } from "react";

export const TimeSelectComponent = (props:any) => {

    const options = Array.from({length: 16}, (_, i) => ({
        value: i + 1,
        label: `${i == 5 ? 12 : (i + 7) % 12}:00 ${i >= 5 ? 'PM' : 'AM'}`
    }))


    return (
        <div className={`time-select-wrapper`}>
            <div className='time-select-text-wrapper'>
                <p className='time-select-text'>FROM</p>
            </div>
            <Select searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateStart(values[0]['label'])}} />
            <div className='time-select-text-wrapper'>
                <p className='time-select-text'>TO</p>
            </div>
            <Select searchable={false} options={options} values={[]} onChange={(values:any) => {props.updateEnd(values[0]['label'])}} />
        </div>
    );
}