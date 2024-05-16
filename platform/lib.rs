#![cfg_attr(not(feature = "std"), no_std, no_main)]


#[ink::contract]
mod platform {
    use ink::{primitives::AccountId, storage::{Mapping, StorageVec}};

    /// The Faucet error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        GeneralError,
    }

    pub type UserTokenPair = (AccountId, AccountId);

    /// The Platform result type.
    pub type Result<T> = core::result::Result<T, Error>;

    /// Representation of a project in our Platform
    #[ink::storage_item]
    pub struct Project {
        /// Map of all users and the tokens invested in the project
        investors: Mapping<UserTokenPair, Balance>,

        /// Overal invested funds that in the project
        /// Funding goal measured in smallest token type (Bronze)
        funding_goal: Balance,

        /// Map of tokens' goals that needs to be reached
        /// in order for a user to reach different benefits
        token_goals: Mapping<AccountId, Balance>,

        /// The deadline for the project after it will be
        /// *destroyed* if `funding_goal` was not reached
        deadline: Timestamp,

        /// Owner of the project
        owner: AccountId,

        /// Flag marking successfull project
        successful: bool,
    }

    impl Project {
        // here we pbly have some help implementation for the
        // project type: Most importantly the calculation of the
        pub fn is_investor(&self, user: &AccountId) -> bool {
            self.invested_funds.contains((user, _))
        }

        pub fn is_invested_token(&self, user: &AccountId, token: &AccountId) -> bool {
        }

        pub fn invest(&mut self, user: &AccountId, token: &AccountId, amount: Balance) -> Result<()> {
            Ok(())
        }
    }

    #[ink(storage)]
    pub struct Platform { }

    impl Platform {
        #[ink(constructor)]
        pub fn new() -> Self {
        }

        /// Initializes new campaign with `owner`, funding `goal` and `timeline`
        #[ink(message)]
        pub fn initialize_campaign(&self) {

        }

        /// Invest `amount` of funds in particular `campaign`
        #[ink(message)]
        pub fn invest_funds(&self) {
        }

        /// `owner` of `campaign` can withdraw the deposited funds
        #[ink(message)]
        pub fn withdraw_funds(&self) {

        }

        /// investor in a `campaign` can revoke `amount` of his deposits
        pub fn revoke_funds(&self) {

        }

        /// investor can refund his deposits of particular campaign
        pub fn refund_funds(&self) {

        }
    }

}
