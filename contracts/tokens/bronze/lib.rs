#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod bronze_token {

    use erc20::Erc20;

    #[ink(storage)]
    pub struct BronzeToken {
        token: Erc20,
        faucet_address: AccountId,
        deploy_address: AccountId,
    }

    /// The Bronze result type.
    pub type Result<T> = core::result::Result<T, Error>;

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Returned if the transaction from the `faucet` to the respective receiver fails
        TransactionFailed,
        /// Returned if the caller of the `transfer` function isn't the faucet
        InvalidAuthorization,
    }

    impl BronzeToken {
        #[ink(constructor)]
        pub fn new(
            initial_supply: Balance,
            faucet_address: AccountId,
            deploy_address: AccountId,
        ) -> Self {
            Self {
                token: Erc20::new(initial_supply),
                faucet_address,
                deploy_address,
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.token.total_supply()
        }

        #[ink(message)]
        pub fn balance_of(&self, user: AccountId) -> Balance {
            self.token.balance_of(user)
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, amount: Balance) -> Result<()> {
            if self.env().caller() != self.faucet_address
                && self.env().caller() != self.deploy_address
            {
                return Err(Error::InvalidAuthorization);
            }
            if self.token.transfer(to, amount).is_ok() {
                Ok(())
            } else {
                Err(Error::TransactionFailed)
            }
        }
    }
}
