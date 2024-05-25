'use client';

import { FC, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import { SnackbarProvider, useSnackbar } from 'notistack';

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
  backgroundColor: '#212121', // Restoring the previous color
  color: '#FFFFFF',
  borderRadius: '8px', // Slightly rounded corners
  transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.3s',
  '&:hover': {
    backgroundColor: '#333333',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    transform: 'scale(1.05)', // Slight scaling effect on hover
  },
  '&:active': {
    transform: 'scale(0.95)', // Slight scaling effect on click
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

const ProjectCard = styled(Card)({
  width: '100%',
  maxWidth: 600,
  backgroundColor: '#2b2b2b',
  borderRadius: '8px',
  marginBottom: '20px',
  color: '#FFFFFF',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const ProjectCardContent = styled(CardContent)({
  '& .MuiTypography-root': {
    color: '#E0E0E0',
  },
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
});

interface Project {
  name: string;
  fundingGoal: string;
  deadline: string;
  investedFunds: string;
}

const Platform: FC = () => {
  const [projectName, setProjectName] = useState<string>('');
  const [fundingGoal, setFundingGoal] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleAddProject = () => {
    if (!projectName || !fundingGoal || !deadline) {
      enqueueSnackbar('All fields are required!', { variant: 'error' });
      return;
    }
    const fundingGoalNumber = parseFloat(fundingGoal);
    if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
      enqueueSnackbar('Funding goal must be a positive number!', { variant: 'error' });
      return;
    }
    const newProject: Project = {
      name: projectName,
      fundingGoal,
      deadline,
      investedFunds: '0',
    };
    setProjects([...projects, newProject]);
    setProjectName('');
    setFundingGoal('');
    setDeadline('');
  };

  return (
    <MainContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        Platform
      </Typography>
      <InputContainer>
        <InputField
          label="Project Name"
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
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
          label="Funding Goal"
          variant="outlined"
          value={fundingGoal}
          onChange={(e) => setFundingGoal(e.target.value)}
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
          label="Deadline"
          variant="outlined"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
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
        <StyledButton variant="contained" onClick={handleAddProject}>
          Add Project
        </StyledButton>
      </InputContainer>
      <Grid container spacing={2} justifyContent="center">
        {projects.map((project, index) => (
          <Grid item key={index} xs={12} md={6}>
            <ProjectCard>
              <ProjectCardContent>
                <Typography variant="h5" component="div">
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Invested Funds: {project.investedFunds}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Funding Goal: {project.fundingGoal}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Deadline: {project.deadline}
                </Typography>
              </ProjectCardContent>
              <CardActions>
                <ButtonContainer>
                  <StyledButton variant="contained">Invest</StyledButton>
                  <StyledButton variant="contained">Revoke</StyledButton>
                  <StyledButton variant="contained">Refund</StyledButton>
                  <StyledButton variant="contained">Withdraw</StyledButton>
                </ButtonContainer>
              </CardActions>
            </ProjectCard>
          </Grid>
        ))}
      </Grid>
    </MainContainer>
  );
};

const App: FC = () => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
  >
    <Platform />
  </SnackbarProvider>
);

export default App;
