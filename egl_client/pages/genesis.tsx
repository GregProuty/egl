import React, { useEffect, useState, useReducer } from 'react'
import GenericPage from '../components/pageTemplates/GenericPage'
import BodyHeader from '../components/molecules/BodyHeader'
import Countdown from '../components/organisms/Countdown'
import TotalStaked from '../components/organisms/TotalStaked'
import ParticipateModal from '../components/organisms/ParticipateModal'
import Web3Container from '../components/lib/Web3Container'
import connectToWeb3 from '../components/lib/connectToWeb3'
import useMediaQuery from '../components/hooks/UseMediaQuery'
import Vote from '../components/organisms/Vote'
import Withdraw from '../components/organisms/Withdraw'
import clsx from 'clsx'
import { getAllEventsForType } from '../components/lib/helpers'
import UseRecursiveTimeout from '../components/hooks/UseRecursiveTimeout'
import { useRouter } from 'next/router'
import LoadingMessage from '../components/organisms/LoadingMessage'
import ConnectToMetamask from '../components/organisms/ConnectToMetamask'
import GenesisAwards from '../components/organisms/GenesisAwards'
import YourContribution from '../components/organisms/YourContribution'
import {
    calculateCumulativeRewards,
    calculateBonusEgls,
} from '../components/lib/contractMethods'

interface GenesisProps {
    accounts: any
    web3Reader?: any
    contract: any
    web3: any
    votingContract: any
    tokenContract: any
}

const Genesis = ({
    accounts,
    web3,
    contract,
    votingContract,
    tokenContract,
}: GenesisProps) => {
    const [walletAddress, setWalletAddress] = useState(
        accounts ? accounts[0] : null
    )
    const [modal, setModal] = useState(false)
    const [hasContributed, setHasContributed] = useState(false)
    const [ended, setEnded] = useState(false)
    const [hasClaimed, setHasClaimed] = useState(false)
    const [isSeeder, setIsSeeder] = useState(false)
    const [isGenesis, setIsGenesis] = useState(null)
    const [pending, setPending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dateContributed, setDateContributed] = useState(null)
    const [amountContributed, setAmountContributed] = useState('0')
    const [cumulativeBalance, setCumulativeBalance] = useState('0')
    const [contractBalance, setContractBalance] = useState('0')
    const [contributorCumulativeBalance, setContributorCumulativeBalance] =
        useState('0')
    const [eglBalance, setEglBalance] = useState('0')
    const [votingStartDate, setVotingStartDate] = useState('0')
    const [cumulativeRewards, setCumulativeRewards] = useState('0')
    const [tokensLocked, setTokensLocked] = useState('0')
    const [bonusEgls, setBonusEgls] = useState('0')
    const [seederAmount, setSeederAmount] = useState('0')

    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
    const [poolTokensWithdrawnEvents, setPoolTokensWithdrawnEvents] = useState(
        []
    )
    const [eventWithdraw, setEventWithdraw] = useState([])

    const router = useRouter()

    let isPageWide = useMediaQuery('(min-width: 1000px)')

    if (votingContract && isGenesis !== null && !isGenesis) router.push('vote')

    const ticker = async () => {
        if (contract) {
            let response = await contract.methods
                .cumulativeBalance()
                .call({ from: '0x0000000000000000000000000000000000000000' })

            if (response) {
                setCumulativeBalance(String(web3.utils.fromWei(response)))
            }

            let canContribute = await contract.methods
                .canContribute()
                .call({ from: '0x0000000000000000000000000000000000000000' })

            let canWithdraw = await contract.methods
                .canWithdraw()
                .call({ from: '0x0000000000000000000000000000000000000000' })

            if (!canContribute && !canWithdraw) {
                setEnded(true)
            }
            let balance = await contract.methods
                .cumulativeBalance()
                .call({ from: '0x0000000000000000000000000000000000000000' })

            setContractBalance(String(balance))
        }

        if (votingContract !== null) {
            const eventInitialized = await getAllEventsForType(
                votingContract,
                'Initialized'
            )
            const contributor = await contract.methods
                .contributors(walletAddress)
                .call({ from: walletAddress })

            let ethEglRatio = Number(
                web3.utils.fromWei(eventInitialized[0].returnValues.ethEglRatio)
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

            const seedAmount = await votingContract.methods
                .seeders(walletAddress)
                .call()

            setSeederAmount(seedAmount)

            setVotingStartDate(
                eventInitialized.length
                    ? eventInitialized[0].returnValues.firstEpochStartDate
                    : 0
            )
            const eventPoolTokensWithdrawn = await getAllEventsForType(
                votingContract,
                'PoolTokensWithdrawn'
            )
            const eventWithdraw = await getAllEventsForType(
                votingContract,
                'Withdraw'
            )

            setEventWithdraw(eventWithdraw)
            setPoolTokensWithdrawnEvents(eventPoolTokensWithdrawn)
        }

        if (walletAddress) {
            const accounts = await web3.eth.getAccounts()
            if (walletAddress !== accounts[0]) window.location.reload()

            const contributorsStruct = await contract.methods
                .contributors(walletAddress)
                .call()
            let contributor = await contract.methods
                .contributors(walletAddress)
                .call({ from: walletAddress })

            let positive = contributor.amount > 0
            setAmountContributed(contributor.amount)
            setDateContributed(contributor.date)
            setContributorCumulativeBalance(contributor.cumulativeBalance)

            if (positive) setHasContributed(positive)
            if (contributorsStruct.amount !== '0') {
                setIsGenesis(true)
            } else {
                setIsGenesis(false)
            }
            if (votingContract) {
                const seederStruct = await votingContract.methods
                    .seeders(walletAddress)
                    .call()
                const voterData = await votingContract.methods
                    .voters(walletAddress)
                    .call()
                const latestEpoch = await votingContract.methods
                    .currentEpoch()
                    .call()
                const userRewards = await calculateCumulativeRewards(
                    voterData.voteEpoch,
                    latestEpoch,
                    voterData.tokensLocked,
                    voterData.lockupDuration,
                    votingContract
                )
                setCumulativeRewards(userRewards)
                setTokensLocked(voterData.tokensLocked)

                if (seederStruct > 0) {
                    setIsSeeder(true)
                }
            }
            if (votingContract) {
                const supporterStruct = await votingContract.methods
                    .supporters(walletAddress)
                    .call()

                if (supporterStruct.claimed > 0) {
                    setHasClaimed(true)
                }
            }
            if (tokenContract) {
                const balance = await tokenContract.methods
                    .balanceOf(walletAddress)
                    .call()
                setEglBalance(balance)
            }
        } else {
            setHasContributed(false)
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
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload()
        })
    }

    UseRecursiveTimeout(async () => {
        await ticker()
        console.log('ticker called!', ignored)
    }, 1000)

    useEffect(() => {
        ticker()
    }, [])

    const switchRender = (condition) => {
        switch (condition) {
            case 'votingLaunched':
                return (
                    <div className={'w-full'}>
                        <div className={'mt-16'}>
                            <div className={'flex justify-center mb-12'}>
                                <p
                                    onClick={() => router.push('/vote')}
                                    className={clsx(
                                        'cursor-pointer hover:opacity-50 text-2xl mt-2 w-auto',
                                        'inline-block font-bold bg-clip-text text-transparent',
                                        'bg-gradient-to-r from-pink to-pink-dark',
                                        'hover:opacity-50 cursor-pointer font-semibold'
                                    )}
                                >
                                    {'Vote ⭢'}
                                </p>
                            </div>
                            <Vote
                                amountContributed={web3.utils.fromWei(
                                    amountContributed
                                )}
                                contractBalance={contractBalance}
                                web3={web3}
                                contributorCumulativeBalance={
                                    contributorCumulativeBalance
                                }
                                hasClaimed={hasClaimed}
                                votingStartDate={votingStartDate}
                                isPageWide={isPageWide}
                            />
                            <Withdraw
                                className={'mt-4'}
                                votingStartDate={votingStartDate}
                                amountContributed={web3.utils.fromWei(
                                    amountContributed
                                )}
                                contributorCumulativeBalance={
                                    contributorCumulativeBalance
                                }
                                contractBalance={contractBalance}
                                hasClaimed={hasClaimed}
                                poolTokensWithdrawnEvents={
                                    poolTokensWithdrawnEvents
                                }
                                walletAddress={walletAddress}
                                isPageWide={isPageWide}
                                eventWithdraw={eventWithdraw}
                            />
                            <div className={'text-white ml-4 mt-8'}>
                                {!hasClaimed && (
                                    <p>
                                        Bonus EGLs must be used to vote at least
                                        once to be withdrawn.
                                    </p>
                                )}
                                <p>
                                    These numbers are estimates and may be
                                    slightly off due to rounding.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            case 'ended':
                return (
                    <div className={'mt-16'}>
                        {
                            <>
                                <TotalStaked
                                    cumulativeBalance={cumulativeBalance}
                                    onClickJoin={() => setModal(true)}
                                    className={'ml-4 mt-20'}
                                    hasContributed={hasContributed}
                                    walletAddress={walletAddress}
                                    ended={ended}
                                />
                                <div className={'text-white ml-4 mt-8 text-xl'}>
                                    <p>The Genesis has closed.</p>
                                    {walletAddress ? (
                                        <p>
                                            {
                                                'We are currently working on deploying the Balancer Pool and next set of contracts. Please check '
                                            }
                                            <span
                                                onClick={() =>
                                                    window.open(
                                                        'https://discord.gg/5TP84xk535',
                                                        '_blank'
                                                    )
                                                }
                                                className={
                                                    'underline hover:opacity-50 cursor-pointer'
                                                }
                                            >
                                                {'Discord'}
                                            </span>
                                            {' for updates.'}
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                Please connect your wallet to
                                                see your participation.
                                            </p>
                                            <button
                                                className={clsx(
                                                    'rounded-xl mr-10 h-12 font-semibold w-96 mt-8',
                                                    'text-center px-4 py-2 transition duration-500',
                                                    'w-32 border-2 border-salmon text-salmon',
                                                    'hover:bg-salmon hover:border-white hover:text-white'
                                                )}
                                            >
                                                <p className={'font-semibold'}>
                                                    App
                                                </p>
                                            </button>
                                        </>
                                    )}
                                </div>
                                <p
                                    className={
                                        'text-5xl font-bold text-white mt-16'
                                    }
                                >
                                    Awarded to Genesis Participants
                                </p>
                                <YourContribution
                                    className={'mt-12 mb-5'}
                                    amount={amountContributed}
                                    date={dateContributed}
                                />
                                <GenesisAwards
                                    ethAmount={cumulativeBalance}
                                    genesisEnded={ended}
                                />
                            </>
                        }
                    </div>
                )
            case 'contributed':
                return (
                    <div>
                        <Countdown
                            className={clsx(
                                'ml-4',
                                isPageWide ? 'mt-32' : 'mt-8'
                            )}
                        />
                        <TotalStaked
                            cumulativeBalance={cumulativeBalance}
                            onClickJoin={() => setModal(true)}
                            className={'ml-4 mt-20'}
                            hasContributed={hasContributed}
                            walletAddress={walletAddress}
                            ended={ended}
                            isPageWide={isPageWide}
                        />
                        <div className={'text-white ml-4 mt-8 text-xl'}>
                            {walletAddress ? (
                                <>
                                    <p>Thank you for your participation!</p>
                                    <p>
                                        Addresses can only participate once in
                                        the Genesis.
                                    </p>
                                    <p>
                                        {
                                            "If you'd like to participate again, please use another "
                                        }
                                        <span
                                            onClick={() =>
                                                window.open(
                                                    'https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-Create-an-Additional-Account-in-your-MetaMask-Wallet',
                                                    '_blank'
                                                )
                                            }
                                            className={
                                                'underline hover:opacity-50 cursor-pointer'
                                            }
                                        >
                                            {'wallet address.'}
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        Please connect your wallet to see your
                                        participation.
                                    </p>
                                    <button
                                        className={clsx(
                                            'rounded-xl mr-10 h-12 font-semibold w-96 mt-8',
                                            'text-center px-4 py-2 transition duration-500',
                                            'w-32 border-2 border-salmon text-salmon',
                                            'hover:bg-salmon hover:border-white hover:text-white'
                                        )}
                                    >
                                        <p className={'font-semibold'}>App</p>
                                    </button>
                                </>
                            )}
                        </div>
                        <p className={'text-5xl font-bold text-white mt-16'}>
                            Awarded to Genesis Participants
                        </p>
                        <YourContribution
                            className={'mt-12 mb-12'}
                            amount={amountContributed}
                            date={dateContributed}
                        />
                        <GenesisAwards
                            ethAmount={cumulativeBalance}
                            genesisEnded={ended}
                        />
                    </div>
                )
            default:
                return (
                    <div className={'flex flex-col'}>
                        <Countdown
                            className={clsx(
                                'ml-4',
                                isPageWide ? 'mt-32' : 'mt-8'
                            )}
                        />
                        <TotalStaked
                            cumulativeBalance={cumulativeBalance}
                            onClickJoin={() => setModal(true)}
                            className={'ml-4 mt-20'}
                            hasContributed={hasContributed}
                            walletAddress={walletAddress}
                            ended={ended}
                        />
                        <div style={{ width: '90%' }} className={'ml-4 mt-8'}>
                            <p className={'text-white'}>
                                {
                                    'Wallet addresses can only participate once. Please use another '
                                }
                                <span
                                    onClick={() =>
                                        window.open(
                                            'https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-Create-an-Additional-Account-in-your-MetaMask-Wallet',
                                            '_blank'
                                        )
                                    }
                                    className={
                                        'underline hover:opacity-50 cursor-pointer'
                                    }
                                >
                                    {'wallet'}
                                </span>
                                {' if you’d like to ' +
                                    'participate again. Be sure to check etherscan ' +
                                    'for your transaction confirmation.'}
                            </p>
                        </div>
                        <p className={'text-5xl font-bold text-white mt-16'}>
                            Awarded to Genesis Participants
                        </p>
                        <GenesisAwards ethAmount={cumulativeBalance} />
                    </div>
                )
        }
    }

    const imageSwitch = (condition) => {
        switch (condition) {
            case 'contributed':
                return (
                    <div className={'flex -ml-20 w-full'}>
                        <img width={'600'} src={'/eggCracked.png'} />
                    </div>
                )
            case 'votingLaunched':
            case 'ended':
                return null
            default:
                return (
                    <div className={'flex -ml-20 w-full'}>
                        <img width={'600'} src={'/egg.png'} />
                    </div>
                )
        }
    }

    const getCondtion = () => {
        if (votingContract) return 'votingLaunched'
        if (ended) return 'ended'
        if (hasContributed) return 'contributed'
        return 'default'
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
            fixedFooter={true}
            tokensLocked={tokensLocked}
            cumulativeRewards={cumulativeRewards}
            bonusEgls={bonusEgls}
            seederAmount={seederAmount}
        >
            <main
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '82vh',
                    zIndex: 2,
                }}
                className='flex flex-row justify-center'
            >
                <div
                    style={{ width: '100%', height: '100%' }}
                    className={'flex flex-row justify-center h-full'}
                >
                    <div style={{ width: '100%' }}>
                        <div
                            style={{ width: '100%' }}
                            className={'flex flex-col w-full'}
                        >
                            <div style={{ width: '100%' }}>
                                <h1
                                    className={
                                        'text-white text-5xl font-bold mt-16'
                                    }
                                >
                                    EGL Genesis.
                                </h1>
                                <BodyHeader
                                    contractAddress={
                                        contract ? contract._address : ''
                                    }
                                />
                            </div>
                            <div
                                className={
                                    'w-full flex justify-center items-center'
                                }
                            >
                                {!isPageWide &&
                                    getCondtion() !== 'ended' &&
                                    getCondtion() !== 'votingLaunched' && (
                                        <div
                                            style={{ width: '100%' }}
                                            className={
                                                'flex justify-center items-center'
                                            }
                                        >
                                            <div
                                                style={{
                                                    width: '50%',
                                                    maxWidth: '200px',
                                                }}
                                                className={'flex justify-end'}
                                            >
                                                {loading
                                                    ? null
                                                    : imageSwitch(
                                                          getCondtion()
                                                      )}
                                            </div>
                                        </div>
                                    )}
                                <div
                                    style={{ width: '80%' }}
                                    className={'flex'}
                                >
                                    {loading ? (
                                        <LoadingMessage />
                                    ) : (
                                        switchRender(getCondtion())
                                    )}
                                </div>
                            </div>
                        </div>
                        {isPageWide && (
                            <div
                                style={{
                                    maxWidth: '300px',
                                    width: '50%',
                                    marginTop: 'auto',
                                    marginBottom: 'auto',
                                }}
                                className={'flex justify-end items-center'}
                            >
                                {loading ? null : null}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {modal && (
                <ParticipateModal
                    web3={web3}
                    walletAddress={walletAddress}
                    contract={contract}
                    handleOutsideClick={() => {
                        setModal(false)
                        forceUpdate()
                    }}
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
            <Genesis
                accounts={accounts}
                web3={web3}
                contract={contract}
                votingContract={votingContract}
                tokenContract={tokenContract}
            />
        )}
    />
)
