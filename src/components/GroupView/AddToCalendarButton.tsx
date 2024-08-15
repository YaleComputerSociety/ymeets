import { useState, useCallback, useContext } from 'react'
import { getAccountId, getEventObjectForGCal } from '../../firebase/events'
import { GAPIContext } from '../../firebase/gapiContext'
import { signInWithGoogle } from '../../firebase/auth'
import { LoadingAnim } from '../utils/components/LoadingAnim'

/**
 *
 * Facilitates exporting the event to the currently logged in user's calandear
 *
 * @returns Page Support Component - Admin View
 */
function AddToGoogleCalendarButton(): JSX.Element {
  const { gapi, GAPILoading, handleIsSignedIn } = useContext(GAPIContext)
  const [loading, setLoading] = useState(false)

  const createCalendarEvent = useCallback(
    async (event: any) => {
      if (!gapi) {
        alert('gapi not loaded')
        return
      }
      setLoading(true)

      try {
        // @ts-expect-error
        const request = await gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: event,
        })
      } catch (e) {
        console.error('Error creating user event: ', e)
        setLoading(false)
        return
      }

      setLoading(false)
      alert('Exporting to Google Calendar!')
    },
    [gapi]
  )

  if (loading || GAPILoading) {
    return <LoadingAnim />
  }

  return (
    <>
      <button
        className="font-bold rounded-full bg-white text-black py-3 px-5 text-sm w-full
        transform transition-transform hover:scale-90 active:scale-100e"
        onClick={
          getAccountId() !== ''
            ? async () => {
                await createCalendarEvent(getEventObjectForGCal())
              }
            : () => {
                signInWithGoogle(undefined, gapi, handleIsSignedIn)
              }
        }
      >
        {getAccountId() !== ''
          ? 'Add to Google Calendar'
          : 'Sign in to Google to Add to GCAL'}
      </button>
    </>
  )
}

export default AddToGoogleCalendarButton
