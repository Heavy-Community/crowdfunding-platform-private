'use client';

import { FC, useState } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/system';

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

const ProjectList = styled(List)({
  width: '100%',
  maxWidth: 600,
  backgroundColor: '#1e1e1e',
  borderRadius: '8px',
  marginTop: '20px',
  color: '#FFFFFF',
});

const ProjectListItem = styled(ListItem)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  '& .MuiListItemText-primary': {
    color: '#FFFFFF',
    fontSize: '1.2rem',
  },
  '& .MuiListItemText-secondary': {
    color: '#FFFFFF',
    fontSize: '1rem',
  },
});

const ButtonContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
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

  const handleAddProject = () => {
    if (!projectName || !fundingGoal || !deadline) return;
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
      <ProjectList>
        {projects.map((project, index) => (
          <ProjectListItem key={index}>
            <ListItemText
              primary={project.name}
              secondary={`Invested Funds: ${project.investedFunds} | Funding Goal: ${project.fundingGoal} | Deadline: ${project.deadline}`}
            />
            <ButtonContainer>
              <StyledButton variant="contained">Invest</StyledButton>
              <StyledButton variant="contained">Revoke</StyledButton>
              <StyledButton variant="contained">Refund</StyledButton>
              <StyledButton variant="contained">Withdraw</StyledButton>
            </ButtonContainer>
          </ProjectListItem>
        ))}
      </ProjectList>
    </MainContainer>
  );
};

export default Platform;

