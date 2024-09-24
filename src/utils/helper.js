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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetInactivityTimer = exports.filteredAttributes = exports.startNewAnalyticSession = exports.gamerPlateformAnalytics = exports.plateformAnalytics = exports.firebaseAnalytics = exports.getCurrentPlatform = exports.PLATFORMS = exports.isSessionEndTrigger = exports.inactivityTimer = exports.addMinutesToEpoch = exports.triggerSessionEndEvent = exports.isSessionEnd = exports.setLocalStorage = exports.baseURL = exports.isStaging = exports.getLocalStorageItem = exports.sessionId = exports.ipAddressRef = exports.userRefId = exports.loginId = exports.isDesktop = exports.setDeviceInfo = exports.deviceInfoRef = void 0;
var react_device_detect_1 = require("react-device-detect");
var eventIds_1 = require("./eventIds");
var const_1 = require("../constant/const");
var data_1 = require("./data");
var analytics_1 = require("firebase/analytics");
var app_1 = require("firebase/app");
// import { firebaseAnalytics } from "./firebaseAnalytics";
var ACCESS_TOKEN = const_1.STORAGE_KEYS.ACCESS_TOKEN, REFRESH_TOKEN = const_1.STORAGE_KEYS.REFRESH_TOKEN, CAMPAIGN_TASK = const_1.STORAGE_KEYS.CAMPAIGN_TASK, CURRENT_CAMPAIGN_TASK_TYPE = const_1.STORAGE_KEYS.CURRENT_CAMPAIGN_TASK_TYPE, SOCIAL_CONNECT_TASK_MODAL = const_1.STORAGE_KEYS.SOCIAL_CONNECT_TASK_MODAL, SOCIAL_FLOW = const_1.STORAGE_KEYS.SOCIAL_FLOW, SOCIAL_CONNECT_FROM = const_1.STORAGE_KEYS.SOCIAL_CONNECT_FROM, ANALYTIC_SESSION_ID = const_1.STORAGE_KEYS.ANALYTIC_SESSION_ID, DEVICE_INFO = const_1.STORAGE_KEYS.DEVICE_INFO, EVENT_TIMESTAMP = const_1.STORAGE_KEYS.EVENT_TIMESTAMP, IS_SESSION_END_TRIGGERED = const_1.STORAGE_KEYS.IS_SESSION_END_TRIGGERED, LOGIN_SESSION_ID = const_1.STORAGE_KEYS.LOGIN_SESSION_ID, USER_ID = const_1.STORAGE_KEYS.USER_ID, IP_ADDRESS = const_1.STORAGE_KEYS.IP_ADDRESS, USER_LOCATION_DATA = const_1.STORAGE_KEYS.USER_LOCATION_DATA, AIRDROP_SESSION_TABS = const_1.STORAGE_KEYS.AIRDROP_SESSION_TABS, AIRDROP_SESSION_TAB_IDENTIFIER = const_1.STORAGE_KEYS.AIRDROP_SESSION_TAB_IDENTIFIER, AUTH_INITIALIZED_FROM_URL = const_1.STORAGE_KEYS.AUTH_INITIALIZED_FROM_URL, IS_NEW_USER = const_1.STORAGE_KEYS.IS_NEW_USER, CCP_MODAL_DATA = const_1.STORAGE_KEYS.CCP_MODAL_DATA, CLAN_PAGE_FOR_REGISTRATION = const_1.STORAGE_KEYS.CLAN_PAGE_FOR_REGISTRATION;
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
exports.isStaging = process.env.ENVIRONMENT === "Staging";
exports.baseURL = "https://m8vkl3e1b4.execute-api.eu-west-1.amazonaws.com/dev";
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
    var eventTimestamp = (0, exports.getLocalStorageItem)("eventTimestamp");
    if (eventTimestamp !== null) {
        var lastEventTimestamp = parseInt(eventTimestamp, 10);
        var timeDifference = Date.now() - lastEventTimestamp;
        var isSessionEnded = timeDifference > sessionTimeout;
        return isSessionEnded;
    }
    else {
        return false;
    }
};
exports.isSessionEnd = isSessionEnd;
var generateAnalyticsObject = function () {
    // Get userId and ipAddress from localStorage
    var userId = (0, exports.getLocalStorageItem)("userId");
    var loginSessionId = (0, exports.getLocalStorageItem)(LOGIN_SESSION_ID);
    var analyticSessionId = (0, exports.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    var analyticObject = {
        userId: userId,
        loginSessionId: loginSessionId,
        analyticSessionId: analyticSessionId,
        timestamp: new Date().getTime().toString(),
    };
    return analyticObject;
};
// Utility to trigger session end event
var triggerSessionEndEvent = function () {
    var analyticSessionId = (0, exports.getLocalStorageItem)(ANALYTIC_SESSION_ID);
    var sessionAttributes = (0, exports.filteredAttributes)(generateAnalyticsObject());
    var storedValue = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(IS_SESSION_END_TRIGGERED);
    var isSessionEndTriggered = storedValue !== null ? JSON.parse(storedValue) : null;
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
var addMinutesToEpoch = function (epochTimestamp, additionTime) {
    var updatedEpochTimestamp = epochTimestamp / 1000 + additionTime * 60;
    return updatedEpochTimestamp;
};
exports.addMinutesToEpoch = addMinutesToEpoch;
// const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
var sessionTimeout = 10 * 1000; // 30 minutes in milliseconds
exports.isSessionEndTrigger = false; //  Data for reference
exports.PLATFORMS = {
    GAMER: "gamer",
    AIRDROP: "airdrop",
    UNDEFINED: "",
};
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
var firebaseConfig = {
    apiKey: "AIzaSyCpBpnPd0CrE9UpgnyY4DZsZiQZomRJTx4",
    authDomain: "indigg-website-staging.firebaseapp.com",
    projectId: "indigg-website-staging",
    storageBucket: "indigg-website-staging.appspot.com",
    messagingSenderId: "115613134409",
    appId: "1:115613134409:web:ddacf6eb35ccdf74f89998",
    measurementId: "G-CSXM02V8S6",
};
var firebaseAnalytics = function (eventName, analyticsObject) {
    var eventId = exports.isStaging
        ? eventIds_1.STAGING_EVENTS_NAME[eventName]
        : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
    if (!eventId) {
        console.error("Error from FirebaseAnalytics : Event Id is missing for ".concat(eventName, "."));
        return;
    }
    var analyticsData = __assign(__assign({}, analyticsObject), { eventId: eventId });
    console.log(eventName, __assign(__assign({}, analyticsData), { eventName: eventName, eventId: eventId }));
    var analytics = (0, analytics_1.getAnalytics)((0, app_1.initializeApp)(firebaseConfig));
    (0, analytics_1.logEvent)(analytics, eventName, analyticsData);
};
exports.firebaseAnalytics = firebaseAnalytics;
var plateformAnalytics = function (eventName, analyticsObject) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, queryParams, filteredParams, url, response, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventId = exports.isStaging
                    ? eventIds_1.STAGING_EVENTS_NAME[eventName]
                    : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
                if (!eventId) {
                    console.error("Error from PlateformAnalytics : Event Id is missing for ".concat(eventName, "."));
                    return [2 /*return*/];
                }
                queryParams = __assign({ eventName: eventName, eventId: eventId }, analyticsObject);
                filteredParams = Object.entries(queryParams)
                    .filter(function (_a) {
                    var _key = _a[0], value = _a[1];
                    return value !== undefined && value !== null;
                })
                    .map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return "".concat(key, "=").concat(encodeURIComponent(value));
                })
                    .join("&");
                url = "".concat(exports.baseURL, "?").concat(filteredParams);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch(url, {
                        mode: "no-cors",
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                result = _a.sent();
                console.log(result, "plateformAnalyticsSuccess");
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error(error_1, "plateformAnalyticsError");
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.plateformAnalytics = plateformAnalytics;
var gamerPlateformAnalytics = function (eventName, analyticsObject) { return __awaiter(void 0, void 0, void 0, function () {
    var baseURL, gameAccountId, platformGameId, isStaging, eventId, _a, ANALYTIC_SESSION_START, LOGIN_SUCCESSFUL, CCP_MODAL_DATA, CCPModalData, parsedCCPModalData, accessToken, handleCCPSessionTime, queryParams, filteredParams, url, response, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                baseURL = process.env.BASE_URL_TRACKER;
                gameAccountId = process.env.GAME_ACCOUNT_ID;
                platformGameId = process.env.GAME_ID;
                isStaging = process.env.ENVIRONMENT === "Staging";
                eventId = isStaging
                    ? eventIds_1.STAGING_EVENTS_NAME[eventName]
                    : eventIds_1.PRODUCTION_EVENTS_NAME[eventName];
                _a = const_1.ANALYTICS_EVENTS.SESSION_EVENTS, ANALYTIC_SESSION_START = _a.ANALYTIC_SESSION_START, LOGIN_SUCCESSFUL = _a.LOGIN_SUCCESSFUL;
                CCP_MODAL_DATA = const_1.STORAGE_KEYS.CCP_MODAL_DATA;
                CCPModalData = (0, exports.getLocalStorageItem)(CCP_MODAL_DATA) || '"iuytrewertyu8i"';
                parsedCCPModalData = (CCPModalData && JSON.parse(CCPModalData)) || '"iuytrewertyu8i"';
                return [4 /*yield*/, (0, data_1.readCookie)("accessToken")];
            case 1:
                accessToken = _b.sent();
                handleCCPSessionTime = function (isNewSession) {
                    var timestamp = (analyticsObject || {}).timestamp;
                    if (!timestamp) {
                        return;
                    }
                    var sessionStartTine = Number(timestamp);
                    // * to show the user CPP modal after 1 minutes of session start'
                    if (isNewSession) {
                        // * User will see the CPP in alternate session
                        var isCPPShownInCurrentSession = parsedCCPModalData === null || parsedCCPModalData === void 0 ? void 0 : parsedCCPModalData.isCPPShownInCurrentSession;
                        var sessionData = __assign(__assign({}, parsedCCPModalData), { showCCPAt: Math.floor((0, exports.addMinutesToEpoch)(sessionStartTine, 1)), isCPPShownInPrevSession: isCPPShownInCurrentSession, isCPPShownInCurrentSession: false });
                        (0, exports.setLocalStorage)(CCP_MODAL_DATA, JSON.stringify(sessionData));
                    }
                    else {
                        var sessionData = __assign(__assign({}, parsedCCPModalData), { showCCPAt: Math.floor((0, exports.addMinutesToEpoch)(sessionStartTine, 1)) });
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
                    console.error("Error from PlateformAnalytics : Event Id is missing for ".concat(eventName, "."));
                    return [2 /*return*/];
                }
                queryParams = __assign({ gameAccountId: gameAccountId, platformGameId: platformGameId, eventName: eventName, eventId: eventId }, analyticsObject);
                filteredParams = Object.entries(queryParams)
                    .filter(function (_a) {
                    var key = _a[0], value = _a[1];
                    return value !== undefined && value !== null;
                })
                    .map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return "".concat(key, "=").concat(encodeURIComponent(value));
                })
                    .join("&");
                url = "".concat(baseURL, "?").concat(filteredParams);
                _b.label = 2;
            case 2:
                _b.trys.push([2, 5, , 6]);
                return [4 /*yield*/, fetch(url, {
                        mode: "no-cors",
                    })];
            case 3:
                response = _b.sent();
                return [4 /*yield*/, response.json()];
            case 4:
                result = _b.sent();
                console.log(result, "plateformAnalyticsSuccess");
                return [3 /*break*/, 6];
            case 5:
                error_2 = _b.sent();
                console.error(error_2, "plateformAnalyticsError");
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.gamerPlateformAnalytics = gamerPlateformAnalytics;
// function generateRandomId(length = 16) {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let id = "";
//   for (let i = 0; i < length; i++) {
//     id += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return id;
// }
var generateRandomId = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
        var random = (Math.random() * 16) | 0;
        var value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};
var startNewAnalyticSession = function (event, analyticsData, isEndEventTrigger, locationData) {
    console.log("startNewAnalyticSession analyticsData", analyticsData);
    var analyticSessionId = encodeURIComponent(generateRandomId());
    localStorage.setItem("analyticSessionId", analyticSessionId);
    var userId = (0, exports.getLocalStorageItem)(USER_ID);
    var ipAddresss = (0, exports.getLocalStorageItem)(IP_ADDRESS) || exports.ipAddressRef;
    var loginSessionId = (0, exports.getLocalStorageItem)(LOGIN_SESSION_ID);
    var getDeviceInfo = (0, exports.getLocalStorageItem)(DEVICE_INFO);
    var getUserLocation = (0, exports.getLocalStorageItem)(USER_LOCATION_DATA);
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
        localStorage.removeItem(IS_SESSION_END_TRIGGERED);
    }
    (0, exports.firebaseAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_START, filteredSessionAttribute);
    (0, exports.plateformAnalytics)(const_1.SESSION_EVENTS.ANALYTIC_SESSION_START, filteredSessionAttribute);
    if (Object.keys(analyticsData).length > 0) {
        (0, exports.setLocalStorage)(EVENT_TIMESTAMP, Date.now().toString());
        // Track the event using Firebase Analytics and platform-specific analytics
        exports.sessionId = analyticSessionId;
        (0, exports.firebaseAnalytics)(event, __assign(__assign({}, analyticsData), { analyticSessionId: analyticSessionId }));
        (0, exports.plateformAnalytics)(event, __assign(__assign({}, analyticsData), { analyticSessionId: analyticSessionId }));
        (0, exports.resetInactivityTimer)();
    }
    else {
        console.error("Analytics data is empty.");
    }
};
exports.startNewAnalyticSession = startNewAnalyticSession;
// Utility to filter analytics data before sending it to an analytics platform
// export const filteredAttributes = (data: any): any => {
//   // Placeholder function to filter out sensitive or unnecessary data
//   // In practice, you'd filter or modify the data as needed before sending it to analytics platforms
//   return data;
// };
var isNotNullOrUndefined = function (value) {
    return (value !== "null" &&
        value !== "undefined" &&
        value !== null &&
        value !== undefined);
};
var filteredAttributes = function (commonAnalytics) {
    var filteredAnalyticsData = {};
    for (var _i = 0, _a = Object.entries(commonAnalytics); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        // Convert to string if the value is not already a string
        var stringValue = typeof value === "string" ? value : String(value);
        // Exclude null or undefined values
        if (isNotNullOrUndefined(stringValue)) {
            filteredAnalyticsData[key] =
                stringValue;
        }
    }
    return filteredAnalyticsData;
};
exports.filteredAttributes = filteredAttributes;
// const startInactivityTimer = (time?: number) => {
//   inactivityTimer = setTimeout(() => {
//     triggerSessionEndEvent();
//   }, time || 30 * 60 * 1000); // 30 minutes in milliseconds
// };
var startInactivityTimer = function (time) {
    exports.inactivityTimer = setTimeout(function () {
        (0, exports.triggerSessionEndEvent)();
    }, time || 10 * 1000); // 30 minutes in milliseconds
};
// Utility to reset the inactivity timer
var resetInactivityTimer = function (time) {
    clearTimeout(exports.inactivityTimer);
    startInactivityTimer(time);
};
exports.resetInactivityTimer = resetInactivityTimer;
function uuid4() {
    throw new Error("Function not implemented.");
}
