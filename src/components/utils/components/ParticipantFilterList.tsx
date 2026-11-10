import { Dispatch, SetStateAction } from 'react';
import { IconCheck } from '@tabler/icons-react';

interface ParticipantFilterListProps {
  allPeople: string[];
  declinedPeople: string[];
  peopleStatus: { [key: string]: boolean };
  setPeopleStatus: Dispatch<SetStateAction<{ [key: string]: boolean }>>;
  /** Called instead of toggling when the user tries to hide the last shown participant. */
  onRemoveLastParticipant: () => void;
  size?: 'sm' | 'md';
}

/**
 * Returns the participants who haven't declined, and how many of them are shown.
 */
export function getFilterableParticipants(
  allPeople: string[],
  declinedPeople: string[],
  peopleStatus: { [key: string]: boolean }
): { people: string[]; shownCount: number } {
  const people = (allPeople || []).filter(
    (name) => !declinedPeople.includes(name)
  );
  return {
    people,
    shownCount: people.filter((name) => peopleStatus[name]).length,
  };
}

/**
 * Checkbox list for choosing which participants the group calendar shows.
 * Declined participants are left out, and at least one participant always stays shown.
 */
export default function ParticipantFilterList({
  allPeople,
  declinedPeople,
  peopleStatus,
  setPeopleStatus,
  onRemoveLastParticipant,
  size = 'sm',
}: ParticipantFilterListProps) {
  const { people, shownCount } = getFilterableParticipants(
    allPeople,
    declinedPeople,
    peopleStatus
  );

  return (
    <>
      {people.map((name) => (
        <div
          key={name}
          className={`flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
            size === 'md' ? 'py-2 px-2 -mx-2' : 'py-1.5 px-1 -mx-1'
          }`}
          onClick={() => {
            if (shownCount === 1 && peopleStatus[name]) {
              onRemoveLastParticipant();
              return;
            }
            setPeopleStatus((prev) => ({
              ...prev,
              [name]: !prev[name],
            }));
          }}
        >
          <span
            className={`text-sm min-w-0 break-words ${peopleStatus[name] ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {name}
          </span>
          <div
            className={`${size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} shrink-0 rounded border flex items-center justify-center ${
              peopleStatus[name]
                ? 'bg-primary border-primary'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {peopleStatus[name] && (
              <IconCheck size={size === 'md' ? 14 : 12} className="text-white" />
            )}
          </div>
        </div>
      ))}
    </>
  );
}
