import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { AnalyticEventData, AnalyticsEventObject } from "../types/types";
import { ANALYTICS_EVENTS, STORAGE_KEYS } from "../constant/const";
import { getLocalStorageItem, setLocalStorage } from "./helper";
import { addMinutesToEpoch } from "./helper";
import { readCookie } from "./data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

export const firebaseAnalytics = (
  eventName: string,
  analyticsObject: AnalyticEventData
) => {
  const isStaging = process.env.ENVIRONMENT === "Staging";
  //   const eventId = "oiuytre";
  const eventId = isStaging
    ? eventNamesStaging[eventName]
    : eventNamesProduction[eventName];
  if (!eventId) {
    console.error(
      `Error from FirebaseAnalytics : Event Id is missing for ${eventName}.`
    );
    return;
  }
  const analyticsData: AnalyticEventData = { ...analyticsObject, eventId };
  console.log(eventName, { ...analyticsData, eventName, eventId });
  const analytics = getAnalytics(initializeApp(firebaseConfig));
  logEvent(analytics, eventName, analyticsData);
};

export const plateformAnalytics = async (
  eventName: string,
  analyticsObject: AnalyticEventData
) => {
  const baseURL = process.env.BASE_URL_TRACKER;
  const gameAccountId = process.env.GAME_ACCOUNT_ID;
  const platformGameId = process.env.GAME_ID;
  const isStaging = process.env.ENVIRONMENT === "Staging";
  const eventId = isStaging
    ? eventNamesStaging[eventName]
    : eventNamesProduction[eventName];

  const { ANALYTIC_SESSION_START, LOGIN_SUCCESSFUL } =
    ANALYTICS_EVENTS.SESSION_EVENTS;
  const { CCP_MODAL_DATA } = STORAGE_KEYS;
  const CCPModalData = getLocalStorageItem(CCP_MODAL_DATA) || "null";
  const parsedCCPModalData = CCPModalData && JSON.parse(CCPModalData);
  const accessToken = await readCookie("accessToken");

  // * function handles CPP session time
  const handleCCPSessionTime = (isNewSession?: boolean) => {
    const { timestamp } = analyticsObject || {};
    if (!timestamp) {
      return;
    }
    const sessionStartTine = Number(timestamp);
    // * to show the user CPP modal after 1 minutes of session start'
    if (isNewSession) {
      // * User will see the CPP in alternate session
      const isCPPShownInCurrentSession =
        parsedCCPModalData?.isCPPShownInCurrentSession;
      const sessionData = {
        ...parsedCCPModalData,
        showCCPAt: Math.floor(addMinutesToEpoch(sessionStartTine, 1)),
        isCPPShownInPrevSession: isCPPShownInCurrentSession,
        isCPPShownInCurrentSession: false,
      };
      setLocalStorage(CCP_MODAL_DATA, JSON.stringify(sessionData));
    } else {
      const sessionData = {
        ...parsedCCPModalData,
        showCCPAt: Math.floor(addMinutesToEpoch(sessionStartTine, 1)),
      };
      setLocalStorage(CCP_MODAL_DATA, JSON.stringify(sessionData));
    }
  };
  // * condition to handles CPP modal after logging in and CPP not shown already in current or previous sprint
  if (
    eventName === LOGIN_SUCCESSFUL &&
    !parsedCCPModalData?.isCPPShownInCurrentSession &&
    !parsedCCPModalData?.isCPPShownInPrevSession
  ) {
    handleCCPSessionTime();
  }
  // * condition to handle CPP if user is already logged in and new session started
  else if (eventName === ANALYTIC_SESSION_START && accessToken) {
    handleCCPSessionTime(true);
  }

  if (!eventId) {
    console.error(
      `Error from PlateformAnalytics : Event Id is missing for ${eventName}.`
    );
    return;
  }

  const queryParams: AnalyticEventData = {
    gameAccountId,
    platformGameId,
    eventName,
    eventId,
    ...analyticsObject,
  };

  const filteredParams = Object.entries(queryParams)
    .filter(([key, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = `${baseURL}?${filteredParams}`;

  try {
    const response = await fetch(url, {
      mode: "no-cors",
    });
    const result = await response.json();
    console.log(result, "plateformAnalyticsSuccess");
  } catch (error) {
    console.error(error, "plateformAnalyticsError");
  }
};

export const eventNamesProduction: AnalyticsEventObject = {
  Insufficientkcashoverlay_Buybutton_click:
    "a58adfb2-6815-42b7-a062-4fa5e4304925",
  Addkcashprofile_plusicon_click: "b06103b6-8553-47b2-bd14-be2365b6701f",
  kcashpurchasepage_Buybutton_click: "57ae8b9a-e430-4181-8c17-b13cb945a2d9",
  Confirmkcashpurchase_confrimbutton_click:
    "6f61187a-ec95-45cd-a73e-8e62e776914a",
  "Login flow overlay shown": "1c2c1fda-81a7-43ad-bea8-08e55a2b2748",
  "Login flow triggered": "e86136aa-7ffa-43ed-add8-36e10a28f7b5",
  "Game details overlay shown": "43a63010-de5a-40bb-b02c-7726d10d102c",
  "Game Details Submitted": "913b9aca-77ed-4215-877e-eda904e8a52b",
  "Game Details Submission failed": "b9b79fcc-9a85-4ab5-9bbd-018008399837",
  "POW submission overlay shown": "6a19caaa-3b4b-47f8-8335-08123e5ef641",
  "Clan chief referral overlay shown": "542639f7-a399-41e5-a00b-2405293bbbab",
  "POW submission captured": "bf979efd-c164-4ec6-a3ec-54d6f176fbea",
  "POW submission failed": "a03d2b6b-bce4-4a03-8bcc-414667c4094b",
  "Clan chief attribution captured": "29f1e582-fa7f-40a3-9ea4-3bb83f2a5e5e",
  "Clan chief attribution failed": "98c931b9-def3-4e1a-abee-1b57c674dc7f",
  "Clan chief attribution bypassed": "afea6308-ee49-4b4b-be2c-9cf1edae0912",
  "View Past Submissions overlay": "ff23c7d6-44bf-403f-bdd1-321c4c52aea5",
  "Quest link copied": "4592ad1d-4d91-4f87-8dfc-5118be4a135d",
  "User redirected": "600201a0-e710-417f-bbdf-05b96dd0b26a",
  "POW submission overlay closed": "0755f635-5e2c-4ad5-bc88-8006d7ac9002",
  "OTP verification overlay shown": "2ea8e6b9-eb27-473c-a2f2-6df3f2c7275a",
  "OTP Verification failed": "792f8c2b-8251-403d-b60a-dedfc1ccc97e",
  "Offerwall guide overlay shown": "9e80c3a1-c064-4f0a-a13d-2c0331cb4487",
  "Offerwall iframe page shown": "10a05de6-e0ae-4b56-9564-9648e9496989",
  "Time Spent on the offerwall guide overlay":
    "11bec5b5-4084-41cb-9763-d3606c119844",
  "Offerwall guide overlay closed": "c7ff4f55-e695-45dd-bc54-99f0c055a149",
  "Time Spent on the offerwall iframe page":
    "8cd10560-fd69-4e45-b4a8-436f3c53b537",
  OfferwallVisitWebsite_click: "1292e55f-0238-4241-bae8-b85cd123950b",
  Offerwallredirection_sucess: "875e4480-427f-47e7-b80c-2aebc93da1a9",
  questtab_click: "ee024ab6-81db-443e-a6d2-82582ca08082",
  GameDetailsOverlay_loginmethod_selected:
    "d98d04d5-dd46-4e97-9e4c-30479ea1a38f",
  GameDetailsOverlay_loginvalue_interaction:
    "2333542c-266a-417e-ab24-e59ff83395b7",
  GameDetailsOverlay_gamedetails_interaction:
    "fa332744-133a-4687-aad5-b1ad2bf78ebe",
  clanchiefreferraloverlay_clanchiefnumber_interaction:
    "42e7dc39-a2ab-4884-8767-cf23cea1fd8e",
  POWsubmissionoverlay_proof_uploaded: "e7b9079a-a0ce-4312-94ed-23eac830969e",
  "Phonenumberdetail-overlay_shown": "1650c702-4464-4315-a04d-01a258d0f45e",
  SendOTP_click: "df45090e-3101-4418-a64c-30f608aff713",
  "OTPscreen _Resend_Click": "b6487ed3-4bd9-4c88-800b-fb0fe52f9eeb",
  OTPscreen_Submit_click: "9ffdd444-cf32-4211-9420-ad21f2ca6bbd",
  Otpscreen_OTPverificationfailed: "bcb569aa-701f-4588-8eca-2310893cdd00",

  // Quest Events
  "Quest card shown": "46eb0e48-f20c-4c93-aa5e-364e0b3dd59b",
  "Quest Details page shown": "55645aaf-b9a3-4cfc-b341-c57adb1e05f1",
  "Quest listing page shown": "f294e446-55b4-45c3-90ad-165a2625ae45",
  stage_expand_click: "964f09c8-bd11-4266-87d3-c4fd34ad98dc",
  stage_minimise_click: "012b4b12-2c06-44ed-97ba-f5f3ce617d8d",

  // Website Events
  first_page_load: "1dfd8868-0321-420d-af5d-24a1ea686b9a",
  Homepage_shown: "ae4de447-8e69-489d-afdf-fc15f974dfd1",
  Marketingbanner1_click: "a8300b81-a81d-4638-9abe-21a63899951d",
  Marketingbanner2_click: "9b26ae35-82b4-43a4-839f-15ce51fae232",
  Marketingbanner3_click: "e05f3214-9fd9-4548-bce2-4e6a5d22fa60",
  Marketingbanner4_click: "4ab4cbc7-1373-4352-9b57-026047e64891",
  "GameTile _click": "f00863cf-6599-4162-906a-4a792296a0bd",
  GameListingPage_shown: "c29de1c0-189e-490d-90b4-bcb5c6ef0662",
  GameGenreTile_click: "62153477-47a3-4a66-91bd-c42e5efc3a84",
  BlockchainNetworkfilter_click: "26d32206-4664-4096-8318-9425678c231d",
  GameGenrefilter_click: "686869fc-eaf9-43f8-bf42-f327c71aa728",
  GamePlatformfilter_click: "1231042b-03de-4979-832b-af3ad2db2c52",
  GameDetailsPage_shown: "1de13e9d-2b9d-44c4-8218-14400ccd66dc",
  GameURL_click: "a4c3e21b-9b90-46fb-b45c-49544f5604f3",
  GameSocial_click: "4c694fae-2e1b-4951-b48f-0abcdedfdb3a",
  "GameQuestPage_shown ": "6f85c726-be45-4656-9f71-d3327108730e",
  // <--- Depreciated Start --->
  "GameQuestUpvote_click ": "876f73af-c987-4f8e-8e56-a4090e8e1b17",
  GameQuestUpvote_submitted: "dee70d92-59d3-4cfa-852e-f36c76f9239f",
  Gamelike_click: "e161ee20-eece-4d98-8dd4-8384136c39e6",
  Gamelike_submitted: "2deb8390-7430-40ba-9b4d-43c94216c874",
  Gamedislike_click: "c70737d5-8446-40bd-ab99-4cb5502a0514",
  Gamedislike_submitted: "518497c4-bf63-4390-90cd-06d46ac86123",
  // <--- Depreciated End --->

  //New Quest Events
  questcard_click: "010e489c-d4b8-43ea-82f8-09cf7b01d0ea",
  QuestDetailspage_start_click: "402e6170-7714-4299-b5bb-2c8b25e9837e",
  gamedetailsoverlay_submit_click: "57479a55-fdf6-4f49-9010-4e1078d70bca",
  Gamedetailsoverlay_crossicon_click: "e9e5411b-f6da-4131-b80d-ba98b3a0e5f3",
  questDetailspage_share_click: "4e5ec3b3-ead0-4687-8d12-135cd165aa29",
  questDetailspage_submit_click: "2ae6d6e2-f4f6-47f8-b2c1-028d28023dc0",
  POWsubmissionoverlay_next_click: "6c0a65b1-5434-469b-a178-21b2ed09dec3",
  POWsubmissionoverlay_crossicon_click: "5e390a1a-61d2-4802-9745-39b2f2023351",
  "CCreferraloverlay_don'thaveCC_click": "4d9048e5-25c4-4619-8863-fdedbf124a44",
  clanchiefreferraloverlay_crossicon_click:
    "5394b98e-b0f0-4299-8dbd-bee5a2b79ef2",
  clanchiefreferraloverlay_submit_click: "882e9fa4-cddc-43ed-9dff-1721cb6fbf62",
  questDetailspage_Pastsubmissions_click:
    "1cb6a493-43e7-4357-8721-6816fdb7e27a",
  QuestDetailsPage_redirection_failed: "35103990-9390-4ba7-80ea-470890260767",
  "Questpage_DownloadGame/Visit_click": "ee59ed97-6d78-4bd6-ba69-5713fb11ee9f",

  // Clan events
  Click_Clan_Form_CollegeName: "a14ef011-e33c-4c3f-8129-03cc8df3d295",
  Select_Clan_Form_IfStudent: "7b182762-3a0f-47b6-b8b1-31bf344bc277",
  Click_Clan_Form_City: "6ff35381-5f69-4b4d-949a-675bfa062211",
  Select_Clan_Form_Country: "3d2cb1ae-9abb-474a-a0f2-42b31d060bdf",
  Click_Clan_Form_Email: "29eb982c-4577-48ad-8775-a85b26712a40",
  Click_Clan_Form_FirstName: "5eb38d96-6c4f-464b-9459-b0e47b7c42b5",
  Click_clan_join_success_overlay_CTA: "6e954ccb-b613-4534-9c17-59e1e1e58734",
  View_Clan_join_success_overlay: "444832a1-9fa9-4266-bc56-b053bd19f20d",
  Click_join_clan_CTA: "879b093f-598b-4c60-a487-a668180526f6",
  Click_clan_invitation_overlay_CTA: "b553651b-cdd5-4a2d-a64a-737c7f554811",
  View_clan_invitation_overlay: "5a537036-4577-4a1e-af53-20b18fd33adb",
  Click_my_clan_button: "f7d9767d-3cdf-47db-ad90-7bf9f15fde55",
  Click_clan_Invitation_Link: "3ade998d-f90a-40ae-bc00-30bb4325a9d1",
  Click_copy_invite_on_clan_dashboard: "0af4a44c-0e66-46e2-a23b-82fd8847e87f",
  View_clan_dashboard: "7d28cdd8-a559-4716-9b86-4e2fcbba1a9d",
  Click_clan_creation_success_overlay_CTA:
    "519aa094-499f-421d-854b-86a1cb98c66e",
  View_clan_creation_success_overlay: "ff66b329-30a1-4aad-a2a0-e5d0dcc4d084",
  Submit_ClanChiefProgram_Form: "5de8f8c0-17a3-4ed0-8a95-2fbebee8863b",
  View_ClanChiefProgram_Page: "d7c86868-5234-49ba-bd22-e4864f3d7c99",
  Scroll_clan_member_table: "d1d73131-f58d-47f3-b7f8-9c14197e4af7",
  Scroll_Clan_Dashboard: "7236b8cf-8401-4f3d-8b83-02cfde09b50b",
  Click_Select_Country_Dropdown: "e769ee11-515e-40a7-aaa8-4c54030be3a1",
  Scroll_ClanChiefProgram_Page: "0a78cec3-3c5f-4162-b7fd-1e440fc6dcc7",
  Click_Delete_Clan: "9b2f2f43-6424-4e7b-b187-108b7c3374cc",
  Click_Delete_Clan_Deletion_Confirmation_Overlay:
    "7108a513-6d5b-4645-a29b-f4585616cae6",
  Click_Cancel_Clan_Deletion_Confirmation_Overlay:
    "91b05139-f76e-4f45-9f25-01a1a61297d5",
  View_Clan_Deletion_Success_Overlay: "6865bcdc-2347-460f-b000-b5af11bb2d5b",
  Click_Leave_Clan: "f4c1a667-89dd-46a7-8ab2-b52263fcea02",
  Click_Leave_Clan_Leave_Confirmation_Overlay:
    "d24fc3ee-4697-4b75-8cf4-46c89c4d91ca",
  Click_Cancel_Clan_Leave_Confirmation_Overlay:
    "7e121ede-f300-4b1e-a259-3bdaf7be8250",
  View_Clan_Leave_Success_Overlay: "3ffa5d6b-fbc0-486a-9d1c-cec19231f473",
  View_Delete_Clan_OTP_Overlay: "8c244123-cc5a-43ca-8333-747ab399229d",
  Click_DeleteCTA_On_Delete_Clan_OTP_Overlay:
    "53448c06-c494-44b4-9508-0f1f27262191",
  Click_Play_CC_Onboarding_Video: "4b38362c-96d2-48c3-a26d-98cd1549eb20",
  Click_Download_Onboarding_Kit_CTA: "b785c490-3b3e-43e9-8157-971abfde1562",
  click_clanchiefprogram: "31c39718-35d0-420c-88ee-d90448062573",

  // Quest Leaderboard Events
  Leaderboard_widget_click: "5ff9bc17-418d-4a24-bc70-a2aa2f7305cc",
  Leaderboard_questdetailswidget_click: "e57af408-639b-4def-99bc-eb2c68400add",
  Leaderboard_rankings_scroll: "ab0d0e0b-a72b-43ff-a11e-f9980857d2b3",
  Leaderboard_info_click: "c79e38a7-b7f6-4d39-b371-e6e04c7a5ab6",
  Leaderboard_Rewards_click: "5054501f-0c59-4d2d-b3a3-58e4521d08d7",
  Leaderboard_Rewards_shown: "8fc2e30e-0abc-4bb0-91ba-be8afb313516",
  Leaderboard_information_click: "ef6d84fd-9b6a-4a7e-8f42-7e33211e99d6",
  Leaderboard_information_shown: "1940ac05-4721-4083-8d69-4f38d22644a9",

  // Clan Chief Leaderboard Events
  Click_View_Leaderboard: "936d6a16-571a-470d-860f-d64527557773",
  Scroll_Leaderboard_Table: "6f289a53-1b3a-4768-a16a-5dc3a169cb71",
  Click_Leadearboard_Bottomsheet_Rewards_Button:
    "c6a28794-c353-4d34-9b7e-2e49ae7fb93e",
  View_Leaderboard_Rewards_Details: "9b42898f-d415-4859-8f23-5d578e38b937",
  Scroll_Leaderboard_Rewards_Details: "83385e45-0b94-41cc-81ca-c17acf5a36c8",
  Click_Leadearboard_Bottomsheet_Information_Button:
    "38e6eade-1b96-43b0-a8a7-1820b004a765",
  View_Leaderboard_Information: "b84d722d-7147-4c08-b216-7dd5a68e6352",
  Scrolls_Leaderboard_Information: "9c6778bc-4eb8-47d4-aa8d-da095df901a5",
  Close_Leaderboard_Bottomsheet: "60bc6ba9-5952-44ad-ad24-bf225e12c1f5",
  View_leaderboard_RankPage: "9eb00f55-cee7-41a0-9703-b873229cc164",
  Scroll_leaderboard_RankPage: "1fa2621b-8e02-4ca9-b9db-feada1f5b53e",
  Click_Leaderboard_Info_Button: "9851b482-1534-4848-83c4-fa6b5a5c29be",
  Click_Leadeboard_MyClan_Button: "002ac875-fafd-449c-913c-488aa5ae6be0",
  Click_Leaderboard_GoBack_CTA: "802951b8-7d49-4776-832b-b838da8ce511",

  // Session Events
  analytic_SessionStart: "a12a8b6d-636e-4d78-b78c-087f8cfc7256",
  login_session_end: "4fb0e1e3-8f70-4061-a9bf-fd044192a616",
  analytic_SessionEnd: "3c5f2dab-cd69-4838-967d-a63afc8a6298",
  Login_session_start: "1ae53340-3abf-457f-b447-d8d85627feee",

  // Path to Pro
  Klash_Menu_Item_Click: "199ae7b4-340c-4295-bcb1-da171874d197",
  Klash_Home_Page_Sticky_Banner_Click: "f23590e8-0538-423c-b3f5-e7274a4a6cde",
  PathToPro_Website_Redirection: "8de0db6c-b18d-4838-a54d-665ef7c20215",
  IGN_Popup_Shown: "fb335f2f-7f90-4696-946f-084396cd2588",
  IGN_Submitted: "a71ba2e8-e0c3-4669-aa32-4359d8253235",
  IGN_Help_Page_Shown: "0a89437e-8058-4e04-a25d-e08597ad1341",

  //Social handling
  Click_Profile_Tab: "fa39b0fd-4dce-4469-9039-0efefa43c13d",
  Click_Connect_Social_CTA: "407e7958-2081-4a75-ae3b-bf5beba5dbdc",
  CCreferraloverlay_dont_haveCC_click: "4d9048e5-25c4-4619-8863-fdedbf124a44",
  Store_Click_HomePage: "b37e5903-e2e0-4ab7-b518-e2a099b3713c",

  // Social Login
  click_ContinuewithGoogle: "66a0d71d-28fd-49ce-adb3-c62ddffe06cd",
  newWallet_GoogleLogin: "739b65fa-8b3e-49d6-895a-28922f2dd8a3",
  phonenumber_verififyinitiated: "7d8f8237-b146-4733-9e02-fa493d38b132",
  phonenumber_verifycompleted: "121ec5ab-2c99-4301-a5a8-5ad5f9302372",
  email_verififyinitiated: "efecd8e6-fc9c-4391-af7e-52f380c22d5f",
  email_verififycompleted: "1096209d-a3d5-4633-9025-18ad05c7d7a8",

  //Joining and Loyalty bonus
  View_Claim_Bonus_Overlay: "fbf30949-3da9-442a-9fd1-96d0ca3b2aef",
  Click_Claim_CTA_On_Claim_Bonus_Overlay:
    "c611d533-f869-4431-abd2-be4a9c36b8b8",
  Click_Close_On_Claim_Bonus_Overlay: "f5af448a-6091-4b52-a950-40a5135ac03b",
  Click_Know_More_On_Claim_Bonus_Overlay:
    "5ac1f5a1-d128-408e-a37f-1253ce329bf8",
  web3auth_failed: "595034d0-7671-4313-8ea5-e127c13aa718",
  web3auth_failed_overlay_shown: "d753ef84-d630-4abd-ae4e-e8a0aa847570",
  web3_initiated: "b00a19f0-c754-4b2e-a450-0cf4cfa2d31d",
  web3_Login_Successfull: "d9c05afc-0511-4113-a5f8-544f1c8b5d23",
  walletIdMismatchFoundWithDB: "81716aa5-60a6-4a2f-a7c5-407274150ea2",
  walletIdSavedInDB: "8c7ea4a4-1fdd-4004-b715-1bdaea6c28a6",

  // Clan Chief Quest Events
  Scroll_Clan_Stats_Dashboard: "5dd9f494-5c52-430b-bc66-b984752e7e5e",
  Click_View_Details_Clan_Stats_Dashboard:
    "56fd4f91-4dfe-489d-adcd-9718b0c5f454",
  Click_Share_Quest_Clan_Stats_Dashboard:
    "6b83fde7-300a-4768-b978-32aa9c736e5f",
  ScrollQuestStats_InClanStatsDashboard: "258e245a-32d5-496a-b017-eeea30a26cb6",

  web3Auth_connected: "94393387-2ce8-4c77-a7da-997003a0f43d",
  PrivateKey_generated_Successfully: "a13233fb-fd4a-4719-bd92-f5562d33b214",
  web3_initiated_Successfully: "ce497aa5-b82f-4fda-8328-bdee1a48b4b0",
  Wallet_Created_SuccessFully: "8e391f5f-9ebf-4d24-a2e1-cdcdf6214c78",
  Save_Wallet_API_Initiated: "9aaeab53-a7c8-4adf-85b8-25ed839dc292",
  Web3_refreshToken_Error: "569811ba-fcd7-4282-87eb-899c7c769680",
  click_Discord: "c628acfb-b3c1-475a-a19b-3d31ada254f7",
  View_CC_Program_Promotion_Overlay: "1e445ea1-691a-4474-9a56-46bca676e1cf",
  Click_StartClan_On_CC_Promotion_Overlay:
    "6e9d2462-dc11-43fe-a1ef-7a98662422e4",
  Close_CC_Program_Promotion_Overlay: "08276368-c4cf-4cc8-b777-164216bd97d2",
  View_CC_Onboarding_Challenge: "08276368-c4cf-4cc8-b777-164216bd97d2",
  Click_Start_CC_Challenge_CTA: "553a11b3-b9a9-4e8a-b772-28eee8969c1f",
  View_CC_Onboarding_Completion_Overlay: "304fd330-0ece-4fcf-90ea-672a566941e7",

  // USDT PAYMENT IN KSTORE
  "click Convert icon": "0c07e151-c3a4-4263-b2a0-e1907c89954e",
  "click confirm on conversion screen": "7ae16f4a-d1a1-47ae-bc99-df11516f1c97",
  "transaction successful": "db17d1a3-9d36-4e1c-92eb-ae3b12024a09",
  "transaction failed": "b8a5e705-c245-476d-951f-d7d42639ba72",

  //twitter coonect overlay

  overlay_twitter_connect_shown: "8c563820-6ff1-41d1-aa1c-9b917d8fc85f",
  overlay_twitter_cross_button_click: "8a30d438-11f4-460d-82cf-3076a80c94cd",
  overlay_twitter_connect_click: "7ef03453-c6e1-4384-a650-36f19db4c237",
  overlay_twitter_reconnect: "9d82cef1-c230-4625-93d3-2f162833388d",
  overlay_twitter_recoonect_cross_button_click:
    "59b54e7e-541c-4550-ba93-04cc178cd8bb",

  //kgen corporate
  homepage_corporate: "831c3088-b270-4d77-9fd5-99330c52aa3e",
  corporate_about_us_clicked: "5cb61414-beaa-432f-b855-51e80a6b1cdb",
  corporate_build_clicked: "07f84e25-deea-424b-b3b1-dfc9204bae3b",
  corporate_connect_clicked: "21e58a76-2eb0-4ea2-b197-e34c272cffcf",
  corporate_play_clicked: "b0209400-676f-42d3-9c50-dd6f7cf7057f",
  corporate_store_clicked: "369a9dcf-9fc8-4ed8-bf2c-ee64106c1b2a",
  kdroptab_click: "997b1786-a531-4ac8-824d-690844f58455",
};

export const eventNamesStaging: AnalyticsEventObject = {
  Insufficientkcashoverlay_Buybutton_click:
    "f1fe3603-5d3c-43c3-928e-397578c62884",
  Addkcashprofile_plusicon_click: "c9433f46-f253-47d5-ac97-c3bf6daa52bb",
  kcashpurchasepage_Buybutton_click: "81d87c7d-5203-45ff-acb7-607295f2b88c",
  Confirmkcashpurchase_confrimbutton_click:
    "10c3b4dd-496f-4ce2-8105-816c0351aa3d",
  "Login flow overlay shown": "545acb83-6cae-47e9-a65b-81880d6914cb",
  "Login flow triggered": "a30341bc-ce56-4009-9e96-2e747d8678c5",
  "Game details overlay shown": "2a7cba77-f497-48c9-bd00-99b441ab9775",
  "Game Details Submitted": "13c34ea9-ef67-408e-8779-a632c23087e2",
  "Game Details Submission failed": "35284993-bef5-4fc4-966d-78610e0f6f0d",
  "POW submission overlay shown": "6d42c6e1-f20e-4e4e-9188-ed2a416a4aa0",
  "Clan chief referral overlay shown": "00aed8a7-3e38-4af2-8cd9-72d67cdbed82",
  "POW submission captured": "a74c44fa-d3c1-407b-9b64-6615b53cf8c1",
  "POW submission failed": "61113994-9b15-406c-8c04-7bc8ac34dfb6",
  "Clan chief attribution captured": "d6f98685-2438-4bda-860e-2d0cdc1c72e1",
  stage_expand_click: "fead16a9-a62a-4279-b0af-dbed0f9350b1",
  stage_minimise_click: "44001ad0-6bfe-47e4-a0c9-da06f43a8bc8",
  "Clan chief attribution failed": "5f427d2b-d606-4371-ba6c-d043d9abee2e",
  "Clan chief attribution bypassed": "24093a97-733f-40e5-803f-ddacba9698cb",
  "View Past Submissions overlay": "9c5c0607-4d5a-4ff1-a2c2-b5f5f5a1628b",
  "Quest link copied": "1f4ad079-04b0-4cf1-9784-d7b651130b6d",
  "User redirected": "6d797320-56ef-41b9-b065-dc899569bef8",
  "Quest Details page shown": "5c08dff0-acd7-4137-a6ff-33875d8dbbc6",
  "Quest listing page shown": "db9e7ec9-36a3-4593-a23e-89c696e755a3",
  "Quest card shown": "b082ca0b-c7b5-440c-9ea8-74d736010225",
  "POW submission overlay closed": "e9f4ef62-028f-46d1-9ef0-d77ba8f51519",
  "OTP verification overlay shown": "afd75a14-3de6-48bb-8cc1-cfdfa7af8ea1",
  "OTP Verification failed": "b11fad3a-32d6-4815-a01f-ffe6bbe00d3b",
  "Offerwall guide overlay shown": "418057c9-024c-41f1-a1c6-fbbc9398e0dd",
  "Offerwall iframe page shown": "a3d9fde4-417e-44d7-bc12-9e7ee2b3c54b",
  "Time Spent on the offerwall guide overlay":
    "546f0a88-03e6-4fa5-9b7b-59ce1fe4841f",
  "Time Spent on the offerwall iframe page":
    "54995af5-de16-4b83-9889-75d11df4feee",
  "Offerwall guide overlay closed": "b7c01507-8ddb-444e-8629-339d1663d65c",
  OfferwallVisitWebsite_click: "fdc46e59-860f-46d5-a17d-5430833a7d62",
  Offerwallredirection_sucess: "69f966c5-405e-4cb8-a7eb-cef3326bbaaf",
  questtab_click: "e182b006-0df2-4bee-8ca2-7dea38729a9c",
  GameDetailsOverlay_loginmethod_selected:
    "55917419-ff17-4599-bbd4-5a3b9b6f1816",
  GameDetailsOverlay_loginvalue_interaction:
    "bccbc356-ecc7-4993-85f7-1727ebe0e26f",
  GameDetailsOverlay_gamedetails_interaction:
    "1e8693a5-c8a7-42fe-bf1b-f7d9302d1724",
  clanchiefreferraloverlay_clanchiefnumber_interaction:
    "9b65032a-364c-4f52-b9ff-86c6205d6805",
  POWsubmissionoverlay_proof_uploaded: "c0ed6aba-a5e6-4015-b090-7fa809426d08",
  "Phonenumberdetail-overlay_shown": "52a2a752-198f-4d51-ace3-a502f272c87c",
  SendOTP_click: "7cec3cf6-f555-47ca-8469-176fac113136",
  "OTPscreen _Resend_Click": "def47202-da68-4ff2-8ead-8a0ab9f68a33",
  OTPscreen_Submit_click: "caa11ab7-1a4b-4398-9be1-b38eac879bc0",
  Otpscreen_OTPverificationfailed: "b8550192-4934-4f0c-8345-a25cde452c79",

  // Website Events
  first_page_load: "d89a9bc1-f29c-438a-9c5b-bdde1ef8aec3",
  Homepage_shown: "3ddfab21-d51a-414f-b464-9f44e3a29ac1",
  Marketingbanner1_click: "f785c8ea-f920-41fb-9686-7c8d64ac2aee",
  Marketingbanner2_click: "f5dff418-e70e-455d-80e4-04cbb194a983",
  Marketingbanner3_click: "e3b61b3c-a03a-4af6-ae00-85735dea4451",
  Marketingbanner4_click: "4ea13848-2641-4cbe-9275-6aedba260bff",
  "GameTile _click": "f830a1ed-04d5-4f74-a68b-801101d019a2",
  GameListingPage_shown: "a8ed16d2-583c-4e7f-bd4d-e8c5380fc119",
  GameGenreTile_click: "bb3c1fd7-b6ee-4a9f-ab34-eb538cb8b8d0",
  BlockchainNetworkfilter_click: "dd34875b-9d0b-4489-927b-f0752cb5fe1a",
  GameGenrefilter_click: "0d2c1f74-bee7-48c6-9cf4-0a20c6478f3d",
  GamePlatformfilter_click: "48b1b115-8769-4964-8b45-280f45fa5f5c",
  GameDetailsPage_shown: "04cf29b5-3ce5-40b2-a67c-41e5a528c56a",
  GameURL_click: "13f99550-8104-4596-8a4d-7c89c8bdd3e6",
  GameSocial_click: "901dcac8-bcca-495a-a7b1-002f91b3865a",
  "GameQuestPage_shown ": "47b90c1d-1128-40f8-8628-34edf2437f5a",
  // <--- Depreciated Start --->
  "GameQuestUpvote_click ": "84dd4ea6-7914-4314-8441-ef61a6cb8c43",
  GameQuestUpvote_submitted: "d9ec7593-a3b2-4739-86e5-deb3fa6265a1",
  Gamelike_click: "4462aa4b-c518-40d3-aeef-59ac7879e34e",
  Gamelike_submitted: "d529679c-ac68-4bff-a3eb-2a0699a67c65",
  Gamedislike_click: "e574fdc8-1d17-4541-833c-654f0941807d",
  Gamedislike_submitted: "b8b459e2-de4e-4cec-afea-512d9e9708cd",
  // <--- Depreciated End --->

  // New Quest Events
  questcard_click: "63549a1e-576e-454c-aef0-3483a41e80c5",
  QuestDetailspage_start_click: "fa511255-486b-4216-b9ad-50a8516102f8",
  gamedetailsoverlay_submit_click: "f04546d4-81e1-4840-a32e-45514205b8b1",
  Gamedetailsoverlay_crossicon_click: "9ab5dad7-69e4-47a5-b985-ac4935c55480",
  questDetailspage_share_click: "740bff06-94ef-4bf0-8497-53b28f48396a",
  questDetailspage_submit_click: "7829ac2e-4e58-4e39-8389-0069281ba417",
  POWsubmissionoverlay_next_click: "5f437801-60ac-44d0-851b-e741b4f26211",
  POWsubmissionoverlay_crossicon_click: "2e29b8bd-f01b-4458-a5f7-fb4928b48b06",
  "CCreferraloverlay_don'thaveCC_click": "bc882ebe-302c-4eb8-895f-b6300cc1e587",
  clanchiefreferraloverlay_crossicon_click:
    "a613e70f-6210-414f-85f0-febf98e004a6",
  clanchiefreferraloverlay_submit_click: "d13c5d88-6d7e-48e6-a3ed-5c68b817fa2d",
  questDetailspage_Pastsubmissions_click:
    "f42bdcc1-8ca9-4e46-b71f-81c2489c80bb",
  QuestDetailsPage_redirection_failed: "79cb95ed-c63f-456b-a7e5-5b40def5d3b2",
  "Questpage_DownloadGame/Visit_click": "991e79f5-bf89-4d73-a337-fe78847846f0",

  // Clan Events
  Click_Clan_Form_CollegeName: "12e9cc26-5ec1-4134-b347-c031fd5b026d",
  Select_Clan_Form_IfStudent: "7c368e00-61fd-477d-ba2b-4d22bd9bdf47",
  Click_Clan_Form_City: "1c9f2e0f-08f0-4c6c-8c63-d11d3fc3743a",
  Select_Clan_Form_Country: "ca612ff0-1749-432a-8a51-27481b92da60",
  Click_Clan_Form_Email: "864422d8-3aa9-479a-9ef5-e31c1ec88136",
  Click_Clan_Form_FirstName: "df6b1d23-394d-4f9a-9604-e047b7b7cb11",
  Click_clan_join_success_overlay_CTA: "7def6cb6-6674-4ddd-a13f-129defb059cc",
  View_Clan_join_success_overlay: "400b0f1d-38af-4c1a-a9c0-d4873a78ca24",
  Click_join_clan_CTA: "8d23d8f7-eec4-48b4-9e13-c2b625c572f0",
  Click_clan_invitation_overlay_CTA: "493b9bc0-fb33-44c3-944f-d08e490e77ed",
  View_clan_invitation_overlay: "0cd3fdfd-7fac-4039-acdf-49bc976458d4",
  Click_my_clan_button: "82bdae6c-9c8a-46d7-8c50-451cce00d773",
  Click_clan_Invitation_Link: "fb361b45-6b05-4ca0-9054-4bfed829f46d",
  Click_copy_invite_on_clan_dashboard: "b829a98a-8a7e-42e9-9438-dc6f7ad071c3",
  View_clan_dashboard: "f1ffed00-8f34-4859-9aa3-d9156ad889fd",
  Click_clan_creation_success_overlay_CTA:
    "ba836cbf-5311-467f-b0d0-525c29e76bf0",
  View_clan_creation_success_overlay: "d43e2997-d6bc-4b17-be35-08da199a7c55",
  Submit_ClanChiefProgram_Form: "32e08321-9843-4c04-a26f-b888da4be8d5",
  View_ClanChiefProgram_Page: "d71f65b6-899c-470b-8fe9-7051569919c2",
  Scroll_clan_member_table: "66695332-3b92-48fd-b131-f3af194042de",
  Scroll_Clan_Dashboard: "69cb8e06-6d25-49aa-8f65-97723daa380a",
  Click_Select_Country_Dropdown: "acb57f32-134e-414b-9bcf-85ac3c15b87a",
  Scroll_ClanChiefProgram_Page: "f47cb96c-8f16-42fe-a43d-07ef3131b49a",
  Click_Delete_Clan: "5d4a9af7-3304-4e4b-bd51-a72d1e04c13a",
  Click_Delete_Clan_Deletion_Confirmation_Overlay:
    "ab446895-ce7b-414e-931a-690954e4c10d",
  Click_Cancel_Clan_Deletion_Confirmation_Overlay:
    "e74a920a-d7e8-4938-a6fe-d5993445e24d",
  View_Clan_Deletion_Success_Overlay: "23d473f0-1bd5-4fe3-b47d-2ba6be0da1bc",
  Click_Leave_Clan: "b018d7f6-8ad8-4a05-b1de-ac31d9c45494",
  Click_Leave_Clan_Leave_Confirmation_Overlay:
    "6fb3eba0-a5ae-475f-a826-bf13865d7714",
  Click_Cancel_Clan_Leave_Confirmation_Overlay:
    "b228a68c-77b0-4eeb-84ae-7710611891f3",
  View_Clan_Leave_Success_Overlay: "a8045bda-bcd5-4695-a6d9-febbef940c5e",
  View_Delete_Clan_OTP_Overlay: "5a592304-4622-45ee-920c-86a22ac34a28",
  Click_DeleteCTA_On_Delete_Clan_OTP_Overlay:
    "6eb446dd-965e-4191-91e9-b6690df2e417",
  Click_Play_CC_Onboarding_Video: "81cd7e8e-dcaa-4b30-a566-161dad631f0a",
  Click_Download_Onboarding_Kit_CTA: "78f67667-372e-419e-9cdf-936c10c150d2",
  click_clanchiefprogram: "62d4b124-27f6-4b95-a5ca-c97dc01192c6",

  // Quest Leaderboard Events
  Leaderboard_widget_click: "ce917051-b7a4-416d-837f-8985f22eb874",
  Leaderboard_questdetailswidget_click: "9d32987f-c069-40b0-9e9c-5b59dbfc0e4c",
  Leaderboard_rankings_scroll: "638441ab-ddaf-42b8-ba56-0fb323ad76f7",
  Leaderboard_info_click: "5e1b0295-83eb-4b26-af00-3e8010759984",
  Leaderboard_Rewards_click: "09590b0d-b85c-447a-a18e-f9ed7e80a417",
  Leaderboard_Rewards_shown: "4a55a0d7-dc5d-48f5-b2c7-b17c3bcf99b2",
  Leaderboard_information_click: "976e75b5-9dc0-4248-986f-841d324849ee",
  Leaderboard_information_shown: "0c0705d0-daea-4609-a3a1-d41da2d78e39",

  // Clan Chief Leaderboard Events
  Click_View_Leaderboard: "bf59d646-3caa-423a-94e6-ec1c89bd9ff8",
  Scroll_Leaderboard_Table: "ac10f6ce-3afa-41d7-893b-3cafbfc9e4bf",
  Click_Leadearboard_Bottomsheet_Rewards_Button:
    "7c55dba5-a480-44b7-a672-dfc24fc7c251",
  View_Leaderboard_Rewards_Details: "49cf26e5-cff5-4d5f-8bee-4232a73ec479",
  Scroll_Leaderboard_Rewards_Details: "65b8800c-8152-42b2-9161-050cda3baf45",
  Click_Leadearboard_Bottomsheet_Information_Button:
    "91032a0f-7b9a-448b-ac38-03e76a16d386",
  View_Leaderboard_Information: "8c18098a-185d-44f5-a7b6-8c3a3b059a74",
  Scrolls_Leaderboard_Information: "546c3146-d296-472b-9b6b-a8fc8c55cb26",
  Close_Leaderboard_Bottomsheet: "7306f10d-7f27-4ec0-a67a-357e00b3cadc",
  View_leaderboard_RankPage: "046e9cfa-3b43-42e9-9026-59e4f11e9f8e",
  Scroll_leaderboard_RankPage: "2a5c5f6f-0b32-4bb4-af72-1efa46766624",
  Click_Leaderboard_Info_Button: "8f91bec4-a558-4ad9-8cbd-d2ace5c6eb70",
  Click_Leadeboard_MyClan_Button: "eccb5c7a-acb3-4fd8-8169-a2ff6f1fc772",
  Click_Leaderboard_GoBack_CTA: "556207ac-5eb9-43ec-9519-53a455745c4f",

  // Session Events
  analytic_SessionStart: "85396224-0af2-4145-bf59-da0f369c6565",
  login_session_end: "19d959a2-3788-487a-b2ca-0a41d8a14a2d",
  analytic_SessionEnd: "ac6fcd48-c5cb-4bce-9c7a-1ff39fe64dc3",
  Login_session_start: "15831a09-4928-4d19-b711-1668137e4a37",

  // Path to Pro
  Klash_Menu_Item_Click: "74cce855-a8b8-4060-a881-e2bf09e26733",
  Klash_Home_Page_Sticky_Banner_Click: "dcfbcca8-fdd4-40d7-8eae-432f15faaaed",
  PathToPro_Website_Redirection: "1914aaaf-a1e3-42e0-93e2-894025623f5b",
  IGN_Popup_Shown: "078655f3-7b1a-4948-b2fd-6fec23cad960",
  IGN_Submitted: "940e750e-91ec-49ad-84f3-3c6ef1fc73c2",
  IGN_Help_Page_Shown: "0311d2c9-f110-4087-ba40-920b9051a649",

  //Social handling

  Click_Profile_Tab: "606cc81d-71bf-4424-bb9a-7fa0861aae4d",
  Click_Connect_Social_CTA: "860dcd4f-e127-44d4-9e6d-6b6adf0f0179",
  CCreferraloverlay_dont_haveCC_click: "bc882ebe-302c-4eb8-895f-b6300cc1e587",
  Store_Click_HomePage: "6f9930fe-9af3-4325-ae0e-8421d1e0ff43",

  // Social Login
  click_ContinuewithGoogle: "de1be9de-9c1c-497d-9c32-7a4e3e36dd4b",
  newWallet_GoogleLogin: "26c75601-b14d-4388-b540-53c69e9fcaa1",
  phonenumber_verififyinitiated: "147f870e-92b2-48bb-b7a7-ddf4edff4357",
  phonenumber_verifycompleted: "71818540-8edc-4cd1-98bf-d96ae23ce545",
  email_verififyinitiated: "5da77307-614a-4c55-baf6-17b4744b837f",
  email_verififycompleted: "a1db96a3-4517-499e-bbc2-82c0ece7b1ad",

  //Joining and Loyalty bonus
  View_Claim_Bonus_Overlay: "45249ff8-519b-43bd-a354-2665158d84c7",
  Click_Claim_CTA_On_Claim_Bonus_Overlay:
    "977948ae-80a9-4bf3-bbfd-1edfdfa11fd6",
  Click_Close_On_Claim_Bonus_Overlay: "b5cd2888-9186-40bc-981a-11f33e138c2c",
  Click_Know_More_On_Claim_Bonus_Overlay:
    "3d540775-1c0b-4ffd-9106-0bef00b56920",
  web3auth_failed: "a29fbc04-dd82-4a1e-b064-6920503011e1",
  web3auth_failed_overlay_shown: "837bad8f-7e66-418e-9287-9fdbd8a422ef",
  web3_initiated: "907a6db1-66fb-47b9-85d4-d64b7ca40384",
  web3_Login_Successfull: "14370549-d397-4638-8fb4-0a5cb6aa4efd",

  View_CC_Onboarding_Challenge: "b817c5e3-a748-4d51-b365-8828cb70ecd7",
  Click_Start_CC_Challenge_CTA: " a43357a2-84ba-47e0-9fbe-ed9e23c675bd",
  View_CC_Onboarding_Completion_Overlay: "967066d9-fa0a-40f8-8339-7ad4d53fec60",
  walletIdMismatchFoundWithDB: "096c9d70-3a61-47db-a58f-7d35a78eb1cd",
  walletIdSavedInDB: "e92f3e50-6f1f-4d15-aa64-3bc375afb91a",
  web3Auth_connected: "2fcfa991-bd14-4835-b463-a40bd3e18bc6",

  // Clan Chief Quest Events
  Scroll_Clan_Stats_Dashboard: "09b4d340-6f8b-4aa3-aa2f-ac631d3a73a3",
  Click_View_Details_Clan_Stats_Dashboard:
    "56f4e980-ba9a-4561-ae6f-bf0a5e441743",
  Click_Share_Quest_Clan_Stats_Dashboard:
    "ea2b9d08-dc12-4489-96e8-6c852e3ceea1",
  ScrollQuestStats_InClanStatsDashboard: "4aa8a020-d485-49a4-be67-20c235175556",

  click_Discord: "595b4761-d31e-4df9-b20f-bdb405ab2cd8",
  PrivateKey_generated_Successfully: "d735b63e-be55-4254-96fd-95afc18599da",
  web3_initiated_Successfully: "10e0adec-4602-48ed-a33d-75fbabfdac8a",
  Wallet_Created_SuccessFully: "a2822b25-2854-4231-afb4-20e7d1e30549",
  Save_Wallet_API_Initiated: "2a0c9830-7971-40a8-8e50-f68ae58a26c2",
  Web3_refreshToken_Error: "8227e96a-91db-4f77-b224-63f68e397cd3",
  View_CC_Program_Promotion_Overlay: "e9a966ed-226a-478c-8943-4c27052e07cb",
  Click_StartClan_On_CC_Promotion_Overlay:
    "bac59327-7932-4397-986c-5d40a1138234",
  Close_CC_Program_Promotion_Overlay: "61624a49-1714-469e-abda-6c6bada6dc11",

  // USDT PAYMENT IN KSTORE
  "click Convert icon": "a4b2ea22-a8e3-4099-94a0-c16968cd066a",
  "click confirm on conversion screen": "af9a3382-1455-4f1f-9f2e-27611a8a8a7a",
  "transaction successful": "7c8792b9-2658-438a-bdad-df884a95b236",
  "transaction failed": "5ba00517-cd5e-4fdc-8a57-9d39a0957760",

  //twitter-connect-overlay
  overlay_twitter_connect_shown: "e4bb6741-20ee-4d0c-99d4-729b0f420a4f",
  overlay_twitter_cross_button_click: "deedc685-466e-48ac-ad09-8bca8e37034c",
  overlay_twitter_connect_click: "b0bca166-034a-4eb2-819d-11afcf43e05c",
  overlay_twitter_reconnect: "864bcda2-d2fd-415d-88bc-2806e9fa0d04",
  overlay_twitter_recoonect_cross_button_click:
    "5d2a7ce3-6d82-4725-b465-55639dbcb919",

  //kgen corporate
  homepage_corporate: "20a9b30d-9092-4a59-bbe3-3e505de7d96b",
  corporate_about_us_clicked: "ce501d14-d895-44e6-adf2-da21f7035e90",
  corporate_build_clicked: "26621ef5-02e1-453f-95be-24654341ec00",
  corporate_connect_clicked: "3a1bdaaa-d20d-459e-b866-ee40cdab8131",
  corporate_play_clicked: "599308c5-67a2-4c4b-877e-0fe6156581fe",
  corporate_store_clicked: "26687455-1761-4a59-9fea-a72d70fa394f",
  kdroptab_click: "bf44dc5a-76d5-4446-8fdd-18eb3430a841",
};
