import React from 'react'
import getWeb3 from './getWeb3'
import getContract from './getContract'
import { CONDITIONAL_REQUIRE } from './constants'

let genesisDefinition = null
try {
    genesisDefinition = require(`../../lib/contracts/EglGenesis.json${CONDITIONAL_REQUIRE}`)
} catch (err) {
    console.log('Genesis not deployed')
}

let contractDefinition = null
let tokenDefinition = null

try {
    contractDefinition = require(`../../lib/contracts/EglContract.json${CONDITIONAL_REQUIRE}`)
    tokenDefinition = require(`../../lib/contracts/EglToken.json${CONDITIONAL_REQUIRE}`)
} catch (err) {
    console.log('Voting not deployed')
}

interface Web3ContainerProps {
    render: Function
    renderLoading: Function
    renderFailure: Function
}

export default class Web3Container extends React.Component<Web3ContainerProps> {
    state = {
        web3: null,
        web3Reader: null,
        accounts: null,
        contract: null,
        token: null,
        votingContract: null,
        tokenContract: null,
        failure: false,
    }

    async componentDidMount() {
        try {
            const web3 = await getWeb3()
            // @ts-ignore
            const accounts = await web3.eth.getAccounts()
            if (genesisDefinition) {
                const contract = await getContract(web3, genesisDefinition)
                this.setState({
                    contract,
                })
            }

            if (contractDefinition && tokenDefinition) {
                const votingContract = await getContract(
                    web3,
                    contractDefinition
                )
                const tokenContract = await getContract(web3, tokenDefinition)
                this.setState({
                    votingContract,
                    tokenContract,
                })
            }

            this.setState({
                web3,
                accounts,
            })
        } catch (error) {
            console.log('error', error)
            this.setState({
                failure: true,
            })
        }
    }

    render() {
        const { web3, accounts, contract, votingContract, tokenContract } =
            this.state

        return this.state.failure
            ? this.props.renderFailure()
            : web3
            ? this.props.render({
                  web3,
                  accounts,
                  contract,
                  votingContract,
                  tokenContract,
              })
            : this.props.renderLoading()
    }
}
