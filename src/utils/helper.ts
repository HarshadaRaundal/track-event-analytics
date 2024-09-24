// utils.ts

import { isMobile, isTablet } from "react-device-detect";
import {
  AnalyticEventData,
  IAnalyticEventAttributes,
  IDeviceInfo,
} from "../types/types";
import { PRODUCTION_EVENTS_NAME, STAGING_EVENTS_NAME } from "./eventIds";
import {
  ANALYTICS_EVENTS,
  SESSION_EVENTS,
  STORAGE_KEYS,
} from "../constant/const";
import { readCookie } from "./data";
import { getAnalytics, logEvent } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// import { firebaseAnalytics } from "./firebaseAnalytics";

const {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  CAMPAIGN_TASK,
  CURRENT_CAMPAIGN_TASK_TYPE,
  SOCIAL_CONNECT_TASK_MODAL,
  SOCIAL_FLOW,
  SOCIAL_CONNECT_FROM,
  ANALYTIC_SESSION_ID,
  DEVICE_INFO,
  EVENT_TIMESTAMP,
  IS_SESSION_END_TRIGGERED,
  LOGIN_SESSION_ID,
  USER_ID,
  IP_ADDRESS,
  USER_LOCATION_DATA,
  AIRDROP_SESSION_TABS,
  AIRDROP_SESSION_TAB_IDENTIFIER,
  AUTH_INITIALIZED_FROM_URL,
  IS_NEW_USER,
  CCP_MODAL_DATA,
  CLAN_PAGE_FOR_REGISTRATION,
} = STORAGE_KEYS;

export let deviceInfoRef = {} as IDeviceInfo;
export const setDeviceInfo = (data: any) => {
  deviceInfoRef = data;
};

export const isDesktop = () => {
  return !isMobile && !isTablet;
};

export let loginId: string | null; //  Data for reference
export let userRefId: string | null; //  Data for reference
export let ipAddressRef: any;
let deviceInfo: any = deviceInfoRef;
export let sessionId: string | null; // Data for reference

// Utility to get an item from localStorage by key
export const getLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(
      `Error retrieving item from localStorage with key ${key}:`,
      error
    );
    return null;
  }
};

export const isStaging = process.env.ENVIRONMENT === "Staging";
export const baseURL =
  "https://m8vkl3e1b4.execute-api.eu-west-1.amazonaws.com/dev";

// Utility to set an item in localStorage by key
export const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in localStorage with key ${key}:`, error);
  }
};

// Utility to check if the session has ended
export const isSessionEnd = () => {
  const eventTimestamp = getLocalStorageItem("eventTimestamp");
  if (eventTimestamp !== null) {
    const lastEventTimestamp = parseInt(eventTimestamp, 10);
    const timeDifference = Date.now() - lastEventTimestamp;
    const isSessionEnded = timeDifference > sessionTimeout;
    return isSessionEnded;
  } else {
    return false;
  }
};

const generateAnalyticsObject = (): IAnalyticEventAttributes => {
  // Get userId and ipAddress from localStorage

  const userId = getLocalStorageItem("userId");
  const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  const analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID);
  const analyticObject: IAnalyticEventAttributes = {
    userId,
    loginSessionId,
    analyticSessionId,
    timestamp: new Date().getTime().toString(),
  };

  return analyticObject;
};
// Utility to trigger session end event
export const triggerSessionEndEvent = () => {
  const analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID);
  const sessionAttributes = filteredAttributes(generateAnalyticsObject());
  const storedValue = localStorage?.getItem(IS_SESSION_END_TRIGGERED);
  const isSessionEndTriggered =
    storedValue !== null ? JSON.parse(storedValue) : null;
  if (!isSessionEndTriggered && analyticSessionId) {
    firebaseAnalytics(SESSION_EVENTS.ANALYTIC_SESSION_END, sessionAttributes);
    plateformAnalytics(SESSION_EVENTS.ANALYTIC_SESSION_END, sessionAttributes);
    setLocalStorage(IS_SESSION_END_TRIGGERED, "true");
    isSessionEndTrigger = true;
    localStorage.removeItem(ANALYTIC_SESSION_ID);
  }
  // Cancel the timer to prevent further execution
  clearTimeout(inactivityTimer);
};

// Utility to start a new analytic session
// export const startNewAnalyticSession = (
//   eventName: string,
//   eventData: any, // Replace with a proper type if you have one
//   isEndEventTrigger: string | null
// ): void => {
//   console.log(`Starting new analytic session with event: ${eventName}`);
//   console.log("Session Data:", eventData);

//   //   const airdrop_analyticSessionId = encodeURIComponent(uuid4());
//   //   console.log(airdrop_analyticSessionId);
//   //   setLocalStorage("ANALYTIC_SESSION_ID", airdrop_analyticSessionId);

//   // Placeholder logic for starting a new session
//   // You might want to store new session info in localStorage or another place

// };

export const addMinutesToEpoch = (
  epochTimestamp: number,
  additionTime: number
): number => {
  var updatedEpochTimestamp = epochTimestamp / 1000 + additionTime * 60;
  return updatedEpochTimestamp;
};

// const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
const sessionTimeout = 10 * 1000; // 30 minutes in milliseconds
export let inactivityTimer: NodeJS.Timeout | undefined;
export let isSessionEndTrigger: boolean = false; //  Data for reference

export const PLATFORMS = {
  GAMER: "gamer",
  AIRDROP: "airdrop",
  UNDEFINED: "",
} as const;

export type ObjectValues<T> = T[keyof T];

export type PlatformsType = ObjectValues<typeof PLATFORMS>;

export const getCurrentPlatform = (): PlatformsType => {
  if (typeof window !== "undefined") {
    const url = window.location.href;

    if (url.includes("gamer/k-drop")) {
      return PLATFORMS.AIRDROP;
    }

    return PLATFORMS.GAMER;
  }

  // Server-side default logic
  return PLATFORMS.UNDEFINED;
};

const firebaseConfig = {
  apiKey: "AIzaSyCpBpnPd0CrE9UpgnyY4DZsZiQZomRJTx4",
  authDomain: "indigg-website-staging.firebaseapp.com",
  projectId: "indigg-website-staging",
  storageBucket: "indigg-website-staging.appspot.com",
  messagingSenderId: "115613134409",
  appId: "1:115613134409:web:ddacf6eb35ccdf74f89998",
  measurementId: "G-CSXM02V8S6",
};
export const firebaseAnalytics = (
  eventName: string,
  analyticsObject: IAnalyticEventAttributes
) => {
  const eventId = isStaging
    ? STAGING_EVENTS_NAME[eventName]
    : PRODUCTION_EVENTS_NAME[eventName];

  if (!eventId) {
    console.error(
      `Error from FirebaseAnalytics : Event Id is missing for ${eventName}.`
    );
    return;
  }
  const analyticsData: IAnalyticEventAttributes = {
    ...analyticsObject,
    eventId,
  };
  console.log(eventName, { ...analyticsData, eventName, eventId });
  const analytics = getAnalytics(initializeApp(firebaseConfig));
  logEvent(analytics, eventName, analyticsData);
};

export const plateformAnalytics = async (
  eventName: string,
  analyticsObject: IAnalyticEventAttributes
) => {
  const eventId = isStaging
    ? STAGING_EVENTS_NAME[eventName]
    : PRODUCTION_EVENTS_NAME[eventName];

  if (!eventId) {
    console.error(
      `Error from PlateformAnalytics : Event Id is missing for ${eventName}.`
    );
    return;
  }

  const queryParams: IAnalyticEventAttributes = {
    eventName,
    eventId,
    ...analyticsObject,
  };

  const filteredParams = Object.entries(queryParams)
    .filter(([_key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `${baseURL}?${filteredParams}`;

  try {
    const response = await fetch(url, {
      mode: "no-cors",
    });
    const result = await response.json();
    console.log(result, "plateformAnalyticsSuccess");
  } catch (error) {
    console.error(error, "plateformAnalyticsError");
  }
};

export const gamerPlateformAnalytics = async (
  eventName: string,
  analyticsObject: AnalyticEventData
) => {
  const baseURL = process.env.BASE_URL_TRACKER;
  const gameAccountId = process.env.GAME_ACCOUNT_ID;
  const platformGameId = process.env.GAME_ID;
  const isStaging = process.env.ENVIRONMENT === "Staging";
  const eventId = isStaging
    ? STAGING_EVENTS_NAME[eventName]
    : PRODUCTION_EVENTS_NAME[eventName];
  const { ANALYTIC_SESSION_START, LOGIN_SUCCESSFUL } =
    ANALYTICS_EVENTS.SESSION_EVENTS;
  const { CCP_MODAL_DATA } = STORAGE_KEYS;
  const CCPModalData =
    getLocalStorageItem(CCP_MODAL_DATA) || '"iuytrewertyu8i"';
  const parsedCCPModalData =
    (CCPModalData && JSON.parse(CCPModalData)) || '"iuytrewertyu8i"';
  const accessToken = await readCookie("accessToken");

  // * function handles CPP session time
  const handleCCPSessionTime = (isNewSession?: boolean) => {
    const { timestamp } = analyticsObject || {};
    if (!timestamp) {
      return;
    }
    const sessionStartTine = Number(timestamp);
    // * to show the user CPP modal after 1 minutes of session start'
    if (isNewSession) {
      // * User will see the CPP in alternate session
      const isCPPShownInCurrentSession =
        parsedCCPModalData?.isCPPShownInCurrentSession;
      const sessionData = {
        ...parsedCCPModalData,
        showCCPAt: Math.floor(addMinutesToEpoch(sessionStartTine, 1)),
        isCPPShownInPrevSession: isCPPShownInCurrentSession,
        isCPPShownInCurrentSession: false,
      };
      setLocalStorage(CCP_MODAL_DATA, JSON.stringify(sessionData));
    } else {
      const sessionData = {
        ...parsedCCPModalData,
        showCCPAt: Math.floor(addMinutesToEpoch(sessionStartTine, 1)),
      };
      setLocalStorage(CCP_MODAL_DATA, JSON.stringify(sessionData));
    }
  };
  // * condition to handles CPP modal after logging in and CPP not shown already in current or previous sprint
  if (
    eventName === LOGIN_SUCCESSFUL &&
    !parsedCCPModalData?.isCPPShownInCurrentSession &&
    !parsedCCPModalData?.isCPPShownInPrevSession
  ) {
    handleCCPSessionTime();
  }
  // * condition to handle CPP if user is already logged in and new session started
  else if (eventName === ANALYTIC_SESSION_START && accessToken) {
    handleCCPSessionTime(true);
  }

  if (!eventId) {
    console.error(
      `Error from PlateformAnalytics : Event Id is missing for ${eventName}.`
    );
    return;
  }

  const queryParams: AnalyticEventData = {
    gameAccountId,
    platformGameId,
    eventName,
    eventId,
    ...analyticsObject,
  };

  const filteredParams = Object.entries(queryParams)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `${baseURL}?${filteredParams}`;

  try {
    const response = await fetch(url, {
      mode: "no-cors",
    });
    const result = await response.json();
    console.log(result, "plateformAnalyticsSuccess");
  } catch (error) {
    console.error(error, "plateformAnalyticsError");
  }
};

// function generateRandomId(length = 16) {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let id = "";
//   for (let i = 0; i < length; i++) {
//     id += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return id;
// }

const generateRandomId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const startNewAnalyticSession = (
  event: string,
  analyticsData: AnalyticEventData,
  isEndEventTrigger: string | null,
  locationData?: any
) => {
  console.log("startNewAnalyticSession analyticsData", analyticsData);

  const analyticSessionId = encodeURIComponent(generateRandomId());
  localStorage.setItem("analyticSessionId", analyticSessionId);
  const userId = getLocalStorageItem(USER_ID);
  const ipAddresss = getLocalStorageItem(IP_ADDRESS) || ipAddressRef;
  const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  const getDeviceInfo = getLocalStorageItem(DEVICE_INFO);
  const getUserLocation = getLocalStorageItem(USER_LOCATION_DATA);
  const domainName = "KGeN";

  // TODO: location data can't be read from hook,
  // need to find another way instead of exporting
  let userLocation: any = locationData;
  //   let deviceInfo: IDeviceInfo = deviceInfoRef;

  if (getDeviceInfo !== null) {
    deviceInfo = JSON.parse(getDeviceInfo);
  }
  if (getUserLocation !== null) {
    userLocation = JSON.parse(getUserLocation);
  }

  console.log("getDeviceInfo >>>", getDeviceInfo); //For Reference
  console.log("getUserLocation >>>", getUserLocation); //For Reference

  const countryCode = userLocation?.countryCode;

  const location =
    countryCode === "+91"
      ? "India"
      : countryCode === "+55"
      ? "Brazil"
      : "Others";

  const {
    screenHeight,
    screenWidth,
    browserName,
    osName,
    osVersion,
    deviceModel,
  } = deviceInfo || ({} as IDeviceInfo);

  const device = isMobile ? "Mobile" : isDesktop() ? "DeskTop" : "Others";
  const platform = getCurrentPlatform();

  const sessionAttributes = {
    userId,
    location,
    ipAddress: ipAddresss,
    domainName,
    loginSessionId,
    analyticSessionId,
    channel: "WEBSITE",
    timestamp: Date.now().toString(),
    // Device Info
    device,
    osName,
    osVersion,
    deviceModel,
    browserName,
    screenHeight: screenHeight?.toString(),
    screenWidth: screenWidth?.toString(),
    source: "WEBSITE",
  };

  const filteredSessionAttribute = filteredAttributes(sessionAttributes);

  if (isEndEventTrigger === "true") {
    localStorage.removeItem(IS_SESSION_END_TRIGGERED);
  }

  firebaseAnalytics(
    SESSION_EVENTS.ANALYTIC_SESSION_START,
    filteredSessionAttribute
  );

  plateformAnalytics(
    SESSION_EVENTS.ANALYTIC_SESSION_START,
    filteredSessionAttribute
  );

  if (Object.keys(analyticsData).length > 0) {
    setLocalStorage(EVENT_TIMESTAMP, Date.now().toString());

    // Track the event using Firebase Analytics and platform-specific analytics
    sessionId = analyticSessionId;
    firebaseAnalytics(event, { ...analyticsData, analyticSessionId });

    plateformAnalytics(event, { ...analyticsData, analyticSessionId });

    resetInactivityTimer();
  } else {
    console.error("Analytics data is empty.");
  }
};

// Utility to filter analytics data before sending it to an analytics platform

// export const filteredAttributes = (data: any): any => {
//   // Placeholder function to filter out sensitive or unnecessary data
//   // In practice, you'd filter or modify the data as needed before sending it to analytics platforms
//   return data;
// };

const isNotNullOrUndefined = (value: string | null | undefined): boolean => {
  return (
    value !== "null" &&
    value !== "undefined" &&
    value !== null &&
    value !== undefined
  );
};

export const filteredAttributes = (
  commonAnalytics: IAnalyticEventAttributes
) => {
  const filteredAnalyticsData: IAnalyticEventAttributes = {};
  for (const [key, value] of Object.entries(commonAnalytics)) {
    // Convert to string if the value is not already a string
    const stringValue = typeof value === "string" ? value : String(value);

    // Exclude null or undefined values
    if (isNotNullOrUndefined(stringValue)) {
      filteredAnalyticsData[key as keyof IAnalyticEventAttributes] =
        stringValue;
    }
  }
  return filteredAnalyticsData;
};

// const startInactivityTimer = (time?: number) => {
//   inactivityTimer = setTimeout(() => {
//     triggerSessionEndEvent();
//   }, time || 30 * 60 * 1000); // 30 minutes in milliseconds
// };
const startInactivityTimer = (time?: number) => {
  inactivityTimer = setTimeout(() => {
    triggerSessionEndEvent();
  }, time || 10 * 1000); // 30 minutes in milliseconds
};
// Utility to reset the inactivity timer
export const resetInactivityTimer = (time?: number) => {
  clearTimeout(inactivityTimer);
  startInactivityTimer(time);
};
function uuid4(): string | number | boolean {
  throw new Error("Function not implemented.");
}
