import React from 'react'
import { displayComma, formatUsd, fromWei } from '../lib/helpers'
import { voteExpirationDate } from '../lib/contractMethods'
import m from 'moment'
import clsx from 'clsx'

interface YourVoteProps {
    style?: object
    className?: string
    tokensLocked?: string
    releaseDate?: string
    gasTarget?: string
    lockupDuration?: string
    voterReward?: string
    voteEpoch?: string
    firstEpochStartDate?: string | number
    isPageWide?: boolean
}
interface TdmProps {
    children?: JSX.Element[] | JSX.Element | string
    className?: string
}
const Tdm = ({ children, className }: TdmProps) => (
    <td className={clsx(className, 'pl-3 py-4')}>{children}</td>
)
const Td = ({ children }) => (
    <td className={'text-left h-10 p-2 px-4'}>{children}</td>
)
const Th = ({ children }) => (
    <th className={'text-left text-white p-2 px-4 font-normal text-sm'}>
        {children}
    </th>
)

export default function YourVote({
    style,
    className,
    tokensLocked,
    releaseDate,
    gasTarget,
    lockupDuration,
    voterReward,
    voteEpoch,
    firstEpochStartDate,
    isPageWide,
}: YourVoteProps) {
    const voteValidUntilDate = voteExpirationDate(
        firstEpochStartDate,
        voteEpoch,
        lockupDuration
    )

    return (
        <div
            style={{ width: '100%', ...style }}
            className={`${className} rounded`}
        >
            {isPageWide ? (
                <table className={'w-full rounded overflow-hidden p-4'}>
                    <tr
                        className={
                            'w-full bg-gradient-to-r from-pink to-pink-dark px-2'
                        }
                    >
                        <Th>Desired Gas Limit</Th>
                        <Th>EGLs Voting</Th>
                        <Th>Weeks</Th>
                        <Th>Vote Epoch</Th>
                        <Th>Vote Valid Until Epoch</Th>
                        <Th>Vote Valid Until Date</Th>
                        <Th>Reward EGLs Earned</Th>
                        <Th>EGLs Unlock Date</Th>
                    </tr>
                    <tr className={'w-full bg-white'}>
                        <Td>
                            {gasTarget && gasTarget !== '0'
                                ? displayComma(gasTarget)
                                : '-'}
                        </Td>
                        <Td>
                            {tokensLocked && tokensLocked !== '0'
                                ? formatUsd(fromWei(tokensLocked))
                                : '-'}
                        </Td>
                        <Td>
                            {lockupDuration && lockupDuration !== '0'
                                ? lockupDuration
                                : '-'}
                        </Td>
                        <Td>{voteEpoch}</Td>
                        <Td>
                            {parseFloat(voteEpoch) + parseFloat(lockupDuration)}
                        </Td>
                        <Td>
                            {m
                                .unix(voteValidUntilDate)
                                .format('MM.DD.YY h:mma')}
                        </Td>
                        <Td>
                            {voterReward && voterReward !== '0'
                                ? displayComma(voterReward)
                                : '-'}
                        </Td>
                        <Td>
                            {m(Number(releaseDate) * 1000).format(
                                'MM.DD.YY h:mm a'
                            )}
                        </Td>
                    </tr>
                </table>
            ) : (
                <table
                    style={{ borderCollapse: 'collapse' }}
                    className={'w-full rounded overflow-hidden p-4'}
                >
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Desired Gas Limit</Tdm>
                        <Tdm>
                            {gasTarget && gasTarget !== '0'
                                ? displayComma(gasTarget)
                                : '-'}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>EGLs Voting</Tdm>
                        <Tdm>
                            {tokensLocked && tokensLocked !== '0'
                                ? formatUsd(fromWei(tokensLocked))
                                : '-'}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Weeks</Tdm>
                        <Tdm>
                            {lockupDuration && lockupDuration !== '0'
                                ? lockupDuration
                                : '-'}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Vote Epoch</Tdm>
                        <Tdm>{voteEpoch}</Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Vote Valid Until Epoch</Tdm>
                        <Tdm>
                            {String(
                                parseFloat(voteEpoch) +
                                    parseFloat(lockupDuration)
                            )}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Vote Valid Until Date</Tdm>
                        <Tdm>
                            {m
                                .unix(voteValidUntilDate)
                                .format('MM.DD.YY h:mma')}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>Reward EGLs Earned</Tdm>
                        <Tdm>
                            {voterReward && voterReward !== '0'
                                ? displayComma(voterReward)
                                : '-'}
                        </Tdm>
                    </tr>
                    <tr className={'w-full bg-white border-b border-gray-200'}>
                        <Tdm>EGLs Unlock Date</Tdm>
                        <Tdm>
                            {m(Number(releaseDate) * 1000).format(
                                'MM.DD.YY h:mm a'
                            )}
                        </Tdm>
                    </tr>
                </table>
            )}
        </div>
    )
}
