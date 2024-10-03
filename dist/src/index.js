"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackAnalytics = void 0;
// analytics.ts
const const_1 = require("./constant/const");
const helper_1 = require("./utils/helper");
const { ANALYTIC_SESSION_ID, DEVICE_INFO, EVENT_TIMESTAMP, IS_SESSION_END_TRIGGERED, LOGIN_SESSION_ID, USER_ID, IP_ADDRESS, USER_LOCATION_DATA, AIRDROP_SESSION_TABS, CHANNEL, } = const_1.STORAGE_KEYS;
const trackAnalytics = (eventName, eventAttributes) => {
    var _a;
    const isEndEventTrigger = (0, helper_1.getLocalStorageItem)(IS_SESSION_END_TRIGGERED);
    const userId = (0, helper_1.getLocalStorageItem)(USER_ID);
    const loginSessionId = (0, helper_1.getLocalStorageItem)(LOGIN_SESSION_ID);
    const channel = (0, helper_1.getLocalStorageItem)(CHANNEL);
    if ((0, helper_1.isSessionEnd)() && isEndEventTrigger === null) {
        (0, helper_1.triggerSessionEndEvent)();
    }
    const analyticSessionId = (0, helper_1.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    const { entryPoint } = eventAttributes || {};
    const updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
    const analyticsData = Object.assign(Object.assign({}, eventAttributes), { entryPoint: updateEntryPoint });
    const filteredAnalyticsData = (0, helper_1.filteredAttributes)(Object.assign(Object.assign({ userId,
        loginSessionId, channel: channel }, analyticsData), { analyticSessionId, timestamp: new Date().getTime().toString() }));
    if (eventName !== const_1.SESSION_EVENTS.ANALYTIC_SESSION_START &&
        ((0, helper_1.isSessionEnd)() || analyticSessionId === null)) {
        console.log("New Session Start with eventName >>>>", eventName);
        (0, helper_1.startNewAnalyticSession)(eventName, filteredAnalyticsData, isEndEventTrigger);
    }
    else {
        if (Object.keys(filteredAnalyticsData).length > 0) {
            console.log("Active session eventName >>>>", eventName);
            (0, helper_1.setLocalStorage)(EVENT_TIMESTAMP, (_a = Date.now()) === null || _a === void 0 ? void 0 : _a.toString());
            const sessionId = analyticSessionId;
            // Track the event using Firebase Analytics and platform-specific analytics
            (0, helper_1.firebaseAnalytics)(eventName, filteredAnalyticsData);
            (0, helper_1.plateformAnalytics)(eventName, filteredAnalyticsData);
            (0, helper_1.resetInactivityTimer)();
            if (isEndEventTrigger === "true") {
                if (typeof window !== "undefined" &&
                    typeof localStorage !== "undefined") {
                    localStorage.removeItem(IS_SESSION_END_TRIGGERED);
                }
                else {
                    console.warn("localStorage is not available in this environment");
                }
            }
        }
        else {
            console.error("Analytics data is empty.");
        }
    }
};
exports.trackAnalytics = trackAnalytics;
