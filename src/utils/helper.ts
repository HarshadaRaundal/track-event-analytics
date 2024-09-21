// utils.ts

import { isMobile, isTablet } from "react-device-detect";
import {
  AnalyticEventData,
  IAnalyticEventAttributes,
  IDeviceInfo,
} from "../types/types";
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

// Utility to set an item in localStorage by key
export const setLocalStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in localStorage with key ${key}:`, error);
  }
};

// Utility to check if the session has ended
export const isSessionEnd = (): boolean => {
  // Placeholder logic for session end, update this with your session end logic
  //   const sessionEnd = localStorage.getItem("sessionEnd") === "true";
  const sessionEnd = true;
  return sessionEnd;
};

// Utility to trigger session end event
export const triggerSessionEndEvent = (): void => {
  console.log("Session end event triggered.");
  // Placeholder logic, add more functionality as needed
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

export const startNewAnalyticSession = (
  event: string,
  analyticsData: AnalyticEventData,
  isEndEventTrigger: string | null,
  locationData?: any
) => {
  const analyticSessionId = "111";
  setLocalStorage("ANALYTIC_SESSION_ID", analyticSessionId);

  const userId = getLocalStorageItem("USER_ID");
  const ipAddresss = getLocalStorageItem("IP_ADDRESS") || "ipAddressRef";
  const loginSessionId = getLocalStorageItem("LOGIN_SESSION_ID");
  const getDeviceInfo = getLocalStorageItem("DEVICE_INFO");
  const getUserLocation = getLocalStorageItem("USER_LOCATION_DATA");
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
    // localStorage.removeItem("IS_SESSION_END_TRIGGERED");
  }

  firebaseAnalytics("ANALYTIC_SESSION_START", filteredSessionAttribute);

  gamerPlateformAnalytics("ANALYTIC_SESSION_START", filteredSessionAttribute);

  if (Object.keys(analyticsData).length > 0) {
    setLocalStorage("EVENT_TIMESTAMP", Date.now().toString());

    // Track the event using Firebase Analytics and platform-specific analytics
    sessionId = analyticSessionId;
    firebaseAnalytics(event, { ...analyticsData, analyticSessionId });

    gamerPlateformAnalytics(event, { ...analyticsData, analyticSessionId });

    resetInactivityTimer();
  } else {
    console.error("Analytics data is empty.");
  }
};

// Utility to filter analytics data before sending it to an analytics platform

export const filteredAttributes = (data: any): any => {
  // Placeholder function to filter out sensitive or unnecessary data
  // In practice, you'd filter or modify the data as needed before sending it to analytics platforms
  return data;
};

// Utility to track an event using Firebase Analytics
export const firebaseAnalytics = (eventName: string, data: any): void => {
  console.log(`Sending event to Firebase Analytics: ${eventName}`);
  console.log("Event Data:", data);

  // Placeholder for Firebase Analytics tracking logic
  // Replace with actual Firebase Analytics API calls
};

// Utility to track an event using a gamer platform analytics system
export const gamerPlateformAnalytics = (eventName: string, data: any): void => {
  console.log(`Sending event to Gamer Platform Analytics: ${eventName}`);
  console.log("Event Data:", data);

  // Placeholder for platform-specific analytics tracking logic
  // Replace with the actual platform-specific API calls
};

// Utility to reset the inactivity timer
export const resetInactivityTimer = (): void => {
  console.log("Inactivity timer reset.");

  // Placeholder logic for resetting an inactivity timer
  // This could involve clearing and setting a timeout or another strategy
};
function uuid4(): string | number | boolean {
  throw new Error("Function not implemented.");
}
