"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTM_PARAMS = exports.ANALYTICS_EVENTS = exports.SESSION_EVENTS = exports.STORAGE_KEYS = void 0;
exports.STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    CAMPAIGN_TASK: "campaignTask",
    CURRENT_CAMPAIGN_TASK_TYPE: "currentCampaignTaskType",
    SOCIAL_CONNECT_TASK_MODAL: "isConnectTaskInitiated",
    SOCIAL_FLOW: "socialFlow",
    SOCIAL_CONNECT_FROM: "socialConnectFrom",
    ANALYTIC_SESSION_ID: "analyticSessionId",
    DEVICE_INFO: "deviceInfo",
    EVENT_TIMESTAMP: "eventTimestamp",
    IS_SESSION_END_TRIGGERED: "isSessionEndTriggered",
    LOGIN_SESSION_ID: "loginSessionId",
    USER_ID: "userId",
    IP_ADDRESS: "ipAddress",
    USER_LOCATION_DATA: "userLocationData",
    AIRDROP_SESSION_TABS: "sessionTabs",
    AIRDROP_SESSION_TAB_IDENTIFIER: "sessionTabIdentifier",
    AUTH_INITIALIZED_FROM_URL: "authInitializedFromURL",
    IS_NEW_USER: "isNewUser",
    CCP_MODAL_DATA: "CCPModalData",
    CLAN_PAGE_FOR_REGISTRATION: "clanPageForRegistration",
    CHANNEL: "channel",
};
exports.SESSION_EVENTS = {
    ANALYTIC_SESSION_START: "analytic_SessionStart",
    ANALYTIC_SESSION_END: "analytic_SessionEnd",
    LOGIN_SUCCESSFUL: "Login_session_start",
    LOGIN_SESSION_END: "login_session_end",
    FIRST_PAGE_LOAD: "first_page_load",
};
exports.ANALYTICS_EVENTS = {
    SESSION_EVENTS: {
        ANALYTIC_SESSION_START: "analytic_SessionStart",
        ANALYTIC_SESSION_END: "analytic_SessionEnd",
        LOGIN_SUCCESSFUL: "Login_session_start",
        LOGIN_SESSION_END: "login_session_end",
        FIRST_PAGE_LOAD: "first_page_load",
    },
};
exports.UTM_PARAMS = {
    UTM_SOURCE: "utm_source",
    UTM_MEDIUM: "utm_medium",
    UTM_CAMPAIGN: "utm_campaign",
    UTM_ID: "utm_id",
    UTM_TERM: "utm_term",
    UTM_CONTENT: "utm_content",
};
