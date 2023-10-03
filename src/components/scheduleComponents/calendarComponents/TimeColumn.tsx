import { generateTimeBlocks } from "../utils/generateTimeBlocks";

export default function TimeColumn(props: any) {

    const {startTime, endTime} = props;

    let blocks = generateTimeBlocks(startTime, endTime);

    let military_to_normal: Record<string, string> = {
        "00:00": "12AM",
        "01:00": "1AM",
        "02:00": "2AM",
        "03:00": "3AM",
        "04:00": "4AM",
        "05:00": "5AM",
        "06:00": "6AM",
        "07:00": "7AM",
        "08:00": "8AM",
        "09:00": "9AM",
        "10:00": "10AM",
        "11:00": "11AM",
        "12:00": "12PM",
        "13:00": "1PM",
        "14:00": "2PM",
        "15:00": "3PM",
        "16:00": "4PM",
        "17:00": "5PM",
        "18:00": "6PM",
        "19:00": "7PM",
        "20:00": "8PM",
        "21:00": "9PM",
        "22:00": "10PM",
        "23:00": "11PM"
    }
    

    return (
        <div className="mr-1 ml-1">
        <div className="lg:h-28 md:h-24 xs:h-24 sm:h-20"></div>
            {  
            
                blocks.map((block) => {
                    
                    return (
                        <div>
                            <p className="text-xs text-[#787878] font-roboto">{block in military_to_normal ? military_to_normal[block] : "-"}</p>
                            <div className="h-6"></div>
                        </div>
                    )
                })
            }
        </div>
    )
}