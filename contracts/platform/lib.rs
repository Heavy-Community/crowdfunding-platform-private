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

    /// Event emitted when a new `project` is initialized by `owner`.
    #[ink(event)]
    pub struct InitializeProject {
        #[ink(topic)]
        project: Project,
        #[ink(topic)]
        owner: Option<AccountId>,
    }

    /// Event emitted when a new investment in a particular `project` occurs.
    #[ink(event)]
    pub struct InvestFunds {
        #[ink(topic)]
        project: Project,
        #[ink(topic)]
        investor: Option<AccountId>,
        amount: Balance,
    }

    /// Event emitted when the funds from a successful `project` are withdrawn by the `owner`.
    #[ink(event)]
    pub struct WithdrawFunds {
        #[ink(topic)]
        project: Project,
        #[ink(topic)]
        owner: Option<AccountId>,
    }

    /// Event emitted when the `amount` of an investment revocation occurs by an `investor` in a particular `project`.
    #[ink(event)]
    pub struct RevokeFunds {
        #[ink(topic)]
        project: Project,
        #[ink(topic)]
        investor: Option<AccountId>,
        amount: Balance,
    }

    /// Event emitted when the entire `amount` of investments is refunded from a particular failed `project` by an `investor`.
    #[ink(event)]
    pub struct RefundFunds {
        #[ink(topic)]
        project: Project,
        #[ink(topic)]
        investor: Option<AccountId>,
        amount: Balance,
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
    #[derive(Debug, PartialEq, Eq)]
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
        /// Flag marking status of project as failed.
        fn fail(&mut self) {
            self.status = ProjectStatus::Failed
        }

        /// Flag marking status of project as successful.
        fn success(&mut self) {
            self.status = ProjectStatus::Succeded;
        }

        /// Updates the state of the invested funds and the project.
        fn invest_funds(&mut self, amount: Balance) -> Result<()> {
            let new_invest_funds = self.invested_funds.checked_add(amount);
            if new_invest_funds.is_none() {
                return Err(Error::FailedCalculation);
            }

            self.invested_funds = new_invest_funds.unwrap();
            if self.status != ProjectStatus::Succeded && self.invested_funds >= self.funding_goal {
                self.success();
            }

            Ok(())
        }

        /// Updates the state of the project based on its deadline and current time.
        fn is_over_the_deadline(&mut self, current_time: Timestamp) {
            if self.deadline < current_time && self.status == ProjectStatus::Ongoing {
                self.fail();
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
            Self {
                projects_counter: 1,
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

            self.env().emit_event(InitializeProject {
                project: new_project,
                owner: Some(self.env().caller()),
            });

            Ok(())
        }

        /// `investor` deposits `amount` of funds in particular `project`
        #[ink(message)]
        pub fn invest_funds(&mut self, amount: Balance, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_before_deadline(project_id)?;
            self.is_project_ongoing_or_successfull(project_id)?;

            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            let investor = self.env().caller();

            // If already the investor has deposited funds in particular project.
            if self.investors.contains((investor, project_id)) {
                if let Some(current_invested_amount) = self.investors.get((investor, project_id)) {
                    let new_invested_amount = current_invested_amount.checked_add(amount);
                    if new_invested_amount.is_none() {
                        return Err(Error::FailedCalculation);
                    }

                    self.investors
                        .insert((investor, project_id), &new_invested_amount.unwrap());
                }
            } else {
                self.investors.insert((investor, project_id), &amount);
            }

            // Update the project instance
            let mut project = self.ongoing_projects.get(project_id).unwrap();
            project.invest_funds(amount)?;
            project.is_over_the_deadline(self.env().block_timestamp());
            self.ongoing_projects.insert(project_id, &project);

            self.env().emit_event(InvestFunds {
                project,
                investor: Some(investor),
                amount,
            });

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

        /// When a project became `successful` has raised funds on time
        /// the `owner` can collect his funds by `withdraw_funds`.
        #[ink(message)]
        pub fn withdraw_funds(&mut self, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_project_successfull(project_id)?;

            let owner = self.env().caller();
            self.is_project_owner(owner, project_id)?;

            let reached_funding = self
                .ongoing_projects
                .get(project_id)
                .unwrap()
                .invested_funds;

            let project = self.ongoing_projects.get(project_id).unwrap();

            // Remove from the map of projects
            self.ongoing_projects.remove(project_id);

            self.env().emit_event(WithdrawFunds {
                project,
                owner: Some(owner),
            });

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
        #[ink(message)]
        pub fn revoke_funds(&mut self, project_id: u128, amount: Balance) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.is_project_ongoing(project_id)?;

            let investor = self.env().caller();
            self.is_investor_in_project(project_id, investor)?;

            if amount == 0 {
                return Err(Error::ZeroAmount);
            }

            if let Some(current_invested_amount) = self.investors.get((investor, project_id)) {
                let amount_after_revoke = current_invested_amount.checked_sub(amount);
                if amount_after_revoke.is_none() {
                    return Err(Error::InvalidAmount);
                }
                // Remove from investors if investor decides to revoke all his deposits.
                if amount_after_revoke.unwrap() == 0 {
                    self.investors.remove((investor, project_id));
                } else {
                    // If he is revoking only a certain amount, overwrite his investment.
                    self.investors
                        .insert((investor, project_id), &amount_after_revoke.unwrap());
                }

                let mut project = self.ongoing_projects.get(project_id).unwrap();
                project.invested_funds = project.invested_funds.checked_sub(amount).unwrap();
                self.ongoing_projects.insert(project_id, &project);
            }

            let project = self.ongoing_projects.get(project_id).unwrap();

            self.env().emit_event(RevokeFunds {
                project,
                investor: Some(investor),
                amount,
            });

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

        /// When a `project` has failed, all investors on that project
        /// can `refund` their funds by `refund_funds`.
        #[ink(message)]
        pub fn refund_funds(&mut self, project_id: u128) -> Result<()> {
            self.is_existing_project(project_id)?;
            self.project_failed(project_id)?;

            let investor = self.env().caller();
            self.is_investor_in_project(project_id, investor)?;

            let amount_invested = self.investors.get((investor, project_id)).unwrap();
            self.investors.remove((investor, project_id));

            let mut project = self.ongoing_projects.get(project_id).unwrap();
            project.invested_funds = project.invested_funds.checked_sub(amount_invested).unwrap();

            // Check if the project's invested funds are zero, and remove the project.
            if project.invested_funds == 0 {
                self.ongoing_projects.remove(project_id)
            } else {
                // Overwrite the project's value with the previously decreased value.
                self.ongoing_projects.insert(project_id, &project);
            }

            self.env().emit_event(RefundFunds {
                project,
                investor: Some(investor),
                amount: amount_invested,
            });

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

        #[ink(message)]
        /// Gets project counter
        pub fn get_project_counter(&self) -> u128 {
            self.projects_counter
        }

        /// Checks if the caller is the `owner` of the `project_id`.
        fn is_project_owner(&self, owner: AccountId, project_id: u128) -> Result<()> {
            if owner == self.ongoing_projects.get(project_id).unwrap().owner {
                Ok(())
            } else {
                Err(Error::NotProjectOwner)
            }
        }

        /// Checks if `project_id` is still going.
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

        /// Checks whether `project_id` has been finished successfully or is still going.
        fn is_project_ongoing_or_successfull(&self, project_id: u128) -> Result<()> {
            if self.ongoing_projects.get(project_id).unwrap().status == ProjectStatus::Succeded
                || self.ongoing_projects.get(project_id).unwrap().status == ProjectStatus::Ongoing
            {
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
