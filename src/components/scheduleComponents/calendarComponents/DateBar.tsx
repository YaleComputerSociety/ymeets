import { calandarDate } from "./scheduletypes"

interface DateBarProps {
    dates : calandarDate[]
}

export default function DateBar({dates} : DateBarProps) {

    return (
        <div className={`flex flex-row`}>
            {
                dates.map((d, index) => {
                    return <> 
                    { index == 0 ?
                        <div className="w-16 p-2 border-black border-l border-r border-t border-b">
                            <center>
                                <p style={{fontSize : "10px"}} className="mb-2 mt-2">{d.month}</p>                   
                                <p>{d.shortenedWeekDay}</p>
                                <p className="mb-2">{d.calanderDay}</p>
                            </center>
                        </div>
                        : 
                        <div className="w-16 p-2 border-black border-r border-t border-b">
                            <center>
                                <p style={{fontSize : "10px"}} className="mb-2 mt-2">{d.month}</p>                   
                                <p>{d.shortenedWeekDay}</p>
                                <p className="mb-2">{d.calanderDay}</p>
                            </center>
                        </div>
                    }
                    </>
                })
            }


        </div>
    )

}