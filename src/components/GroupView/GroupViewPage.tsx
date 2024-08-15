import { checkIfAdmin, getEventOnPageload } from '../../firebase/events'
import ParticipantGroupViewPage from './ParticipantGroupViewApp'
import AdminGroupViewPage from './AdminGroupViewApp'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
/**
 *
 * Determines which Group View to render depending on if an admin is logged in or not.
 *
 * @returns Page Component
 */
export default function GroupViewApp() {
  const [isAdmin, setIsAdmin] = useState(checkIfAdmin())

  const { code } = useParams()

  useEffect(() => {
    // @ts-expect-error
    getEventOnPageload(code)
      .then(() => {
        setIsAdmin(checkIfAdmin())
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return (
    <>
      {isAdmin ? (
        <div>
          <AdminGroupViewPage />
        </div>
      ) : (
        <div>
          <ParticipantGroupViewPage />
        </div>
      )}
    </>
  )
}
