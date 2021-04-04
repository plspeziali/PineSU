import { JsonRpcBatchRequestPayload, JsonRpcRequestCallback, JsonRpcRequestPayload, JsonRpcResponsePayload } from '../types';
/**
 * Fortmatic's Web3-compliant provider.
 */
export declare class FmProvider {
    private readonly apiKey;
    readonly isFortmatic: boolean;
    private readonly overlay;
    private readonly payloadTransport;
    private queue;
    constructor(endpoint: string, apiKey: string, encodedQueryParams: string);
    /**
     * Enqueue a native Web3 payload for asynchronous processing.
     */
    sendAsync(payload: Partial<JsonRpcRequestPayload> | Partial<JsonRpcRequestPayload>[] | Partial<JsonRpcBatchRequestPayload>, onRequestComplete: JsonRpcRequestCallback): void;
    /**
     * Enqueue a Fortmatic custom payload for asynchronous processing.
     */
    sendFortmaticAsync(payload: Partial<JsonRpcRequestPayload>, onRequestComplete: JsonRpcRequestCallback): void;
    /**
     * Primary, Web3-compatible send interface. Enqueues a native Web3 payload for
     * processing.
     */
    send<ResultType>(method: string, params?: any[]): Promise<ResultType>;
    send(payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload, onRequestComplete: JsonRpcRequestCallback): void;
    send<ResultType>(payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload, none: void): JsonRpcResponsePayload<ResultType>;
    /**
     * Enable the provider by invoking the `eth_accounts` RPC method.
     */
    enable(): Promise<string[]>;
    /**
     * Enqueue a payload for processing.
     */
    private enqueue;
    /**
     * Dequeue the next payload and execute the request.
     */
    private dequeue;
    /**
     * Listen for messages sent from the Fortmatic `<iframe>`.
     */
    private listen;
}
