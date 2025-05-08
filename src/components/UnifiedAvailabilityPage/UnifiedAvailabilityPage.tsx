import { useState } from 'react';
import GroupViewPage from '../GroupView/GroupViewPage';
import TimeSelectPage from '../TimeSelect/TimeSelectPage';
import ConditionalGroupViewRenderer from '../GroupView/ConditionalGroupViewRenderer';
import { useLocation } from 'react-router-dom';

export default function UnifiedAvailabilityPage() {
  const location = useLocation();
  console.log('Location State:', location.state);
  const initialMode = location.state?.isEditing ?? false;
  const [isEditing, setIsEditing] = useState(initialMode); // Toggle between Edit and View modes

  return (
    <div>
      {isEditing ? (
        <TimeSelectPage isEditing={isEditing} toggleEditing={() => setIsEditing(false)} />
      ) : (
        <ConditionalGroupViewRenderer isEditing={isEditing} toggleEditing={() => setIsEditing(true)} />
      )}
    </div>
  );
}