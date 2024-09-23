interface Props {
  bgColor: string;
  textColor: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function ButtonSmall({
  textColor,
  bgColor,
  onClick,
  children,
  disabled = false,
}: Props) {
  return (
    <button
      className={`text-md text-${textColor} drop-shadow-sm transform transition-transform hover:scale-90 py-3 px-5 active:scale-100 text-center rounded-full font-bold w-fit disabled:hover:scale-100 disabled:bg-gray-500 disabled:opacity-70 bg-${bgColor}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
