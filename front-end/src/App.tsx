'use client'

import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { UseInkathonProvider, SubstrateChain } from '@scio-labs/use-inkathon';
import Sidebar from './components/Sidebar';
import Faucet from './pages/Faucet';
import Platform from './pages/Platform';

const App: React.FC = () => {
    const [balance, setBalance] = useState<string | null>(null);

    // Set the Background to black
    useEffect(() => {
            document.body.style.backgroundColor = '#121212'; // A little hacky but gets the job done
    }, []);

    return (
        <UseInkathonProvider
            appName="Crowdfunding Platform"
            connectOnInit={true}
            defaultChain="alephzero-testnet"
        >
            <Router>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Sidebar />
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Toolbar />
                        <Routes>
                            <Route path="/faucet" element={<Faucet />} />
                            <Route path="/platform" element={<Platform />} />
                            <Route path="/" element={<Faucet />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </UseInkathonProvider>
    );
}

export default App;
