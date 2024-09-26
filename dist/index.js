"use strict";
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
const screenHeight = window.screen.height;
const screenWidth = window.screen.width;
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
