import TokenJson from '../contracts-info/token.json'
import FaucetJson from '../contracts-info/faucet.json'
import PlatformJson from '../contracts-info/platform.json'

export const TokenAbi = TokenJson as Record<string, any>;
export const FaucetAbi = FaucetJson as Record<string, any>;
export const PlatformAbi = PlatformJson as Record<string, any>;

export enum ContractsAddresses {
    Token = '5FcewiPMSveFJxgxyqNmwRCvRj7nSp4HcZriyaHzk3jexFxw',
    Faucet = '5Fm2EUXjj6oXoUooCxYYF2rGZxNXrkkwVA1noTGjn8fy9mxB',
    // TODO: Change with real address of the deployed contracts
    Platform = '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu',
}

