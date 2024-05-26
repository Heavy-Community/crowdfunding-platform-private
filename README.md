# Crowdfunding Startups Platform

These smart contracts establish a cutting-edge crowdfunding platform that employs an ERC20-based token currency. The platform contract empowers project owners to launch their investment campaigns, invest in, and manage funds across multiple projects.<br> Meanwhile, the faucet contract offers a seamless mechanism for users to periodically request tokens, thereby promoting the utilization of these digital assets within the platform's ecosystem.

[Link to pitch video]()

## Prerequisites

### Polkadot.js Wallet & Account

After you create your new account, you are ready to proceed to the next step with your Polkadot.js account.

### Aleph Zero Tokens

Since we are working with Aleph Zero tokens, it is essential to acquire free tokens through the [Aleph Zero faucet](https://faucet.test.azero.dev/) with your account before engaging in platform activities.

## Instructions for Using the Platform

### Faucet

Once your Polkadot.js account and Aleph Zero testnet tokens are set up, on the faucet page (accessible through the sidebar), you can both **add new custom** tokens to the platform and request tokens from those that you already added.

* **Important Note**: The implementation in the Faucet smart contract is generic, thus it supports custom tokens. However, our current implementation only supports one token, namely the Platform token.

#### Request Tokens

You can click on the `REQUEST TOKENS` button, and a Polkadot.js dialog screen will pop up asking you to sign the transaction, i.e., to accept the interaction with the faucet contract, which will give you an amount of tokens. Currently, the fixed amount is 5.

After clicking the `UPDATE BALANCE` button, you will see that the total *Tokens to invest* has increased by 5.

* **Note**: Clicking `UPDATE BALANCE` ensures that you see an updated version of your balance.

#### Add Token Type

Adding a new custom token requires you to provide a name for the token, its token address, and its withdrawing amount.

### Platform

When you navigate to the platform (again, from the sidebar), you will see the list of all the projects that are currently ongoing and their statistics.

* **Note**: The names of the platform's functionalities are slightly different for comprehensive purposes. For example, in the smart contracts, `WITHDRAW` is actually `CASHOUT`, and `REVOKE` in the smart contracts is `WITHDRAW` in the user interface.

#### Allowance of the Platform

* ⚠ **Very Important Note**: You **must** approve the platform to use X amount of your tokens. The purpose of this is because we are using custom tokens that play the role of [ERC20 standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) that are using the `approve` function under the hood.

#### Add Project

You must provide the name of the project, a valid funding goal, and a deadline by which the project must be successfully completed. When you click the `ADD PROJECT` button, a Polkadot.js dialog window will appear for you to sign the transaction. If the transaction is successful, your crowdfunding project will appear on the list of all currently ongoing projects.

* **Note**: Right now, we have 2 projects - Meme Coin and Blood Coin projects.

After you approve some amount of tokens to be spent on the platform's behalf (as we've already mentioned above), you can proceed to the following functionalities of the platform:

#### Invest

Depositing funds can happen with the `INVEST` button. Accept the Polkadot.js request. If everything is successful, you will see the *Invested funds* field increment with the amount invested.

* **Note**: Click the `UPDATE BALANCE` button in the sidebar to see the changes.

* **Note**: Right now, the `INVEST` function transfers only 1 token to the chosen project. However, the smart contracts implementation supports custom amounts of token investments.

#### Withdraw

As previously mentioned, `WITHDRAW` is implemented as the `revoke_funds` function in the smart contracts. As the name suggests, it's meant to withdraw some of the deposit of an investor if the project **is still ongoing**. The process is similar to the `INVEST` function. After you've clicked the `WITHDRAW` button and the transaction passes successfully, you will see that the *Invested Funds* label of the project you've revoked from decreases by one.

* **Note**: Click the `UPDATE BALANCE` button in the sidebar to see the changes in your balance.

#### Refund

If a particular project has finished and failed, then every investor can refund their investments from the project. When the last investor refunds their deposits, the project is deleted.

* **Note**: A failed project is one where its deadline has already expired, and its invested funds haven't reached the funding goal before the deadline expiration.

#### Cashout

As previously mentioned, `CASHOUT` is implemented as the `withdraw` function in the smart contracts. Only the owner of the project can successfully execute this function. If a particular project's status is `Successful`, then its owner can withdraw the project's investments. A project can be `Successful` even if its deadline hasn't expired.
