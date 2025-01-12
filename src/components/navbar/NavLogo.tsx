import CalendarIcon from './CalendarIcon';

export default function NavLogo() {
  return (
    <div className="inline-flex items-center space-x-4 transition hover:scale-x-102">
      <a href="/">
        <div
          className="flex flex-row items-center select-none text-text dark:text-text-dark \
                                hover:text-primary"
        >
          <div className="mr-2">
            <CalendarIcon></CalendarIcon>
          </div>
          <span className="text-2xl font-bold font-mono">ymeets</span>
        </div>
      </a>
    </div>
  );
}
