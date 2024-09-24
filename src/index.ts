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

// function getLocalStorageItem(key: string) {
//   if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
//     return localStorage.getItem(key);
//   }
//   // Return null if localStorage is not available (for Node.js or other non-browser environments)
//   return null;
// }

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

export const trackAnalytics = (
  eventName: string,
  eventAttributes: AnalyticEventData
) => {
  console.log("eventName", eventName);

  // const userId = getLocalStorageItem(USER_ID) || null;
  // const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  const isEndEventTrigger = getLocalStorageItem(IS_SESSION_END_TRIGGERED);

  console.log("isEndEventTrigger", isEndEventTrigger);

  const userId = getLocalStorageItem(USER_ID);
  const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
  // const isEndEventTrigger = "oiuytrewe456789";

  if (isSessionEnd() && isEndEventTrigger === null) {
    console.log("isSessionEnd()");

    triggerSessionEndEvent();
  }

  const analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID);

  const { entryPoint } = eventAttributes || ({} as AnalyticEventData);
  const updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
  const analyticsData = { ...eventAttributes, entryPoint: updateEntryPoint };

  const filteredAnalyticsData = filteredAttributes({
    userId,
    loginSessionId,
    channel: "WEBSITE",
    ...analyticsData,
    source: "WEBSITE",
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

      // setLocalStorage("EVENT_TIMESTAMP", Date.now()?.toString());
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
