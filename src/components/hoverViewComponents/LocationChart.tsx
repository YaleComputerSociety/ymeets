export default function LocationChart(props: any) {
    return (
        <div className="flex justify-center items-center text-center bg-white rounded-lg">
            <table className="table-fixed border-collapse w-full">
                <tbody>
                    <tr>
                        <th className="border-b p-3 text-black">Location</th>
                        <th className="border-b p-3 text-black">Votes</th>
                    </tr>
                    {/* @ts-ignore */}
                    {props.locationOptions.map((loc, idx) => {
                        return <tr>
                                <td className="p-3">{loc}</td>
                                <td className="p-3">{props.locationVotes[idx]}</td>
                            </tr>
                    })}
                </tbody>
            </table>
        </div>
    )

}