/* eslint-disable */

import React from 'react';
import no_person from './anon.jpeg';
import { FaGithubSquare, FaLinkedin, FaLink } from 'react-icons/fa';
import group from './ymeetsgroupimage.png';
import ETHAN from './ethan.png';
import NICK from './NicholasRibeiero.jpg';
import RON from './RonCheng.png';
import ROME from './Rome Thorstenson.png';
import LILY from './LilyLin.png';
import LAILAH from './lailah.jpeg';
import JIAKANG from './Jiakang.png';
import ALAN from './AlanXie.jpg';
import SHANKARA from './Shankara_Headshot.jpeg';

import JEET from './Jeet_Headshot.jpg';
import RYLAN from './Rylan_Headshot.jpg';

const CURR_CONTRIBUTORS = [
  {
    name: 'Jeet Parikh',
    title: ['Product Lead', 'Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/parikhjeet/',
    github: 'https://github.com/jeet-parikh',
    image: JEET,
  },

  {
    name: 'Rylan Yang',
    title: ['Product Lead', 'Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/rylan-yang/',
    github: 'https://github.com/rylany27',
    image: RYLAN,
  },

  {
    name: 'Julien Toussaint Dang',
    title: ['Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/julien-toussaint-dang/',
    github: 'https://github.com/JulienTD23',
    image: no_person,
  },

  {
    name: 'Nikita Saitov',
    title: ['Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/nikita-saitov-bb8648331/',
    github: 'https://github.com/niksaitov',
    image: no_person,
  },

  {
    name: 'Hawa Khalif',
    title: ['Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/hawa-khalif-44a788241/',
    github: 'https://github.com/hawakhalif',
    image: no_person,
  },

  {
    name: 'Jack McCain',
    title: ['Software Engineer'],
    founding: false,
    linkedin: 'https://www.linkedin.com/in/jack-mccain-49bab41a1/',
    github: 'https://github.com/jackmccain',
    image: no_person,
  },

  {
    name: 'Nicholas Ribeiro',
    title: ['Senior Advisor'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/nicholas-ribeiro1/',
    portfolio: 'http://www.nicholasjribeiro.com/',
    github: 'https://github.com/nickribs1',
    image: NICK,
  },

  {
    name: 'Ethan Mathieu',
    title: ['Senior Advisor'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/ethan-mathieu/',
    github: 'https://github.com/emath12',
    image: ETHAN,
  },
];

const PAST_CONTRIBUTORS = [
  {
    name: 'Rome Thorstenson',
    title: ['Software Engineer'],
    founding: true,
    linkedin: 'https://www.linkedin.com/in/romethorstenson/',
    portfolio: undefined,
    github: 'https://github.com/Rome-1',
    image: ROME,
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
  name: string | undefined;
  title: string[] | undefined;
  founding: boolean | undefined;
  linkedin: string | undefined;
  portfolio: string | undefined;
  github: string | undefined;
  image: string | undefined;
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
  return (
    <div
      className="rounded-lg border min-w-fit bg-white dark:bg-secondary_background-dark dark:text-text-dark mr-6 mb-6 shadow-lg \
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
              'Software Engineer': 'text-blue-400 border-blue-400',
              'UI/UX Designer': 'text-pink-400 border-pink-400',
              'Product Lead': 'text-amber-600 border-amber-600',
              'Senior Advisor': 'text-purple-400 border-purple-400',
            };
            return (
              <h3
                className={
                  'text-md rounded-full border px-4 py-1 mb-2 w-fit ' +
                  style[subtitle]
                }
              >
                {subtitle}
              </h3>
            );
          })}
          {/* <p className="text-gray-500 border-gray-500 text-md rounded-full border px-4 py-1 w-fit">
            {founding === true ? 'Founding Member' : ''}
          </p> */}
        </div>
        <div className="flex bottom-0 flex-row mt-2 py-2 text-gray-500 dark:text-text-dark">
          <div className="pr-1 hover:text-primary">
            {github && (
              <a href={github}>
                <FaGithubSquare size={30} />
              </a>
            )}
          </div>
          <div className="pr-1 hover:text-primary">
            {linkedin && (
              <a href={linkedin}>
                <FaLinkedin size={30} />
              </a>
            )}
          </div>
          <div className="pr-1 hover:text-primary">
            {portfolio && (
              <a href={portfolio}>
                <FaLink size={30} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * About Us.
 * @returns Page Component
 */
export default function AboutUsPage() {
  return (
    <div className="flex flex-row justify-center items-center w-screen dark:text-text-dark">
      <div className="w-[80%] md:w-[70%]">
        <h1 className="text-5xl font-bold mb-7">Our Story</h1>
        <div
          className="flex flex-col-reverse justify-between \
                            lg:flex-row"
        >
          <p className="text-xl text-gray-700 dark:text-text-dark">
            Frustrated with unaesthetic group schedulers that lacked modern
            integrations and were not tailored to the college student's needs,
            we set out to provide our own solution. <br /> <br />
            ymeets is a platform designed to make it easier to schedule group
            events @ Yale by leveraging Google Calendar and allowing the
            physical location for meetings to also be decided on. The app is
            built and maintained by a small team of{' '}
            <a
              className="text-primary "
              href="https://yalecomputersociety.org/"
            >
              y/cs (Yale Computer Society){' '}
            </a>
            developers. If you have concerns about our app uses your
            information, please go to the following{' '}
            <a className="text-primary" href="/privacy">
              page
            </a>{' '}
            to view our privacy policy.
          </p>
          <img
            className="inline-block mb-6 md:ml-6"
            src={group}
            height={300}
            width={300}
          ></img>
        </div>
        <br />
        <h1 className="text-5xl font-bold">Our Team</h1>
        <br />
        <div className="grid lg:grid-cols-4 md:grid-cols-2">
          {CURR_CONTRIBUTORS.map((c) => {
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
            );
          })}
        </div>
        <br />
        <br />
        <h1 className="text-5xl font-bold">Past Contributors</h1>
        <br />
        <div className="grid lg:grid-cols-4 md:grid-cols-2">
          {PAST_CONTRIBUTORS.map((c) => {
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
