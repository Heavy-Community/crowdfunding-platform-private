#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::bronze_token::BronzeToken;

#[ink::contract]
mod bronze_token {

    use erc20::Erc20;

    #[ink(storage)]
    #[derive(Default)]
    pub struct BronzeToken {
        token: Erc20,
        total_supply: Balance,
    }

    impl BronzeToken {
        #[ink(constructor)]
        pub fn mint(initial_supply: Balance) -> Self {
            let bronze_token = Erc20::new(initial_supply);
            let bronze_token_supply = bronze_token.total_supply();
            Self {
                token: bronze_token,
                total_supply: bronze_token_supply,
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }
    }
}