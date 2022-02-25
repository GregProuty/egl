import React from 'react'
import { displayComma, formatUsd, fromWei } from '../lib/helpers'
import m from 'moment'

interface YourWithdrawalProps {
    style?: object
    className?: string
    tokensUnlocked?: string
    withdrawDate?: number
    showWithdrawButton?: boolean
    tokensLocked?: string
    cumulativeRewards?: string
}

const Td = ({ children }) => (
    <td className={'text-left h-10 p-2 px-4'}>{children}</td>
)
const Th = ({ children }) => (
    <th className={'text-left text-white p-2 px-4 font-normal text-sm'}>
        {children}
    </th>
)

export default function YourWithdrawal({
    style,
    className,
    tokensUnlocked,
    withdrawDate,
    showWithdrawButton,
    tokensLocked,
    cumulativeRewards,
}: YourWithdrawalProps) {
    return (
        <div
            style={{ width: !showWithdrawButton ? '24em' : '12em', ...style }}
            className={`${className} rounded`}
        >
            <table className={'w-full rounded overflow-hidden p-4'}>
                <tr
                    className={
                        'w-full bg-gradient-to-r from-pink to-pink-dark px-2'
                    }
                >
                    <Th>EGLs Available to Vote</Th>
                    {!showWithdrawButton && <Th>EGLs Unlock Date</Th>}
                </tr>
                <tr className={'w-full bg-white'}>
                    <Td>
                        {tokensUnlocked && tokensUnlocked !== '0'
                            ? formatUsd(fromWei(tokensUnlocked))
                            : formatUsd(
                                  Number(fromWei(tokensLocked)) +
                                      Number(cumulativeRewards)
                              )}
                    </Td>
                    {!showWithdrawButton && (
                        <Td>
                            {m(withdrawDate * 1000).format('MM.DD.YY h:mm a')}
                        </Td>
                    )}
                </tr>
            </table>
        </div>
    )
}
