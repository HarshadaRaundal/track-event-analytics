// analytics.ts
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
} from "./utils/helper";

function getLocalStorageItem(key: string) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  // Return null if localStorage is not available (for Node.js or other non-browser environments)
  return null;
}

const USER_ID = "userId";
const LOGIN_SESSION_ID = "loginSessionId";
const IS_SESSION_END_TRIGGERED = "isSessionEndTriggered";
const ANALYTIC_SESSION_ID = "analyticSessionId";
const WEBSITE = "website";
const SESSION_EVENTS = { ANALYTIC_SESSION_START: "analyticSessionStart" };
const EVENT_TIMESTAMP = "eventTimestamp";

export const trackAnalytics = (
  eventName: string,
  eventAttributes: AnalyticEventData
) => {
  // const userId = getLocalStorageItem(USER_ID) || null;
  // const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  const isEndEventTrigger =
    getLocalStorageItem(IS_SESSION_END_TRIGGERED) || "true";

  const userId = getLocalStorageItem(USER_ID) || "oiuytre";
  const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID) || "oiuytr23";
  // const isEndEventTrigger = "oiuytrewe456789";

  if (isSessionEnd() && isEndEventTrigger === null) {
    triggerSessionEndEvent();
  }

  const analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID) || "true";
  const loginId = loginSessionId; // Data for reference
  const userRefId = userId; // Data for reference

  const { entryPoint } = eventAttributes || ({} as AnalyticEventData);
  const updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
  const analyticsData = { ...eventAttributes, entryPoint: updateEntryPoint };

  const filteredAnalyticsData = filteredAttributes({
    userId,
    loginSessionId,
    channel: WEBSITE,
    ...analyticsData,
    source: WEBSITE,
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
      gamerPlateformAnalytics(eventName, filteredAnalyticsData);

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
