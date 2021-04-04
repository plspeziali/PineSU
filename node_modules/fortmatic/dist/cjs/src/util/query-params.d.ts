/**
 * The shape of encoded query parameters sent along with the `<iframe>` request.
 */
export interface QueryParameters {
    API_KEY?: string;
    DOMAIN_ORIGIN?: string;
    ETH_NETWORK?: string | {
        rpcUrl: string;
        chainId?: number;
    } | {
        rpcUrl: string;
        chainId?: number;
        chainType: ChainType;
    };
    host?: string;
    sdk?: string;
    version?: string;
    gsnRelay?: boolean;
}
declare enum ChainType {
    HARMONY = "HARMONY"
}
export declare function encodeQueryParameters(options: QueryParameters): string;
export declare function decodeQueryParameters(queryString: string): QueryParameters;
export {};
