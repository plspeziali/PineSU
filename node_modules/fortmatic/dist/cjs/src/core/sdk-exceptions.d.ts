import { SDKErrorCode, SDKWarningCode, JsonRpcError, RPCErrorCode } from '../types';
export declare class FortmaticError extends Error {
    code: SDKErrorCode;
    __proto__: ErrorConstructor;
    constructor(code: SDKErrorCode, message: string);
}
export declare class FortmaticWarning {
    code: SDKWarningCode;
    message: string;
    constructor(code: SDKWarningCode, message: string);
    log(): void;
}
export declare class RpcError extends Error {
    __proto__: ErrorConstructor;
    code: RPCErrorCode;
    constructor(sourceError?: JsonRpcError | null);
}
export declare function createMissingApiKeyError(): FortmaticError;
export declare function createModalNotReadyError(): FortmaticError;
export declare function createInvalidArgumentError(options: {
    functionName: string;
    argIndex: number;
    expected: string;
    received: string;
}): FortmaticError;
export declare function createSynchronousWeb3MethodWarning(): FortmaticWarning;
export declare function createDuplicateIframeWarning(): FortmaticWarning;
