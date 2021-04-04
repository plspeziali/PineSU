export declare enum SDKErrorCode {
    MissingApiKey = "MISSING_API_KEY",
    ModalNotReady = "MODAL_NOT_READY",
    InvalidArgument = "INVALID_ARGUMENT"
}
export declare enum SDKWarningCode {
    SyncWeb3Method = "SYNC_WEB3_METHOD",
    DuplicateIframe = "DUPLICATE_IFRAME"
}
export declare enum RPCErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    MagicLinkFailedVerification = -10000,
    MagicLinkExpired = -10001,
    MagicLinkRateLimited = -10002,
    UserAlreadyLoggedIn = -10003
}
export declare type ErrorCode = SDKErrorCode | RPCErrorCode;
export declare type WarningCode = SDKWarningCode;
