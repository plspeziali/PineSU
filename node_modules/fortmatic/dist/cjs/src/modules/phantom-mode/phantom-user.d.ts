import { GetIdTokenConfiguration, PhantomModeUserMetadata } from '../../types';
import { BaseModule } from '../base-module';
/**
 * A stateless object representing the current Fortmatic Auth user.
 */
export declare class PhantomUser extends BaseModule {
    /** */
    getIdToken(configuration?: GetIdTokenConfiguration): Promise<string>;
    /** */
    getMetadata(): Promise<PhantomModeUserMetadata>;
    /** */
    isLoggedIn(): Promise<boolean>;
    /** */
    logout(): Promise<boolean>;
}
