'use client';

import { FC, useState, useEffect } from 'react';
import { ApiPromise } from '@polkadot/api';
import { web3Accounts, web3FromAddress } from '@polkadot/extension-dapp';

// TODO: Fix if possible
// import { ContractOptions } from '@polkadot/api-contract/types'

import { Button, TextField, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';

import { ContractIds } from '../deployments/deployments'
import toast from 'react-hot-toast';

import {
    contractQuery,
    decodeOutput,
    useInkathon,
    useRegisteredContract,
} from '@scio-labs/use-inkathon';

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

interface Token {
    name: string;
    address: string;
    amount: string;
}

const Faucet: FC = () => {
    const { api, activeAccount, activeSigner } = useInkathon();
    const { contract: tokenContract, address: tokenContractAddress } = useRegisteredContract(ContractIds.Token)

    const [balance, setBalance] = useState<string>('');
    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
    const [tokenName, setTokenName] = useState<string>('');
    const [newTokenContractAddress, setNewTokenContractAddress] = useState<string>('');
    const [withdrawingAmount, setWithdrawingAmount] = useState<string>('');

    const [tokens, setTokens] = useState<Token[]>([
        { name: 'ERC20 Token (Currently implemented)', address: '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu', amount: '420' },
    ]);

    const fetchBalance = async () => {
        if (!tokenContract || !api || !activeAccount) return;

        setFetchIsLoading(true);
        try {
            const result = await contractQuery(api, activeAccount.address, tokenContract, 'balanceOf', {} as any, [activeAccount.address])

            const { output, isError, decodedOutput } = decodeOutput(result, tokenContract, 'balanceOf');
            if (isError) throw new Error(decodedOutput);
            setBalance(output?.toString() || '');
        } catch (e) {
            console.error(e);
            toast.error('Error while fetching balance. Try again…');
            setBalance('');
        } finally {
            setFetchIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [tokenContract]);

    const handleAddTokenType = async () => {
        if (!api || !activeAccount || !newTokenContractAddress || !withdrawingAmount || !tokenName) return;
        const injector = await web3FromAddress(activeAccount.address);
        const faucetContractAddress = '5E6sr8VxAy5y9Wawwi8VtUpZzU9mj7K2aqZzG4Rq6DCwZEJW';

        await api.tx.contracts.call(
            faucetContractAddress,
            0,
            -1,
            api.tx.contracts.encodeContractCall('addTokenType', newTokenContractAddress, withdrawingAmount)
        ).signAndSend(activeAccount.address, { signer: injector.signer });

        setTokens([...tokens, { name: tokenName, address: newTokenContractAddress, amount: withdrawingAmount }]);
    };

    const handleRequestTokens = async (tokenAddress: string) => {
        if (!api || !activeAccount || !tokenAddress) return;
        const injector = await web3FromAddress(activeAccount.address);
        const faucetContractAddress = '5E6sr8VxAy5y9Wawwi8VtUpZzU9mj7K2aqZzG4Rq6DCwZEJW';

        await api.tx.contracts.call(
            faucetContractAddress,
            0,
            -1,
            api.tx.contracts.encodeContractCall('requestTokens', tokenAddress)
        ).signAndSend(activeAccount.address, { signer: injector.signer });

        fetchBalance();
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

