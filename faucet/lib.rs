#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::faucet::{
    Faucet,
    FaucetRef,
};

#[ink::contract]
mod faucet {
    use ink::storage::Mapping;
    use erc20::Erc20Ref;

    // Different tokens' amounts that will faucet give to investors
    const BRONZE_TOKENS_AMOUNT: u128 = 1_000_000_000;
    const SILVER_TOKENS_AMOUNT: u128 = 100_000;
    const GOLD_TOKENS_AMOUNT: u128 = 1000;

    /// 1 hour
    const WAIT_TIME: Timestamp = 3600;

    // Here token instances will be connected after Niko's implementation
    // Below is solidity token example
    // ERC20 public tokenInstance; -> Will be used in the constructor

    #[ink(storage)]
    pub struct Faucet {
        /// Map with Address <-> Last time this address has requested funds
        /// (TBD) Right now - no matter what token you have requested, u will wait 1 hour
        last_access_time: Mapping<AccountId, Timestamp>,
        tokens : Erc20Ref,
    }

    impl Faucet {
        /// Creates a new Faucet contract
        #[ink(constructor)]
        pub fn new(token_contract: Hash, token_total_supply: Balance) -> Self {
            let token_contract = Erc20Ref::new(token_total_supply)
                .code_hash(token_contract)
                .endowment(0)
                .salt_bytes([0xDE, 0xAD, 0xBE, 0xEF])
                .instantiate();
            Self {
                last_access_time: Mapping::new(),
                tokens: token_contract,
            }
        }

        /// Give Bronze tokens to user if he/she is eligible
        #[ink(message)]
        pub fn request_bronze_tokens(&mut self, user: AccountId) {
            // TODO: Delete the current impl and do it for BronzeToken
            // TODO: Check if there is sth like require(..) in Ink!
            if self.is_allowed_to_withdraw_impl(&user) {
                let _ = self.tokens.transfer(user, BRONZE_TOKENS_AMOUNT);
                self.last_access_time.insert(user, &self.env().block_timestamp());
            }
        }

        /// Give Silver tokens to user if he/she is eligible
        #[ink(message)]
        pub fn request_silver_tokens(&mut self) {
        }

        /// Give Gold tokens to user if he/she is eligible.
        #[ink(message)]
        pub fn request_gold_tokens(&mut self) {
        }

        /// Get balance of custom tokens of an account
        #[ink(message)]
        pub fn balance_of_user(&mut self, user: AccountId) -> Balance  {
            self.tokens.balance_of(user)
        }

        // TODO: Rework to be more detailed and "safe"
        /// Check whether the user of our Faucet contract is eligible
        /// to request new funds based on his/her last access time.
        #[ink(message)]
        pub fn is_allowed_to_withdraw(&self, user: AccountId) -> bool {
            return self.is_allowed_to_withdraw_impl(&user);
        }

        #[inline]
        fn is_allowed_to_withdraw_impl(&self, user: &AccountId) -> bool {
            if !self.last_access_time.contains(user) {
                return true;
            }
            else if let Some(user_last_access_time) = self.last_access_time.get(user) {
                // TODO: Make it SAFE!!!
                let next_possible_time = user_last_access_time.checked_add(WAIT_TIME).unwrap();
                return next_possible_time <= self.env().block_timestamp();
            }
            return false;
        }
    }

}
