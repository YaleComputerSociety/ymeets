import React from 'react'
import no_person from './anon.jpeg'
import { FaGithubSquare, FaLinkedin, FaLink } from 'react-icons/fa'
import group from './ymeetsgroupimage.png'
import ETHAN from './EthanMathieu.jpeg'
import NICK from './NicholasRibeiero.jpg'
import RON from './RonCheng.png'
import ROME from './Rome Thorstenson.png'
import LILY from './LilyLin.jpeg'
import LAILAH from './lailah.jpeg'
import JIAKANG from './Jiakang.png'
import ALAN from './AlanXie.jpg'
import SHANKARA from './Shankara_Headshot.jpeg'

const CONTRIBUTORS = [
  {
    name: 'Ethan Mathieu',
    title: ['Product Lead', 'Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/ethan-mathieu/',
    portfolio: 'https://ethanmathieu.com/',
    github: 'https://github.com/emath12',
    image: ETHAN,
  },

  {
    name: 'Rome Thortensen',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/romethorstenson/',
    portfolio: undefined,
    github: 'https://github.com/Rome-1',
    image: ROME,
  },

  {
    name: 'Nicholas Ribeiro',
    title: ['Product Lead', 'Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/nicholas-ribeiro1/',
    portfolio: 'http://www.nicholasjribeiro.com/',
    github: 'https://github.com/nickribs1',
    image: NICK,
  },

  {
    name: 'Ron Cheng',
    title: ['Software Engineer', 'UI/UX Designer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/ron-cheng-360b791a7/',
    portfolio: undefined,
    github: 'https://github.com/rcheng11',
    image: RON,
  },

  {
    name: 'Jiakang Chen',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/jiakang-chen/',
    portfolio: undefined,
    github: 'https://github.com/jkc33',
    image: JIAKANG,
  },

  {
    name: 'Alan Xie',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/alanxie2026',
    github: 'https://github.com/gr4d13nt',
    image: ALAN,
    portfolio: undefined,
  },

  {
    name: 'Lily Lin',
    title: ['UI/UX Designer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/lily-lin-a0565b214/',
    portfolio: undefined,
    github: undefined,
    image: LILY,
  },

  {
    name: 'Lailah Nabegu',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/lailah-nabegu/',
    portfolio: undefined,
    github: undefined,
    image: LAILAH,
  },

  {
    name: 'Shankara Abbineni',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/shankaraabbineni/',
    github: 'https://github.com/SAbbineni24',
    portfolio: undefined,
    image: SHANKARA,
  },
]

interface ContributorCardProps {
  name: string | undefined
  title: string[] | undefined
  founding: boolean | undefined
  linkedin: string | undefined
  portfolio: string | undefined
  github: string | undefined
  image: string | undefined
}

/**
 * Page Support Component for the AboutUsPage. Displays information about
 * a contributer to the project
 * @param ContributerCardProps
 * @returns Page Support Component
 */
function ContributorCard({
  name,
  title,
  founding,
  linkedin,
  portfolio,
  github,
  image,
}: ContributorCardProps) {
  console.log(name, image)
  return (
    <div
      className="rounded-lg border min-w-fit bg-white mr-6 mb-6 shadow-lg \
        transform transition-transform hover:scale-105 active:scale-100e"
    >
      <img
        className="mb-2 min-w-full h-80 object-cover object-center rounded-t-lg"
        src={image !== undefined ? image : no_person}
        height={400}
      />
      <div className="px-5 pb-5 pt-2">
        <div>
          <h1 className="text-xl mb-3 font-bold font-mono">{name}</h1>
          {title?.map((subtitle) => {
            const style: Record<string, string> = {
              'Software Engineer': 'text-blue-500 border-blue-500',
              'UI/UX Designer': 'text-pink-500 border-pink-500',
              'Product Lead': 'text-amber-500 border-amber-500',
            }
            return (
              <h3
                className={
                  'text-md rounded-full border px-4 py-1 mb-2 w-fit ' +
                  style[subtitle]
                }
              >
                {subtitle}
              </h3>
            )
          })}
          <p className="text-gray-500 border-gray-500 text-md rounded-full border px-4 py-1 w-fit">
            {founding === true ? 'Founding Member' : ''}
          </p>
        </div>
        <div className="flex bottom-0 flex-row mt-2 py-2 text-gray-500">
          <div className="pr-1 hover:text-blue-500">
            {github && (
              <a href={github}>
                <FaGithubSquare size={30} />
              </a>
            )}
          </div>
          <div className="pr-1 hover:text-blue-500">
            {linkedin && (
              <a href={linkedin}>
                <FaLinkedin size={30} />
              </a>
            )}
          </div>
          <div className="pr-1 hover:text-blue-500">
            {portfolio && (
              <a href={portfolio}>
                <FaLink size={30} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * About Us.
 * @returns Page Component
 */
export default function AboutUsPage() {
  return (
    <div className="flex flex-row justify-center items-center w-screen">
      <div className="w-[80%] md:w-[70%]">
        <h1 className="text-5xl font-bold mb-7">Our Story</h1>
        <div
          className="flex flex-col-reverse justify-between \
                            lg:flex-row"
        >
          <p className="text-xl text-gray-700">
            Our app ymeets has been in development since late 2022, starting
            intially as the app "Study Buddy" by Rome Thortensen (Yale '25) and
            Ethan Mathieu (Yale '25). Since then, this project has undergone
            several transformations as we hopped from different codebases and
            different ideas (we almost named it Beluga!).
            <br />
            <br />
            By 2024, our goal is to create a platform for making the scheduling
            of group events easier. We took inspiration from sites like
            when2meet, reverse engineering the features we liked, and integrated
            our own ideas, features, and designs. As of right now, this app is
            built and maintained by a small team of passionate{' '}
            <a
              className="text-blue-500 "
              href="https://yalecomputersociety.org/"
            >
              y/cs (Yale Computer Society){' '}
            </a>
            developers hoping to make scheduling more user friendly and
            convenient. If you have concerns about our app uses your
            information, please go to the following{' '}
            <a className="text-blue-500" href="/privacy">
              page
            </a>{' '}
            to view our privacy policy.
          </p>
          <img
            className="inline-block mb-6 md:ml-6"
            src={group}
            height={350}
            width={350}
          ></img>
        </div>
        <br />
        <h1 className="text-5xl font-bold">Our Team</h1>
        <br />
        <div className="grid lg:grid-cols-4 md:grid-cols-2">
          {CONTRIBUTORS.map((c) => {
            console.log(c)
            return (
              <ContributorCard
                name={c.name}
                title={c.title}
                founding={c.founding}
                linkedin={c.linkedin}
                portfolio={c.portfolio}
                github={c.github}
                image={c.image}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
