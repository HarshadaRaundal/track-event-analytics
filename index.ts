// index.js

import { trackAnalytics } from "./src";

export default function currencyConverter(a: any, b: any) {
  return a + b;
}
// console.log("ertyuiop-->3");

trackAnalytics("EventName", {});

// console.log("ertyuiop-->1");

// const result = currencyConverter(10, 20);
// console.log("Currency Converter Result:", result);

// console.log("ertyuiop-->2");
