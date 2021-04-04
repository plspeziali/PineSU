import { DepositConfiguration } from '../../types';
import { BaseModule } from '../base-module';
/**
 *
 */
export declare class UserModule extends BaseModule {
    /** */
    login(): Promise<string[]>;
    /** */
    logout(): Promise<void>;
    /** */
    getUser(): Promise<any>;
    /** */
    getBalances(): Promise<any>;
    /** */
    getTransactions(): Promise<any>;
    /** */
    isLoggedIn(): Promise<any>;
    /** */
    settings(): Promise<any>;
    /**
     * With configuration, it will skip the deposit selection page and takes the user to the fiat-on-ramp flow directly
     * */
    deposit(payload?: DepositConfiguration): Promise<any>;
}
