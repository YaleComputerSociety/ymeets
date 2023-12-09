export default function ChartRow(props: any) {
    return (
        <>
            <tr className="w-1/2">
                    <td className="p-3 text-blue-500">{props.available}</td>
                    <td className="p-3 text-gray-500">{props.unavailable}</td>
            </tr>
        </>
    )

}