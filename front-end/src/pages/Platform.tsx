'use client';

import { FC, useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { styled } from '@mui/system';

import { ContractIds } from '../deployments/deployments'
import toast from 'react-hot-toast';

import {
    contractQuery,
    decodeOutput,
    useInkathon,
    useRegisteredContract,
} from '@scio-labs/use-inkathon';

type Balance = bigint;
type Timestamp = bigint; // or Date
type AccountId = string;
type u128 = number;

enum ProjectStatus {
    Ongoing,
    Succeded,
    Failed,
}

interface Project {
    investedFunds: Balance;
    fundingGoal: Balance;
    deadline: Timestamp; // Should we use Date?
    owner: AccountId;
    status: ProjectStatus;
}

interface Platform {
    projectsCounter: u128;
    ongoingProjects: Map<u128, Project>; // CHANGE TO BALANCE
    investors: Map<[AccountId, u128], u128>; // Nested map to represent (AccountId, u128) -> Balance
    tokenAddress: AccountId;
}

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

const TokenList = styled(List)({
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    marginTop: '20px',
    color: '#FFFFFF',
});

const TokenListItem = styled(ListItem)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .MuiListItemText-primary': {
        color: '#FFFFFF',
        fontSize: '1.2rem',
    },
    '& .MuiListItemText-secondary': {
        color: '#FFFFFF',
        fontSize: '1rem',
    },
});

const Platform = () => {
    const { api, activeAccount, activeSigner } = useInkathon();
    const { contract: tokenContract, address: tokenContractAddress } = useRegisteredContract(ContractIds.Token)

    const [investedFunds, setinvestedFunds] = useState<number>();
    const [fundingGoal, setFundingGoal] = useState<number>();
    const [deadline, setDeadline] = useState<number>();
    const [owner, setOwner] = useState<number>();
    const [status, setStatus] = useState<number>();

    const [projects, setProjects] = useState<Project[]>([
        // {
        //     investedFunds: BigInt(2),
        //     fundingGoal: BigInt(1),
        //     deadline: BigInt(2),
        //     owner: '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu',
        //     status: ProjectStatus.Ongoing
        // }
    ]);

    const [platform, setPlatform] = useState<Platform[]>([
        {            
            projectsCounter: 1,
            ongoingProjects: new Map<1, Project>,
            investors: new Map<['5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu', 1], 1>(),
            tokenAddress: '000000000000000000000000000000000000000000000000'
        }
    ]);

    const handleAddProject = async () => {
        console.log('asd')
        // if (!api || !activeAccount || !newTokenContractAddress || !withdrawingAmount || !tokenName) return;
        // const injector = await web3FromAddress(activeAccount.address);
        // const faucetContractAddress = '5E6sr8VxAy5y9Wawwi8VtUpZzU9mj7K2aqZzG4Rq6DCwZEJW';

        // await api.tx.contracts.call(
        //     faucetContractAddress,
        //     0,
        //     -1,
        //     api.tx.contracts.encodeContractCall('addTokenType', newTokenContractAddress, withdrawingAmount)
        // ).signAndSend(activeAccount.address, { signer: injector.signer });

        setProjects([
            ...projects,
            {
            investedFunds: BigInt(1),
            fundingGoal: fundingGoal as any,
            deadline: deadline as any,
            owner: '5Hgiu38EojYy9DLpJJcNXer18ubxGh8bZLZv86SBf2kEmXeu',
            status: ProjectStatus.Ongoing
            }
        ]);
    };
    

    return (
        <MainContainer>
        <Typography variant="h4" component="h1" gutterBottom>
        Platform
        </Typography>
        <InputContainer>
        <InputField
        label="Funding Goal"
        variant="outlined"
        type="number"
        value={fundingGoal}
        onChange={(e) => setFundingGoal(parseInt(e.target.value))}
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
        type="number"
        value={deadline}
        onChange={(e) => setDeadline(parseInt(e.target.value))}
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
        <TokenList>
            <List sx={{ backgroundColor: '#202020', color: '#f0f0f0' }} className="MuiList-root">
            {projects.map((project, index) => (
            <TokenListItem key={index}>
                <>deadline: <ListItem key={index}>{project.deadline as any}</ListItem>
                fundingGoal: <ListItem key={index}>{project.fundingGoal as any}</ListItem>
                investedFunds: <ListItem key={index}>{project.investedFunds as any}</ListItem>
                owner: <ListItem key={index}>{project.owner as any}</ListItem>
                status: <ListItem key={index}>{project.status as any}</ListItem></>
            </TokenListItem>
            ))}
            </List>
        {projects.map((project, index) => (
            <TokenListItem key={index}>
            <ListItemText
            primary={project.fundingGoal.toString() as React.ReactNode}
            secondary={`Deadline: ${project.deadline.toString() as React.ReactNode}`}
            children={`asd: ${project.deadline.toString() as React.ReactNode}`}
            />
            {/* <StyledButton variant="contained" onClick={() => handleRequestTokens(token.address)}>
            Request Tokens
            </StyledButton> */}
            </TokenListItem>
        ))}
        </TokenList>
        </MainContainer>
    );
};

export default Platform;

