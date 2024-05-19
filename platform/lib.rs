#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {
    use ink::{scale::{Encode, WrapperTypeEncode}, storage::Mapping};

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
        pub fn invest(
            &mut self,
            user: &AccountId,
            amount: Balance,
            level: u8,
        ) -> ProjectResult<()> {
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
            } else {
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
    pub struct Platform {
        projects_counter: u128,
        // ongoing_projects: Mapping<u128, Project>,
    }

    impl Platform {
        #[ink(constructor)]
        pub fn new() -> Self {
            unreachable!("Constructor isn't called since we are using Delegator pattern!");
        }

        /// Initializes new campaign with `owner`, funding `goal` and `timeline`
        #[ink(message)]
        pub fn initialize_campaign(&self) {}

        /// Invest `amount` of funds in particular `campaign`
        #[ink(message)]
        pub fn invest_funds(&self) {}

        #[ink(message, selector = 0xAWITHDRAW)]
        pub fn withdraw_funds(&self, owner: AccountId, project_id: u128) {
            self.is_project_owner(owner);
            self.is_project_successful(project_id);
            self.is_existing_project(project_id);
        }

        /// Investor in a `campaign` can revoke `amount` of his deposits.
        pub fn revoke_funds(&self) {}

        /// Investor can refund his deposits of particular campaign.
        pub fn refund_funds(&self) {}

        /// Checks if the caller is the owner of the project.
        fn is_project_owner(&self, owner: AccountId) {
            assert_eq!(
                self.env().caller(),
                owner,
                "{:?} cannot withdraw!. Only the owner ({:?}) of the project can withdraw the funds!",
                self.env().caller(),
                owner
            )
        }

        /// Checks if project is successful.
        fn is_project_successful(&self, project_id: u128) {
            // assert_eq!(ongoing_projects[project_id].successful, true, "Project must be successful!");
        }

        /// Checks if project exists.
        fn is_existing_project(&self, project_id: u128) {
            // assert_eq!(ongoing_projects[project_id].does_exist, true, "Project must exist!");
        }

        fn is_before_deadline(&self, project_id: u128) {
            // assert_eq!(ongoing_projects[project_id].deadline > env::current_time(), false, "Project must exist!");
        }
    }
}
