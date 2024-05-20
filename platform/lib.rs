#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {

    use ink::storage::Mapping;

    // The token
    use erc20::Erc20Ref;

    /// The Faucet error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        GeneralError,
        TransferError,
        NotExistingProject,
        DeadlineExceeded,
        ZeroAmount,
        FailedCalculation,
        NotProjectOwner,
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
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Project {
        /// Map of all users and the amount they have invested in the project
        // investors: (AccountId, InvestorInfo),

        /// All invested funds in the project
        invested_funds: Balance,

        /// Funding goal measured in smallest token type (Bronze)
        funding_goal: Balance,

        /// Map of all levels that investor can reach
        /// based on the balance that is invested
        invest_levels: (u8, Balance),

        /// The deadline for the project after it will be
        /// *destroyed* if `funding_goal` was not reached
        deadline: Timestamp,

        /// Owner of the project
        owner: AccountId,

        /// Flag marking successfull project
        successful: bool,
    }

    impl Project {
        pub fn is_successful(&self) -> bool {
            self.successful
        }
    }

    #[ink(storage)]
    pub struct Platform {
        projects_counter: u128,
        ongoing_projects: Mapping<u128, Project>,
        investors: Mapping<(AccountId, u128), Balance>,
        token: Erc20Ref,
    }

    impl Platform {
        #[ink(constructor)]
        pub fn new(token_hash: Hash) -> Self {
            //  TODO: Discuss how exactly we will keep the tokens here
            // let token = Erc20Ref::new(true)
            //     .code_hash(token_hash)
            //     .endowment(0)
            //     .salt_bytes([0xDE, 0xAD, 0xBE, 0xEF])
            //     .ref_time_limit(ref_time_limit)
            //     .proof_size_limit(proof_size_limit)
            //     .storage_deposit_limit(storage_deposit_limit)
            //     .instantiate();

            unreachable!("Constructor isn't called since we are using Delegator pattern!");
        }

        /// Initializes new campaign with `owner`, funding `goal` and `timeline`
        #[ink(message)]
        pub fn initialize_campaign(&mut self, project: Project) {
            self.projects_counter = self.projects_counter.checked_add(1).unwrap();
            self.ongoing_projects.insert(self.projects_counter, &project);
        }

        /// `investor` deposits `amount` of funds in particular `project`
        #[ink(message)]
        pub fn invest_funds(
            &mut self,
            amount: Balance,
            project_id: u128,
        ) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_before_deadline(project_id)?;
            self.is_project_successful(project_id)?;

            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let investor = self.env().caller();

            if let Some(current_invested_amount) = self.investors.get((investor, project_id)) {
                let new_invested_amount = current_invested_amount.checked_add(amount);
                if new_invested_amount.is_none() {
                    return Err(Error::FailedCalculation)
                }
                self.investors.insert((investor, project_id), &new_invested_amount.unwrap());
            }

            // Transfer the invested `amount` to our address
            let transfer_result = self.token.transfer_from(investor, self.env().account_id(), amount);
            if transfer_result.is_err() {
                return Err(Error::TransferError);
            }

            Ok(())
        }

        #[ink(message)]
        pub fn withdraw_funds(&self, owner: AccountId, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_project_successful(project_id)?;
            self.is_project_owner(owner, project_id)?;

            Ok(())
        }

        /// Investor in a `campaign` can revoke `amount` of his deposits.
        pub fn revoke_funds(&self) {}

        /// Investor can refund his deposits of particular campaign.
        pub fn refund_funds(&self) {}

        /// Checks if the caller is the owner of the project.
        fn is_project_owner(&self, owner: AccountId, project_id: u128) -> Result<()> {
            if owner == self.ongoing_projects.get(project_id).unwrap().owner {
                Ok(())
            }
            else {
                Err(Error::NotProjectOwner)
            }
        }

        /// Checks if project is successful.
        fn is_project_successful(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().is_successful()
            {
                Ok(())
            } else {
                Err(Error::DeadlineExceeded)
            }
        }

        /// Checks if project exists.
        fn is_existing_project(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.contains(project_id) {
                Ok(())
            } else {
                Err(Error::NotExistingProject)
            }
        }

        /// Checks if the project exceeded its deadline.
        fn is_before_deadline(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().deadline
                > self.env().block_timestamp()
            {
                Ok(())
            } else {
                Err(Error::DeadlineExceeded)
            }
        }
    }
}
