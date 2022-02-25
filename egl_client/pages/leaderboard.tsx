import React, { useEffect, useState, useReducer } from 'react'
import GenericPage from '../components/pageTemplates/GenericPage'
import Web3Container from '../components/lib/Web3Container'
import connectToWeb3 from '../components/lib/connectToWeb3'
import LeaderboardTable from '../components/organisms/LeaderboardTable'
import { getAllEventsForType } from '../components/lib/contractMethods'
import UseRecursiveTimeout from '../components/hooks/UseRecursiveTimeout'
import LoadingMessage from '../components/organisms/LoadingMessage'
import ConnectToMetamask from '../components/organisms/ConnectToMetamask'
import {
    calculateCumulativeRewards,
    calculateBonusEgls,
} from '../components/lib/contractMethods'
import web3 from 'web3'

declare global {
    interface Window {
        ethereum: any
    }
}

interface LeaderboardProps {
    accounts: any
    web3Reader?: any
    contract: any
    votingContract: any
    tokenContract: any
}

const Leaderboard = ({
    accounts,
    contract,
    votingContract,
    tokenContract,
}: LeaderboardProps) => {
    const [walletAddress, setWalletAddress] = useState(
        accounts ? accounts[0] : null
    )
    const [isSeeder, setIsSeeder] = useState(false)
    const [isGenesis, setIsGenesis] = useState(false)
    const [loading, setLoading] = useState(true)
    const [eglBalance, setEglBalance] = useState('0')
    const [voteEvents, setVoteEvents] = useState([])
    const [firstEpochStartDate, setFirstEpochStartDate] = useState('0')
    const [epochLengthSeconds, setEpochLengthSeconds] = useState('0')
    const [cumulativeRewards, setCumulativeRewards] = useState('0')
    const [tokensLocked, setTokensLocked] = useState('0')
    const [bonusEgls, setBonusEgls] = useState('0')
    const [seederAmount, setSeederAmount] = useState('0')
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

    const ticker = async () => {
        if (tokenContract) {
            if (walletAddress) {
                const balance = await tokenContract.methods
                    .balanceOf(walletAddress)
                    .call()
                setEglBalance(balance)
            }
        }

        if (votingContract) {
            const eventInitialized = await getAllEventsForType(
                votingContract,
                'Initialized'
            )
            const events = await getAllEventsForType(votingContract, 'Vote')
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
            setVoteEvents(events)
            setFirstEpochStartDate(
                eventInitialized[0].returnValues.firstEpochStartDate
            )
            setEpochLengthSeconds(eventInitialized[0].returnValues.epochLength)
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
            const seedAmount = await votingContract.methods
                .seeders(walletAddress)
                .call()

            setSeederAmount(seedAmount)
            setBonusEgls(String(bonusEgls))
        }
        if (walletAddress) {
            const contributorsStruct = await contract.methods
                .contributors(walletAddress)
                .call()

            if (contributorsStruct.amount !== '0') {
                setIsGenesis(true)
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

    UseRecursiveTimeout(async () => await ticker(), 1000)

    useEffect(() => {
        ticker()
    }, [])

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
                }}
                className='flex flex-row'
            >
                <div className={'w-full flex justify-center'}>
                    <div style={{ zIndex: -1 }} className={'top-.5 fixed'}>
                        <img src={'/grey.png'} width={'1000'} height={'1000'} />
                    </div>
                    <div className={'w-full flex flex-col'}>
                        <h1
                            className={
                                'text-5xl text-white font-semibold mt-8 mb-8'
                            }
                        >
                            Leaderboard
                        </h1>
                        {loading ? (
                            <LoadingMessage />
                        ) : (
                            <div style={{ height: '70vh' }}>
                                <div className={'w-full flex justify-center'}>
                                    <LeaderboardTable
                                        listLength={20}
                                        eventVote={voteEvents}
                                        firstEpochStartDate={
                                            firstEpochStartDate
                                        }
                                        epochLengthSeconds={epochLengthSeconds}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
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
        render={({ accounts, contract, votingContract, tokenContract }) => (
            <Leaderboard
                accounts={accounts}
                contract={contract}
                votingContract={votingContract}
                tokenContract={tokenContract}
            />
        )}
    />
)
