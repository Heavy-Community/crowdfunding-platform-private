#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::faucet::{Faucet, FaucetRef};

#[ink::contract]
mod faucet {
    use ink::env::call::{build_call, ExecutionInput, Selector};
    use ink::env::{CallFlags, DefaultEnvironment};
    use ink::storage::Mapping;

    /// The Faucet error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Returned if the address of the token is already added
        TokenAlreadyAdded,
        /// Returned if the address is not added as a token contract in the Faucet
        TokenNotFound,
        /// Returned if user is not allowed to get free tokens_withdraw_amount at the current time
        UserNotAllowedToWithdraw,
        /// Returned if there was a transaction error in the custom tokens_withdraw_amount
        TransferFailed,
        /// Returned if contract couldn't calculate the next time that user will be allowed to use
        /// faucet (shouldn't happen!!)
        NextAccessTimeCalculation,
    }

    /// 1 hour of wait time
    const WAIT_TIME: Timestamp = 3600;

    /// The Faucet result type.
    pub type Result<T> = core::result::Result<T, Error>;

    /// Account to token hash, used for a key in the mapping
    pub type AccountTokenPair = (AccountId, AccountId);

    /// Event emitted when a token given occurs.
    #[ink(event)]
    pub struct TokensGiven {
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        token: Option<AccountId>,
        amount: Balance,
    }

    #[ink(storage)]
    pub struct Faucet {
        /// Map with user and requested token pairs, which holds the next
        /// possible time for withdrawing funds
        next_access_times: Mapping<AccountTokenPair, Timestamp>,

        /// Different tokens' address and amount that the Faucet will give to users
        tokens_withdraw_amount: Mapping<AccountId, Balance>,
    }

    impl Faucet {
        /// Creates a new Faucet contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                next_access_times: Mapping::new(),
                tokens_withdraw_amount: Mapping::new(),
            }
        }

        /// Insert new token type that the faucet can "give"
        #[ink(message)]
        pub fn add_token_type(
            &mut self,
            token_contract: AccountId,
            withdrawing_amount: Balance,
        ) -> Result<()> {
            if self.tokens_withdraw_amount.contains(token_contract) {
                return Err(Error::TokenAlreadyAdded);
            }
            self.tokens_withdraw_amount
                .insert(token_contract, &withdrawing_amount);
            Ok(())
        }

        /// Give tokens to user if he/she is eligible
        #[ink(message)]
        pub fn request_tokens(&mut self, token_contract: AccountId) -> Result<()> {
            if !self.tokens_withdraw_amount.contains(token_contract) {
                return Err(Error::TokenNotFound);
            }

            if self.is_allowed_to_withdraw_impl(&self.env().caller(), &token_contract) {
                if let Some(withdrawing_amount) = self.tokens_withdraw_amount.get(token_contract) {

                    // Add user's wait_time for next possible request of tokens
                    if let Some(caller_next_access_time) =
                        self.env().block_timestamp().checked_add(WAIT_TIME)
                    {
                        self.next_access_times.insert(
                            (&self.env().caller(), &token_contract),
                            &caller_next_access_time,
                        );
                    } else {
                        return Err(Error::NextAccessTimeCalculation);
                    }

                    // Transfer money to the user
                    let mut call_flags = ink::env::CallFlags::empty();
                    call_flags.set(CallFlags::TAIL_CALL, true);

                    self.env().emit_event(TokensGiven {
                        to: Some(self.env().caller()),
                        token: Some(token_contract),
                        amount: withdrawing_amount,
                    });

                    let transfer_result = build_call::<DefaultEnvironment>()
                        .call(token_contract)
                        .call_v1()
                        .gas_limit(0)
                        .transferred_value(0)
                        .call_flags(call_flags)
                        .exec_input(
                            ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer")))
                                .push_arg(self.env().caller()) // To
                                .push_arg(withdrawing_amount), // Amount
                        )
                        .returns::<Result<()>>()
                        .try_invoke();

                    if transfer_result.is_ok() {
                        Ok(())
                    }
                    else {
                        Err(Error::TransferFailed)
                    }
                } else {
                    Err(Error::TokenNotFound)
                }
            } else {
                Err(Error::UserNotAllowedToWithdraw)
            }
        }

        /// Check whether the user of our Faucet contract is eligible
        /// to request new funds based on his/her last access time.
        #[ink(message)]
        pub fn is_allowed_to_withdraw(&self, token_contract: AccountId) -> bool {
            self.is_allowed_to_withdraw_impl(&self.env().caller(), &token_contract)
        }

        #[inline]
        fn is_allowed_to_withdraw_impl(
            &self,
            user: &AccountId,
            token_contract: &AccountId,
        ) -> bool {
            if !self.next_access_times.contains((user, token_contract)) {
                return true;
            } else if let Some(next_access_time) =
                self.next_access_times.get((user, token_contract))
            {
                return next_access_time <= self.env().block_timestamp();
            }
            false
        }
    }
}
