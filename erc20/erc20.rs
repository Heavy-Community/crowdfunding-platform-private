#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod erc20 {
    use ink::{primitives::AccountId, storage::Mapping};

    #[ink(storage)]
    #[derive(Default)]
    pub struct Erc20 {
        /// Total token suplly
        total_supply: Balance,
        /// Mapping from owner to number of owned tokens
        balances: Mapping<AccountId, Balance>,
        /// Mapping of the token amount an account is allowed to withdraw from another account
        allowances: Mapping<(AccountId, AccountId), Balance>,
    }

    /// Event emitted when an approval occurs that `spender` is allowed to withdraw
    /// up to the amount of `value` tokens from the `owner`
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        value: Balance,
    }

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        amount: Balance
    }

    /// The ERC-20 error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Returned if not enough balance to fulfill a request is available.
        InsufficientBalance,
        /// Returned if not enough allowance to fulfill a request is available.
        InsufficientAllowance,
    }

    /// The ERC-20 result type.
    pub type Result<T> = core::result::Result<T, Error>;

    impl Erc20 {
        /// Creates a new ERC-20 contract with the specified initial supply.
        #[ink(constructor)]
        pub fn new(total_supply: Balance) -> Self {
            let mut balances = Mapping::default();
            let mut caller = self::env().caller();
            balances.insert(caller, &total_supply);
            self::env().emit_event(
                Transfer {
                    from: None,
                    to: Some(caller),
                    value: total_supply,
                }
            );

            Self {
                total_supply,
                balances,
                allowances: Default::default(),
            }
        }
    }

    /// Returns the total token supply.
    #[ink(message)]
    pub fn total_supply(&self) -> Balance {
        self.total_supply
    }

    /// Returns the account balance of the specified `owner`.
    /// Returns 0 if the account is non-existent.
    #[ink(message)]
    pub fn balance_of(&self, owner: AccountId) -> Balance {
        self.balance_of_impl(&owner);
    }

    /// Returns the account balance of the specified `owner`.
    /// 
    /// Returns 0 if the account is non-existent.
    /// 
    /// # Note
    /// 
    /// Prefer to call this method over `balance_of`since this
    /// works using references which are more efficient in Wasm
    #[inline]
    fn balance_of_impl(&self, &owner: AccountId) -> Balance {
        self.balances.get(owner).unwrap_or_default()
    }

    /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
    /// 
    /// Returns 0 if no allowance has been set.
    #[ink(message)]
    pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
        self.allowance_impl(&owner, &spender);
    }


    /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
    /// 
    /// Returns 0 if no allowance has been set.
    /// 
    /// Prefer to call this method over `allowance`since this
    /// works using references which are more efficient in Wasm
    #[ink(inline)]
    pub fn allowance_impl(&self, owner: &AccountId, spender: &AccountId) -> Balance {
        self.allowances.get(owner, spender).unwrap_or_default()
    }

    /// Transfers `value` amount of tokens from the caller's account to account `to`
    ///
    /// On success a `Transfer` event is emitted.
    ///
    /// # Errors
    ///
    /// Returns `InsufficientBalance` error if there are not enough tokens on
    /// the caller's account balance.
    #[ink(message)]
    pub fn transfer(&mut self, to: AccountId, value: Balance) -> Result<()> {
        let from = self.env().caller();
        self.transfer_from(&from, &to, value);
    }

    /// Allow `spender` to withdraw from the caller's account multiple times, up to the `value` amount.
    /// 
    /// If this function is called again it overwrites the current allowance with `value`.
    /// 
    /// An `Approval` event is emitted.
    #[ink(message)]
    pub fn approve(&mut self, owner: AccountId, spender: AccountId, value: Balance) -> Result<()> {
        let owner = self.env().caller();
        self.allowances.insert((&owner, &spender), &value);
        self.env().emit_event(Approval {
            owner,
            spender,
            value
        });
        Ok(())
    }

    /// Transfers `value` tokens on the behalf of `from` to the account `to`.
    ///
    /// This can be used to allow a contract to transfer tokens on ones behalf and/or
    /// to charge fees in sub-currencies, for example.
    ///
    /// On success a `Transfer` event is emitted.
    ///
    /// # Errors
    ///
    /// Returns `InsufficientAllowance` error if there are not enough tokens allowed
    /// for the caller to withdraw from `from`.
    ///
    /// Returns `InsufficientBalance` error if there are not enough tokens on
    /// the account balance of `from`.
    #[ink(message)]
    pub fn transfer_from(&mut self, from: AccountId, to: AccountId, value: Balance) -> Result<()> {
        let caller = self.env().caller();
        let allowance = self.allowance_impl(&from, &caller);
        if allowance < value {
            return Err(Error::InsufficientAllowance)
        }
        self.transfer_from_to(&from, &to, value)?;

    }

    /// Transfer `value` amount of tokens from the caller's account to account `to`
    /// 
    /// On success a `Transfer`event is emitted.
    /// 
    /// Returns `InsufficientAllowance` if there aren't enough tokens on the caller's account balance
    fn transfer_from_to(&mut self, from: &AccountId, to: &AccountId, value: Balance) -> Result<()> {
        let from_balance = self.balance_of_impl(from);
        
        if from_balance < value {
            return Err(Error::InsufficientAllowance)
        }

        // We checked that from_balance >= value
        #[allow(clippy::arithmetic_side_effects)]
        self.balances.insert(from, &(from_balance - value));

        let to_balance = balance_of_impl(to);
        self.balances.insert(to, &(to_balance.checked_add(value).unwrap()));
        self.env.emit_event(
            Transfer {
                from: Some(*from),
                to: Some(*to),
                amount
            }
        );
    }
}