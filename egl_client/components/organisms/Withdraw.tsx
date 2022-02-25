import React from 'react'
import m from 'moment'
import {
    getTokenReleaseDate,
    calculateBonusEgls,
    getCurrentSerializedEgl,
    getBptsWithdrawn,
    addCommas,
} from '../lib/helpers'
import web3 from 'web3'
import { totalEglToBalancer, BPTSupply } from '../lib/constants'
import clsx from 'clsx'
import { hasWithdrawn } from '../lib/contractMethods'

interface WithdrawProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    votingStartDate?: string
    amountContributed?: string
    contributorCumulativeBalance?: string
    contractBalance?: string
    hasClaimed?: Boolean
    poolTokensWithdrawnEvents?: any[]
    walletAddress?: string
    isPageWide?: Boolean
    eventWithdraw?: object[]
}

export default function Withdraw({
    style,
    className,
    children,
    votingStartDate,
    amountContributed,
    contributorCumulativeBalance,
    contractBalance,
    poolTokensWithdrawnEvents,
    walletAddress,
    isPageWide,
    eventWithdraw,
}: WithdrawProps) {
    const ethBptRatio = BPTSupply / Number(web3.utils.fromWei(contractBalance))

    const bptDue = Number(amountContributed) * ethBptRatio

    const ethEglRatio =
        totalEglToBalancer / Number(web3.utils.fromWei(contractBalance))
    const firstEgl =
        (Number(web3.utils.fromWei(contributorCumulativeBalance)) -
            Number(amountContributed)) *
        ethEglRatio
    const serializedEgl = Number(amountContributed) * ethEglRatio

    const lastEgl = firstEgl + serializedEgl

    const unlockTokenStartDate = m
        .unix(parseFloat(votingStartDate) + getTokenReleaseDate(firstEgl))
        .unix()

    const unlockTokenEndDate = m
        .unix(parseFloat(votingStartDate) + getTokenReleaseDate(lastEgl))
        .unix()

    const now = m().unix()

    const tokensAvailable = now > unlockTokenStartDate

    const mySerializedEgl =
        Math.min(getCurrentSerializedEgl(votingStartDate), lastEgl) - firstEgl
    const bptUnlocked = (bptDue * mySerializedEgl) / (lastEgl - firstEgl)

    const bonusEglsUnlocked =
        now >= unlockTokenEndDate ? calculateBonusEgls(firstEgl, lastEgl) : 0

    let bptsWithdrawn = getBptsWithdrawn(
        poolTokensWithdrawnEvents,
        walletAddress
    )

    let bonusEglsWithdrawnLabel =
        'All BPT must be withdrawn before Bonus EGLs can be withdrawn. Bonus EGLs are withdrawn all at once'

    const allBptWithdrawn =
        Math.floor(bptUnlocked) - Math.floor(bptsWithdrawn) === 0

    const allTokensWithdrawn = hasWithdrawn(walletAddress, eventWithdraw)

    return (
        <>
            {tokensAvailable && (
                <>
                    <div
                        style={{ flexWrap: !isPageWide ? 'wrap' : 'nowrap' }}
                        className={`${className} flex flex-row justify-center`}
                    >
                        <div
                            style={{
                                ...style,
                                padding: '2em',
                                minWidth: '450px',
                                width: '450px',
                                height: '235px',
                            }}
                            className={`${className} rounded-xl bg-black ${
                                isPageWide && 'mr-8'
                            }`}
                        >
                            <div className={'flex flex-col justify-start'}>
                                <p
                                    className={clsx(
                                        'text-5xl mt-2 w-auto text-white',
                                        'inline-block font-bold'
                                    )}
                                >
                                    {addCommas(Number(bptUnlocked).toFixed(2))}
                                </p>
                                <p
                                    className={clsx(
                                        'text-2xl w-auto',
                                        'inline-block font-bold',
                                        'text-gray-400'
                                    )}
                                >
                                    {'BP Tokens Unlocked'}
                                </p>
                                {bptsWithdrawn === 0 ? (
                                    <div
                                        className={'w-full mt-8 flex flex-row'}
                                    >
                                        <div className={'w-1/2'}>
                                            <p
                                                className={clsx(
                                                    'w-auto',
                                                    'inline-block',
                                                    'text-gray-400'
                                                )}
                                            >
                                                {
                                                    'Withdraw your BPT on the vote page.'
                                                }
                                            </p>
                                        </div>
                                        <span
                                            className={
                                                'text-white text-xl font-bold'
                                            }
                                        >
                                            /
                                        </span>
                                        <div
                                            className={
                                                'w-1/2 flex flex-col items-start ml-4 justify-center'
                                            }
                                        >
                                            <p
                                                className={clsx(
                                                    'text-xl font-semibold text-white'
                                                )}
                                            >
                                                {addCommas(
                                                    Number(
                                                        bptUnlocked -
                                                            bptsWithdrawn
                                                    ).toFixed(2)
                                                )}
                                            </p>
                                            <p
                                                className={clsx(
                                                    'w-auto',
                                                    'inline-block',
                                                    'text-gray-400'
                                                )}
                                            >
                                                {'Unlocked & Remaining'}
                                            </p>
                                        </div>
                                    </div>
                                ) : allBptWithdrawn ? (
                                    <div className={'w-full mt-8'}>
                                        <p
                                            className={
                                                'text-xl font-bold text-white'
                                            }
                                        >
                                            ALL
                                        </p>
                                        <p
                                            className={clsx(
                                                'w-auto',
                                                'inline-block',
                                                'text-gray-400'
                                            )}
                                        >
                                            {'BPT have been withdrawn'}
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className={'w-full mt-8 flex flex-row'}
                                    >
                                        <div
                                            className={
                                                'w-1/2 flex flex-col items-start justify-start'
                                            }
                                        >
                                            <p
                                                className={clsx(
                                                    'text-xl font-semibold text-white'
                                                )}
                                            >
                                                {addCommas(
                                                    Number(
                                                        bptsWithdrawn
                                                    ).toFixed(2)
                                                )}
                                            </p>
                                            <p
                                                className={clsx(
                                                    'w-auto',
                                                    'inline-block',
                                                    'text-gray-400'
                                                )}
                                            >
                                                {'BPT Withdrawn'}
                                            </p>
                                        </div>
                                        <span
                                            className={
                                                'text-white text-xl font-bold'
                                            }
                                        >
                                            /
                                        </span>
                                        <div
                                            className={
                                                'w-1/2 flex flex-col items-start ml-4 justify-center'
                                            }
                                        >
                                            <p
                                                className={clsx(
                                                    'text-xl font-semibold text-white'
                                                )}
                                            >
                                                {addCommas(
                                                    Number(
                                                        bptUnlocked -
                                                            bptsWithdrawn
                                                    ).toFixed(2)
                                                )}
                                            </p>
                                            <p
                                                className={clsx(
                                                    'w-auto',
                                                    'inline-block',
                                                    'text-gray-400'
                                                )}
                                            >
                                                {'Unlocked & Remaining'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!allBptWithdrawn ? (
                            <div
                                style={{
                                    ...style,
                                    padding: '2em',
                                    width: '450px',
                                    minWidth: '450px',
                                    height: '235px',
                                }}
                                className={`${className} rounded-xl bg-black`}
                            >
                                <div className={'flex flex-col justify-start'}>
                                    <p
                                        className={clsx(
                                            'text-5xl mt-2 w-auto text-white',
                                            'inline-block font-bold'
                                        )}
                                    >
                                        {addCommas(
                                            Number(bonusEglsUnlocked).toFixed(2)
                                        )}
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-2xl w-auto',
                                            'inline-block font-bold',
                                            'text-gray-400'
                                        )}
                                    >
                                        {'Bonus EGLs Unlocked'}
                                    </p>

                                    <p
                                        className={clsx(
                                            'w-auto mt-8',
                                            'inline-block',
                                            'text-gray-400'
                                        )}
                                    >
                                        {bonusEglsWithdrawnLabel}
                                    </p>
                                </div>
                            </div>
                        ) : allTokensWithdrawn ? (
                            <div
                                style={{
                                    ...style,
                                    padding: '2em',
                                    width: '450px',
                                    minWidth: '450px',
                                    height: '235px',
                                }}
                                className={`${className} rounded-xl bg-black`}
                            >
                                <div className={'flex flex-col justify-start'}>
                                    <p
                                        className={clsx(
                                            'text-5xl mt-2 w-auto text-white',
                                            'inline-block font-bold'
                                        )}
                                    >
                                        {addCommas(
                                            Number(bonusEglsUnlocked).toFixed(2)
                                        )}
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-2xl w-auto',
                                            'inline-block font-bold',
                                            'text-gray-400'
                                        )}
                                    >
                                        {'Bonus EGLs Unlocked'}
                                    </p>
                                    <div className={'w-full mt-8'}>
                                        <p
                                            className={
                                                'text-xl font-bold text-white'
                                            }
                                        >
                                            ALL
                                        </p>
                                        <p
                                            className={clsx(
                                                'w-auto',
                                                'inline-block',
                                                'text-gray-400'
                                            )}
                                        >
                                            {'Bonus EGLs have been withdrawn'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    ...style,
                                    padding: '2em',
                                    width: '450px',
                                    minWidth: '450px',
                                    height: '235px',
                                }}
                                className={`${className} rounded-xl bg-black`}
                            >
                                <div className={'flex flex-col justify-start'}>
                                    <p
                                        className={clsx(
                                            'text-5xl mt-2 w-auto text-white',
                                            'inline-block font-bold'
                                        )}
                                    >
                                        {addCommas(
                                            Number(bonusEglsUnlocked).toFixed(2)
                                        )}
                                    </p>
                                    <p
                                        className={clsx(
                                            'text-2xl w-auto',
                                            'inline-block font-bold',
                                            'text-gray-400'
                                        )}
                                    >
                                        {'Bonus EGLs Unlocked'}
                                    </p>
                                    <div className={'w-full mt-8'}>
                                        <p
                                            className={
                                                'text-xl font-bold text-white'
                                            }
                                        >
                                            0.0
                                        </p>
                                        <p
                                            className={clsx(
                                                'w-auto',
                                                'inline-block',
                                                'text-gray-400'
                                            )}
                                        >
                                            {'Bonus EGLs Withdrawn'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    )
}
