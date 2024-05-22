import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Faucet from './pages/Faucet';
import Platform from './pages/Platform';

function App() {
    const [balance, setBalance] = useState(null);

    document.body.style = 'background: #121212;'; // A little hacky but gets the job done

    return (
        <Router>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar balance={balance} />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Routes>
                        <Route path="/faucet" element={<Faucet balance={balance} setBalance={setBalance} />} />
                        <Route path="/platform" element={<Platform />} />
                        <Route path="/" element={<Faucet balance={balance} setBalance={setBalance} />} />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;

