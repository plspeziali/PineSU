export declare enum WidgetModePrimaryLoginOption {
    LoginWithEmail = "email",
    LoginWithPhone = "phone"
}
export interface WidgetModeConfiguration {
    primaryLoginOption?: WidgetModePrimaryLoginOption;
}
export interface WidgetModeGSNConfiguration {
    gsnRelay: boolean;
}
export interface DepositConfiguration {
    address: string;
    amount: number;
    crypto: string;
}
