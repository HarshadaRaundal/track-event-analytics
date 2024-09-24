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
// analytics.ts
var const_1 = require("./constant/const");
var helper_1 = require("./utils/helper");
var ANALYTIC_SESSION_ID = const_1.STORAGE_KEYS.ANALYTIC_SESSION_ID, DEVICE_INFO = const_1.STORAGE_KEYS.DEVICE_INFO, EVENT_TIMESTAMP = const_1.STORAGE_KEYS.EVENT_TIMESTAMP, IS_SESSION_END_TRIGGERED = const_1.STORAGE_KEYS.IS_SESSION_END_TRIGGERED, LOGIN_SESSION_ID = const_1.STORAGE_KEYS.LOGIN_SESSION_ID, USER_ID = const_1.STORAGE_KEYS.USER_ID, IP_ADDRESS = const_1.STORAGE_KEYS.IP_ADDRESS, USER_LOCATION_DATA = const_1.STORAGE_KEYS.USER_LOCATION_DATA, AIRDROP_SESSION_TABS = const_1.STORAGE_KEYS.AIRDROP_SESSION_TABS;
var trackAnalytics = function (eventName, eventAttributes) {
    var _a;
    console.log("eventName", eventName);
    var isEndEventTrigger = (0, helper_1.getLocalStorageItem)(IS_SESSION_END_TRIGGERED);
    console.log("isEndEventTrigger", isEndEventTrigger);
    var userId = (0, helper_1.getLocalStorageItem)(USER_ID);
    var loginSessionId = (0, helper_1.getLocalStorageItem)(LOGIN_SESSION_ID);
    if ((0, helper_1.isSessionEnd)() && isEndEventTrigger === null) {
        console.log("isSessionEnd()");
        (0, helper_1.triggerSessionEndEvent)();
    }
    var analyticSessionId = (0, helper_1.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    var entryPoint = (eventAttributes || {}).entryPoint;
    var updateEntryPoint = entryPoint === "/" ? "Home_Page" : entryPoint;
    var analyticsData = __assign(__assign({}, eventAttributes), { entryPoint: updateEntryPoint });
    var filteredAnalyticsData = (0, helper_1.filteredAttributes)(__assign(__assign({ userId: userId, loginSessionId: loginSessionId, channel: "WEBSITE" }, analyticsData), { source: "WEBSITE", analyticSessionId: analyticSessionId, timestamp: new Date().getTime().toString() }));
    if (eventName !== const_1.SESSION_EVENTS.ANALYTIC_SESSION_START &&
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
