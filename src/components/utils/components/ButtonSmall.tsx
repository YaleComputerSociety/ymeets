interface Props {
  bgColor: string;
  textColor: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  themeGradient?: boolean;
}

export default function ButtonSmall({
  textColor,
  bgColor,
  onClick,
  children,
  disabled = false,
  themeGradient = true,
}: Props) {
  return (
    <button
      className={`text-sm md:text-md text-${textColor} transform transition-transform hover:scale-95 py-3 px-3 lg:py-3 lg:px-5 text-center rounded-full font-bold w-fit disabled:hover:scale-100 disabled:bg-gray-500 disabled:opacity-70 ${
        themeGradient
          ? `bg-gradient-to-r from-primary to-primary-dark dark:from-blue-900 dark:to-blue-600`
          : `bg-${bgColor}`
      } ${bgColor === `primary` ? `dark:bg-blue-700` : ``}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
