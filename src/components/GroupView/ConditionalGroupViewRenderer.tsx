import { checkIfAdmin, getEventOnPageload } from '../../firebase/events';
import GroupViewPage from './GroupViewPage';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
/**
 *
 * Determines which Group View to render depending on if an admin is logged in or not.
 *
 * @returns Page Component
 */
export default function ConditionalGroupViewRenderer({
  isEditing,
  toggleEditing,
}: {
  isEditing: boolean;
  toggleEditing: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(checkIfAdmin());

  const { code } = useParams();

  useEffect(() => {
    if (code !== undefined) {
      getEventOnPageload(code)
        .then(() => {
          setIsAdmin(checkIfAdmin());
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      alert('code is missing');
    }
  }, []);

  return (
    <>
      {isAdmin ? (
        <div>
          <GroupViewPage isAdmin={true} isEditing={false} toggleEditing={toggleEditing}/>
        </div>
      ) : (
        <div>
          <GroupViewPage isAdmin={false} isEditing={false} toggleEditing={toggleEditing} />
        </div>
      )}
    </>
  );
}
