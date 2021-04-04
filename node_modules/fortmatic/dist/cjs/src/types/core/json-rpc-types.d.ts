export interface JsonRpcRequestPayload {
    jsonrpc: string;
    method: string;
    params: any;
    id: string | number;
}
export interface JsonRpcBatchRequestPayload {
    jsonrpc: string;
    method: string;
    batch: JsonRpcRequestPayload[];
    id: string | number;
}
export interface JsonRpcError {
    message: string;
    code: string | number;
}
export interface JsonRpcResponsePayload<ResultType = any> {
    jsonrpc: string;
    id: string | number | null;
    result?: ResultType | null;
    error?: JsonRpcError | null;
}
export interface JsonRpcRequestCallback {
    /**
     * Callback executed upon JSON RPC response.
     */
    (err: JsonRpcError | null, result?: JsonRpcResponsePayload | (JsonRpcResponsePayload | null)[] | null): void;
}
export interface ComposeTransactionConfig {
    to: string;
    amount: string;
}
/**
 * Enum of Fortmatic custom JSON RPC methods. These are used for communication
 * with the Fortmatic provider and as such are not part of the Web3 standard
 * spec.
 */
export declare enum FmPayloadMethod {
    fm_composeSend = "fm_composeSend",
    fm_logout = "fm_logout",
    fm_get_balances = "fm_get_balances",
    fm_get_transactions = "fm_get_transactions",
    fm_is_logged_in = "fm_is_logged_in",
    fm_accountSettings = "fm_accountSettings",
    fm_deposit = "fm_deposit",
    fm_get_user = "fm_get_user",
    fm_configure = "fm_configure",
    fm_auth_login_with_magic_link = "fm_auth_login_with_magic_link",
    fm_auth_get_access_token = "fm_auth_get_access_token",
    fm_auth_get_metadata = "fm_auth_get_metadata",
    fm_auth_logout = "fm_auth_logout"
}
