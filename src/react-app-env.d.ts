/// <reference types="react-scripts" />
/// <reference types="gapi.auth2"/>

declare global {
  interface Window {
    FB: typeof FB
  }
}

declare module '*.mp4' {
  const src: string;
  export default src;
}