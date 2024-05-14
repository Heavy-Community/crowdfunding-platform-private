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

        /// Invest `amount` of funds in particular `campaign`
        #[ink(message)]
        pub fn invest_funds(&self) {

        }

        /// `owner` of `campaign` can withdraw the deposited funds
        #[ink(message)]
        pub fn withdraw_funds(&self) {

        }

        /// investor in a `campaign` can revoke `amount` of his deposits
        pub fn revoke_funds(&self) {

        }

        /// investor can refund his deposits of particular campaign
        pub fn refund_funds(&self) {

        }
    }

}
