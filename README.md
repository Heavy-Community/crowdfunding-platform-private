# Crowdfunding Startups Platform

These smart contracts establish a cutting-edge crowdfunding platform that employs an ERC20-based token currency. The platform contract empowers project owners to launch their investment campaigns, invest in, and manage funds across multiple projects. Meanwhile, the faucet contract offers a seamless mechanism for users to periodically request tokens, thereby promoting the utilization of these digital assets within the platform's ecosystem.

[Link to pitch video]()

# Prerequisites
<h3>polkadotjs wallet & account</h3>

After you created your new account, you are ready to proceed to the next step with your polkadotjs account.

<h3>Aleph zero tokens</h3>

Since we are working with Aleph Zero tokens, it is essential to acquire free tokens through the [Aleph Zero faucet](https://faucet.test.azero.dev/) with your account before engaging in platform activities.

# Instructions for using the platform

<h2>Faucet</h2>

Once your polkadotjs account and Aleph zero testnet tokens are set up, on the faucet page (accessible through the sidebar), you can both **add new custom** tokens to the platform and request tokens from those that you already added.

* *Important Note*: The implementation in the Faucet smart contract is generic, thus it supports custom tokens. However, our current implementation only supports one token, namely the Platform token.

<h3>Request tokens</h3>

You can click on the `REQUEST TOKENS` button and polkadotjs dialog screen will pop up asking you the sign the transaction i.e. to accept the interaction with the faucet contract which will give you an amount of tokens, currently the fixed amount is: 5.

After clicking the `UPDATE BALANCE` button you will see that a change in your total *Tokens to invest* has increased its value with 5.

* *Note*: Clicking `UPDATE BALANCE` ensures that you are seeing an updated version of your balance.

<h3>Add token type</h3>
Adding new custom token requires you to provide a name for the token, its token address and its withdrawing amount.

> Note: 

<h2>Platform</h2>
When you navigate to the platform (again, from the sidebar) you are going to see the list of all the projects that are currently ongoing and their statistics.

* *Note*: the names of the platform's functionalities are slightly different for comprehensive purposes. E.g. in the smart contracts the `WITHDRAW` is actually `CASHOUT`. And `REVOKE` in the smart contracts is `WITHDRAW` in the user unterface.


<h3>Allowance of the platform</h3>

* ⚠️ **Very important note**: You **must** approve the platform to use X amount of your tokens. The purpose of this is because we are using custom tokens that play the role of [ERC20 standart](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/) that are using `approve` function under the hood.

<h3>Add project</h3>
Use must prove the name of the project, valid funding goal and deadline until the project must be successfully finished. When you click the `ADD PROJECT` button, again polkadotjs dialog windows will appear for you to sign the transaction. If the transaction is successful your crowdfunding project will appear on the list of all currently ongoing projects.

* *Note*: Right now we have 2 projects - Meme Coin and Blood Coin projects

After you approved some amount of tokens to be spent from the platform's behalf (as we've already mentioned above) you can proceed to the following functionalities of the platform:

<h3>Invest</h3>
Depositing funds can happen with the `INVEST` button. Accept the polkadotjs's request. If everthing is successful you will see the *Invested funds* field to be incremented with the amount invested.

* *Note*: Click the `UPDATE BALANCE` button in the sidebar to see the changes.

* *Note*: right now the `INVEST` function transfers only 1 token to the chosen project. However, the smart contracts implementation supports custom amount of tokens investment

<h3>Withdraw</h3>

As previously mentioned `WITHDRAW` is in the smart contracts implemented as the `revoke_funds` function. As the name suggests it's meant to withdraw some of the deposit of an investor if the project **is still ongoing**. The process is similiar as in the `INVEST` function. After you've clicked on the `WITHDRAW` button and the transaction passes successfully you will see that the *Invested Funds* label of the project that you've revoked from decreases by one.

* *Note*: Click the `UPDATE BALANCE` button in the sidebar to see the changes in your balance.

<h3>Refund</h3>

If particular project has finished and has failed, then every investor can refund their investments from the project. When the last investor refund its deposits then the project is deleted.

* *Note*: Failed project is such that its deadline has already expired and its invested funds haven't reached the funding goal before the deadline expiration.

<h3>Cashout</h3>

As previously mentioned `CASHOUT` is in the smart contracts implemented as the `withdraw` function. Only the owner of the project can successfully execute this function. If particular project's status is `Successful` then its owner can withdraw its investments of the project. Project can be `Successful` even if its deadline hasn't already expired.