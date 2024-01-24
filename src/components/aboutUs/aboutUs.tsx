import no_person from "./anon.jpeg"
import { FaGithubSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaLink } from "react-icons/fa";
import group from "./ymeetsgroupimage.png"
import ETHAN from "./EthanMathieu.jpeg"
import NICK from "./NicholasRibeiero.jpg"
import RON from "./RonCheng.png"

const CONTRIBUTORS = [
    {
        name : "Ethan Mathieu",
        title : ["Software Engineer", "Product Lead"],
        founding : true,
        linkedin : "https://www.linkedin.com/in/ethan-mathieu/",
        portfolio : "https://ethanmathieu.com/",
        github : "https://github.com/emath12",
        image : ETHAN

    },

    {
        name : "Rome Thortensen",
        title : ["Software Engineer"],
        founding : true,
        linkedin : undefined,
        portfolio : undefined,
        github : "https://github.com/Rome-1",
        image : undefined

    },
    
    {
        name : "Nicholas Riberio",
        title : ["Product Lead", "Software Engineer"],
        founding : true,
        linkedin : "https://www.linkedin.com/in/nicholas-ribeiro1/",
        portfolio : "http://www.nicholasjribeiro.com/",
        github : "https://github.com/nickribs1",
        image : NICK

    },

    {
        name : "Ron Cheng",
        title : ["Software Engineer", "UI/UX Designer"],
        founding : true,
        linkedin : "https://www.linkedin.com/in/ron-cheng-360b791a7/",
        portfolio : undefined,
        github : "https://github.com/rcheng11",
        image : RON

    },

    {
        name : "Jiakang Chen",
        title : ["Software Engineer"],
        founding : true,
        linkedin : undefined,
        portfolio :undefined,
        github : "https://github.com/JiakangChenBuff",
        image: undefined

    },

    {
        name : "Alan Xie",
        title : ["Software Engineer"],
        founding : true,
        linkedin : undefined,
        github :undefined,
        image : undefined
    },

    {
        name : "Lily Lin",
        title : ["UI/UX Designer"],
        founding : true,
        linkedin : undefined,
        portfolio : undefined,
        github : undefined,
        image : undefined


    },

    {
        name : "Laliah Nabegu",
        title : ["Software Engineer"],
        founding : true,
        linkedin :undefined,
        portfolio : undefined,
        github : undefined ,   
        image : undefined
    },

    {
        name : "Shankara Abbineni",
        title : ["Software Engineer"],
        founding : true,
        linkedin : "https://www.linkedin.com/in/shankaraabbineni/",
        github : undefined,
        portfolio : undefined,
        image: undefined


    }

]

interface ContributorCardProps {
    name : string | undefined,
    title : string[] | undefined
    founding : boolean | undefined,
    linkedin : string | undefined,
    portfolio : string | undefined,
    github : string | undefined,
    image : string | undefined,
}

function ContributorCard({name, title, founding, linkedin, portfolio, github, image} : ContributorCardProps) {

    console.log(name, image);

    return (
        <div className="rounded-b-lg border min-w-fit border-black bg-white mr-4 mb-4">

            <img 
                className="mb-2 min-w-full h-80"
                src={image !== undefined ? image : no_person}
                height={400}
                />

            <h1 className="text-lg px-4 py-1 font-semibold">{name}</h1>

            { 
                title?.map((subtitle) => { 
                    return <h3 className="text-md px-4 py-1">{subtitle}</h3>
                })
            }

            <p className="text-amber-500 px-4 py-1 ">

            {
                founding === true ? "Founding Memeber" : ""
            }

            </p>

            <div className="flex bottom-0 flex-row px-3 py-2">
                <div className="pr-1">
                    {github && <a href={github}>
                        <FaGithubSquare 
                            size={30}
                        />
                    </a>
                }   
                </div>
                <div className="pr-1">
                    { linkedin &&
                    <a href={linkedin}>
                        <FaLinkedin 
                            size={30}
                        />
                    </a>
                    }
                </div>
                <div className="pr-1">
                    
                    {
                        portfolio && 
                        <a href={portfolio}>
                        <FaLink
                            size={30}
                        />
                    </a>
                    }
                </div>

        
            </div>

        </div>
    )

}

export default function AboutUs() {
    return <div className="ml-20 mr-20">
        <h1 className="text-3xl font-bold">Our Story</h1>
        <div className="flex lg:flex-row md:flex-col sm:flex-col xs:flex-col justify-between">
            <p className="text-2xl">
            Lorem ipsum dolor sit amet, 
            consectetur adipiscing elit, 
            sed do eiusmod tempor incididunt ut 
            labore et dolore magna aliqua. Ut enim ad minim veniam, <br/>
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <img   
                className="hidden md:hidden sm:hidden lg:visible lg:flex"
                src={group}
                height={350}
                width={350}
            >
            </img>
        </div>
        <br/>
        <h1 className="text-3xl font-bold">Our Team</h1>
        <br/>
        <div className="grid lg:grid-cols-4 md:grid-cols-2">
        {
            CONTRIBUTORS.map((c) => {

                console.log(c);
                return <ContributorCard 
                            name={c.name}
                            title={c.title}
                            founding={c.founding}
                            linkedin={c.linkedin}
                            //@ts-ignore
                            portfolio={c.portfolio}
                            //@ts-ignore
                            github={c.github}
                            image={c.image}
                        />   
            })
        }
        </div>
    </div>

}