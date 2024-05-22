import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);

