import TokenJson from '../contracts-info/token.json'
import FaucetJson from '../contracts-info/faucet.json'
import PlatformJson from '../contracts-info/platform.json'

export const TokenAbi = TokenJson as Record<string, any>;
export const FaucetAbi = FaucetJson as Record<string, any>;
export const PlatformAbi = PlatformJson as Record<string, any>;

export enum ContractsAddresses {
    Token = '5Emr6PEhmRGuExeMZ5ns2NcDLZD7yi5YyvsR15wmGCTZ3AYv',
    Faucet = '5HQs79zc9MNSKAa37tXkhAMEm8dYJKYFDWEDpAD6dsfP9WVt',
    // TODO: Change with real address of the deployed contracts
    Platform = '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu',
}

