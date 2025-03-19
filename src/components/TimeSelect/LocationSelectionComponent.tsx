import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-dropdown-select';
import { getAccountName, getLocationVotesByName } from '../../firebase/events';
import './locationSelectionComponent.css';

interface LocationSelectionProps {
  locations: string[];
  update: any;
}

interface LocationOption {
  value: string;
  label: string;
}

const LocationSelectionComponent: React.FC<LocationSelectionProps> = (
  props
) => {
  const locations = props.locations || [];

  const options = locations.map((loc) => ({
    value: loc,
    label: loc,
  }));

  const alreadySelectedLocations =
    getLocationVotesByName(getAccountName()) || [];
  const initialValues = alreadySelectedLocations.map((loc) => ({
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
      <Select<LocationOption>
        multi
        className="dark:bg-secondary_background-dark"
        create={false}
        options={options}
        clearOnSelect={false}
        values={initialValues}
        onChange={(values) => {
          props.update(values.map((val) => val.value));
        }}
        valueField="value"
        labelField="label"
        dropdownPosition="auto"
        placeholder="Select preferred location(s)"
        noDataRenderer={() => (
          <div className="p-2 text-center">No location options set :(</div>
        )}
        style={{
          zIndex: 50,
        }}
      />
    </div>
  );
};

export default LocationSelectionComponent;
