"use strict";
// utils.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetInactivityTimer = exports.filteredAttributes = exports.startNewAnalyticSession = exports.gamerPlateformAnalytics = exports.plateformAnalytics = exports.firebaseAnalytics = exports.getCurrentPlatform = exports.PLATFORMS = exports.isSessionEndTrigger = exports.inactivityTimer = exports.addMinutesToEpoch = exports.triggerSessionEndEvent = exports.isSessionEnd = exports.setLocalStorage = exports.baseURL = exports.isStaging = exports.getLocalStorageItem = exports.sessionId = exports.ipAddressRef = exports.userRefId = exports.loginId = exports.isDesktop = exports.setDeviceInfo = exports.deviceInfoRef = void 0;
const react_device_detect_1 = require("react-device-detect");
const eventIds_1 = require("./eventIds");
const const_1 = require("../constant/const");
const data_1 = require("./data");
const analytics_1 = require("firebase/analytics");
const app_1 = require("firebase/app");
const UAParser = require("ua-parser-js");
const { ANALYTIC_SESSION_ID, DEVICE_INFO, EVENT_TIMESTAMP, IS_SESSION_END_TRIGGERED, LOGIN_SESSION_ID, USER_ID, IP_ADDRESS, USER_LOCATION_DATA, } = const_1.STORAGE_KEYS;
exports.deviceInfoRef = {};
const setDeviceInfo = (data) => {
    exports.deviceInfoRef = data;
};
exports.setDeviceInfo = setDeviceInfo;
const isDesktop = () => {
    return !react_device_detect_1.isMobile && !react_device_detect_1.isTablet;
};
exports.isDesktop = isDesktop;
let deviceInfo = exports.deviceInfoRef;
// Utility to get an item from localStorage by key
const getLocalStorageItem = (key) => {
    try {
        return localStorage.getItem(key);
    }
    catch (error) {
        console.error(`Error retrieving item from localStorage with key ${key}:`, error);
        return null;
    }
};
exports.getLocalStorageItem = getLocalStorageItem;
exports.isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === "Staging";
exports.baseURL = process.env.NEXT_PUBLIC_BASE_URL_TRACKER;
// Utility to set an item in localStorage by key
const setLocalStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    }
    catch (error) {
        console.error(`Error setting item in localStorage with key ${key}:`, error);
    }
};
exports.setLocalStorage = setLocalStorage;
// Utility to check if the session has ended
const isSessionEnd = () => {
    const eventTimestamp = (0, exports.getLocalStorageItem)("eventTimestamp");
    if (eventTimestamp !== null) {
        const lastEventTimestamp = parseInt(eventTimestamp, 10);
        const timeDifference = Date.now() - lastEventTimestamp;
        const isSessionEnded = timeDifference > sessionTimeout;
        return isSessionEnded;
    }
    else {
        return false;
    }
};
exports.isSessionEnd = isSessionEnd;
const generateAnalyticsObject = () => {
    // Get userId and ipAddress from localStorage
    const userId = (0, exports.getLocalStorageItem)("userId");
    const loginSessionId = (0, exports.getLocalStorageItem)(LOGIN_SESSION_ID);
    const analyticSessionId = (0, exports.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    const analyticObject = {
        userId,
        loginSessionId,
        analyticSessionId,
        timestamp: new Date().getTime().toString(),
        channel: "website",
    };
    return analyticObject;
};
// Utility to trigger session end event
const triggerSessionEndEvent = () => {
    const analyticSessionId = (0, exports.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    const sessionAttributes = (0, exports.filteredAttributes)(generateAnalyticsObject());
    const storedValue = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(IS_SESSION_END_TRIGGERED);
    const isSessionEndTriggered = storedValue !== null ? JSON.parse(storedValue) : null;
    if (!isSessionEndTriggered && analyticSessionId) {
        (0, exports.firebaseAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_END, sessionAttributes);
        (0, exports.plateformAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_END, sessionAttributes);
        (0, exports.setLocalStorage)(IS_SESSION_END_TRIGGERED, "true");
        exports.isSessionEndTrigger = true;
        localStorage.removeItem(ANALYTIC_SESSION_ID);
    }
    // Cancel the timer to prevent further execution
    clearTimeout(exports.inactivityTimer);
};
exports.triggerSessionEndEvent = triggerSessionEndEvent;
const addMinutesToEpoch = (epochTimestamp, additionTime) => {
    var updatedEpochTimestamp = epochTimestamp / 1000 + additionTime * 60;
    return updatedEpochTimestamp;
};
exports.addMinutesToEpoch = addMinutesToEpoch;
const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
exports.isSessionEndTrigger = false; //  Data for reference
exports.PLATFORMS = {
    GAMER: "gamer",
    AIRDROP: "airdrop",
    UNDEFINED: "",
};
const getCurrentPlatform = () => {
    if (typeof window !== "undefined") {
        const url = window.location.href;
        if (url.includes("gamer/k-drop")) {
            return exports.PLATFORMS.AIRDROP;
        }
        return exports.PLATFORMS.GAMER;
    }
    // Server-side default logic
    return exports.PLATFORMS.UNDEFINED;
};
exports.getCurrentPlatform = getCurrentPlatform;
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};
const firebaseAnalytics = (eventName, analyticsObject) => {
    const eventId = exports.isStaging
        ? eventIds_1.STAGING_EVENTS_NAME[eventName]
        : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
    if (!eventId) {
        console.error(`Error from FirebaseAnalytics : Event Id is missing for ${eventName}.`);
        return;
    }
    const analyticsData = Object.assign(Object.assign({}, analyticsObject), { eventId });
    console.log(eventName, Object.assign(Object.assign({}, analyticsData), { eventName, eventId }));
    const analytics = (0, analytics_1.getAnalytics)((0, app_1.initializeApp)(firebaseConfig));
    (0, analytics_1.logEvent)(analytics, eventName, analyticsData);
};
exports.firebaseAnalytics = firebaseAnalytics;
const plateformAnalytics = (eventName, analyticsObject) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = exports.isStaging
        ? eventIds_1.STAGING_EVENTS_NAME[eventName]
        : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
    if (!eventId) {
        console.error(`Error from PlateformAnalytics : Event Id is missing for ${eventName}.`);
        return;
    }
    const queryParams = Object.assign({ eventName,
        eventId }, analyticsObject);
    const filteredParams = Object.entries(queryParams)
        .filter(([_key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
    const url = `${exports.baseURL}?${filteredParams}`;
    try {
        const response = yield fetch(url, {
            mode: "no-cors",
        });
        const result = yield response.json();
        console.log(result, "plateformAnalyticsSuccess");
    }
    catch (error) {
        console.error(error, "plateformAnalyticsError");
    }
});
exports.plateformAnalytics = plateformAnalytics;
const gamerPlateformAnalytics = (eventName, analyticsObject) => __awaiter(void 0, void 0, void 0, function* () {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL_TRACKER;
    const gameAccountId = process.env.GAME_ACCOUNT_ID;
    const platformGameId = process.env.GAME_ID;
    const isStaging = process.env.ENVIRONMENT === "Staging";
    const eventId = isStaging
        ? eventIds_1.STAGING_EVENTS_NAME[eventName]
        : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
    const { ANALYTIC_SESSION_START, LOGIN_SUCCESSFUL } = const_1.ANALYTICS_EVENTS.SESSION_EVENTS;
    const { CCP_MODAL_DATA } = const_1.STORAGE_KEYS;
    const CCPModalData = (0, exports.getLocalStorageItem)(CCP_MODAL_DATA) || '"iuytrewertyu8i"';
    const parsedCCPModalData = (CCPModalData && JSON.parse(CCPModalData)) || '"iuytrewertyu8i"';
    const accessToken = yield (0, data_1.readCookie)("accessToken");
    // * function handles CPP session time
    const handleCCPSessionTime = (isNewSession) => {
        const { timestamp } = analyticsObject || {};
        if (!timestamp) {
            return;
        }
        const sessionStartTine = Number(timestamp);
        // * to show the user CPP modal after 1 minutes of session start'
        if (isNewSession) {
            // * User will see the CPP in alternate session
            const isCPPShownInCurrentSession = parsedCCPModalData === null || parsedCCPModalData === void 0 ? void 0 : parsedCCPModalData.isCPPShownInCurrentSession;
            const sessionData = Object.assign(Object.assign({}, parsedCCPModalData), { showCCPAt: Math.floor((0, exports.addMinutesToEpoch)(sessionStartTine, 1)), isCPPShownInPrevSession: isCPPShownInCurrentSession, isCPPShownInCurrentSession: false });
            (0, exports.setLocalStorage)(CCP_MODAL_DATA, JSON.stringify(sessionData));
        }
        else {
            const sessionData = Object.assign(Object.assign({}, parsedCCPModalData), { showCCPAt: Math.floor((0, exports.addMinutesToEpoch)(sessionStartTine, 1)) });
            (0, exports.setLocalStorage)(CCP_MODAL_DATA, JSON.stringify(sessionData));
        }
    };
    // * condition to handles CPP modal after logging in and CPP not shown already in current or previous sprint
    if (eventName === LOGIN_SUCCESSFUL &&
        !(parsedCCPModalData === null || parsedCCPModalData === void 0 ? void 0 : parsedCCPModalData.isCPPShownInCurrentSession) &&
        !(parsedCCPModalData === null || parsedCCPModalData === void 0 ? void 0 : parsedCCPModalData.isCPPShownInPrevSession)) {
        handleCCPSessionTime();
    }
    // * condition to handle CPP if user is already logged in and new session started
    else if (eventName === ANALYTIC_SESSION_START && accessToken) {
        handleCCPSessionTime(true);
    }
    if (!eventId) {
        console.error(`Error from PlateformAnalytics : Event Id is missing for ${eventName}.`);
        return;
    }
    const queryParams = Object.assign({ gameAccountId,
        platformGameId,
        eventName,
        eventId }, analyticsObject);
    const filteredParams = Object.entries(queryParams)
        .filter(([key, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
    const url = `${baseURL}?${filteredParams}`;
    try {
        const response = yield fetch(url, {
            mode: "no-cors",
        });
        const result = yield response.json();
        console.log(result, "plateformAnalyticsSuccess");
    }
    catch (error) {
        console.error(error, "plateformAnalyticsError");
    }
});
exports.gamerPlateformAnalytics = gamerPlateformAnalytics;
const generateRandomId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};
const startNewAnalyticSession = (event, analyticsData, isEndEventTrigger, locationData) => {
    var _a, _b;
    console.log("eventName", analyticsData);
    const analyticSessionId = encodeURIComponent(generateRandomId());
    localStorage.setItem("analyticSessionId", analyticSessionId);
    const userId = (0, exports.getLocalStorageItem)(USER_ID);
    const ipAddresss = (0, exports.getLocalStorageItem)(IP_ADDRESS) || exports.ipAddressRef;
    const loginSessionId = (0, exports.getLocalStorageItem)(LOGIN_SESSION_ID);
    const getDeviceInfo = (0, exports.getLocalStorageItem)(DEVICE_INFO);
    const getUserLocation = (0, exports.getLocalStorageItem)(USER_LOCATION_DATA);
    const domainName = "KGeN";
    const parser = new UAParser();
    const uaResult = parser.getResult();
    const browserName = uaResult.browser.name || "Unknown";
    const osName = uaResult.os.name || "Unknown";
    const osVersion = uaResult.os.version || "Unknown";
    let screenHeight;
    let screenWidth;
    if (typeof window !== "undefined") {
        // This block only runs if window is available, i.e., in the browser
        screenHeight = (_a = window === null || window === void 0 ? void 0 : window.screen) === null || _a === void 0 ? void 0 : _a.height;
        screenWidth = (_b = window === null || window === void 0 ? void 0 : window.screen) === null || _b === void 0 ? void 0 : _b.width;
    }
    // Extract device model
    let deviceModel = uaResult.device.model;
    let userLocation = locationData;
    if (getDeviceInfo !== null) {
        deviceInfo = JSON.parse(getDeviceInfo);
    }
    if (getUserLocation !== null) {
        userLocation = JSON.parse(getUserLocation);
    }
    const countryCode = userLocation === null || userLocation === void 0 ? void 0 : userLocation.countryCode;
    const location = countryCode === "+91"
        ? "India"
        : countryCode === "+55"
            ? "Brazil"
            : "Others";
    const device = react_device_detect_1.isMobile ? "Mobile" : (0, exports.isDesktop)() ? "DeskTop" : "Others";
    const platform = (0, exports.getCurrentPlatform)();
    const sessionAttributes = {
        userId,
        location,
        ipAddress: ipAddresss,
        domainName,
        loginSessionId,
        analyticSessionId,
        channel: "website",
        timestamp: Date.now().toString(),
        // Device Info
        device,
        osName,
        osVersion,
        deviceModel,
        browserName,
        screenHeight: screenHeight === null || screenHeight === void 0 ? void 0 : screenHeight.toString(),
        screenWidth: screenWidth === null || screenWidth === void 0 ? void 0 : screenWidth.toString(),
    };
    const filteredSessionAttribute = (0, exports.filteredAttributes)(sessionAttributes);
    if (isEndEventTrigger === "true") {
        localStorage.removeItem(IS_SESSION_END_TRIGGERED);
    }
    (0, exports.firebaseAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_START, filteredSessionAttribute);
    (0, exports.plateformAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_START, filteredSessionAttribute);
    if (Object.keys(analyticsData).length > 0) {
        (0, exports.setLocalStorage)(EVENT_TIMESTAMP, Date.now().toString());
        // Track the event using Firebase Analytics and platform-specific analytics
        exports.sessionId = analyticSessionId;
        (0, exports.firebaseAnalytics)(event, Object.assign(Object.assign({}, analyticsData), { analyticSessionId }));
        (0, exports.plateformAnalytics)(event, Object.assign(Object.assign({}, analyticsData), { analyticSessionId }));
        (0, exports.resetInactivityTimer)();
    }
    else {
        console.error("Analytics data is empty.");
    }
};
exports.startNewAnalyticSession = startNewAnalyticSession;
const isNotNullOrUndefined = (value) => {
    return (value !== "null" &&
        value !== "undefined" &&
        value !== null &&
        value !== undefined);
};
const filteredAttributes = (commonAnalytics) => {
    const filteredAnalyticsData = {};
    for (const [key, value] of Object.entries(commonAnalytics)) {
        // Convert to string if the value is not already a string
        const stringValue = typeof value === "string" ? value : String(value);
        // Exclude null or undefined values
        if (isNotNullOrUndefined(stringValue)) {
            filteredAnalyticsData[key] =
                stringValue;
        }
    }
    return filteredAnalyticsData;
};
exports.filteredAttributes = filteredAttributes;
const startInactivityTimer = (time) => {
    exports.inactivityTimer = setTimeout(() => {
        (0, exports.triggerSessionEndEvent)();
    }, time || 30 * 60 * 1000); // 30 minutes in milliseconds
};
// Utility to reset the inactivity timer
const resetInactivityTimer = (time) => {
    clearTimeout(exports.inactivityTimer);
    startInactivityTimer(time);
};
exports.resetInactivityTimer = resetInactivityTimer;
function uuid4() {
    throw new Error("Function not implemented.");
}
