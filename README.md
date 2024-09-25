# track-event-analytics

`track-event-analytics` is an event management and tracking package built to help you monitor and analyze events in  application. It integrates with Firebase and React, offering a seamless way to track user interactions and event data, while utilizing a custom random number generator instead of `uuid` for unique event identifiers.

## Features
- Easy integration with Firebase to store and manage event data.
- Compatibility with React and device detection through `react-device-detect`.
- Environment-based configuration using `dotenv`.
- TypeScript support for React and Firebase.
- Lightweight, with minimal dependencies.
  
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Dependencies](#dependencies)


## Installation

You can install the package via `npm`:

```bash
npm install track-event-analytics

## Usage
import trackAnalytics from "track-event-analytics";

trackAnalytics("CLICK_CONTINUEWITHGOOGLE", {
      userid: "oiuytre",
      number: "676",
    });

##Environmental Variables
This package requires the following environment variables to be set in a .env file:

NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""
BASE_URL_TRACKER=""


## Dependencies
The package uses the following dependencies:

dotenv: Loads environment variables from a .env file.
firebase: Manages Firebase interaction, for storing and tracking events.
react: Enables React integration for event tracking within your React components.
react-device-detect: Allows for device-specific tracking (mobile, tablet, etc.).
ts-node: Enables TypeScript support during development.

## Dev Dependencies
@types/react: TypeScript type definitions for React.
@types/react-dom: TypeScript type definitions for React DOM.
@types/uuid: TypeScript type definitions for UUID (although a random number generator is used instead).