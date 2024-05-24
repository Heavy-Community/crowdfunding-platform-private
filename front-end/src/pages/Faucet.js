import React, { useState, useEffect, useMemo } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Button, TextField, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';

import { ContractIds } from '../deployments/deployments'
import toast from 'react-hot-toast'

import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'

const InputContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
});

const InputField = styled(TextField)({
    marginRight: '10px',
    minWidth: '250px',
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#C0C0C0',
        },
        '&:hover fieldset': {
            borderColor: '#FFFFFF',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#FFFFFF',
        },
    },
    '& .MuiInputLabel-outlined': {
        color: '#C0C0C0',
    },
    '& .MuiInputLabel-outlined.Mui-focused': {
        color: '#FFFFFF',
    },
});

const StyledButton = styled(Button)({
    margin: '10px',
    height: '56px',
    backgroundColor: '#212121',
    color: '#FFFFFF',
    '&:hover': {
        backgroundColor: '#333333',
    },
});

const MainContainer = styled(Box)({
    paddingTop: '20px',
    color: '#C0C0C0',
    backgroundColor: '#121212',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh',
});

const TokenList = styled(List)({
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    marginTop: '20px',
    color: '#FFFFFF',
});

const TokenListItem = styled(ListItem)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .MuiListItemText-primary': {
        color: '#FFFFFF',
        fontSize: '1.2rem',
    },
    '& .MuiListItemText-secondary': {
        color: '#FFFFFF',
        fontSize: '1rem',
    },
});

const Faucet = () => {
    // const [api, setApi] = useState(null);
    const { api, activeAccount, activeSigner } = useInkathon();

    // Our ERC-20 token tokenContract and address
    const { tokenContract, tokenContractAddress } = useRegisteredContract(ContractIds.ERC20);

    // Current balance of the user
    const [balance, setBalance] = useState('');

    // Flag whether balance is loading (because of the async function)
    const [fetchIsLoading, setFetchIsLoading] = useState('');

    // Adding tokens' names to the list functionality
    const [tokenName, setTokenName] = useState('');

    // Adding tokens' names to the list functionality
    const [newTokenContractAddress, setNewTokenContractAddress] = useState('');

    // Adding tokens' withdraw amount to the list functionality
    const [withdrawingAmount, setWithdrawingAmount] = useState('');

    // Tokens list
    const [tokens, setTokens] = useState([
        { name: 'ERC20 Token (Currently implemented)', address: '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu', amount: '420' },
    ]);

    // Fetch Greeting
  const fetchBalance = async () => {
    if (!tokenContract || !api || !activeAccount) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', tokenContract, 'balanceOf', activeAccount)
      const { output, isError, decodedOutput } = decodeOutput(result, tokenContract, 'balanceOf')
      if (isError) throw new Error(decodedOutput)
      setBalance(output)

      // NOTE: Currently disabled until `typechain-polkadot` dependencies are upted to support ink! v5
      // Alternatively: Fetch it with typed tokenContract instance
      // const typedResult = await typedContract.query.greet()
      // console.log('Result from typed tokenContract: ', typedResult.value)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
      setBalance(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }
  useEffect(() => {
    fetchBalance()
  }, [tokenContract])

    useEffect(() => {
        fetchBalance();
        if (balance) {
            setBalance(balance.toString());
        }
    }, [balance]);

    const handleAddTokenType = async () => {
        if (!api || !activeAccount || !faucetContractAddress || !withdrawingAmount || !tokenName) return;
        const injector = await web3FromAddress(activeAccount.address);
        const faucetContractAddress = '5E6sr8VxAy5y9Wawwi8VtUpZzU9mj7K2aqZzG4Rq6DCwZEJW';
        // Rework to use inkathon
        // const faucetContract = new ContractPromise(api, faucetAbi, faucetContractAddress);

        await faucetContract.tx.addTokenType({ value: 0, gasLimit: -1 }, newTokenContractAddress, withdrawingAmount)
            .signAndSend(activeAccount.address, { signer: injector.signer });

        setTokens([...tokens, { name: tokenName, address: newTokenContractAddress, amount: withdrawingAmount }]);
    };

    const handleRequestTokens = async (tokenAddress) => {
        if (!api || !activeAccount || !tokenAddress) return;
        const injector = await web3FromAddress(activeAccount.address);
        const faucetContractAddress = '5E6sr8VxAy5y9Wawwi8VtUpZzU9mj7K2aqZzG4Rq6DCwZEJW';
        // const faucetContract = new ContractPromise(api, faucetAbi, faucetContractAddress);

        await faucetContract.tx.requestTokens({ value: 0, gasLimit: 0 }, tokenAddress)
            .signAndSend(activeAccount.address, { signer: injector.signer });
    };

    return (
        <MainContainer>
            <Typography variant="h4" component="h1" gutterBottom>
                Faucet
            </Typography>
            <InputContainer>
                <InputField
                    label="Token Name"
                    variant="outlined"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    InputProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                    InputLabelProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                />
                <InputField
                    label="Token Contract Address"
                    variant="outlined"
                    value={newTokenContractAddress}
                    onChange={(e) => setNewTokenContractAddress(e.target.value)}
                    InputProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                    InputLabelProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                />
                <InputField
                    label="Withdrawing Amount"
                    variant="outlined"
                    value={withdrawingAmount}
                    onChange={(e) => setWithdrawingAmount(e.target.value)}
                    InputProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                    InputLabelProps={{
                        style: {
                            color: '#C0C0C0',
                        },
                    }}
                />
                <StyledButton variant="contained" onClick={handleAddTokenType}>
                    Add Token Type
                </StyledButton>
            </InputContainer>
            <TokenList>
                {tokens.map((token, index) => (
                    <TokenListItem key={index}>
                        <ListItemText
                            primary={token.name}
                            secondary={`Amount: ${token.amount}`}
                        />
                        <StyledButton variant="contained" onClick={() => handleRequestTokens(token.address)}>
                            Request Tokens
                        </StyledButton>
                    </TokenListItem>
                ))}
            </TokenList>
        </MainContainer>
    );
};

export default Faucet;

