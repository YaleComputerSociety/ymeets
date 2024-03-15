import ChartRow from "./UserChartRow";
import { userData } from "../../types"

interface UserChart {
    chartedUsersData: [userData, React.Dispatch<React.SetStateAction<userData>>]
}

/**
 * 
 * Renders who is available during certain time blocks
 * 
 * @param UserChart
 * @returns Page Support Component - Admin View
 */
export default function UserChart({chartedUsersData}: UserChart) {

    const [chartedUsers, setChartedUsers] = chartedUsersData;

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
        <div className="flex justify-center items-center text-center bg-white rounded-lg">
            <table className="table-fixed border-collapse w-full">
                <tbody>
                    <tr className="w-1/2">
                        <th className="border-b p-3 text-blue-500">Available</th>
                        <th className="border-b p-3 text-gray-500">Unavailable</th>
                    </tr>
                    {rows.map((row, idx) => {
                        return <ChartRow available={row[0]} key={idx} unavailable={row[1]}/>
                    })}  
                </tbody>
            </table>
        </div>
        </>
    )

}