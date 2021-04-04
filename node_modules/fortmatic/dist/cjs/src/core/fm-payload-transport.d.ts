import { FmIncomingWindowMessage, FmMessageEvent, FmOutgoingWindowMessage, JsonRpcBatchRequestPayload, JsonRpcRequestPayload, JsonRpcResponsePayload } from '../types';
import { FmIframeController } from './fm-iframe-controller';
interface RemoveEventListenerFunction {
    /**
     * Stop listening on the event associated with this `FmFetchOffFunction`
     * object.
     */
    (): void;
}
/**
 * A class of utilities for communicating with Fortmatic iframes via JSON RPC
 * payloads.
 */
export declare class FmPayloadTransport {
    private readonly endpoint;
    private readonly encodedQueryParams;
    private messageHandlers;
    constructor(endpoint: string, encodedQueryParams: string);
    /**
     * Send a payload to the Fortmatic `<iframe>` for processing and automatically
     * handle the acknowledging follow-up event(s).
     *
     * @param overlay - The `FmIframeController` context to which the event will be posted.
     * @param msgType - The type of message to encode with the data.
     * @param payload - The JSON RPC payload to emit via `window.postMessage`.
     */
    post(overlay: FmIframeController, msgType: FmOutgoingWindowMessage, payload: JsonRpcRequestPayload): Promise<JsonRpcResponsePayload>;
    post(overlay: FmIframeController, msgType: FmOutgoingWindowMessage, payload: JsonRpcBatchRequestPayload): Promise<JsonRpcResponsePayload[]>;
    /**
     * Listen for events received with the given `msgType`.
     *
     * @param msgType - The `msgType` encoded with the event data.
     * @param handler - A handler function to execute on each event received.
     * @return A `void` function to remove the attached event.
     */
    on(msgType: FmIncomingWindowMessage, handler: (this: Window, event: FmMessageEvent) => any): RemoveEventListenerFunction;
    /**
     * Initialize the underlying `Window.onmessage` event listener.
     */
    private initMessageListener;
}
export {};
