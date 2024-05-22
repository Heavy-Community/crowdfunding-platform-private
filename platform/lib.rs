#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::{CallFlags, DefaultEnvironment};
    use ink::storage::Mapping;

    /// The Faucet error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        TransferFailed,
        NotExistingProject,
        DeadlineExceeded,
        ZeroAmount,
        FailedCalculation,
        NotProjectOwner,
        ProjectFinished,
        ProjectNotSuccesfull,
        ProjectNotFailed,
        NotInvestorInProject,
        InvalidDeadline,
        InvalidAmount,
    }

    /// The Platform result type.
    pub type Result<T> = core::result::Result<T, Error>;

    /// The Projects' possible statuses.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum ProjectStatus {
        Ongoing,
        Succeded,
        Failed,
    }

    /// Representation of a project in our Platform
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub struct Project {
        /// All invested funds in the project.
        invested_funds: Balance,

        /// Funding goal of the project.
        funding_goal: Balance,

        /// The project's deadline, after which
        /// it will be terminated if the funding_goal
        /// is not reached and all investors
        /// have refunded their deposits.
        ///
        /// Note: If a project achieves success before its deadline,
        /// it will still be terminated.
        deadline: Timestamp,

        /// Owner of the project.
        owner: AccountId,

        /// Flag marking the status of the project.
        status: ProjectStatus,
    }

    impl Project {
        // TODO: Implement the constructor of the project
        //       to only accept: owner, funding_goal, deadline
        // pub fn new() -> Self {
        // }

        fn fail(&mut self) {
            self.status = ProjectStatus::Failed
        }

        fn invest_funds(&mut self, amount: Balance) -> Result<()> {
            let new_invest_funds = self.invested_funds.checked_add(amount);
            if new_invest_funds.is_none() {
                return Err(Error::FailedCalculation);
            }

            self.invested_funds = new_invest_funds.unwrap();

            Ok(())
        }

        fn update(&mut self, current_time: Timestamp) {
            if self.deadline < current_time {
                self.status = ProjectStatus::Failed;
            } else if self.status == ProjectStatus::Ongoing
                && self.invested_funds >= self.funding_goal
            {
                self.status = ProjectStatus::Succeded;
            }
        }
    }

    #[ink(storage)]
    pub struct Platform {
        /// Counter that increments with every newly initialized project.
        projects_counter: u128,
        /// Mapping of all project IDs and their respective projects.
        ongoing_projects: Mapping<u128, Project>,
        /// Mapping of all addresses with their related project IDs and respective deposits.
        investors: Mapping<(AccountId, u128), Balance>,

        /// The `token_address` of the Token contract that will be
        /// used for investing into projects
        token_address: AccountId,
    }

    impl Platform {
        #[ink(constructor)]
        pub fn new(token_address: AccountId) -> Self {
            // TODO: WTF MAN? Emo asks' Niko - why unreachable??
            // unreachable!("Constructor isn't called since we are using Delegator pattern!");

            Self {
                projects_counter: 0,
                ongoing_projects: Mapping::new(),
                investors: Mapping::new(),
                token_address,
            }
        }

        /// Initializes new project with `funding_goal` and `deadline`
        #[ink(message)]
        pub fn initialize_project(
            &mut self,
            funding_goal: Balance,
            deadline: Timestamp,
        ) -> Result<()> {
            if deadline < self.env().block_timestamp().checked_add(605000).unwrap() {
                return Err(Error::InvalidDeadline);
            }
            if funding_goal == 0 {
                return Err(Error::ZeroAmount);
            }

            let new_project = Project {
                invested_funds: 0,
                funding_goal,
                deadline,
                owner: self.env().caller(),
                status: ProjectStatus::Ongoing,
            };

            self.ongoing_projects
                .insert(self.projects_counter, &new_project);

            self.projects_counter = self.projects_counter.checked_add(1).unwrap();

            Ok(())
        }

        /// `investor` deposits `amount` of funds in particular `project`
        #[ink(message)]
        pub fn invest_funds(&mut self, amount: Balance, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_before_deadline(project_id)?;
            self.is_project_ongoing(project_id)?;

            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let investor = self.env().caller();

            if let Some(current_invested_amount) = self.investors.get((investor, project_id)) {
                let new_invested_amount = current_invested_amount.checked_add(amount);
                if new_invested_amount.is_none() {
                    return Err(Error::FailedCalculation);
                }
                self.investors
                    .insert((investor, project_id), &new_invested_amount.unwrap());
            }

            // Update the project instance
            self.ongoing_projects
                .get(project_id)
                .unwrap()
                .invest_funds(amount)?;
            self.ongoing_projects
                .get(project_id)
                .unwrap()
                .update(self.env().block_timestamp());

            // Transfer the invested `amount` to platform's address
            let mut call_flags = ink::env::CallFlags::empty();
            call_flags.set(CallFlags::TAIL_CALL, true);

            let transfer_result = build_call::<DefaultEnvironment>()
                .call(self.token_address)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .call_flags(call_flags)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                        .push_arg(investor) // From
                        .push_arg(self.env().account_id()) // To
                        .push_arg(amount), // Amount
                )
                .returns::<Result<()>>()
                .try_invoke();

            if transfer_result.is_err() {
                return Err(Error::TransferFailed);
            }

            Ok(())
        }

        /// When a project became _successfull_ has raised funds on time
        /// _the owner_ can collect his/her funds by `withdraw_funds`
        #[ink(message)]
        pub fn withdraw_funds(&self, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_project_successfull(project_id)?;

            let owner = self.env().caller();
            self.is_project_owner(owner, project_id)?;

            let reached_funding = self
                .ongoing_projects
                .get(project_id)
                .unwrap()
                .invested_funds;

            // Remove from the map of projects
            self.ongoing_projects.remove(project_id);

            // Transfer the invested `reached_funding` to the project owner
            let mut call_flags = ink::env::CallFlags::empty();
            call_flags.set(CallFlags::TAIL_CALL, true);

            let transfer_result = build_call::<DefaultEnvironment>()
                .call(self.token_address)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .call_flags(call_flags)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                        .push_arg(owner) // To
                        .push_arg(reached_funding), // Amount
                )
                .returns::<Result<()>>()
                .try_invoke();

            if transfer_result.is_err() {
                return Err(Error::TransferFailed);
            }

            Ok(())
        }

        /// Investor in a `project` can revoke `amount` of his deposits.
        pub fn revoke_funds(&mut self, project_id: u128, amount: Balance) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_project_ongoing(project_id)?;

            let investor = self.env().caller();
            let invested_amount = self.investors.get((investor, project_id)).unwrap();

            if invested_amount < amount {
                return Err(Error::InvalidAmount);
            }
            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            // Transfer the `amount_invested` previously by `investor` back to him
            let mut call_flags = ink::env::CallFlags::empty();
            call_flags.set(CallFlags::TAIL_CALL, true);

            let transfer_result = build_call::<DefaultEnvironment>()
                .call(self.token_address)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .call_flags(call_flags)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                        .push_arg(investor) // To
                        .push_arg(amount), // Amount
                )
                .returns::<Result<()>>()
                .try_invoke();

            if transfer_result.is_err() {
                return Err(Error::TransferFailed);
            }

            Ok(())
        }

        /// When a _project_ has failed, all investor on that project
        /// can _refund_ their funds by `refund_funds`
        #[ink(message)]
        pub fn refund_funds(&mut self, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.project_failed(project_id)?;

            let investor = self.env().caller();
            self.is_investor_in_project(project_id, investor)?;

            let amount_invested = self.investors.get((investor, project_id)).unwrap();
            self.investors.remove((investor, project_id));

            // Transfer the `amount_invested` previously by `investor` back to him
            let mut call_flags = ink::env::CallFlags::empty();
            call_flags.set(CallFlags::TAIL_CALL, true);

            let transfer_result = build_call::<DefaultEnvironment>()
                .call(self.token_address)
                .call_v1()
                .gas_limit(0)
                .transferred_value(0)
                .call_flags(call_flags)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                        .push_arg(investor) // To
                        .push_arg(amount_invested), // Amount
                )
                .returns::<Result<()>>()
                .try_invoke();

            if transfer_result.is_err() {
                return Err(Error::TransferFailed);
            }

            Ok(())
        }

        #[ink(message)]
        /// Gets project by providing `project_id`
        pub fn get_project_by_id(&self, project_id: u128) -> Option<Project> {
            self.ongoing_projects.get(project_id)
        }

        /// Checks if the caller is the `owner` of the `project_id`.
        fn is_project_owner(&self, owner: AccountId, project_id: u128) -> Result<()> {
            if owner == self.ongoing_projects.get(project_id).unwrap().owner {
                Ok(())
            } else {
                Err(Error::NotProjectOwner)
            }
        }

        /// Checks if `project_id` is successful.
        fn is_project_ongoing(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().status == ProjectStatus::Ongoing {
                Ok(())
            } else {
                Err(Error::ProjectFinished)
            }
        }

        /// Checks if `project_id` exists.
        fn is_existing_project(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.contains(project_id) {
                Ok(())
            } else {
                Err(Error::NotExistingProject)
            }
        }

        /// Checks if the `project_id` exceeded its deadline.
        fn is_before_deadline(&self, project_id: u128) -> Result<()> {
            if let Some(mut project) = self.ongoing_projects.get(project_id) {
                if project.deadline > self.env().block_timestamp() {
                    Ok(())
                } else {
                    project.fail();
                    Err(Error::DeadlineExceeded)
                }
            } else {
                unreachable!("You should have already checked whether project is existing!");
            }
        }

        /// Checks whether `project_id` has been finished successfully.
        fn is_project_successfull(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().status == ProjectStatus::Succeded {
                Ok(())
            } else {
                Err(Error::ProjectNotSuccesfull)
            }
        }

        /// Checks whether `project_id` has failed.
        fn project_failed(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().status == ProjectStatus::Failed {
                Ok(())
            } else {
                Err(Error::ProjectNotFailed)
            }
        }

        /// Checks whether `investor` has deposited in the `project_id` project.
        fn is_investor_in_project(&self, project_id: u128, investor: AccountId) -> Result<()> {
            if self.investors.contains((investor, project_id)) {
                Ok(())
            } else {
                Err(Error::NotInvestorInProject)
            }
        }
    }
}
