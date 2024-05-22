import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';

const StyledAppBar = styled(AppBar)({
    backgroundColor: '#1976d2',
});

const StyledLink = styled(Link)({
    textDecoration: 'none',
    color: 'inherit',
    margin: '0 10px',
});

const Navbar = ({ balance }) => {
    return (
        <StyledAppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Crowdfunding Platform
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <StyledLink to="/faucet">
                        <Button color="inherit">Faucet</Button>
                    </StyledLink>
                    <StyledLink to="/platform">
                        <Button color="inherit">Platform</Button>
                    </StyledLink>
                </Box>
                <Typography variant="body1" component="div">
                    Tokens to Invest: {balance}
                </Typography>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Navbar;

