import * as React from 'react';
import './locationSelectionComponent.css';
import Select from 'react-dropdown-select';
import { useEffect, useState, useRef } from 'react';

export function LocationSelectionComponent(props: any) {
  const locations: string[] = props.locations;
  const options = locations.map((loc) => ({
    value: loc,
    label: loc,
  }));

  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // @ts-expect-error
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // @ts-expect-error
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-[100%] flex flex-row justify-center md:justify-start z-50">
      <div className="custom-select-wrapper-time">
        {' '}
        {/* Ensure width matches the textarea */}
        <Select
          style={{ height: '100%', width: '100%' }} // Apply 100% width to match container
          multi
          create={false}
          options={options}
          clearOnSelect={false}
          values={[]}
          onChange={(values: any) => {
            props.update(values.map((val: any) => val.value));
          }}
          dropdownPosition="auto"
          placeholder=" Select preferred location(s)"
          noDataRenderer={() => (
            <div className="p-2 text-center">No location options set :(</div>
          )}
        />
      </div>
    </div>
  );
}
