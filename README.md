# ymeets - Yale Group Meetings Made Easy
ymeets provides a clean interface for scheduling meetings with other people. We aim to make the platform the go-to place for Yalies to plan their organized gatherings, with features ranging from GAPI integration to Yale Academic Calandar support. 

ymeets is an open-source application maintained by a team of volunteers within the [Yale Computer
Society](https://github.com/YaleComputerSociety), a tech organization at Yale University.

# Quick Start
`git clone` the repository.

Run `npm install`

Run `npm start` in the top level directory.

The currently deployed version can be viewed at https://ymeets.com.

# Directory Structure
`src\components`:
Houses all of the dynamic and static frontend components.

There are three types of components: **Page Components**, **Page Support Components** and **Utility** Components, 

Page components render at a specific route in `Root.tsx`. (i.e. the `AboutUs.tsx` component)\\ 

Page Support Components provide utility to support a specific page component. (i.e. the `ContributerCard()` function)

Utility Components are the building blocks to all other components. Examples of this are are general purpose buttons and input fields.

`src\firebase`:
Houses all the backend functionality. Backend is done via Firebase calls. Stay tuned for more backend documentation.

`src\static`:
Static imagery used across the site.

`Root.tsx`:
The react router.

`types.tsx`: Types used across the front and backend of the application to saturate components. Types that are used with a handful of components are not defined here, but instead in their respective file.

As is expanded on in the style guide, other directory modules follow specific formats to make their functionality obvious.

# Contribution Guide
First, read this ReadMe in its entirety (you're off to a good start). Generally, people who contribute are part of the y/cs. If you have a contribution you want to make, but you are not part of the ymeets team within the y/cs, we welcome you to open a Pull Request. You can either solve an open issue that has not been assigned to someone, or contribute a new feature of your design. A successfully merged PR of significant contribution will earn you   implicit membership in the org. You will be credited on the site. 

If you wish to design your own feature, we encourage you to reach out to the ymeets team first at *yalecomputersociety.org*, as we reserve the right to reject any design choice we are not consulted on.

# ymeets style guide
ymeets should be written in TypeScript. 

General functions that are used across more than one file should be stored in the `\utils` folder under the `\functions` folder rather than be redeclared in each scope they are necessary.



Component files should be declared in PascalCase, with a matching PascalCase function definition. Folders that do not contain an exported component file should be declared in camelCase. Please do not use class components under any circumstances.

At the top of each 



