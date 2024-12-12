#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod proxy {

    #[ink(storage)]
    pub struct Proxy {
        /// Implementation contract
        forward_to: AccountId,
        /// Owner of the Proxy
        owner: AccountId,
    }

    impl Proxy {
        #[ink(constructor)]
        pub fn new(implementation_contract: AccountId) -> Self {
            Self {
                forward_to: implementation_contract,
                owner: Self::env().caller(),
            }
        }

        #[ink(message, selector = @)]
        pub fn change_forward_address(&mut self, new_implementation_contract: AccountId) {
            assert_eq!(
                self.env().caller(),
                self.owner,"{:?} cannot perform this operation!. Only the owner ({:?}) of the contract can change the implementation contract's address!",
                self.env().caller(),
                self.owner
            );
            self.forward_to = new_implementation_contract;
        }

        #[ink(message, payable, selector = _)]
        pub fn forward(&self) -> u32 {
            let mut call_flags = ink::env::CallFlags::empty();
            call_flags.set(ink::env::CallFlags::FORWARD_INPUT, true);
            call_flags.set(ink::env::CallFlags::TAIL_CALL, true);

            let _ = ink::env::call::build_call::<ink::env::DefaultEnvironment>()
                .call(self.forward_to)
                .transferred_value(self.env().transferred_value())
                .call_flags(call_flags)
                .try_invoke()
                .unwrap_or_else(|err| {
                    panic!(
                        "cross-contract call to {:?} failed due to {:?}",
                        self.forward_to, err
                    )
                });
            unreachable!("the forwarded call will never return since `tail_call` was set");
        }
    }
}
