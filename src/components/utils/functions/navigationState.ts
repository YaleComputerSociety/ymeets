// Router location state used to coordinate navigation with the unsaved-changes guard.

// Navigate with this state to skip the unsaved-changes prompt, for actions the
// user has already confirmed (e.g. declining or deleting an event).
export const SKIP_UNSAVED_CHANGES_PROMPT = { skipUnsavedChangesPrompt: true };

// Navigate with this state to log out once the navigation actually completes,
// so cancelling at the unsaved-changes prompt keeps the user signed in.
export const LOGOUT_ON_ARRIVAL = { logoutOnArrival: true };

export const shouldSkipUnsavedChangesPrompt = (state: unknown): boolean =>
  (state as { skipUnsavedChangesPrompt?: boolean } | null)
    ?.skipUnsavedChangesPrompt === true;

export const shouldLogoutOnArrival = (state: unknown): boolean =>
  (state as { logoutOnArrival?: boolean } | null)?.logoutOnArrival === true;
