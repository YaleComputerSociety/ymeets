import { calandarDate } from "./scheduletypes"

interface DateBarProps {
    dates : calandarDate[]
}

export default function DateBar({dates} : DateBarProps) {

    return (
        <div className={`flex flex-row`}>
            {
                dates.map((d) => {
                    return <div className="border border-solid w-16 border-black">
                        <center>
                            <p>{d.shortenedWeekDay}</p>
                            <br/>
                            <p>{d.calanderDay}</p>
                        </center>
                    </div>
                })
            }


        </div>
    )

}