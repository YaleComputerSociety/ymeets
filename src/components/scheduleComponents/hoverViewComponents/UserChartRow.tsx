export default function ChartRow(props: any) {
    return (
        <>
            <tr className="w-1/2">
                    <td className="border-b border-r p-3">{props.available}</td>
                    <td className="border-b p-3">{props.unavailable}</td>
            </tr>
        </>
    )

}