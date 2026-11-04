import { SelectHTMLAttributes } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

export default function EventSelect({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        {...props}
        className="w-full appearance-none rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      >
        {children}
      </select>
      <IconChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
      />
    </span>
  );
}
