import UAParser = require("ua-parser-js");

// index.js

import { trackAnalytics } from "./src";
const parser = new UAParser();
const uaResult = parser.getResult();
const browserName: string = uaResult.browser.name || "Unknown";
const osName: string = uaResult.os.name || "Unknown";
const osVersion: string = uaResult.os.version || "Unknown";
let screenHeight: number | undefined;
let screenWidth: number | undefined;

if (typeof window !== "undefined") {
  // This block only runs if window is available, i.e., in the browser
  screenHeight = window?.screen?.height;
  screenWidth = window?.screen?.width;
}

let deviceModel = uaResult.device.model;

export default function analyticsConverter(a: any, b: any) {
  if (a === "first_page_load" || b === "Login_session_start") {
    b = {
      ...b, // Spread the existing properties of b
      browserName,
      osName,
      osVersion,
      screenHeight,
      screenWidth,
      deviceModel,
    };
  }

  trackAnalytics(a, b);
  return;
}
