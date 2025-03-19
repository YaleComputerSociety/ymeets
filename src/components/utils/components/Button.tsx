interface Props {
  bgColor: string;
  textColor: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  rounded?: 'full' | 'lg'; // Border radius
  textSize?: 'sm' | 'md' | 'lg'; // Text size
  px?: string; // Padding-left and padding-right
  py?: string; // Padding-top and padding-bottom
  themeGradient?: boolean;
}

export default function Button({
  textColor,
  bgColor,
  onClick,
  children,
  disabled = false,
  rounded = 'full',
  textSize = 'lg',
  px = '7', // Default padding
  py = '4', // Default padding
  themeGradient = true,
}: Props) {
  const borderRadius = rounded === 'full' ? 'rounded-full' : 'rounded-lg';
  const textSizeClass =
    textSize === 'sm' ? 'text-sm' : textSize === 'md' ? 'text-base' : 'text-lg';

  return (
    <button
      className={`drop-shadow-sm transform transition-transform hover:scale-90 py-${py} px-${px} active:scale-100 text-center font-bold w-fit disabled:hover:scale-100 disabled:bg-gray-500 disabled:opacity-70 
      ${
        themeGradient
          ? `bg-gradient-to-r from-primary to-primary-dark dark:from-blue-900 dark:to-blue-600`
          : `bg-${bgColor}`
      } 
      ${textSizeClass} text-${textColor} ${borderRadius}
      ${bgColor === `primary` ? `dark:bg-blue-700` : ``}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
