"use strict";
// utils.ts
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
exports.resetInactivityTimer = exports.gamerPlateformAnalytics = exports.firebaseAnalytics = exports.filteredAttributes = exports.startNewAnalyticSession = exports.getCurrentPlatform = exports.PLATFORMS = exports.triggerSessionEndEvent = exports.isSessionEnd = exports.setLocalStorage = exports.getLocalStorageItem = exports.sessionId = exports.ipAddressRef = exports.userRefId = exports.loginId = exports.isDesktop = exports.setDeviceInfo = exports.deviceInfoRef = void 0;
var react_device_detect_1 = require("react-device-detect");
exports.deviceInfoRef = {};
var setDeviceInfo = function (data) {
    exports.deviceInfoRef = data;
};
exports.setDeviceInfo = setDeviceInfo;
var isDesktop = function () {
    return !react_device_detect_1.isMobile && !react_device_detect_1.isTablet;
};
exports.isDesktop = isDesktop;
var deviceInfo = exports.deviceInfoRef;
// Utility to get an item from localStorage by key
var getLocalStorageItem = function (key) {
    try {
        return localStorage.getItem(key);
    }
    catch (error) {
        console.error("Error retrieving item from localStorage with key ".concat(key, ":"), error);
        return null;
    }
};
exports.getLocalStorageItem = getLocalStorageItem;
// Utility to set an item in localStorage by key
var setLocalStorage = function (key, value) {
    try {
        localStorage.setItem(key, value);
    }
    catch (error) {
        console.error("Error setting item in localStorage with key ".concat(key, ":"), error);
    }
};
exports.setLocalStorage = setLocalStorage;
// Utility to check if the session has ended
var isSessionEnd = function () {
    // Placeholder logic for session end, update this with your session end logic
    //   const sessionEnd = localStorage.getItem("sessionEnd") === "true";
    var sessionEnd = true;
    return sessionEnd;
};
exports.isSessionEnd = isSessionEnd;
// Utility to trigger session end event
var triggerSessionEndEvent = function () {
    console.log("Session end event triggered.");
    // Placeholder logic, add more functionality as needed
};
exports.triggerSessionEndEvent = triggerSessionEndEvent;
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
exports.PLATFORMS = {
    GAMER: "gamer",
    AIRDROP: "airdrop",
    UNDEFINED: "",
};
var _a = deviceInfo || {}, screenHeight = _a.screenHeight, screenWidth = _a.screenWidth, browserName = _a.browserName, osName = _a.osName, osVersion = _a.osVersion, deviceModel = _a.deviceModel;
var getCurrentPlatform = function () {
    if (typeof window !== "undefined") {
        var url = window.location.href;
        if (url.includes("gamer/k-drop")) {
            return exports.PLATFORMS.AIRDROP;
        }
        return exports.PLATFORMS.GAMER;
    }
    // Server-side default logic
    return exports.PLATFORMS.UNDEFINED;
};
exports.getCurrentPlatform = getCurrentPlatform;
var startNewAnalyticSession = function (event, analyticsData, isEndEventTrigger, locationData) {
    var analyticSessionId = "111";
    (0, exports.setLocalStorage)("ANALYTIC_SESSION_ID", analyticSessionId);
    var userId = (0, exports.getLocalStorageItem)("USER_ID");
    var ipAddresss = (0, exports.getLocalStorageItem)("IP_ADDRESS") || "ipAddressRef";
    var loginSessionId = (0, exports.getLocalStorageItem)("LOGIN_SESSION_ID");
    var getDeviceInfo = (0, exports.getLocalStorageItem)("DEVICE_INFO");
    var getUserLocation = (0, exports.getLocalStorageItem)("USER_LOCATION_DATA");
    var domainName = "KGeN";
    // TODO: location data can't be read from hook,
    // need to find another way instead of exporting
    var userLocation = locationData;
    //   let deviceInfo: IDeviceInfo = deviceInfoRef;
    if (getDeviceInfo !== null) {
        deviceInfo = JSON.parse(getDeviceInfo);
    }
    if (getUserLocation !== null) {
        userLocation = JSON.parse(getUserLocation);
    }
    console.log("getDeviceInfo >>>", getDeviceInfo); //For Reference
    console.log("getUserLocation >>>", getUserLocation); //For Reference
    var countryCode = userLocation === null || userLocation === void 0 ? void 0 : userLocation.countryCode;
    var location = countryCode === "+91"
        ? "India"
        : countryCode === "+55"
            ? "Brazil"
            : "Others";
    var _a = deviceInfo || {}, screenHeight = _a.screenHeight, screenWidth = _a.screenWidth, browserName = _a.browserName, osName = _a.osName, osVersion = _a.osVersion, deviceModel = _a.deviceModel;
    var device = react_device_detect_1.isMobile ? "Mobile" : (0, exports.isDesktop)() ? "DeskTop" : "Others";
    var platform = (0, exports.getCurrentPlatform)();
    var sessionAttributes = {
        userId: userId,
        location: location,
        ipAddress: ipAddresss,
        domainName: domainName,
        loginSessionId: loginSessionId,
        analyticSessionId: analyticSessionId,
        channel: "WEBSITE",
        timestamp: Date.now().toString(),
        // Device Info
        device: device,
        osName: osName,
        osVersion: osVersion,
        deviceModel: deviceModel,
        browserName: browserName,
        screenHeight: screenHeight === null || screenHeight === void 0 ? void 0 : screenHeight.toString(),
        screenWidth: screenWidth === null || screenWidth === void 0 ? void 0 : screenWidth.toString(),
        source: "WEBSITE",
    };
    var filteredSessionAttribute = (0, exports.filteredAttributes)(sessionAttributes);
    if (isEndEventTrigger === "true") {
        // localStorage.removeItem("IS_SESSION_END_TRIGGERED");
    }
    (0, exports.firebaseAnalytics)("ANALYTIC_SESSION_START", filteredSessionAttribute);
    (0, exports.gamerPlateformAnalytics)("ANALYTIC_SESSION_START", filteredSessionAttribute);
    if (Object.keys(analyticsData).length > 0) {
        (0, exports.setLocalStorage)("EVENT_TIMESTAMP", Date.now().toString());
        // Track the event using Firebase Analytics and platform-specific analytics
        exports.sessionId = analyticSessionId;
        (0, exports.firebaseAnalytics)(event, __assign(__assign({}, analyticsData), { analyticSessionId: analyticSessionId }));
        (0, exports.gamerPlateformAnalytics)(event, __assign(__assign({}, analyticsData), { analyticSessionId: analyticSessionId }));
        (0, exports.resetInactivityTimer)();
    }
    else {
        console.error("Analytics data is empty.");
    }
};
exports.startNewAnalyticSession = startNewAnalyticSession;
// Utility to filter analytics data before sending it to an analytics platform
var filteredAttributes = function (data) {
    // Placeholder function to filter out sensitive or unnecessary data
    // In practice, you'd filter or modify the data as needed before sending it to analytics platforms
    return data;
};
exports.filteredAttributes = filteredAttributes;
// Utility to track an event using Firebase Analytics
var firebaseAnalytics = function (eventName, data) {
    console.log("Sending event to Firebase Analytics: ".concat(eventName));
    console.log("Event Data:", data);
    // Placeholder for Firebase Analytics tracking logic
    // Replace with actual Firebase Analytics API calls
};
exports.firebaseAnalytics = firebaseAnalytics;
// Utility to track an event using a gamer platform analytics system
var gamerPlateformAnalytics = function (eventName, data) {
    console.log("Sending event to Gamer Platform Analytics: ".concat(eventName));
    console.log("Event Data:", data);
    // Placeholder for platform-specific analytics tracking logic
    // Replace with the actual platform-specific API calls
};
exports.gamerPlateformAnalytics = gamerPlateformAnalytics;
// Utility to reset the inactivity timer
var resetInactivityTimer = function () {
    console.log("Inactivity timer reset.");
    // Placeholder logic for resetting an inactivity timer
    // This could involve clearing and setting a timeout or another strategy
};
exports.resetInactivityTimer = resetInactivityTimer;
function uuid4() {
    throw new Error("Function not implemented.");
}
