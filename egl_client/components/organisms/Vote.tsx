import clsx from 'clsx'
import React from 'react'
import { BPTSupply, totalEglToBalancer } from '../lib/constants'
import { getTokenReleaseDate, calculateBonusEgls } from '../lib/helpers'
import m from 'moment'
import { useRouter } from 'next/router'
import NumberLabel from '../molecules/NumberLabel'

interface VoteProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    contractBalance: string
    amountContributed: string
    web3: any
    contributorCumulativeBalance: string
    hasClaimed: Boolean
    votingStartDate: string
    isPageWide?: Boolean
}

export default function Vote({
    style,
    className,
    amountContributed,
    contractBalance,
    children,
    contributorCumulativeBalance,
    web3,
    hasClaimed,
    votingStartDate,
    isPageWide,
}: VoteProps) {
    const router = useRouter()

    const ethBptRatio = BPTSupply / Number(web3.utils.fromWei(contractBalance))
    const bptDue = Number(amountContributed) * ethBptRatio
    const ethEglRatio =
        totalEglToBalancer / Number(web3.utils.fromWei(contractBalance))

    const serializedEgl = Number(amountContributed) * ethEglRatio
    const firstEgl =
        (Number(web3.utils.fromWei(contributorCumulativeBalance)) -
            Number(amountContributed)) *
        ethEglRatio
    const lastEgl = firstEgl + serializedEgl

    const unlockTokenStartDate = m
        .unix(parseFloat(votingStartDate) + getTokenReleaseDate(firstEgl))
        .format('MM.DD.YY  h:mma')
    const unlockTokenEndDate = m
        .unix(parseFloat(votingStartDate) + getTokenReleaseDate(lastEgl))
        .format('MM.DD.YY  h:mma')

    return (
        <>
            <div
                style={{ flexWrap: !isPageWide ? 'wrap' : 'nowrap' }}
                className={`${className} flex flex-row justify-center place-items-center`}
            >
                <NumberLabel
                    className={isPageWide && 'mr-8'}
                    number={bptDue ? Number(bptDue).toFixed(2) : '-'}
                    title={'BP Token'}
                    label={`Unlock starting: ${unlockTokenStartDate}`}
                    width={'450px'}
                    style={{ flex: 1, minWidth: '300px' }}
                />
                <NumberLabel
                    className={!isPageWide && 'mt-8'}
                    number={
                        amountContributed === '0'
                            ? '-'
                            : Number(
                                  calculateBonusEgls(firstEgl, lastEgl)
                              ).toFixed(2)
                    }
                    title={'Bonus EGLs'}
                    label={`Unlock: ${unlockTokenEndDate}`}
                    width={'450px'}
                    style={{ flex: 1, minWidth: '300px' }}
                />
            </div>
        </>
    )
}
