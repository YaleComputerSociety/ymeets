import { calandarDate } from  "../../types"

interface DateBarProps {
    dates : calandarDate[]
}

export default function DateBar({dates} : DateBarProps) {

    return (
        <div className={`flex flex-row`}>
            {
                dates.map((d, index) => {
                    return <div key={index}> 
                    { index == 0 ?
                        <div className="border-black border-b flex-1 w-16 ">
                            <center>
                                <p className="text-sm">{d.month}</p>                   
                                <p className="text-xs">{d.shortenedWeekDay} {d.calanderDay}</p>
                            </center>
                        </div>
                        : 
                        <div className="border-black border-b flex-1 w-16 ">
                            <center>
                                <p className="text-sm">{d.month}</p>                   
                                <p className="text-xs">{d.shortenedWeekDay} {d.calanderDay}</p>
                            </center>
                        </div>
                    }
                    </div>
                })
            }


        </div>
    )

}