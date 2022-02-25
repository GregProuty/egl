import React from 'react'
import Web3Container from '../components/lib/Web3Container'
import moment from 'moment'
import BN from 'bn.js'
import FullWidthScrollPage from '../components/pageTemplates/FullWidthScrollPage'
import connectToWeb3 from '../components/lib/connectToWeb3'

const tableWidth1000 = {
    width: '100%',
}

const tableWidth50 = {
    width: '50%',
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

class EglContractStatus extends React.Component {
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

        const eventGenesisContribution = await this.getAllEventsForType(genesisContract, "ContributionReceived")
        const eventGenesisInit = await this.getAllEventsForType(genesisContract, "Initialized")
        const eventGenesisEnded = await this.getAllEventsForType(genesisContract, "GenesisEnded")

        const genesisCanContribute = await genesisContract.methods.canContribute().call()        
        
        const eventInitialized = await this.getAllEventsForType(eglContract, 'Initialized')
        const eventVote = await this.getAllEventsForType(eglContract, 'Vote')
        const eventWithdraw = await this.getAllEventsForType(eglContract, 'Withdraw')
        const eventVotesTallied = await this.getAllEventsForType(eglContract, 'VotesTallied')
        const eventCreatorRewardsClaimed = await this.getAllEventsForType(eglContract, 'CreatorRewardsClaimed')        
        const eventVoteThresholdMet = await this.getAllEventsForType(eglContract, 'VoteThresholdMet')
        const eventVoteThresholdFailed = await this.getAllEventsForType(eglContract, 'VoteThresholdFailed')
        const eventSeedAccountClaimed = await this.getAllEventsForType(eglContract, 'SeedAccountClaimed')
        const eventVoterRewardCalculated = await this.getAllEventsForType(eglContract, 'VoterRewardCalculated')
        const eventSupporterTokensClaimed = await this.getAllEventsForType(eglContract, 'SupporterTokensClaimed')
        const eventPoolTokensWithdrawn = await this.getAllEventsForType(eglContract, 'PoolTokensWithdrawn')
        const eventSerializedEglCalculated = await this.getAllEventsForType(eglContract, 'SerializedEglCalculated')
        const eventSeedAccountAdded = await this.getAllEventsForType(eglContract, 'SeedAccountAdded')

        const eglContractTokenBalance = await tokenContract.methods
            .balanceOf(eglContract._address)
            .call()

        const currentEpoch = await eglContract.methods.currentEpoch().call()
        const tokensInCirculation = await eglContract.methods
            .tokensInCirculation()
            .call()
        const currentEpochStartDate = moment.unix(
            await eglContract.methods.currentEpochStartDate().call()
        )
        const firstEpochStartDate = moment.unix(
            eventInitialized[0].returnValues.firstEpochStartDate
        )
        const desiredEgl = await eglContract.methods.desiredEgl().call()

        const currentVoteWeightSum = await eglContract.methods
            .voteWeightsSum(0)
            .call()
        const currentVotesTotal = await eglContract.methods.votesTotal(0).call()

        const epochEndDate = moment.unix(
            parseInt(await eglContract.methods.currentEpochStartDate().call()) + 
            parseInt(eventInitialized[0].returnValues.epochLength)
        )
        const endEpochCountdown = moment.duration(epochEndDate - moment())

        const timeToNextEpoch =
            endEpochCountdown.days() +
            ' days ' +
            endEpochCountdown.hours() +
            ' hours ' +
            endEpochCountdown.minutes() +
            ' minutes ' +
            endEpochCountdown.seconds() +
            ' seconds'

        const voterRewardsSums = []
        for (let i = 0; i <= Math.min(currentEpoch, 51); i++) {
            voterRewardsSums.push(
                await eglContract.methods.voterRewardSums(i).call()
            )
        }

        const lpTokenReleaseDate = moment.unix(
            parseInt(eventInitialized[0].returnValues.firstEpochStartDate) + 
            parseInt(eventInitialized[0].returnValues.minLiquidityTokensLockup)
        )
        const lpTokenCountdown = moment.duration(lpTokenReleaseDate - moment())

        let timeToLPTokenRelease = lpTokenCountdown < 0 
            ? "0 months 0 days 0 hours 0 minutes 0 seconds" 
            : lpTokenCountdown.months() + " months " +
                lpTokenCountdown.days() + " days " +
                lpTokenCountdown.hours() + " hours " +
                lpTokenCountdown.minutes() + " minutes " +
                lpTokenCountdown.seconds() + " seconds";

        let currentSerializedEgl = lpTokenCountdown > 0 
            ? 0 
            : (
                ((new Date().getTime() / 1000) - parseInt(eventInitialized[0].returnValues.firstEpochStartDate) - parseInt(eventInitialized[0].returnValues.minLiquidityTokensLockup))
                / ((parseInt(eventInitialized[0].returnValues.epochLength) * 52) - parseInt(eventInitialized[0].returnValues.minLiquidityTokensLockup))
            )**4 * 750000000;

            currentSerializedEgl = currentSerializedEgl > 750000000 ? 750000000 : currentSerializedEgl;

        const upcomingVotes = []
        for (let i = 1; i < 8; i++) {
            upcomingVotes.push({
                index: i,
                voteWeightSums: await eglContract.methods
                    .voteWeightsSum(i)
                    .call(),
                votesTotal: await eglContract.methods.votesTotal(i).call(),
            })
        }

        const eglBalance = await tokenContract.methods.balanceOf(accounts[0]).call();

        this.setState({
            currentTime: moment(),
            eglContractTokenBalance: eglContractTokenBalance,
            currentEpoch: parseInt(currentEpoch),
            currentEpochStartDate: currentEpochStartDate,
            firstEpochStartDate: firstEpochStartDate,
            timeToNextEpoch: timeToNextEpoch,
            tokensInCirculation: tokensInCirculation,
            currentVoteWeightSum: currentVoteWeightSum,
            currentVotesTotal: currentVotesTotal,
            desiredEgl: desiredEgl,
            upcomingVotes: upcomingVotes,
            voterRewardsSums: voterRewardsSums,
            currentSerializedEgl: currentSerializedEgl,
            timeToLPTokenRelease: timeToLPTokenRelease,
            eventSeedAccountClaimed: eventSeedAccountClaimed,
            eventVotesTallied: eventVotesTallied,
            eventCreatorRewardsClaimed: eventCreatorRewardsClaimed,
            eventVote: eventVote,
            eventWithdraw: eventWithdraw,
            eventVoteThresholdMet: eventVoteThresholdMet,
            eventVoteThresholdFailed: eventVoteThresholdFailed,
            eventVoterRewardCalculated: eventVoterRewardCalculated,
            eventPoolTokensWithdrawn: eventPoolTokensWithdrawn,
            eventInitialized: eventInitialized[0].returnValues,
            eventSupporterTokensClaimed: eventSupporterTokensClaimed,
            eventSerializedEglCalculated: eventSerializedEglCalculated,
            eventSeedAccountAdded: eventSeedAccountAdded,
            eventGenesisContribution: eventGenesisContribution,
            eventGenesisInit: eventGenesisInit[0].returnValues,
            eventGenesisEnded: eventGenesisEnded.length > 0 ? eventGenesisEnded[0].returnValues : [],
            eglBalance,
            genesisCanContribute,
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
            currentTime = moment(),
            eglContractTokenBalance = '-',
            currentEpoch = '-',
            currentEpochStartDate = moment(),
            firstEpochStartDate = moment(),
            timeToNextEpoch = '-',
            desiredEgl = '-',
            tokensInCirculation = '-',
            currentVoteWeightSum = '-',
            currentVotesTotal = '-',
            upcomingVotes = [],
            voterRewardsSums = [],
            timeToLPTokenRelease = "-",
            currentSerializedEgl = 0,
            eventSeedAccountClaimed = [],
            eventVotesTallied = [],
            eventCreatorRewardsClaimed = [],
            eventVote = [],
            eventWithdraw = [],
            eventVoteThresholdMet = [],
            eventVoteThresholdFailed = [],
            eventVoterRewardCalculated = [],
            eventPoolTokensWithdrawn = [],
            eventInitialized = {},
            eventSupporterTokensClaimed = [],
            eventSerializedEglCalculated = [],
            eventSeedAccountAdded = [],
            eventGenesisContribution = [],
            eventGenesisInit = [],
            eventGenesisEnded = [],
            eglBalance = 0,
            genesisCanContribute = '',
        } = this.state

        return (
            <FullWidthScrollPage
                connectWeb3={() => connectToWeb3(window)}
                walletAddress={this.props.accounts[0]}
                eglBalance={eglBalance}
                style={fontWhite}
            >
                <div>

                    <div>
                        <div>
                            <b>Current Date: </b>
                            <span style={contractAttributeValue}>
                                {currentTime
                                    .local()
                                    .toDate()
                                    .toLocaleDateString()}{' '}
                                {currentTime
                                    .local()
                                    .toDate()
                                    .toLocaleTimeString()}
                            </span>
                        </div>
                        <br />
                        <table  style={tableWidth1000}>
                            <tbody>
                                <tr>
                                    <td>
                                        <b>First Epoch Start Date: </b>
                                        <span style={contractAttributeValue}>
                                            {firstEpochStartDate
                                                .local()
                                                .toDate()
                                                .toString()}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Current EGL: </b>
                                        <span style={contractAttributeValue}>
                                            {desiredEgl}
                                        </span>
                                    </td>
                                </tr>                                
                            </tbody>
                        </table>


                        <br />
                        <table style={tableWidth1000}>
                            <tbody>
                                <tr>
                                    <td>
                                        <b>Current Epoch: </b>
                                        <span style={contractAttributeValue}>
                                            {currentEpoch}
                                        </span>
                                    </td>
                                    <td>
                                        <b>EGL Contract Token Balance: </b>
                                        <span style={contractAttributeValue}>
                                            {this.formatBigNumberAttribute(
                                                eglContractTokenBalance
                                            )}{' '}
                                            EGL{' '}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Current Epoch Start Date: </b>
                                        <span style={contractAttributeValue}>
                                            {currentEpochStartDate
                                                .local()
                                                .toDate()
                                                .toString()}
                                        </span>
                                    </td>
                                    <td>
                                        <b>Tokens in Circulation: </b>
                                        <span style={contractAttributeValue}>
                                            {this.formatBigNumberAttribute(
                                                tokensInCirculation
                                            )}{' '}
                                            EGL
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Time to Next Epoch: </b>
                                        <span style={contractAttributeValue}>
                                            {timeToNextEpoch}
                                        </span>
                                    </td>
                                    <td>
                                        &nbsp;
                                    </td>
                                </tr>
                                <tr><td>&nbsp;</td></tr>
                                <tr>
                                    <td>
                                        <b>Time to Pool Token Release: </b>
                                        <span style={contractAttributeValue}>{timeToLPTokenRelease}</span>
                                    </td>
                                    <td>&nbsp;</td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Current Serialized EGL: </b>
                                        <span style={contractAttributeValue}>
                                            {currentSerializedEgl.toLocaleString('en-US',{minimumFractionDigits: 0,maximumFractionDigits: 18,})}
                                        </span>
                                    </td>
                                    <td>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <div>
                        <table  style={tableWidth1000}>
                            <tbody>
                                <tr>
                                    <td colSpan="2" style={heading}>Contract Addresses:</td>
                                    <td colSpan="2" style={heading}>Deployment Params:</td>
                                </tr>
                                <tr>
                                    <td><b>EGL Contract: </b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.eglContract}</span></td>
                                    <td><b>Liquidity Pool Lockup: </b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.minLiquidityTokensLockup} seconds</span></td>
                                </tr>
                                <tr>
                                    <td><b>EGL Token: </b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.eglToken}</span></td>
                                    <td><b>Epoch Length: </b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.epochLength} seconds</span></td>
                                </tr>
                                <tr>
                                    <td><b>EGL Genesis</b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.genesisContract}</span></td>
                                    <td><b>Voting Pause: </b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.votingPauseSeconds} seconds before next epoch</span></td>
                                </tr>
                                <tr>
                                    <td><b>Balancer Pool Token</b></td>
                                    <td><span style={contractAttributeValue}>{eventInitialized.balancerToken}</span></td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <div>
                        <div style={heading}>Genesis</div>
                        <table  style={tableWidth1000}>
                            <tbody>
                                <tr>
                                    <td>
                                        <b>Total Genesis ETH: </b>
                                        <span style={contractAttributeValue}>{this.formatBigNumberAttribute(eventInitialized.totalGenesisEth)} ETH</span>
                                    </td>
                                    <td>
                                        <b>Genesis Max Threshold: </b>
                                        <span style={contractAttributeValue}>{this.formatBigNumberAttribute(eventGenesisInit.maxThreshold)} ETH</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Genesis ETH:EGL Ratio: </b>
                                        <span style={contractAttributeValue}>1:{this.formatBigNumberAttribute(eventInitialized.ethEglRatio)}</span>
                                    </td>
                                    <td>
                                        <b>Genesis Owner: </b>
                                        <span style={contractAttributeValue}>{eventGenesisInit.owner}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>Genesis ETH:BPT Ratio: </b>
                                        <span style={contractAttributeValue}>1:{this.formatBigNumberAttribute(eventInitialized.ethBptRatio)}</span>
                                    </td>
                                    <td>
                                        <b>Genesis Open: </b>
                                        <span style={contractAttributeValue}>{genesisCanContribute.toString()}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <div style={heading}>Genesis Contributors:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Contribution Account</td>
                                    <td>Contribution Amount</td>
                                    <td>Cumulative Balance at time of Contribution</td>
                                    <td>Contribution Order</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventGenesisContribution.map((event) => {
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
                                                <td>{event.returnValues.contributor}</td>
                                                <td>
                                                    {this.formatBigNumberAttribute(
                                                        event.returnValues.amount
                                                    )} ETH
                                                </td>
                                                <td>
                                                    {this.formatBigNumberAttribute(
                                                        event.returnValues.cumulativeBalance
                                                    )} ETH
                                                </td>
                                                <td>{event.returnValues.idx}</td>
                                            </tr>
                                        )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <div style={heading}>Genesis Ended:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Transferred To</td>                                    
                                    <td>Total Received</td>
                                    <td>Contract Balance</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>                                
                                <tr>
                                    <td>
                                        {moment
                                            .unix(
                                                eventGenesisEnded.date
                                            )
                                            .local()
                                            .toDate()
                                            .toLocaleDateString()}
                                    </td>
                                    <td>
                                        {moment
                                            .unix(
                                                eventGenesisEnded.date
                                            )
                                            .local()
                                            .toDate()
                                            .toLocaleTimeString()}
                                    </td>
                                    <td>{eventGenesisEnded.owner}</td>
                                    <td>
                                        {this.formatBigNumberAttribute(
                                            eventGenesisEnded.cumulativeBalance
                                        )} EGL
                                    </td>                                                
                                    <td>
                                        {this.formatBigNumberAttribute(
                                            eventGenesisEnded.contractBalance
                                        )} EGL
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <br />
                    <div style={heading}>Seed Accounts Added:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Seed Account</td>
                                    <td>Seed Amount</td>
                                    <td>Remaining Seeder Balance</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventSeedAccountAdded.map((event) => {
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
                                                <td>{event.returnValues.seedAccount}</td>
                                                <td>
                                                    {this.formatBigNumberAttribute(
                                                        event.returnValues.seedAmount
                                                    )} EGL
                                                </td>
                                                <td>
                                                    {this.formatBigNumberAttribute(
                                                        event.returnValues.remainingSeederBalance
                                                    )} EGL
                                                </td>
                                            </tr>
                                        )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <br />
                    <div style={heading}>Current Epoch Votes:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Epoch</td>
                                    <td>Total Vote Weight</td>
                                    <td>Total Locked Tokens</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                <tr>
                                    <td>{currentEpoch}</td>
                                    <td>
                                        {this.formatBigNumberAttribute(
                                            currentVoteWeightSum
                                        )}
                                    </td>
                                    <td>
                                        {this.formatBigNumberAttribute(
                                            currentVotesTotal
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <br />
                    <div style={heading}>Upcoming Votes:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Epoch</td>
                                    <td>Total Vote Weight</td>
                                    <td>Total Locked Tokens</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {upcomingVotes.map((upcomingVote) => {
                                    return (
                                        <tr>
                                            <td>
                                                {currentEpoch +
                                                    upcomingVote.index}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    upcomingVote.voteWeightSums
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    upcomingVote.votesTotal
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <br />
                    <div style={heading}>Vote Totals Per Epoch: </div>
                    <div>
                        <table style={tableWidth50}>
                            <thead style={thead}>
                                <tr>
                                    <td>Epoch</td>
                                    <td>Votes Total</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {voterRewardsSums.map((epochReward, idx) => {
                                    return (
                                        <tr>
                                            <td>{idx}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    epochReward
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <h2 style={heading}>Events</h2>
                    <div style={heading}>Votes:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Voter</td>
                                    <td>Current Epoch</td>
                                    <td>Gas Target</td>
                                    <td>EGL Amount</td>
                                    <td>Lockup Duration</td>
                                    <td>Vote Weight</td>
                                    <td>Release Date</td>
                                    <td>Total Votes</td>
                                    <td>Total Votes (for reward)</td>
                                    <td>Total Locked Tokens</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventVote.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {event.returnValues.gasTarget}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.eglAmount
                                                )}
                                            </td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .lockupDuration
                                                }
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    new BN(
                                                        event.returnValues.eglAmount
                                                    )
                                                        .mul(
                                                            new BN(
                                                                event.returnValues.lockupDuration
                                                            )
                                                        )
                                                        .toString()
                                                )}
                                            </td>
                                            <td>
                                                {moment
                                                    .unix(
                                                        event.returnValues
                                                            .releaseDate
                                                    )
                                                    .local()
                                                    .toDate()
                                                    .toLocaleDateString() +
                                                    ' ' +
                                                    moment
                                                        .unix(
                                                            event.returnValues
                                                                .releaseDate
                                                        )
                                                        .local()
                                                        .toDate()
                                                        .toLocaleTimeString()}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .epochVoteWeightSum
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .epochVoterRewardSum
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .epochTotalVotes
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <div style={heading}>Withdraw:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Current Epoch</td>
                                    <td>Original Vote</td>
                                    <td>Tokens Locked</td>
                                    <td>Reward Tokens</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventWithdraw.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {event.returnValues.gasTarget}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .tokensLocked
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .rewardTokens
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <div style={heading}>VoterReward Calculation:</div>
                    <div>
                        <div>
                            Voter Rewards = (Vote Weight / Epoch Total Votes) *
                            Reward Multiplier
                        </div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Voter</td>
                                    <td>Current Epoch</td>
                                    <td>Reward Epoch</td>
                                    <td>Cumulative Reward</td>
                                    <td>Epoch Reward</td>
                                    <td>Remaining Rewards</td>
                                    <td>Vote Weight</td>
                                    <td>Epoch Total Votes</td>
                                    <td>Total Epoch Reward</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventVoterRewardCalculated.map((event) => {
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
                                            <td>{event.returnValues.voter}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {52 -
                                                    event.returnValues.weeksDiv}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .voterReward
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .epochVoterReward
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .remainingVoterRewards
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .voteWeight
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .epochVoterRewardSum
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    new BN(
                                                        event.returnValues.rewardMultiplier
                                                    ).mul(
                                                        new BN(
                                                            event.returnValues.weeksDiv
                                                        )
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    <br />
                    <div style={heading}>Tally Votes:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Current Epoch</td>
                                    <td>Desired EGL</td>
                                    <td>Vote %</td>
                                    <td>Threshold %</td>
                                    <td>Average Gas Target</td>
                                    <td>Baseline EGL</td>
                                    <td>Tokens In Circulation</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventVotesTallied.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {event.returnValues.desiredEgl}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .actualVotePercentage
                                                )}
                                                %
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .votingThreshold
                                                )}
                                                %
                                            </td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .averageGasTarget
                                                }
                                            </td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .baselineEgl
                                                }
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .tokensInCirculation
                                                )} EGL
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <div style={heading}>Vote Threshold Met:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Current Epoch</td>
                                    <td>New EGL</td>
                                    <td>Vote Threshold Percentage</td>
                                    <td>Actual Vote Percentage</td>
                                    <td>Gas Limit Sum</td>
                                    <td>Blocks Considered</td>
                                    <td>Baseline EGL</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventVoteThresholdMet.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {event.returnValues.desiredEgl}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .voteThreshold
                                                )}
                                                %
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .actualVotePercentage
                                                )}
                                                %
                                            </td>
                                            <td>
                                                {event.returnValues.gasLimitSum}
                                            </td>
                                            <td>
                                                {event.returnValues.voteCount}
                                            </td>
                                            <td>
                                                {event.returnValues.baselineEgl}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <br />
                    <div style={heading}>Vote Threshold Failed:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Current Epoch</td>
                                    <td>New EGL</td>
                                    <td>Initial EGL</td>
                                    <td>Baseline EGL</td>
                                    <td>Vote Threshold Percentage</td>
                                    <td>Actual Vote Percentage</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventVoteThresholdFailed.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {event.returnValues.desiredEgl}
                                            </td>
                                            <td>
                                                {event.returnValues.initialEgl}
                                            </td>
                                            <td>
                                                {event.returnValues.baselineEgl}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .voteThreshold
                                                )}
                                                %
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .actualVotePercentage
                                                )}
                                                %
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <hr />
                    <br />
                    <div style={heading}>Creator Rewards Claimed:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Creator Address</td>
                                    <td>Current Epoch</td>
                                    <td>Reward Amount</td>
                                    <td>Last Serialized EGL</td>
                                    <td>Remaining Reward Amount</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventCreatorRewardsClaimed.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .creatorRewardAddress
                                                }
                                            </td>
                                            <td>
                                                {
                                                    event.returnValues
                                                        .currentEpoch
                                                }
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .amountClaimed
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .lastSerializedEgl
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .remainingCreatorReward
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <br />
                    <div style={heading}>Serialized EGL Calculated:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Epoch</td>
                                    <td>Seconds Since EGL Start</td>
                                    <td>Percentage Time Passed </td>
                                    <td>Serialized EGL</td>
                                    <td>Max EGL Supply</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventSerializedEglCalculated.map((event) => {
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
                                            <td>{event.returnValues.secondsSinceEglStart}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                        event.returnValues.timePassedPercentage
                                                )}%
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .serializedEgl
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .maxSupply
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <br />

                    <hr />
                    
                    <div style={heading}>Seeder EGLs Claimed:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Seed Account</td>
                                    <td>Seed Amount</td>
                                    <td>Release Date</td>
                                    <td>Release Time</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventSeedAccountClaimed.map((event) => {
                                return (
                                    <tr>
                                        <td>{moment.unix(event.returnValues.date).local().toDate().toLocaleDateString()}</td>
                                        <td>{moment.unix(event.returnValues.date).local().toDate().toLocaleTimeString()}</td>
                                        <td>{event.returnValues.seedAddress}</td>
                                        <td>{this.formatBigNumberAttribute(event.returnValues.individualSeedAmount)}</td>
                                        <td>{moment.unix(event.returnValues.releaseDate).local().toDate().toLocaleDateString()}</td>
                                        <td>{moment.unix(event.returnValues.releaseDate).local().toDate().toLocaleTimeString()}</td>
                                    </tr>
                                )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <hr />
                    <br />
                    <div style={heading}>Bonus EGLs Claimed:</div>
                    <div>
                        <b></b>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Genesis Amount Contr.</td>
                                    <td>ETH:EGL</td>
                                    <td>ETH:BPT</td>
                                    <td>EGL's Received</td>
                                    <td>BPT's Received</td>
                                    <td>Remaining Bonus EGL's Balance</td>
                                    <td>Remaining BPT Balance</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventSupporterTokensClaimed.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .amountContributed
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .ethEglRatio
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .ethBptRatio
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.bonusEglsReceived
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.poolTokensReceived
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.remainingSupporterBalance
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.remainingBptBalance
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <hr />
                    <br />
                    <div style={heading}>Pool Tokens Withdrawn:</div>
                    <div>
                        <table style={tableWidth1000}>
                            <thead style={thead}>
                                <tr>
                                    <td>Date</td>
                                    <td>Time</td>
                                    <td>Caller</td>
                                    <td>Current Serialized EGL</td>
                                    <td>Pool Tokens Due</td>
                                    <td>Remaining Pool Tokens</td>
                                    <td>First EGL</td>
                                    <td>Last EGL</td>
                                    <td>EGL's Release Date</td>
                                    <td>EGL's Release Time</td>
                                </tr>
                            </thead>
                            <tbody style={contractAttributeValue}>
                                {eventPoolTokensWithdrawn.map((event) => {
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
                                            <td>{event.returnValues.caller}</td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .currentSerializedEgl
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .poolTokensDue
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues
                                                        .poolTokens
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.firstEgl
                                                )}
                                            </td>
                                            <td>
                                                {this.formatBigNumberAttribute(
                                                    event.returnValues.lastEgl
                                                )}
                                            </td>
                                            <td>
                                                {moment
                                                    .unix(
                                                        event.returnValues.eglReleaseDate
                                                    )
                                                    .local()
                                                    .toDate()
                                                    .toLocaleDateString()}
                                            </td>
                                            <td>
                                                {moment
                                                    .unix(
                                                        event.returnValues.eglReleaseDate
                                                    )
                                                    .local()
                                                    .toDate()
                                                    .toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    <br />
                    <br />
                    <br />
                    <br />
                    </div>
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
            <EglContractStatus
                accounts={accounts}
                web3={web3}
                genesisContract={contract}
                eglContract={votingContract}
                tokenContract={tokenContract}
            />
        )}
    />
)
