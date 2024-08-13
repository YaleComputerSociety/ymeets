interface Props {
  available: string
  unavailable: string
}

/**
 *
 * Renders a row of the availability chart. Contains an individual who is
 * available and one who is unavaiable.
 *
 * @param {string} available - The name of the available individual.
 * @param {string} unavailable - Name of the unavailable individual
 * @returns {JSX.Element}
 */
export default function ChartRow ({ available, unavailable }: Props) {
  return (
        <>
            <tr className="w-1/2">
                    <td className="p-3 text-blue-500">{available}</td>
                    <td className="p-3 text-gray-500">{unavailable}</td>
            </tr>
        </>
  )
}
