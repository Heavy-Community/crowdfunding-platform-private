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

> **Important Note**: The implementation in the Faucet smart contract is generic, thus it supports custom tokens. However, our current implementation only supports one token, namely the Platform token.

<h3>Request tokens</h3>

You can click on the `REQUEST TOKENS` button and polkadotjs dialog screen will pop up asking you the sign the transaction i.e. to accept the interaction with the faucet contract which will give you an amount of tokens, currently the fixed amount is: 5.

After clicking the `UPDATE BALANCE` button you will see that a change in your total *Tokens to invest* has increased its value with 5.

> Note: Clicking `UPDATE BALANCE` ensures that you are seeing an updated version of your balance.

<h3>Add token type</h3>
Adding new custom token requires you to provide a name for the token, its token address and its withdrawing amount.

> Note: 

<h2>Platform</h2>
When you navigate to the platform (again, from the sidebar) you are going to see the list of all the projects that are currently ongoing and their statistics.

> Note the names of the platform's functionalities are slightly different for comprehensive purposes. E.g. in the smart contracts the `WITHDRAW` is actually `CASHOUT`. And `REVOKE` in the smart contracts is `WITHDRAW` in the user unterface.

<h3>Add project</h3>

<h3>Invest</h3>

<h3>Withdraw</h3>

<h3>Refund</h3>

<h3>Revoke</h3>

- we have only two projects 
- on restart they disapear
- in order to use it you have to firstly allow 