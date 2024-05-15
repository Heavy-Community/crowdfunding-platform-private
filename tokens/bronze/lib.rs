#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::bronze_token::BronzeToken;

#[ink::contract]
mod bronze_token {

    use erc20::Erc20;

    #[ink(storage)]
    pub struct BronzeToken {
        token: Erc20,
        faucet_address: AccountId,
    }

    /// The ERC-20 result type.
    pub type Result<T> = core::result::Result<T, Error>;

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        /// Returned if the transaction from the `faucet` to the respective receiver fails
        TransactionFailed,
        /// Returned if the caller of the `transfer` function isn't the faucet
        InvalidAuthorization
    }

    impl BronzeToken {
        #[ink(constructor)]
        pub fn mint(initial_supply: Balance, faucet_address: AccountId) -> Self {
            Self {
                token: Erc20::new(initial_supply),
                faucet_address,
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.token.total_supply()
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, amount: Balance) -> Result<()> {
            if !(self.env().caller() == AccountId::from([0x42; 32])) {
                return Err(Error::InvalidAuthorization);
            }
            let transaction = self.token.transfer(to, amount);
            if transaction.is_ok() {
                Ok(())
            } else {
                Err(Error::TransactionFailed)
            }
        }
    }
}