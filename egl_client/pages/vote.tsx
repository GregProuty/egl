import React, { useEffect, useState, useReducer } from 'react'
import GenericPage from '../components/pageTemplates/GenericPage'
import BodyHeader from '../components/molecules/BodyHeader'
import Web3Container from '../components/lib/Web3Container'
import connectToWeb3 from '../components/lib/connectToWeb3'
import clsx from 'clsx'
import ClaimModal from '../components/organisms/ClaimModal'
import Button from '../components/atoms/Button'
import VoteCountdown from '../components/organisms/VoteCountdown'
import YourVote from '../components/organisms/YourVote'
import VoteModal from '../components/organisms/VoteModal'
import RevoteModal from '../components/organisms/RevoteModal'
import ConnectModal from '../components/organisms/ConnectModal'
import LeaderboardTable from '../components/organisms/LeaderboardTable'
import YourWithdrawal from '../components/organisms/YourWithdrawal'
import {
    addCommas,
    getTokenReleaseDate,
    getPauseTime,
} from '../components/lib/helpers'
import m from 'moment'
import {
    REWARD_MULTIPLIER,
    totalEglToBalancer,
} from '../components/lib/constants'
import BigNumber from 'bignumber.js'
import {
    calculateCumulativeRewards,
    getLatestGasLimit,
    getAllEventsForType,
    calculateBonusEgls,
    calculateGenesisWithdrawDate,
    voteExpirationDate,
} from '../components/lib/contractMethods'
import moment from 'moment'
import NumberLabel from '../components/molecules/NumberLabel'
import UseRecursiveTimeout from '../components/hooks/UseRecursiveTimeout'
import LoadingMessage from '../components/organisms/LoadingMessage'
import ConnectToMetamask from '../components/organisms/ConnectToMetamask'
import useMediaQuery from '../components/hooks/UseMediaQuery'

interface IndexProps {
    accounts: any
    web3Reader?: any
    contract: any
    web3: any
    votingContract: any
    tokenContract: any
}

const Index = ({
    accounts,
    web3,
    contract,
    votingContract,
    tokenContract,
}: IndexProps) => {
    const [walletAddress, setWalletAddress] = useState(
        accounts ? accounts[0] : null
    )
    const [voterData, setVoterData] = useState(null)
    const [showClaimModal, setShowClaimModal] = useState(false)
    const [showVoteModal, setShowVoteModal] = useState(false)
    const [showRevoteModal, setShowRevoteModal] = useState(false)
    const [isSeeder, setIsSeeder] = useState(false)
    const [isGenesis, setIsGenesis] = useState(false)
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [hasConnected, setHasConnected] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [showClaim, setShowClaim] = useState(false)
    const [pending, setPending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [epochsBehind, setEpochsBehind] = useState('0')
    const [bonusEgls, setBonusEgls] = useState('0')
    const [lastEpochDesiredEgl, setLastEpochDesiredEgl] = useState('0')
    const [reward, setReward] = useState('0')
    const [cumulativeRewards, setCumulativeRewards] = useState('0')
    const [eglBalance, setEglBalance] = useState('0')
    const [seederAmount, setSeederAmount] = useState('0')
    const [currentGasLimit, setCurrentGasLimit] = useState('0')
    const [currentEpoch, setCurrentEpoch] = useState('0')
    const [tokensUnlocked, setTokensUnlocked] = useState('0')
    const [unlockTokenStartDate, setUnlockTokenStartDate] = useState('0')
    const [firstEpochStartDate, setFirstEpochStartDate] = useState('0')
    const [epochLengthSeconds, setEpochLengthSeconds] = useState('0')
    const [unlockTokenEndDate, setUnlockTokenEndDate] = useState(0)
    const [votingPauseSeconds, setVotingPauseSeconds] = useState(0)
    const [hasWithdrawnPoolTokens, setHasWithdrawnPoolTokens] = useState(false)
    const [showWithdrawTable, setShowWithdrawTable] = useState(false)
    const [showWithdrawButton, setShowWithdrawButton] = useState(false)
    const [showBptWithdrawButton, setShowBptWithdrawButton] = useState(false)
    const [withdrawDate, setWithdrawDate] = useState('0')
    const [showYourVote, setShowYourVote] = useState(false)
    const [timeToNextEpoch, setTimeToNextEpoch] = useState(m.duration())
    const [voteEvents, setVoteEvents] = useState([])
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
    const showConnect = !(isGenesis || isSeeder) && !hasConnected
    const [contractBalance, setContractBalance] = useState('0')
    const [contributorCumulativeBalance, setContributorCumulativeBalance] =
        useState('0')
    const [amountContributed, setAmountContributed] = useState('0')
    const [votingStartDate, setVotingStartDate] = useState('0')

    let isPageWide = useMediaQuery('(min-width: 1000px)')

    const ticker = async () => {
        const now = m().unix()

        if (tokenContract) {
            if (walletAddress) {
                const balance = await tokenContract.methods
                    .balanceOf(walletAddress)
                    .call()
                setEglBalance(balance)
                const allowance = await tokenContract.methods
                    .allowance(walletAddress, votingContract._address)
                    .call()
                setHasConnected(allowance > 1)
            }

            const eventInitialized = await getAllEventsForType(
                votingContract,
                'Initialized'
            )
            setVotingStartDate(
                eventInitialized.length
                    ? eventInitialized[0].returnValues.firstEpochStartDate
                    : 0
            )
            const epochLength = eventInitialized.length
                ? eventInitialized[0].returnValues.epochLength
                : 300
            const epochEndDate = m.unix(
                parseInt(
                    await votingContract.methods.currentEpochStartDate().call()
                ) + Number(epochLength)
            )
            const votePauseSeconds =
                eventInitialized[0].returnValues.votingPauseSeconds

            const countdown = m.duration(
                +epochEndDate - +m.unix(votePauseSeconds) - +m()
            )
            const epochDuration = m.duration(+epochEndDate - +m())
            // @ts-ignore
            const totalSeconds = epochDuration._milliseconds / 1000
            const totalEpochsBehind = Math.abs(
                Math.floor((totalSeconds + votePauseSeconds) / epochLength)
            )

            setEpochsBehind(String(totalEpochsBehind))
            const latestGasLimit = await getLatestGasLimit(web3)
            const latestEpoch = await votingContract.methods
                .currentEpoch()
                .call()
            const events = await getAllEventsForType(votingContract, 'Vote')

            setTimeToNextEpoch(countdown)
            setVoteEvents(events)
            setCurrentGasLimit(latestGasLimit)
            setCurrentEpoch(latestEpoch)
        }

        if (walletAddress && contract) {
            let balance = await contract.methods
                .cumulativeBalance()
                .call({ from: '0x0000000000000000000000000000000000000000' })

            setContractBalance(String(balance))
            const contributor = await contract.methods
                .contributors(walletAddress)
                .call({ from: walletAddress })

            setContributorCumulativeBalance(contributor.cumulativeBalance)
            setAmountContributed(contributor.amount)

            if (contributor.amount !== '0') {
                await setIsGenesis(true)

                let balance = await contract.methods.cumulativeBalance().call({
                    from: '0x0000000000000000000000000000000000000000',
                })
                const eventInitialized = await getAllEventsForType(
                    votingContract,
                    'Initialized'
                )

                const poolTokensWithdrawnEvent = await getAllEventsForType(
                    votingContract,
                    'PoolTokensWithdrawn'
                )

                const userWithdraw = poolTokensWithdrawnEvent.filter(
                    (event) =>
                        event.returnValues.caller === walletAddress &&
                        event.returnValues.poolTokens === '0'
                )
                const votingStartDate = eventInitialized.length
                    ? eventInitialized[0].returnValues.firstEpochStartDate
                    : 0

                const ethEglRatio =
                    totalEglToBalancer / Number(web3.utils.fromWei(balance))

                const serializedEgl =
                    Number(web3.utils.fromWei(contributor.amount)) * ethEglRatio
                const firstEgl =
                    (Number(web3.utils.fromWei(contributor.cumulativeBalance)) -
                        Number(web3.utils.fromWei(contributor.amount))) *
                    ethEglRatio
                const lastEgl = firstEgl + serializedEgl

                const firstTokenUnlockDate = String(
                    parseFloat(votingStartDate) + getTokenReleaseDate(firstEgl)
                )

                const lastTokenUnlockDate = m
                    .unix(
                        parseFloat(votingStartDate) +
                            getTokenReleaseDate(lastEgl)
                    )
                    .unix()

                setUnlockTokenStartDate(firstTokenUnlockDate)
                setUnlockTokenEndDate(lastTokenUnlockDate)
                setHasWithdrawnPoolTokens(userWithdraw.length > 0)
            }

            if (votingContract) {
                const eventInitialized = await getAllEventsForType(
                    votingContract,
                    'Initialized'
                )
                const epochLength = eventInitialized.length
                    ? eventInitialized[0].returnValues.epochLength
                    : 300
                const firstEpochStartDate = eventInitialized.length
                    ? eventInitialized[0].returnValues.firstEpochStartDate
                    : 3000000
                const voterData = await votingContract.methods
                    .voters(walletAddress)
                    .call()
                const currentEpoch = await votingContract.methods
                    .currentEpoch()
                    .call()
                const tallyVotesEvents = await getAllEventsForType(
                    votingContract,
                    'VotesTallied'
                )
                const currentDesiredEgl = await votingContract.methods
                    .desiredEgl()
                    .call()
                let epochDesiredEgl =
                    currentEpoch == 0
                        ? currentDesiredEgl
                        : tallyVotesEvents[currentEpoch - 1].returnValues
                              .desiredEgl
                const reward = new BigNumber(REWARD_MULTIPLIER)
                    .multipliedBy(new BigNumber(52 - currentEpoch))
                    .toFixed()

                setReward(reward)

                const userRewards = await calculateCumulativeRewards(
                    voterData.voteEpoch,
                    currentEpoch,
                    voterData.tokensLocked,
                    voterData.lockupDuration,
                    votingContract
                )
                voterData.unlockDate = moment
                    .unix(firstEpochStartDate)
                    .add(voterData.lockupDuration, 'week')
                    .add(currentEpoch * epochLength, 'seconds')
                    .unix()

                const tokensUnlocked =
                    m().unix() > voterData.releaseDate
                        ? new BigNumber(voterData.tokensLocked)
                              .plus(
                                  new BigNumber(
                                      web3.utils.toWei(
                                          Number(userRewards).toFixed(18)
                                      )
                                  )
                              )
                              .toFixed(0)
                        : '0'
                setTokensUnlocked(tokensUnlocked)
                setVoterData(voterData)
                setLastEpochDesiredEgl(epochDesiredEgl)
                setCumulativeRewards(userRewards)
                setFirstEpochStartDate(
                    eventInitialized[0].returnValues.firstEpochStartDate
                )
                setEpochLengthSeconds(
                    eventInitialized[0].returnValues.epochLength
                )
                setVotingPauseSeconds(
                    eventInitialized[0].returnValues.votingPauseSeconds
                )
                if (voterData.tokensLocked != '0') {
                    setHasVoted(true)
                } else {
                    setHasVoted(false)
                }

                const seedAmount = await votingContract.methods
                    .seeders(walletAddress)
                    .call()

                setSeederAmount(seedAmount)

                if (seedAmount > 0) {
                    setIsSeeder(true)
                }

                const supportersStruct = await votingContract.methods
                    .supporters(walletAddress)
                    .call()

                // isGenesis and hasn't claimed
                if (
                    Number(contributor.amount) > 0 &&
                    voterData.tokensLocked === '0' &&
                    Number(supportersStruct.claimed) === 0
                ) {
                    setShowClaim(true)
                }

                // is seeder and currentEpoch is less than 52 and they haven't voted
                if (
                    Number(seederAmount) > 0 &&
                    currentEpoch < 52 &&
                    voterData.tokensLocked === '0'
                ) {
                    setShowClaim(true)
                }

                let ethEglRatio = Number(
                    web3.utils.fromWei(
                        eventInitialized[0].returnValues.ethEglRatio
                    )
                )
                let serializeEgls =
                    Number(web3.utils.fromWei(contributor.amount)) * ethEglRatio
                let firstEgl =
                    (Number(web3.utils.fromWei(contributor.cumulativeBalance)) -
                        Number(web3.utils.fromWei(contributor.amount))) *
                    ethEglRatio
                let lastEgl = firstEgl + serializeEgls
                const bonusEgls = calculateBonusEgls(firstEgl, lastEgl)

                setBonusEgls(String(bonusEgls))

                if (isGenesis) {
                    setWithdrawDate(
                        String(
                            calculateGenesisWithdrawDate(
                                firstEpochStartDate,
                                voterData,
                                contractBalance,
                                contributorCumulativeBalance,
                                amountContributed,
                                votingStartDate
                            )
                        )
                    )
                    if (
                        now >= Number(unlockTokenStartDate) &&
                        Number(supportersStruct.poolTokens) > 0
                    ) {
                        setShowBptWithdrawButton(true)
                        setShowWithdrawButton(false)
                    } else if (
                        now >= unlockTokenEndDate &&
                        supportersStruct.poolTokens == 0
                    ) {
                        // Have to wait for all BPT's to be unlocked and withdrawn before enabling the withdraw button
                        // Once all BPT's are withdrawn, the release date in the contract is correct
                        if (voterData.releaseDate !== '0') {
                            setWithdrawDate(voterData.releaseDate)
                            setShowWithdrawButton(
                                now >= voterData.releaseDate ? true : false
                            )
                            setShowBptWithdrawButton(false)
                        }
                    }
                } else {
                    // Normal voters and seeders
                    setWithdrawDate(voterData.releaseDate)
                    console.log(voterData.releaseDate)
                    if (
                        voterData.releaseDate !== '0' &&
                        now >= Number(voterData.releaseDate)
                    ) {
                        setShowWithdrawButton(true)
                    }
                }
                if (voterData.releaseDate != '0') {
                    if (
                        now <
                        voteExpirationDate(
                            firstEpochStartDate,
                            voterData.voteEpoch,
                            voterData.lockupDuration
                        )
                    ) {
                        setShowYourVote(true)
                        setShowWithdrawTable(false)
                    } else {
                        setShowYourVote(false)
                        setShowWithdrawTable(true)
                    }
                }
            }
        }

        setLoading(false)
    }

    if (
        typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined'
    ) {
        window.ethereum.on('accountsChanged', (accounts) => {
            window.location.reload()
        })
    }

    UseRecursiveTimeout(async () => {
        console.log('ticker called!', ignored)
        await ticker()
    }, 1000)

    useEffect(() => {
        ticker()
    }, [])

    function getButton() {
        if (hasVoted) {
            return (
                <Button
                    className={clsx(
                        'bg-salmon hover:bg-salmon-dark hover:text-white',
                        'w-28 h-12 rounded-2xl text-dark'
                    )}
                    handleClick={() => {
                        setShowRevoteModal(true)
                    }}
                >
                    <p className={'font-semibold'}>{'Revote'}</p>
                </Button>
            )
        }
        if (showConnect) {
            return (
                <Button
                    className={clsx(
                        'bg-salmon hover:bg-salmon-dark hover:text-white',
                        'w-28 h-12 rounded-2xl text-dark'
                    )}
                    handleClick={() => {
                        setShowConnectModal(true)
                    }}
                >
                    <p className={'font-semibold'}>Connect</p>
                </Button>
            )
        }
        if (showClaim) {
            return (
                <Button
                    className={clsx(
                        'bg-salmon hover:bg-salmon-dark hover:text-white',
                        'w-28 h-12 rounded-2xl text-dark'
                    )}
                    handleClick={() => {
                        setShowClaimModal(true)
                    }}
                >
                    <p className={'font-semibold'}>{'Claim & Vote'}</p>
                </Button>
            )
        }
        return (
            <Button
                className={clsx(
                    'bg-salmon hover:bg-salmon-dark hover:text-white',
                    'w-28 h-12 rounded-2xl text-dark'
                )}
                handleClick={() => {
                    setShowVoteModal(true)
                }}
            >
                <p className={'font-semibold'}>{'Vote'}</p>
            </Button>
        )
    }

    return (
        <GenericPage
            connectWeb3={(setShowChooseWallet) =>
                connectToWeb3(window, setShowChooseWallet)
            }
            walletAddress={walletAddress}
            eglBalance={eglBalance}
            isSeeder={isSeeder}
            isGenesis={isGenesis}
            votingContract={votingContract}
            bonusEgls={bonusEgls}
            tokensLocked={voterData ? voterData.tokensLocked : null}
            cumulativeRewards={cumulativeRewards}
            seederAmount={seederAmount}
        >
            <main
                style={{
                    height: '100%',
                    zIndex: 2,
                    width: '100%',
                    minHeight: '120vh',
                }}
                className='flex flex-row'
            >
                <div className={'w-full flex justify-center'}>
                    <div
                        style={{
                            zIndex: -1,
                            height: '100%',
                            marginTop: '14rem',
                        }}
                        className={'absolute w-full flex justify-center'}
                    >
                        <div>
                            <img
                                src={'/grey.png'}
                                width={'1000'}
                                height={'1000'}
                            />
                        </div>
                    </div>
                    <div className={'w-full flex flex-col '}>
                        <div className={'flex flex-col'}>
                            <h1
                                style={{ fontSize: '5rem', height: '6rem' }}
                                className={'text-white font-bold mt-16 ml-1'}
                            >
                                Vote.
                            </h1>
                            <BodyHeader
                                className={'ml-4'}
                                contractAddress={
                                    votingContract
                                        ? votingContract._address
                                        : ''
                                }
                            />
                        </div>
                        {loading ? (
                            <LoadingMessage />
                        ) : (
                            <div
                                style={{ width: '100%' }}
                                className={'flex flex-col mt-8'}
                            >
                                <div className={'flex flex-col'}>
                                    <div
                                        style={{ flexWrap: 'wrap' }}
                                        className={
                                            'flex flex-row w-full justify-start items-center mb-10 flex-wrap'
                                        }
                                    >
                                        <div
                                            className={clsx(
                                                isPageWide && 'w-1/2',
                                                'flex justify-center items-center'
                                            )}
                                            style={{ flex: 1 }}
                                        >
                                            <NumberLabel
                                                number={lastEpochDesiredEgl}
                                                title={'Desired Gas Limit'}
                                                label={'Set in prior epoch'}
                                                style={{
                                                    maxWidth: isPageWide
                                                        ? '450px'
                                                        : '350px',
                                                }}
                                            />
                                        </div>
                                        <div
                                            className={clsx(
                                                isPageWide ? 'w-1/2' : 'mt-8',
                                                'flex justify-center items-center'
                                            )}
                                            style={{ flex: 1 }}
                                        >
                                            <NumberLabel
                                                number={currentGasLimit}
                                                title={'Current Gas Limit'}
                                                label={'Last block mined'}
                                                style={{
                                                    maxWidth: isPageWide
                                                        ? '450px'
                                                        : '350px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{ marginTop: '8em' }}
                                        className={'w-full h-8'}
                                    >
                                        <p
                                            className={
                                                'text-white font-bold text-5xl'
                                            }
                                        >
                                            <span>Epoch </span>
                                            {currentEpoch}
                                        </p>
                                    </div>
                                    <div
                                        className={
                                            'flex flex-row items-center mt-8 h-52'
                                        }
                                        style={{ flexWrap: 'wrap' }}
                                    >
                                        {timeToNextEpoch.asSeconds() < 0 ? (
                                            <div
                                                className={
                                                    'flex flex-col justify-center items-center w-full'
                                                }
                                            >
                                                <p
                                                    className={
                                                        'text-white font-bold text-2xl text-center'
                                                    }
                                                >
                                                    {`Epoch ${currentEpoch} is closed for voting.`}
                                                </p>
                                                <p
                                                    className={
                                                        'text-white font-bold text-2xl text-center'
                                                    }
                                                >
                                                    {`There is a ${getPauseTime(
                                                        votingPauseSeconds
                                                    )} delay between epochs.`}
                                                </p>
                                                <p
                                                    className={
                                                        'text-white font-bold text-2xl text-center'
                                                    }
                                                >
                                                    The next epoch will open
                                                    shortly.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className={clsx(
                                                        isPageWide
                                                            ? 'w-1/2'
                                                            : '',
                                                        'flex justify-center items-center'
                                                    )}
                                                    style={{ flex: 1 }}
                                                >
                                                    <NumberLabel
                                                        number={
                                                            Number(reward) > 0
                                                                ? addCommas(
                                                                      reward
                                                                  )
                                                                : '0'
                                                        }
                                                        title={
                                                            'EGLs to be awarded'
                                                        }
                                                        label={'In this epoch'}
                                                        style={{
                                                            maxWidth: isPageWide
                                                                ? '450px'
                                                                : '350px',
                                                        }}
                                                    />
                                                </div>
                                                <div
                                                    className={clsx(
                                                        isPageWide
                                                            ? 'w-1/2'
                                                            : 'mt-8',
                                                        'flex justify-center items-center'
                                                    )}
                                                    style={{ flex: 1 }}
                                                >
                                                    <VoteCountdown
                                                        itemsCenter={true}
                                                        timeToNextEpoch={
                                                            timeToNextEpoch
                                                        }
                                                        style={{
                                                            maxWidth: isPageWide
                                                                ? '450px'
                                                                : '350px',
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: isPageWide
                                            ? '5rem'
                                            : '12rem',
                                    }}
                                    className={clsx(
                                        'flex flex-row w-full justify-center'
                                    )}
                                >
                                    {getButton()}
                                    {showWithdrawButton && (
                                        <div className={'flex flex-row'}>
                                            <Button
                                                className={clsx(
                                                    'bg-salmon hover:bg-salmon-dark hover:text-white',
                                                    'w-28 h-12 rounded-2xl text-dark ml-4'
                                                )}
                                                handleClick={async () => {
                                                    await votingContract.methods
                                                        .withdraw()
                                                        .send({
                                                            from: walletAddress,
                                                        })
                                                        .on('receipt', () => {
                                                            setShowWithdrawTable(
                                                                false
                                                            )
                                                            setShowWithdrawButton(
                                                                false
                                                            )
                                                        })
                                                }}
                                            >
                                                <p className={'font-semibold'}>
                                                    Withdraw EGLs
                                                </p>
                                            </Button>
                                        </div>
                                    )}
                                    {showBptWithdrawButton && (
                                        <Button
                                            className={clsx(
                                                'bg-salmon hover:bg-salmon-dark hover:text-white',
                                                'w-28 h-12 rounded-2xl text-dark ml-4'
                                            )}
                                            handleClick={() =>
                                                votingContract.methods
                                                    .withdrawPoolTokens()
                                                    .send({
                                                        from: walletAddress,
                                                    })
                                            }
                                        >
                                            <p className={'font-semibold'}>
                                                Withdraw BPT
                                            </p>
                                        </Button>
                                    )}
                                    {epochsBehind != '0' && (
                                        <Button
                                            className={clsx(
                                                'bg-salmon hover:bg-salmon-dark hover:text-white',
                                                'w-28 h-12 rounded-2xl text-dark ml-4'
                                            )}
                                            handleClick={() =>
                                                votingContract.methods
                                                    .tallyVotes()
                                                    .send({
                                                        from: walletAddress,
                                                    })
                                            }
                                        >
                                            <p className={'font-semibold'}>
                                                {`Tally Votes`}
                                            </p>
                                        </Button>
                                    )}
                                </div>
                                <h1
                                    className={
                                        'text-5xl text-white font-bold mt-16'
                                    }
                                >
                                    Your Vote
                                </h1>
                                {showWithdrawTable && (
                                    <div
                                        className={
                                            'w-full flex flex-col justify-center items-center mt-8'
                                        }
                                    >
                                        <YourWithdrawal
                                            tokensUnlocked={tokensUnlocked}
                                            withdrawDate={Number(withdrawDate)}
                                            showWithdrawButton={
                                                showWithdrawButton
                                            }
                                            tokensLocked={
                                                voterData.tokensLocked
                                            }
                                            cumulativeRewards={
                                                cumulativeRewards
                                            }
                                        />
                                    </div>
                                )}
                                {showYourVote && (
                                    <div
                                        className={
                                            'w-full flex justify-start mt-20'
                                        }
                                    >
                                        <YourVote
                                            style={
                                                isPageWide && {
                                                    marginLeft: '5.5em',
                                                    marginRight: '5.5em',
                                                }
                                            }
                                            gasTarget={
                                                voterData && voterData.gasTarget
                                            }
                                            tokensLocked={
                                                voterData &&
                                                voterData.tokensLocked
                                            }
                                            lockupDuration={
                                                voterData &&
                                                voterData.lockupDuration
                                            }
                                            releaseDate={withdrawDate}
                                            voterReward={
                                                voterData && cumulativeRewards
                                            }
                                            voteEpoch={
                                                voterData && voterData.voteEpoch
                                            }
                                            firstEpochStartDate={
                                                firstEpochStartDate
                                            }
                                            isPageWide={isPageWide}
                                        />
                                    </div>
                                )}
                                {isPageWide && (
                                    <div
                                        style={{ height: '40em' }}
                                        className={'w-full flex flex-col'}
                                    >
                                        <h1
                                            className={
                                                'text-5xl text-white font-bold mb-8 mt-16'
                                            }
                                        >
                                            Top Votes
                                        </h1>
                                        <div
                                            className={
                                                'w-full flex justify-center '
                                            }
                                        >
                                            <LeaderboardTable
                                                style={{
                                                    marginLeft: '5.5em',
                                                    marginRight: '5.5em',
                                                }}
                                                eventVote={voteEvents}
                                                listLength={5}
                                                viewMore={true}
                                                firstEpochStartDate={
                                                    firstEpochStartDate
                                                }
                                                epochLengthSeconds={
                                                    epochLengthSeconds
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showClaimModal && (
                <ClaimModal
                    web3={web3}
                    walletAddress={walletAddress}
                    handleOutsideClick={() => setShowClaimModal(false)}
                    votingContract={votingContract}
                    isSeeder={isSeeder}
                    bonusEgls={bonusEgls}
                    isGenesis={isGenesis}
                    seederAmount={seederAmount}
                    pending={pending}
                    setPending={setPending}
                />
            )}
            {showVoteModal && (
                <VoteModal
                    web3={web3}
                    walletAddress={walletAddress}
                    contract={contract}
                    handleOutsideClick={() => setShowVoteModal(false)}
                    tokenContract={tokenContract}
                    votingContract={votingContract}
                    voterData={voterData}
                    isSeeder={isSeeder}
                    isGenesis={isGenesis}
                    pending={pending}
                    setPending={setPending}
                    lastEpochDesiredEgl={lastEpochDesiredEgl}
                />
            )}
            {showRevoteModal && (
                <RevoteModal
                    web3={web3}
                    walletAddress={walletAddress}
                    handleOutsideClick={() => setShowRevoteModal(false)}
                    tokenContract={tokenContract}
                    votingContract={votingContract}
                    voterData={voterData}
                    cumulativeRewards={cumulativeRewards}
                    isSeeder={isSeeder}
                    isGenesis={isGenesis}
                    pending={pending}
                    setPending={setPending}
                    unlockTokenEndDate={unlockTokenEndDate}
                    hasWithdrawnPoolTokens={hasWithdrawnPoolTokens}
                />
            )}
            {showConnectModal && !hasConnected && (
                <ConnectModal
                    handleOutsideClick={() => setShowConnectModal(false)}
                    setHasConnected={setHasConnected}
                    votingContract={votingContract}
                    tokenContract={tokenContract}
                    walletAddress={walletAddress}
                    pending={pending}
                    setPending={setPending}
                />
            )}
        </GenericPage>
    )
}

export default () => (
    <Web3Container
        renderFailure={() => (
            <GenericPage connectWeb3={null} walletAddress={null}>
                <ConnectToMetamask />
            </GenericPage>
        )}
        renderLoading={() => (
            <GenericPage connectWeb3={null} walletAddress={null}>
                <LoadingMessage message={'... Loading Web3'} />
            </GenericPage>
        )}
        render={({
            web3,
            accounts,
            contract,
            votingContract,
            tokenContract,
        }) => (
            <Index
                accounts={accounts}
                web3={web3}
                contract={contract}
                votingContract={votingContract}
                tokenContract={tokenContract}
            />
        )}
    />
)
