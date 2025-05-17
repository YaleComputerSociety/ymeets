import React, { ReactNode, SyntheticEvent } from 'react'
import ApiCalendar from 'react-google-calendar-api'

const config = {
  clientId: '1017679091024-mf9320n5435ab3io3hfsajie3lcb54d8.apps.googleusercontent.com',
  apiKey: 'AIzaSyB922dDAqfzMmBDQezEm9bWAEqSFyidxmI',
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  discoveryDocs: [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
  ]
}

export const apiCalendar = new ApiCalendar(config)
