import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Button, TextField, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';
import faucetAbi from '../contracts/faucetAbi.json';
import erc20Abi from '../contracts/erc20Abi.json';

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
    backgroundColor: '#121212', // Consistent dark background
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
    minHeight: '100vh', /* Ensures it covers the viewport height */
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

const Faucet = ({ balance, setBalance }) => {
    const [api, setApi] = useState(null);
    const [account, setAccount] = useState(null);
    const [tokenContractAddress, setTokenContractAddress] = useState('');
    const [withdrawingAmount, setWithdrawingAmount] = useState('');
    const [tokenName, setTokenName] = useState('');
    const [tokens, setTokens] = useState([
        { name: 'Default Token', address: 'DEFAULT_TOKEN_ADDRESS', amount: '1000' }
    ]);

    useEffect(() => {
        document.body.style = 'background: #121212;'; // Hacky solution for background color
        const init = async () => {
            const extensions = await web3Enable('my-dapp');
            if (extensions.length === 0) return;
            const allAccounts = await web3Accounts();
            setAccount(allAccounts[0]);
            const provider = new WsProvider('wss://rococo-rpc.polkadot.io');
            const api = await ApiPromise.create({ provider });
            setApi(api);
        };
        init();
    }, []);

    const handleAddTokenType = async () => {
        if (!api || !account || !tokenContractAddress || !withdrawingAmount || !tokenName) return;
        const injector = await web3FromAddress(account.address);
        const faucetContractAddress = 'FAUCET_CONTRACT_ADDRESS'; // Replace with actual faucet contract address
        const faucetContract = new api.Contract(api, faucetAbi, faucetContractAddress);

        await faucetContract.tx.addTokenType({ value: 0, gasLimit: -1 }, tokenContractAddress, withdrawingAmount)
            .signAndSend(account.address, { signer: injector.signer });

        setTokens([...tokens, { name: tokenName, address: tokenContractAddress, amount: withdrawingAmount }]);
    };

    const handleRequestTokens = async (tokenAddress) => {
        if (!api || !account || !tokenAddress) return;
        const injector = await web3FromAddress(account.address);
        const faucetContractAddress = 'FAUCET_CONTRACT_ADDRESS'; // Replace with actual faucet contract address
        const faucetContract = new api.Contract(api, faucetAbi, faucetContractAddress);

        await faucetContract.tx.requestTokens({ value: 0, gasLimit: -1 }, tokenAddress)
            .signAndSend(account.address, { signer: injector.signer });
        fetchBalance(tokenAddress);
    };

    const fetchBalance = async (tokenAddress) => {
        if (!api || !account || !tokenAddress) return;
        const contract = new api.Contract(api, erc20Abi, tokenAddress);

        const balance = await contract.query.balanceOf(account.address, { value: 0, gasLimit: -1 }, account.address);
        setBalance(balance.output.toString());
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

