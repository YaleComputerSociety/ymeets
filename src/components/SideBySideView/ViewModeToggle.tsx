import React from 'react';

export type ViewMode = 'side-by-side' | 'time-select' | 'group-view';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({
  currentMode,
  onModeChange,
}: ViewModeToggleProps) {
  const options: { mode: ViewMode; label: string }[] = [
    { mode: 'side-by-side', label: 'Side-by-Side' },
    { mode: 'time-select', label: 'Edit Only' },
    { mode: 'group-view', label: 'View Only' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-1">
      {options.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
            ${
              currentMode === mode
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
