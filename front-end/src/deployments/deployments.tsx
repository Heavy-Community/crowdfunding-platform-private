import { SubstrateDeployment } from '@scio-labs/use-inkathon'

/**
* Add or change your custom contract ids here
* DOCS: https://github.com/scio-labs/inkathon#2-custom-contracts
*/
export enum ContractIds {
    Token = 'token',
    Faucet = 'faucet',
    Platform = 'platform'
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
    const deployments: SubstrateDeployment[] = []

    const networkId: string = 'contracts-rococo'

    for (const contractId of Object.values(ContractIds)) {
        const abi = await import(`../contracts-info/${contractId}.json`)
        const { address } = await import(`../contracts-info/${contractId}.ts`)

        deployments.push({ contractId, networkId, abi, address })
    }

    return deployments
}
