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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = analyticsConverter;
var UAParser = require("ua-parser-js");
// index.js
var src_1 = require("./src");
var parser = new UAParser();
var uaResult = parser.getResult();
var browserName = uaResult.browser.name || "Unknown";
var osName = uaResult.os.name || "Unknown";
var osVersion = uaResult.os.version || "Unknown";
var screenHeight;
var screenWidth;
if (typeof window !== "undefined") {
    // This block only runs if window is available, i.e., in the browser
    screenHeight = (_a = window === null || window === void 0 ? void 0 : window.screen) === null || _a === void 0 ? void 0 : _a.height;
    screenWidth = (_b = window === null || window === void 0 ? void 0 : window.screen) === null || _b === void 0 ? void 0 : _b.width;
}
var deviceModel = uaResult.device.model;
function analyticsConverter(a, b) {
    if (a === "first_page_load" || b === "Login_session_start") {
        b = __assign(__assign({}, b), { // Spread the existing properties of b
            browserName: browserName, osName: osName, osVersion: osVersion, screenHeight: screenHeight, screenWidth: screenWidth, deviceModel: deviceModel });
    }
    (0, src_1.trackAnalytics)(a, b);
    return;
}
