/**
 * View controller for the Fortmatic `<iframe>` overlay.
 */
export declare class FmIframeController {
    private readonly endpoint;
    private readonly encodedQueryParams;
    readonly iframe: Promise<HTMLIFrameElement>;
    private _overlayReady;
    private payloadTransport;
    constructor(endpoint: string, encodedQueryParams: string);
    /**
     * Represents the ready state of the underlying Fortmatic `<iframe>`.
     */
    get overlayReady(): boolean;
    /**
     * Initialize the Fortmatic `<iframe>` and pre-load overlay content when DOM
     * is ready.
     */
    private init;
    /**
     * Show the Fortmatic `<iframe>` overlay.
     */
    private showOverlay;
    /**
     * Hide the Fortmatic `<iframe>` overlay.
     */
    private hideOverlay;
    /**
     * Listen for messages sent from the underlying Fortmatic `<iframe>`.
     */
    private listen;
}
