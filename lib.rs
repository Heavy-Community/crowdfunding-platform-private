#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod crowdfunding_platform {
    #[ink(storage)]
    pub struct Platform { }

    impl Platform {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn transfer(&mut self) {
        }
    }

}
