import * as React from "react";
import './locationSelectionComponent.css';
import Select from "react-dropdown-select";

export const LocationSelectionComponent = (props:any) => {

    let options = [
        {
            value: 'YSB MARSH',
            label: 'YSB MARSH'
        },
        {
            value: 'LOM 206',
            label: 'LOM 206'
        },
        {
            value: 'LC 213',
            label: 'LC 213'
        },
        {
            value: 'WTS A60',
            label: 'WTS A60'
        },
        {
            value: 'KT 101',
            label: 'KT 101'
        }
    ]

    return (
        <div className={`location-select-wrapper`}>
            <Select multi create options={options} clearOnSelect={false} values={[]} onChange={(values:any) => {props.update(values)}} />
        </div>
    );
}