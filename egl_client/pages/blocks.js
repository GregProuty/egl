import React from 'react'
import Web3Container from '../components/lib/Web3Container'
import moment from 'moment'
import FullWidthScrollPage from '../components/pageTemplates/FullWidthScrollPage'
import connectToWeb3 from '../components/lib/connectToWeb3'

const tableWidth1000 = {
    width: '100%',
}

const fontWhite = {
    color: 'white',
}

const thead = {
    backgroundColor: '#3d3d3d',
    fontWeight: 'bold',
    color: 'white',
}

const heading = {
    fontSize: '16pt',
    fontWeight: 'bold',
    fontVariant: 'small-caps',
    color: 'grey',
}

const contractAttributeValue = {
    fontFamily: 'Courier New',
    fontSize: '9pt',
}

class BlockStatus extends React.Component {
    state = {
        ethBalance: null,
        eglBalance: null,
        voterData: null,
    }

    formatBigNumberAttribute = (attribute) => {
        const { web3 } = this.props
        if (attribute === null || attribute === undefined) return attribute
        return parseFloat(web3.utils.fromWei(attribute)).toLocaleString(
            'en-US',
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 18,
            }
        )
    }

    getAllEventsForType = async (contract, eventName) => {        
        return await contract.getPastEvents(eventName, {
            fromBlock: 0,
            toBlock: 'latest',
        })
    }

    sweepButtonClick = async () => {
        const { eglContract,  accounts } = this.props
        console.log("Contact: ", eglContract);
        console.log("Wallet: ", this.props.accounts[0]);
        return await eglContract.methods
            .sweepPoolRewards()
            .send({ from: accounts[0] })
    }

    refreshContractData = async () => {
        const { genesisContract, eglContract, web3, tokenContract, accounts } = this.props

        const eventPoolRewardsSwept = await this.getAllEventsForType(eglContract, 'PoolRewardsSwept')
        const eventBlockRewardCalculated = await this.getAllEventsForType(eglContract, 'BlockRewardCalculated')

        const eglBalance = await tokenContract.methods.balanceOf(accounts[0]).call();

        this.setState({
            eventPoolRewardsSwept: eventPoolRewardsSwept,
            eventBlockRewardCalculated: eventBlockRewardCalculated,
            eglBalance,
        })
    }

    componentDidMount() {
        this.interval = setInterval(() => this.refreshContractData(), 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    render() {
        const {
            eventPoolRewardsSwept = [],
            eventBlockRewardCalculated = [],
            eglBalance = 0,
        } = this.state

        return (
            <FullWidthScrollPage
                connectWeb3={() => connectToWeb3(window)}
                walletAddress={this.props.accounts[0]}
                eglBalance={eglBalance}
                style={fontWhite}
            >
                <div>
                    <br />

                    <div style={heading}>Pool Rewards Swept:</div>
                    <div>
                        <button onClick={this.sweepButtonClick} className={`shadow-lg bg-salmon text-white font-bold text-center rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-salmon-dark`}>        
                            Sweep Rewards    
                        </button>                        

                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Block Number</td>
                                    <td>Caller</td>
                                    <td>CoinBase Address</td>
                                    <td>Block Gas Limit</td>
                                    <td>Calculated Reward Amount</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventPoolRewardsSwept.map((event) => {
                                    return (
                                        <tr>
                                            <td>{event.returnValues.blockNumber}</td>
                                            <td>{event.returnValues.caller}</td>
                                            <td>{event.returnValues.coinbaseAddress}</td>
                                            <td>{event.returnValues.blockGasLimit}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.blockReward
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <div style={heading}>Block Reward Calculated:</div>
                    <div>
                        <b></b>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Epoch</td>
                                    <td>Block Number</td>
                                    <td>Remaining Pool Reward</td>
                                    <td>Block Gas Limit</td>
                                    <td>Desired EGL</td>
                                    <td>Tally Votes Gas Limit</td>
                                    <td>Proximity Percentage</td>
                                    <td>Reward Percentage</td>
                                    <td>Block Reward</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventBlockRewardCalculated.map((event) => {
                                    return (
                                        <tr>
                                            <td>
                                                {moment
                                                    .unix(
                                                        event.returnValues.date
                                                    )
                                                    .local()
                                                    .toDate()
                                                    .toLocaleDateString()}
                                            </td>
                                            <td>
                                                {moment
                                                    .unix(
                                                        event.returnValues.date
                                                    )
                                                    .local()
                                                    .toDate()
                                                    .toLocaleTimeString()}
                                            </td>
                                            <td>{event.returnValues.currentEpoch}</td>
                                            <td>{event.returnValues.blockNumber}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.remainingPoolReward
                                                )}
                                            </td>
                                            <td>{event.returnValues.blockGasLimit}</td>
                                            <td>{event.returnValues.desiredEgl}</td>
                                            <td>{event.returnValues.tallyVotesGasLimit}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.proximityRewardPercent
                                                )}%
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.totalRewardPercent
                                                )}%
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.blockReward
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />
                </div>
            </FullWidthScrollPage>
        )
    }
}

export default () => (
    <Web3Container
        renderLoading={() => (
            <FullWidthScrollPage
                connectWeb3={null}
                walletAddress={null}
                token={null}
            >
                <div
                    style={{ animation: `fadeIn 1s` }}
                    className="opacity-25 fixed inset-0 z-30 bg-black"
                />
            </FullWidthScrollPage>
        )}
        render={({ 
            web3,
            accounts,
            contract,
            votingContract,
            tokenContract,
            }) => (
            <BlockStatus
                accounts={accounts}
                web3={web3}
                genesisContract={contract}
                eglContract={votingContract}
                tokenContract={tokenContract}
            />
        )}
    />
)
