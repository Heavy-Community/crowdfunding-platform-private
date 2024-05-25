'use client';
import { FC, useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast';
import * as z from 'zod'

import { Button, TextField, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';

import { contractTxWithToast } from '../utils/toast-tx-wrapper'

import { ContractsAddresses, FaucetAbi } from '../deployments/deployments'

import {
    contractQuery,
    decodeOutput,
    useInkathon,
    useContract
} from '@scio-labs/use-inkathon';

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

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
    console.log("profile: ", activeAccount);

    const { contract: faucetContract, address: faucetContractAddress } = useContract(FaucetAbi, ContractsAddresses.Faucet);

    const [balance, setBalance] = useState<string>('');
    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);

    const [tokenName, setTokenName] = useState<string>('');
    const [tokenContractAddress, setTokenContractAddress] = useState<string>('');
    const [withdrawingAmount, setWithdrawingAmount] = useState<string>('');

    const [tokens, setTokens] = useState<Token[]>([
        { name: 'ERC20 Token (Currently supported)', address: ContractsAddresses.Token, amount: '420' },
    ]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const { register, reset, handleSubmit } = form;

    const handleAddTokenType = async () => {
        if (!api || !activeAccount || !faucetContract) {
            toast.error('Wallet not connected or not existing Faucet contract. Try again…');
            return;
        }

        if (!tokenContractAddress || !withdrawingAmount) {
            toast.error('Token contract address or withdrawing amount not provided!');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, faucetContract, 'addTokenType', {}, [
                    tokenContractAddress,
                    parseFloat(withdrawingAmount),
            ])
                reset()
        } catch (e) {
            console.error(e)
        } finally {
            setTokens([...tokens, { name: tokenName, address: tokenContractAddress, amount: withdrawingAmount }]);
        }

    };

    const handleRequestTokens = async (tokenAddress: string) => {
        if (!api || !activeAccount || !faucetContract) {
            toast.error('Wallet not connected or not existing Faucet contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, faucetContract, 'requestTokens', {}, [
                    tokenAddress,
            ])
                reset()
        } catch (e) {
            console.error(e)
        } finally {
        }
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
        value={tokenContractAddress}
        onChange={(e) => setTokenContractAddress(e.target.value)}
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

