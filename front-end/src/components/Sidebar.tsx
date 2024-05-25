import { FC, useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography, Divider, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import PolkadotLogo from './polkadot-logo.png'; // Ensure you have the Polkadot logo in the appropriate directory
import toast from 'react-hot-toast';
import {
    ContractsAddresses,
    TokenAbi,
} from '../deployments/deployments'

import {
    contractQuery,
    decodeOutput,
    useInkathon,
    useContract
} from '@scio-labs/use-inkathon';

const drawerWidth = 260;

const StyledDrawer = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#2C2C2C', // Slightly lighter color for sidebar
        color: '#C0C0C0',
    },
});

interface StyledListItemProps {
    isPressed: boolean;
}

const StyledListItem = styled(ListItem)<StyledListItemProps>(({ isPressed }) => ({
    backgroundColor: isPressed ? '#757575' : 'inherit', // Brighter active button background color
    '&:hover': {
        backgroundColor: '#212121', // Darker hover background color
    },
    margin: '0 10px',
}));

const Footer = styled(Box)({
    position: 'absolute',
    bottom: '10px',
    width: '100%',
    textAlign: 'center',
    color: '#C0C0C0',
});

const LogoContainer = styled(Box)({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0',
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


const Sidebar: FC = () => {

    const location = useLocation();
    const { api, activeAccount } = useInkathon();
    const { contract: tokenContract, address: tokenContractAddress} = useContract(TokenAbi, ContractsAddresses.Token);

    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>('0');

    const fetchBalance = async () => {
        if (!tokenContract || !api || !activeAccount) return;

        setFetchIsLoading(true);
        try {
            const result = await contractQuery(api, activeAccount.address, tokenContract, 'balanceOf', {} as any, [activeAccount.address])

            const { output, isError, decodedOutput } = decodeOutput(result, tokenContract, 'balanceOf');
            if (isError) throw new Error(decodedOutput);
            setBalance(output?.toString() || '0');
        } catch (e) {
            console.error(e);
            toast.error('Error while fetching balance. Try again…');
            setBalance('0');
        } finally {
            setFetchIsLoading(false);
            console.log("BALANCE: ", balance);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [tokenContract, api, activeAccount]);

    return (
        <StyledDrawer variant="permanent">
            <Toolbar>
                <Typography variant="h6" noWrap>
                    Crowdfunding 
                </Typography>
                <Typography variant="h6" noWrap>
                    Platform
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                <Link to="/faucet" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <StyledListItem isPressed={location.pathname === '/faucet'}>
                        <ListItemText primary="Faucet" />
                    </StyledListItem>
                </Link>
                <Link to="/platform" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <StyledListItem isPressed={location.pathname === '/platform'}>
                        <ListItemText primary="Platform" />
                    </StyledListItem>
                </Link>
            </List>
            <Divider />
            <Toolbar>
                <Typography variant="body1">
                    Tokens to Invest: {balance || '0'}
                </Typography>
            </Toolbar>
            <StyledButton variant="contained" onClick={fetchBalance}>
                Update Balance
            </StyledButton>
            <Footer>
                <LogoContainer>
                    <img src={PolkadotLogo} alt="Polkadot Logo" style={{ width: '80%' }} />
                </LogoContainer>
                <Typography variant="body2">Developed by:</Typography>
                <Typography variant="body2">Emilski and Nikolayski</Typography>
            </Footer>
        </StyledDrawer>
    );
};

export default Sidebar;

