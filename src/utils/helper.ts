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

const {
  ANALYTIC_SESSION_ID,
  DEVICE_INFO,
  EVENT_TIMESTAMP,
  IS_SESSION_END_TRIGGERED,
  LOGIN_SESSION_ID,
  USER_ID,
  IP_ADDRESS,
  USER_LOCATION_DATA,
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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
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

  let userLocation: any = locationData;

  if (getDeviceInfo !== null) {
    deviceInfo = JSON.parse(getDeviceInfo);
  }
  if (getUserLocation !== null) {
    userLocation = JSON.parse(getUserLocation);
  }

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
