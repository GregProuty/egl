import React, { useState, useEffect } from 'react'
import { zeroPad } from '../lib/helpers'
import m from 'moment'
import { endTime } from '../lib/constants'
import clsx from 'clsx'

interface VoteCountdownProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    itemsCenter?: boolean
    textColor?: string
    timeToNextEpoch?: any
}

interface DigitProps {
    num: number
    label: string
    className?: string
    itemsCenter?: boolean
    textColor?: string
    style?: object
}

const Digit = ({
    num,
    label,
    className,
    itemsCenter,
    textColor,
    style,
}: DigitProps) => (
    <div
        style={{ ...style }}
        className={clsx(
            className,
            'flex flex-col '
            // itemsCenter ? 'items-start' : 'items-start'
        )}
    >
        <div
            className={
                'text-white  flex justify-center text-5xl font-bold mb-4 h-10'
            }
        >
            {zeroPad(String(num), 2)}
        </div>
        {/* <div
            className={clsx(
                textColor ? textColor : 'text-gray-400',
                'text-2xl border-salmon-dark'
            )}
        >
            {label}
        </div> */}
    </div>
)

interface ColonProps {
    className?: string
    style?: object
}

const Colon = ({ className, style }: ColonProps) => (
    <div style={{ ...style }} className={clsx(className)}>
        <div
            className={
                'text-white text-5xl font-bold mb-4 h-10 flex items-center'
            }
        >
            :
        </div>
    </div>
)

export default function VoteCountdown({
    style,
    className,
    children,
    itemsCenter,
    textColor,
    timeToNextEpoch,
}: VoteCountdownProps) {
    const days = timeToNextEpoch.days()
    const hours = timeToNextEpoch.hours()
    const minutes = timeToNextEpoch.minutes()
    const seconds = timeToNextEpoch.seconds()

    return (
        <div
            style={{
                ...style,
                height: '175px',
                width: '400px',
            }}
            className={`${className} px-4 rounded-xl bg-black`}
        >
            <div style={style} className={'w-96 mt-8 flex flex-row text-white'}>
                <Digit
                    itemsCenter={itemsCenter}
                    style={{ width: '20%' }}
                    num={days}
                    label={'days'}
                    textColor={textColor}
                />
                <Colon />
                <Digit
                    itemsCenter={itemsCenter}
                    style={{ width: '20%' }}
                    num={hours}
                    label={'hrs'}
                    textColor={textColor}
                />
                <Colon />
                <Digit
                    itemsCenter={itemsCenter}
                    style={{ width: '20%' }}
                    num={minutes}
                    label={'min'}
                    textColor={textColor}
                />
                <Colon />
                <Digit
                    itemsCenter={itemsCenter}
                    style={{ width: '20%' }}
                    num={seconds}
                    label={'sec'}
                    textColor={textColor}
                />
            </div>
            <p className={'text-gray-400 ml-2 text-2xl font-bold'}>
                {'Until voting closes'}
            </p>
        </div>
    )
}
