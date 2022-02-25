import React from 'react'
import { addCommas, formFormat, fromWei } from '../lib/helpers'
import m from 'moment'

interface YourContributionProps {
    style?: object
    className?: string
    amount?: string
    date?: string
}

const Td = ({ children }) => (
    <td className={'text-left h-10 p-2 px-4'}>{children}</td>
)
const Th = ({ children }) => (
    <th className={'text-left text-white p-2 px-4 font-normal text-sm'}>
        {children}
    </th>
)

export default function YourContribution({
    style,
    className,
    amount,
    date
}: YourContributionProps) {
    return Number(amount) > 0 ? (        
        <div
            style={{ width: '100%', ...style }}
            className={`${className} rounded`}
        >
            <table className={'w-full rounded overflow-hidden p-4'}>
                <tr
                    className={
                        'w-full bg-gradient-to-r from-pink to-pink-dark px-2'
                    }
                >
                    <Th>Your Contributed Amount</Th>
                    <Th>Date Contributed</Th>
                </tr>
                <tr className={'w-full bg-white'}>
                    <Td>
                        {amount && amount !== '0'
                            ? formFormat(fromWei(amount))
                            : '-'} ETH
                    </Td>
                    <Td>
                        {m(Number(date) * 1000).format('MM.DD.YY h:mm a')}
                    </Td>
                </tr>
            </table>
        </div>
    ) : <span />
}
