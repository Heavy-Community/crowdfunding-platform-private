'use client';

import { FC, useState, useRef } from 'react';
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
import toast from 'react-hot-toast';

import { ContractsAddresses, PlatformAbi, TokenAbi } from '../deployments/deployments'
import { contractTxWithToast } from '../utils/toast-tx-wrapper'

import {
    contractQuery,
    decodeOutput,
    useInkathon,
    useContract
} from '@scio-labs/use-inkathon';

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

const ApprovalContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '5%',
    marginTop: '0%',
});

interface Project {
    name: string;
    projectId: number;
    fundingGoal: string;
    deadline: string;
    investedFunds: string;
}

const Platform: FC = () => {
    const [projectName, setProjectName] = useState<string>('');
    const [fundingGoal, setFundingGoal] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');

    // Approve button
    const [tokenAmount, setTokenAmount] = useState<string>('');

    const [projects, setProjects] = useState<Project[]>([
        { name: 'Sample project', projectId: 2, fundingGoal: '420', 'deadline': "June 8 2024", investedFunds: '1',  },
    ]);

    const { enqueueSnackbar } = useSnackbar();

    const projectCounter = useRef<number>(1);

    const { api, activeAccount } = useInkathon();
    const { contract: platformContract, address: platformContractAddress} = useContract(PlatformAbi, ContractsAddresses.Platform);

    const { contract: tokenContract, address: tokenAddress} = useContract(TokenAbi, ContractsAddresses.Token);

    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
    const [projectInfo, setProjectInfo] = useState<string>('0');

    const fetchProjectInfo = async (projectId: number) => {
        if (!platformContract || !api || !activeAccount) return;

        setFetchIsLoading(true);
        try {
            console.log("Fetching info for project id: ", projectId);
            const result = await contractQuery(api, activeAccount.address, platformContract, 'getProjectById', {} as any, [projectId])

            const { output, isError, decodedOutput } = decodeOutput(result, platformContract, 'getProjectById');
            if (isError) throw new Error(decodedOutput);
            console.log(output);
            setProjectInfo(output.investedFunds?.toString() || '0');

            // Update the list of project (the corresponding project.invested_funds)
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project.projectId === projectId
                        ? { ...project, investedFunds: output.investedFunds?.toString() || '0' }
                        : project
                )
            );

        } catch (e) {
            console.error(e);
            toast.error('Error while fetching project info. Try again…');
            setProjectInfo('0');
        } finally {
            setFetchIsLoading(false);
            console.log("Project info: ", projectInfo);
        }
    };

    const handleApproveSpendingTokens = async (tokenAmount: number) => {
        // make approve transaction to token contract in order
        // to approve platform spend money
        if (!api || !activeAccount || !tokenContract || !platformContractAddress) {
            toast.error('Wallet not connected or not existing Token/Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, tokenContract, 'approve', {}, [
                    platformContractAddress,
                    tokenAmount,
            ])
        } catch (e) {
            console.error(e)
            return;
        }
    };

    const handleAddProject = async () => {
        if (!projectName || !fundingGoal || !deadline) {
            enqueueSnackbar('All fields are required!', { variant: 'error' });
            return;
        }
        const fundingGoalNumber = parseFloat(fundingGoal);

        if (isNaN(fundingGoalNumber) || fundingGoalNumber <= 0) {
            enqueueSnackbar('Funding goal must be a positive number!', { variant: 'error' });
            return;
        }

        console.log ("active accout:" ,activeAccount);
        console.log (platformContract);

        // make transaction to smart contract
        if (!api || !activeAccount || !platformContract) {
            toast.error('Wallet not connected or not existing Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, platformContract, 'initializeProject', {}, [
                    fundingGoalNumber,
                    parseInt(deadline),
            ])
                // reset()
        } catch (e) {
            console.error(e)
            return;
        }

        projectCounter.current += 1;

        const newProject: Project = {
          name: projectName,
          projectId: projectCounter.current,
          fundingGoal,
          deadline,
          investedFunds: '0',
        };

        setProjects([...projects, newProject]);

        setProjectName('');
        setFundingGoal('');
        setDeadline('');
    };

    const handleInvestInProject = async (projectId: number) => {
        // make transaction to smart contract
        if (!api || !activeAccount || !platformContract) {
            toast.error('Wallet not connected or not existing Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, platformContract, 'investFunds', {}, [
                    100,
                    projectId,
            ])
                // reset()
        } catch (e) {
            console.error(e)
            enqueueSnackbar('Error during execution of invest funds function ', { variant: 'error' });
            return;
        } finally {
            fetchProjectInfo(projectId);
        }
    };

    const handleRevokeFundsFromProject = async (projectId: number) => {
        // make transaction to smart contract
        if (!api || !activeAccount || !platformContract) {
            toast.error('Wallet not connected or not existing Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, platformContract, 'revokeFunds', {}, [
                    projectId,
                    1,
            ])
                // reset()
        } catch (e) {
            console.error(e)
            enqueueSnackbar('Error during execution of withdraw funds function ', { variant: 'error' });
            return;
        } finally {
            fetchProjectInfo(projectId);
        }
    };

    const handleRefundFundsFromProject = async (projectId: number) => {
        // make transaction to smart contract
        if (!api || !activeAccount || !platformContract) {
            toast.error('Wallet not connected or not existing Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, platformContract, 'refundFunds', {}, [
                    projectId,
            ])
                // reset()
        } catch (e) {
            console.error(e)
            enqueueSnackbar('Error during execution of refund funds function ', { variant: 'error' });
            return;
        } finally {
            fetchProjectInfo(projectId);
        }
    };

    const handleCashoutFundsFromProject = async (projectId: number) => {
        // make transaction to smart contract
        if (!api || !activeAccount || !platformContract) {
            toast.error('Wallet not connected or not existing Platform contract. Try again…');
            return;
        }

        try {
            await contractTxWithToast(api, activeAccount.address, platformContract, 'withdrawFunds', {}, [
                    projectId,
            ])
                // reset()
        } catch (e) {
            console.error(e)
            enqueueSnackbar('Error during execution of cashout funds function ', { variant: 'error' });
            return;
        } finally {
            fetchProjectInfo(projectId);
        }
    };

    return (
            <MainContainer>

            <ApprovalContainer>
                <InputField
                    label="Token Amount"
                    variant="outlined"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
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
                <StyledButton variant="contained" onClick={() => handleApproveSpendingTokens(Number(tokenAmount))}>
                    Approve Platform to Spend Tokens
                </StyledButton>
            </ApprovalContainer>

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

            <StyledButton variant="contained" onClick={() => handleInvestInProject(project.projectId)}>
                Invest
            </StyledButton>

            <StyledButton variant="contained" onClick={() => handleRevokeFundsFromProject(project.projectId)}>
                Withdraw
            </StyledButton>

            <StyledButton variant="contained" onClick={() => handleRefundFundsFromProject(project.projectId)}>
                Refund
            </StyledButton>

            <StyledButton variant="contained" onClick={() => handleCashoutFundsFromProject(project.projectId)}>
                Cashout
            </StyledButton>
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
