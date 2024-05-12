#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::bronze_token::BronzeToken;

#[ink::contract]
mod bronze_token {

    use erc20::Erc20;

    #[ink(storage)]
    #[derive(Default)]
    pub struct BronzeToken {
        token: Erc20,
    }

    impl BronzeToken {
        #[ink(constructor)]
        pub fn mint(initial_supply: Balance) -> Self {
            let bronze_token = Erc20::new(initial_supply);
            Self {
                token: bronze_token,
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.token.total_supply()
        }
    }
}