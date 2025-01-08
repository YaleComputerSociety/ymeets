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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <Select
        style={{
          zIndex: 9999,
        }}
        multi
        create={false}
        options={options}
        clearOnSelect={false}
        values={[]}
        onChange={(values: any) => {
          props.update(values.map((val: any) => val));
        }}
        dropdownPosition="auto"
        placeholder=" Select preferred location(s)"
        noDataRenderer={() => (
          <div className="p-2 text-center">No location options set :(</div>
        )}
      />
    </div>
  );
}
