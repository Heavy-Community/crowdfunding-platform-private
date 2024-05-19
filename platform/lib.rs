#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {
    use ink::storage::Mapping;

    /// The Faucet error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        GeneralError,
    }

    pub type UserTokenPair = (AccountId, AccountId);

    /// The Platform result type.
    pub type Result<T> = core::result::Result<T, Error>;

    // TODO: Emo: Check whether you can seprate the Project structure
    //       in separate file..

    /// The Project error types.
    #[derive(Debug, PartialEq, Eq)]
    pub enum ProjectError {
        GeneralError,
        FailedCalculation,
        AlreadySuccesfull,
        DeadProject,
        NotInvestor,
    }

    /// The Project result type.
    pub type ProjectResult<T> = core::result::Result<T, ProjectError>;

    /// Investor info related to to the project (balance invested and current level)
    pub type InvestorInfo = (Balance, u8);

    /// Representation of a project in our Platform
    #[ink::storage_item]
    pub struct Project {
        /// Map of all users and the amount they have invested in the project
        investors: Mapping<AccountId, InvestorInfo>,

        /// All invested funds in the project
        invested_funds: Balance,

        /// Funding goal measured in smallest token type (Bronze)
        funding_goal: Balance,

        /// Map of all levels that investor can reach
        /// based on the balance that is invested
        invest_levels: Mapping<u8, Balance>,

        /// The deadline for the project after it will be
        /// *destroyed* if `funding_goal` was not reached
        deadline: Timestamp,

        /// Owner of the project
        owner: AccountId,

        /// Flag marking successfull project
        successful: bool,
    }

    impl Project {
        pub fn is_investor_of_a_token(&self, user: &AccountId) -> bool {
            self.investors.contains(user)
        }

        pub fn is_successful(&self) -> bool {
            self.successful
        }

        // Level is going to be provided from the FE
        pub fn invest(&mut self, user: &AccountId, amount: Balance, level: u8) -> ProjectResult<()> {
            if self.is_successful() {
                return Err(ProjectError::AlreadySuccesfull);
            }

            // First add the amount to overall project invested_funds
            let invested_funds = self.invested_funds.checked_add(amount);
            if invested_funds.is_none() {
                return Err(ProjectError::FailedCalculation);
            }
            self.invested_funds = invested_funds.unwrap();

            // Then add the amount to the corresponding user's invested_funds
            if let Some(investor_info) = self.investors.get(user) {
                let new_amount = investor_info.0.checked_add(amount);
                let current_level = investor_info.1;
                if new_amount.is_none() {
                    return Err(ProjectError::FailedCalculation); // shouldn't happen
                }

                self.investors.insert(user, &(new_amount.unwrap(), level));
            }
            else {
                self.investors.insert(user, &(amount, level));
            }

            Ok(())
        }

        pub fn get_investor_level(&self, user: &AccountId) -> ProjectResult<u8> {
            if !self.investors.contains(user) {
                return Err(ProjectError::NotInvestor);
            }

            let investor = self.investors.get(user).unwrap();
            Ok(investor.1)
        }
        
        // fn calculate_new_inv_level(&self, current_level: u8, amount_invested: &Balance) -> u8 {
        //     for () {
        //         if amoun
        //     }
        // }
    }

    #[ink(storage)]
    pub struct Platform { }

    impl Platform {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
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
