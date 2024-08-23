import React from 'react'

interface InputProps {
  id?: string
  className?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  maxLength?: number
}

export function Input({
  id,
  placeholder,
  value,
  onChange,
  rows = 1,
  maxLength = 100,
}: InputProps) {
  return (
    <textarea
      id={id}
      className="p-3 px-4 text-base border rounded-lg w-full md:w-[80%] bg-white"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      maxLength={maxLength}
    />
  )
}

// export function Input() {

//     return (
//     <textarea
//       id="event-description"
//       className="p-3 px-4 text-base border rounded-lg w-full md:w-[80%] bg-white"
//       placeholder="Event Description (Optional)"
//       value={eventDescription}
//       onChange={(e) => {
//         setEventDescription(e.target.value)
//       }}
//       rows={1}
//     />
//   )
// }
