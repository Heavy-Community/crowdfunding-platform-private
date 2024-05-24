import React from 'react';
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography, Divider, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { styled } from '@mui/system';
import PolkadotLogo from './polkadot-logo.png'; // Ensure you have the Polkadot logo in the appropriate directory

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

const StyledListItem = styled(ListItem)(({ isActive }) => ({
    backgroundColor: isActive ? '#757575' : 'inherit', // Brighter active button background color
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

const Sidebar = ({ balance }) => {
    const location = useLocation();
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
                    <StyledListItem button isActive={location.pathname === '/faucet'}>
                        <ListItemText primary="Faucet" />
                    </StyledListItem>
                </Link>
                <Link to="/platform" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <StyledListItem button isActive={location.pathname === '/platform'}>
                        <ListItemText primary="Platform" />
                    </StyledListItem>
                </Link>
            </List>
            <Divider />
            <Toolbar>
                <Typography variant="body1">
                    Tokens to Invest: {balance}
                </Typography>
            </Toolbar>
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

