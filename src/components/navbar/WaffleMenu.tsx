import { useState, useEffect, useRef } from 'react';
import { IconGridDots } from '@tabler/icons-react';

// Product logos - place your logo files in src/assets/logos/
import coursetableLogo from '../../assets/logos/coursetable.png';
import yaliesLogo from '../../assets/logos/yalies.png';
import ymeetsLogo from '../../assets/logos/ymeets.png';
import ylabsLogo from '../../assets/logos/ylabs.png';
import yaleimsLogo from '../../assets/logos/yaleims.png';
import yalemealsLogo from '../../assets/logos/yalemeals.png';
import yaleclubsLogo from '../../assets/logos/yaleclubs.svg';

interface Product {
  name: string;
  url: string;
  logo: string;
  isCurrentApp?: boolean;
}

const products: Product[] = [
  {
    name: 'CourseTable',
    url: 'https://www.coursetable.com/',
    logo: coursetableLogo,
  },
  {
    name: 'Yalies',
    url: 'https://yalies.io/',
    logo: yaliesLogo,
  },
  {
    name: 'ymeets',
    url: '/',
    logo: ymeetsLogo,
    isCurrentApp: true,
  },
  {
    name: 'y/labs',
    url: 'https://yalelabs.io/',
    logo: ylabsLogo,
  },
  {
    name: 'YaleIMs',
    url: 'https://yaleims.com',
    logo: yaleimsLogo,
  },
  {
    name: 'YaleMeals',
    url: 'https://apps.apple.com/us/app/yalemeals/id6755962674',
    logo: yalemealsLogo,
  },
  {
    name: 'YaleClubs',
    url: 'https://yaleclubs.info',
    logo: yaleclubsLogo,
  },
];

export default function WaffleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuState, setMenuState] = useState<'closed' | 'opening' | 'open'>(
    'closed'
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (menuState === 'closed') {
      setIsOpen(true);
      setMenuState('opening');
      setTimeout(() => setMenuState('open'), 10);
    } else {
      setMenuState('closed');
      setTimeout(() => setIsOpen(false), 200);
    }
  };

  useEffect(() => {
    if (menuState === 'open') {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setMenuState('closed');
          setTimeout(() => setIsOpen(false), 200);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuState]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
        aria-label="YCS Apps"
        title="Yale Computer Society Apps"
      >
        <IconGridDots
          size={22}
          className="text-text dark:text-text-dark opacity-70 hover:opacity-100 transition-opacity"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-[9999] overflow-hidden transition-all duration-200 ease-out transform origin-top-right
            ${menuState === 'opening' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        >

          {/* Products Grid */}
          <div className="p-3 grid grid-cols-3 gap-1">
            {products.map((product) => (
              <a
                key={product.name}
                href={product.isCurrentApp ? undefined : product.url}
                onClick={
                  product.isCurrentApp ? (e) => e.preventDefault() : undefined
                }
                target={product.isCurrentApp ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`flex flex-col items-center p-3 rounded-xl
                  ${
                    product.isCurrentApp
                      ? 'bg-blue-50 dark:bg-blue-900/30 cursor-default'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'
                  }`}
              >
                {/* Logo */}
                <img
                  src={product.logo}
                  alt={`${product.name} logo`}
                  className="w-11 h-11 rounded-xl object-contain mb-2"
                />

                {/* Label */}
                <span
                  className={`text-xs font-medium text-center leading-tight
                  ${
                    product.isCurrentApp
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {product.name}
                </span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <a
              href="https://yalecomputersociety.org/products"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span>More from y/cs</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
