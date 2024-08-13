import React from 'react'
import ChartRow from './UserChartRow'
import { userData } from '../../types'

interface UserChartProps {
  chartedUsersData: [userData[], React.Dispatch<React.SetStateAction<userData[]>>]
}

/**
 *
 * Renders who is available during certain time blocks
 *
 * @param UserChart
 * @returns Page Support Component - Admin View
 */
const UserChart: React.FC<UserChartProps> = ({ chartedUsersData }) => {
  const [chartedUsers, setChartedUsers] = chartedUsersData

  console.log(chartedUsers)

  // @ts-expect-error
  const numRows = Math.max(chartedUsers.available.length, chartedUsers.unavailable.length)

  const rows: Array<[string, string]> = Array.from({ length: numRows }, (_, i) => ([
    // @ts-expect-error
    chartedUsers.available[i]?.name || '',
    // @ts-expect-error
    chartedUsers.unavailable[i]?.name || ''
  ]))

  return (
        <div className="flex justify-center items-center text-center bg-white rounded-lg">
            <table className="table-fixed border-collapse w-full">
                <thead>
                    <tr>
                        <th className="border-b p-3 text-blue-500">Available</th>
                        <th className="border-b p-3 text-gray-500">Unavailable</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([available, unavailable], idx) => (
                        <ChartRow available={available} key={idx} unavailable={unavailable} />
                    ))}
                </tbody>
            </table>
        </div>
  )
}

export default UserChart
