import React, { useState } from 'react'
import { formatFromWei, addCommas, filterVoteEvents } from '../lib/helpers'
import clsx from 'clsx'
import Switch from 'react-switch'
import { labelMapping } from '../lib/constants'
import LeaderboardNav from '../molecules/LeaderboardNav'
import m from 'moment'

interface account {
    caller: string
    eglAmount: string
    gasTarget: string
    lockupDuration: string
}

interface LeaderboardTableProps {
    style?: object
    className?: string
    eventVote?: account[]
    seedAccounts?: any
    listLength?: number
    viewMore?: boolean
    firstEpochStartDate?: string
    epochLengthSeconds?: string
}

interface tProp {
    children: any
    className?: string
    style?: object
}

const P = ({ children, className, style }: tProp) => (
    <p style={{ ...style, fontSize: '12px' }} className={clsx(className, '')}>
        {children}
    </p>
)

const Td = ({ children, className, style }: tProp) => (
    <td style={style} className={clsx(className, 'text-left h-12')}>
        {children}
    </td>
)

const Th = ({ children, className, style }: tProp) => (
    <th
        style={{ ...style, fontVariant: 'small-caps' }}
        className={clsx(className, 'text-left text-gray-400 font-normal')}
    >
        {children}
    </th>
)

export default function LeaderboardTable({
    style,
    className,
    eventVote,
    seedAccounts,
    listLength = 10,
    viewMore,
    firstEpochStartDate,
    epochLengthSeconds,
}: LeaderboardTableProps) {
    let [pageNumber, setPageNumber] = useState(0)
    let [checked, setChecked] = useState(false)

    const seederAddresses = labelMapping.map((label) => label.address)

    // @ts-ignore
    eventVote = filterVoteEvents(
        eventVote,
        firstEpochStartDate,
        epochLengthSeconds
    )

    let rankedVotes = eventVote.map((event, i) => {
        return { ...event, rank: i + 1 }
    })

    if (checked) {
        rankedVotes = rankedVotes.filter((obj) => {
            return seederAddresses.includes(obj.caller)
        })
    }

    let eventsToDisplay =
        rankedVotes.length > listLength
            ? rankedVotes.slice(
                  pageNumber * listLength,
                  pageNumber * listLength + listLength
              )
            : rankedVotes

    const numberOfPages = Math.ceil(rankedVotes.length / listLength)

    return (
        <div
            style={{
                ...style,
                minWidth: '600px',
                width: '100%',
            }}
            className={`${className} pt-4 bg-white rounded-xl`}
        >
            <div
                style={{
                    marginLeft: '2em',
                    marginRight: '2em',
                }}
                className={'border-b-2 py-2 h-12 flex flex-row'}
            >
                <p
                    style={{ fontVariant: 'small-caps', marginRight: '1em' }}
                    className={'text-gray-400 font-bold'}
                >
                    Filter By
                </p>
                <div className={'flex flex-row'}>
                    <p className={'font-bold'} style={{ marginRight: '1em' }}>
                        EGL Signals
                    </p>
                    <div>
                        <Switch
                            onChange={() => setChecked(!checked)}
                            checked={checked}
                            handleDiameter={Math.ceil(28 * 0.8 - 2)}
                            height={Math.ceil(28 * 0.8)}
                            width={Math.ceil(56 * 0.8)}
                        />
                    </div>
                </div>
            </div>
            <div
                style={{
                    marginLeft: '2em',
                    marginRight: '2em',
                }}
            >
                <table style={{ width: '100%' }} className={'w-full'}>
                    <thead>
                        <tr className={'w-full border-b-2 h-12 px-4'}>
                            <Th style={{ width: '15em' }}>
                                <p className={'text-end font-bold'}>Rank</p>
                            </Th>
                            <Th
                                style={{
                                    width: '9em',
                                }}
                            >
                                <p className={'text-right font-bold'}>
                                    Desired Gas Limit
                                </p>
                            </Th>
                            <Th
                                style={{
                                    width: '9em',
                                }}
                            >
                                <p className={'flex justify-end font-bold'}>
                                    EGLs Voting
                                </p>
                            </Th>
                            <Th
                                style={{
                                    width: '9em',
                                }}
                            >
                                <p className={'flex justify-center font-bold'}>
                                    Weeks
                                </p>
                            </Th>
                        </tr>
                    </thead>
                    <tbody style={{ width: '100%' }} className={'mx-8'}>
                        {eventsToDisplay.map((account, i) => {
                            let name = ''
                            let signals = false
                            labelMapping.forEach((obj) => {
                                if (obj.address === account.caller) {
                                    name = obj.label
                                    signals = obj.signals
                                }
                            })

                            return (
                                <tr className={'w-full h-12 border-b-2'}>
                                    <Td>
                                        {name ? (
                                            <div
                                                className={
                                                    'flex flex-row items-end'
                                                }
                                            >
                                                <P
                                                    style={{ width: '1.5em' }}
                                                    className={'w-2 mr-4'}
                                                >
                                                    {account['rank']}
                                                </P>

                                                <P className={'mr-4'}>{name}</P>
                                                {signals && (
                                                    <img
                                                        style={{
                                                            width: '1.75em',
                                                            height: '1.5em',
                                                        }}
                                                        src={'/egl-logo.png'}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={'flex flex-row'}>
                                                <P
                                                    style={{ width: '1.5em' }}
                                                    className={'mr-4'}
                                                >
                                                    {account['rank']}
                                                </P>

                                                <P className={'flex items-end'}>
                                                    {account.caller}
                                                </P>
                                            </div>
                                        )}
                                    </Td>
                                    <Td
                                        style={{
                                            width: '6em',
                                        }}
                                    >
                                        <P className={'text-right'}>
                                            {addCommas(account.gasTarget)}
                                        </P>
                                    </Td>
                                    <Td>
                                        <P className={'text-right'}>
                                            {formatFromWei(
                                                account.eglAmount
                                            ) !== '0'
                                                ? formatFromWei(
                                                      account.eglAmount
                                                  )
                                                : '< 1'}
                                        </P>
                                    </Td>
                                    <Td
                                        style={{ marginRight: '-2em' }}
                                        className={'flex justify-center'}
                                    >
                                        <P className={'flex items-center'}>
                                            {account.lockupDuration}
                                        </P>
                                    </Td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className={'w-full h-12'}>
                <LeaderboardNav
                    viewMore={viewMore}
                    listLength={listLength}
                    numberOfPages={numberOfPages}
                    pageNumber={pageNumber}
                    numberOfEvents={eventsToDisplay.length}
                    onClickLeft={() => {
                        setPageNumber(pageNumber - 1)
                    }}
                    onClickRight={() => {
                        setPageNumber(pageNumber + 1)
                    }}
                />
            </div>
        </div>
    )
}
