#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {

    #[ink(storage)]
    pub struct Platform { }

    impl Platform {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        /// Initializes new campaign with `owner`, funding `goal` and `timeline`
        #[ink(message)]
        pub fn initialize_campaign(&self) {

        }
    }

}
