#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod platform {
    use ink::storage::Lazy;

    #[ink(storage)]
    pub struct Proxy {
        /// The initializer and owner of the proxy.
        owner: AccountId,
        /// Logic execution is delegated to this on-chain uploaded code.
        delegate_to: Lazy<Hash>,
    }

    impl Proxy {
        #[ink(constructor)]
        /// Initializes new proxy contract with the hash of
        /// the contract code to delegate to.
        ///
        /// Additionally, this code hash will be locked to prevent its deletion, since
        /// this contract depends on it.
        pub fn new(implementation_code_hash: Hash) -> Self {
            let mut delegate_to = Lazy::new();
            delegate_to.set(&implementation_code_hash);
            Self::env().lock_delegate_dependency(&implementation_code_hash);

            Self {
                owner: Self::env().caller(),
                delegate_to,
            }
        }

        /// Changes the hash of the contract the proxy delegates to.
        /// Executed only by the owner of the proxy contract.
        /// 1. Unlocks the old delegate dependency,
        /// releasing the deposit and allowing old delegated code to be removed.
        /// 2. Adds a new delegate dependency lock.
        /// 3. Sets the `delegate_to` to the new hash.
        #[ink(message)]
        pub fn upgrade_delegate_to(&mut self, new_code_hash: Hash) {
            let _ = self.is_proxy_owner();
            if let Some(old_code_hash) = self.delegate_to.get() {
                self.env().unlock_delegate_dependency(&old_code_hash)
            }
            self.env().lock_delegate_dependency(&new_code_hash);
            self.delegate_to.set(&new_code_hash);
        }

        #[inline]
        /// Checks if the caller is the owner of the proxy contract.
        fn is_proxy_owner(&self) {
            assert_eq!(
                Self::env().caller(),
                self.owner,
                "{:?} cannot perform this operation!. Only the owner ({:?}) of the proxy contract can change the implementation's code hash!",
                self.env().caller(),
                self.owner
            )
        }
    }
}
