import TokenJson from '../contracts-info/token.json'
import FaucetJson from '../contracts-info/faucet.json'
import PlatformJson from '../contracts-info/platform.json'

export const TokenAbi = TokenJson as Record<string, any>;
export const FaucetAbi = FaucetJson as Record<string, any>;
export const PlatformAbi = PlatformJson as Record<string, any>;

export enum ContractsAddresses {
    Token = '5D6UmJWR9eeodNsEQLued24KiBLmWFDwXHj7hN97zM6fQT9E',
    Faucet = '5HQs79zc9MNSKAa37tXkhAMEm8dYJKYFDWEDpAD6dsfP9WVt',
    Platform = '5H8GMducLxz2TqSAENnoDJ1oQWHYu74QTgixS9YgvLH9gcmf',
}

