import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';

const MainContainer = styled(Box)({
    paddingTop: '20px',
    color: '#C0C0C0',
});

const Platform = () => {
    return (
        <MainContainer>
            <Typography variant="h4">
                Platform
            </Typography>
            {/* Add your Platform page content here */}
        </MainContainer>
    );
};

export default Platform;

