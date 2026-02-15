import React, { useLayoutEffect, useRef } from 'react';

interface Props {
  available: string;
  unavailable: string;
  onHeightMeasured?: (height: number) => void;
}

/**
 *
 * Renders a row of the availability chart. Contains an individual who is
 * available and one who is unavaiable.
 *
 * @param {string} available - The name of the available individual.
 * @param {string} unavailable - Name of the unavailable individual
 * @returns {JSX.Element}
 */
export default function ChartRow({ available, unavailable, onHeightMeasured }: Props) {
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useLayoutEffect(() => {
    if (!onHeightMeasured || !rowRef.current) return;
    onHeightMeasured(rowRef.current.getBoundingClientRect().height);
  }, [onHeightMeasured]);

  return (
    <>
      <tr ref={rowRef} className="w-1/2 text-md">
        <td className="p-3 text-primary">{available}</td>
        <td className="p-3 text-text dark:text-text-dark">{unavailable}</td>
      </tr>
    </>
  );
}
