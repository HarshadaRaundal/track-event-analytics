"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = analyticsConverter;
const UAParser = require("ua-parser-js");
// index.js
const src_1 = require("./src");
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
let deviceModel = uaResult.device.model;
function analyticsConverter(a, b) {
    if (a === "first_page_load" || b === "Login_session_start") {
        b = Object.assign(Object.assign({}, b), { // Spread the existing properties of b
            browserName,
            osName,
            osVersion,
            screenHeight,
            screenWidth,
            deviceModel });
    }
    (0, src_1.trackAnalytics)(a, b);
    return;
}
