import React, { useState, useEffect } from 'react'
import { zeroPad } from '../lib/helpers'
import m from 'moment'
import { endTime } from '../lib/constants'
import clsx from 'clsx'

interface CountdownProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    itemsCenter?: boolean
    textColor?: string
}

interface DigitProps {
    num: number
    label: string
    className?: string
    itemsCenter?: boolean
    textColor?: string
}

const Digit = ({
    num,
    label,
    className,
    itemsCenter,
    textColor,
}: DigitProps) => (
    <div
        className={clsx(
            className,
            'w-20 mr-4 ml-2 flex flex-col',
            itemsCenter ? 'items-center' : 'items-start'
        )}
    >
        <div className={'text-white text-4xl mb-4'}>
            {zeroPad(String(num), 2)}
        </div>
        <div className={clsx('text-gray-400', 'text-xl font-semibold')}>
            {label}
        </div>
    </div>
)

export default function Countdown({
    style,
    className,
    children,
    itemsCenter,
    textColor,
}: CountdownProps) {
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const end = endTime
            const now = m().unix()
            const timeLeft = m.duration(end - now, 'seconds')
            if (timeLeft.asMilliseconds() >= 0) {
                setDays(timeLeft.days())
                setHours(timeLeft.hours())
                setMinutes(timeLeft.minutes())
                setSeconds(timeLeft.seconds())
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div style={style} className={`${className} w-96 flex flex-row`}>
            <Digit
                itemsCenter={itemsCenter}
                className={'ml-0'}
                num={days}
                label={'days'}
                textColor={textColor}
            />
            <Digit
                itemsCenter={itemsCenter}
                num={hours}
                label={'hours'}
                textColor={textColor}
            />
            <Digit
                itemsCenter={itemsCenter}
                num={minutes}
                label={'minutes'}
                textColor={textColor}
            />
            <Digit
                itemsCenter={itemsCenter}
                num={seconds}
                label={'seconds'}
                textColor={textColor}
            />
        </div>
    )
}
