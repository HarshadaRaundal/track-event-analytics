"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackAnalytics = void 0;
var helper_1 = require("./utils/helper");
function getLocalStorageItem(key) {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
    }
    // Return null if localStorage is not available (for Node.js or other non-browser environments)
    return null;
}
var USER_ID = "userId";
var LOGIN_SESSION_ID = "loginSessionId";
var IS_SESSION_END_TRIGGERED = "isSessionEndTriggered";
var ANALYTIC_SESSION_ID = "analyticSessionId";
var WEBSITE = "website";
var SESSION_EVENTS = { ANALYTIC_SESSION_START: "analyticSessionStart" };
var EVENT_TIMESTAMP = "eventTimestamp";
var trackAnalytics = function (eventName, eventAttributes) {
    var _a;
    // const userId = getLocalStorageItem(USER_ID) || null;
    // const loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID);
    var isEndEventTrigger = getLocalStorageItem(IS_SESSION_END_TRIGGERED) || "true";
    var userId = getLocalStorageItem(USER_ID) || "oiuytre";
    var loginSessionId = getLocalStorageItem(LOGIN_SESSION_ID) || "oiuytr23";
    // const isEndEventTrigger = "oiuytrewe456789";
    if ((0, helper_1.isSessionEnd)() && isEndEventTrigger === null) {
        (0, helper_1.triggerSessionEndEvent)();
    }
    var analyticSessionId = getLocalStorageItem(ANALYTIC_SESSION_ID) || "true";
    var loginId = loginSessionId; // Data for reference
    var userRefId = userId; // Data for reference
    var entryPoint = (eventAttributes || {}).entryPoint;
    var updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
    var analyticsData = __assign(__assign({}, eventAttributes), { entryPoint: updateEntryPoint });
    var filteredAnalyticsData = (0, helper_1.filteredAttributes)(__assign(__assign({ userId: userId, loginSessionId: loginSessionId, channel: WEBSITE }, analyticsData), { source: WEBSITE, analyticSessionId: analyticSessionId, timestamp: new Date().getTime().toString() }));
    if (eventName !== SESSION_EVENTS.ANALYTIC_SESSION_START &&
        ((0, helper_1.isSessionEnd)() || analyticSessionId === null)) {
        console.log("New Session Start with eventName >>>>", eventName);
        (0, helper_1.startNewAnalyticSession)(eventName, filteredAnalyticsData, isEndEventTrigger);
    }
    else {
        if (Object.keys(filteredAnalyticsData).length > 0) {
            console.log("Active session eventName >>>>", eventName);
            (0, helper_1.setLocalStorage)(EVENT_TIMESTAMP, (_a = Date.now()) === null || _a === void 0 ? void 0 : _a.toString());
            var sessionId = analyticSessionId;
            // Track the event using Firebase Analytics and platform-specific analytics
            (0, helper_1.firebaseAnalytics)(eventName, filteredAnalyticsData);
            (0, helper_1.gamerPlateformAnalytics)(eventName, filteredAnalyticsData);
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
