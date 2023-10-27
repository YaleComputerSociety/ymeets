import ChartRow from "./UserChartRow";
import { useState } from "react";
import {userData, user } from "../scheduletypes";

interface UserChart {
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>]
}

// TODO : Create a UserChart
export default function UserChart(props: any) {

    const [chartedUsers, setChartedUsers] = props.chartedUsersData;

    var rows: Array<string>[] = []
    var numRows: number = Math.max(chartedUsers.available.length, 
                                   chartedUsers.unavailable.length)
    for(let i = 0; i < numRows; i++){
        var row : string[] = []
        if(i >= chartedUsers.available.length){
            row.push("")
        }
        else{
            row.push(chartedUsers.available[i].name)
        }
        if (i >= chartedUsers.unavailable.length){
            row.push("")
        }
        else{
            row.push(chartedUsers.unavailable[i].name)
        }
        rows.push(row)
    }

    return (
        <>
        <div className="flex justify-center items-center text-center">
            <table className="table-fixed border-collapse w-full">
                <tr className="w-1/2">
                    <th className="border-b border-r p-3">Available</th>
                    <th className="border-b p-3">Unavailable</th>
                </tr>
                {rows.map((row) => {
                    return <ChartRow available={row[0]} unavailable={row[1]}/>
                })}
                <tr>
                    <td className="border-r p-3"></td>
                    <td className="p-3"></td>
                </tr>
            </table>
        </div>
        </>
    )

}