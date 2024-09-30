// analytics.ts
import { SESSION_EVENTS, STORAGE_KEYS } from "./constant/const";
import { AnalyticEventData } from "./types/types";

import {
  // getLocalStorageItem,
  triggerSessionEndEvent,
  isSessionEnd,
  startNewAnalyticSession,
  filteredAttributes,
  firebaseAnalytics,
  gamerPlateformAnalytics,
  resetInactivityTimer,
  setLocalStorage,
  getLocalStorageItem,
  plateformAnalytics,
} from "./utils/helper";

const {
  ANALYTIC_SESSION_ID,
  DEVICE_INFO,
  EVENT_TIMESTAMP,
  IS_SESSION_END_TRIGGERED,
  LOGIN_SESSION_ID,
  USER_ID,
  IP_ADDRESS,
  USER_LOCATION_DATA,
  AIRDROP_SESSION_TABS,
  CHANNEL,
} = STORAGE_KEYS;

export const trackAnalytics = (
  eventName: string,
  eventAttributes: AnalyticEventData
) => {
  const isEndEventTrigger = getLocalStorageItem(IS_SESSION_END_TRIGGERED);

  const userId = getLocalStorageItem(USER_ID);
  const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  const channel = getLocalStorageItem(CHANNEL);

  if (isSessionEnd() && isEndEventTrigger === null) {
    triggerSessionEndEvent();
  }

  const analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID);

  const { entryPoint } = eventAttributes || ({} as AnalyticEventData);
  const updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
  const analyticsData = { ...eventAttributes, entryPoint: updateEntryPoint };

  const filteredAnalyticsData = filteredAttributes({
    userId,
    loginSessionId,
    channel: channel,
    ...analyticsData,
    analyticSessionId,
    timestamp: new Date().getTime().toString(),
  });

  if (
    eventName !== SESSION_EVENTS.ANALYTIC_SESSION_START &&
    (isSessionEnd() || analyticSessionId === null)
  ) {
    console.log("New Session Start with eventName >>>>", eventName);
    startNewAnalyticSession(
      eventName,
      filteredAnalyticsData,
      isEndEventTrigger
    );
  } else {
    if (Object.keys(filteredAnalyticsData).length > 0) {
      console.log("Active session eventName >>>>", eventName);

      setLocalStorage(EVENT_TIMESTAMP, Date.now()?.toString());
      const sessionId = analyticSessionId;

      // Track the event using Firebase Analytics and platform-specific analytics
      firebaseAnalytics(eventName, filteredAnalyticsData);
      plateformAnalytics(eventName, filteredAnalyticsData);

      resetInactivityTimer();

      if (isEndEventTrigger === "true") {
        if (
          typeof window !== "undefined" &&
          typeof localStorage !== "undefined"
        ) {
          localStorage.removeItem(IS_SESSION_END_TRIGGERED);
        } else {
          console.warn("localStorage is not available in this environment");
        }
      }
    } else {
      console.error("Analytics data is empty.");
    }
  }
};
