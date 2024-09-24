import { getLocalStorageItem } from "./helper";

// Function to read any data from cookie
export function readCookie(cname: string) {
  // read cookie, if not present read localstorage
  if (typeof window !== "undefined") {
    if (document.cookie) {
      var name = cname + "=";
      var decoded_cookie = decodeURIComponent(document.cookie);
      var carr = decoded_cookie.split(";");
      for (var i = 0; i < carr.length; i++) {
        var c = carr[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
    } else {
      const data = getLocalStorageItem(cname);
      return data;
    }
  }
  return "";
}

// function to rmove any cokkie
export function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
}
