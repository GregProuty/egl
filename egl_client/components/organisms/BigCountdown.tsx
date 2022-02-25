import React, { useState, useEffect } from 'react'
import { zeroPad } from '../lib/helpers'
import m from 'moment'
import { launchTime } from '../lib/constants'

interface CountdownProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    numFontSize?: string
    labelFontSize?: string
}

interface DigitProps {
    num: number
    label: string
    className?: string
    style?: object
    numFontSize?: string
    labelFontSize?: string
}

const Digit = ({
    num,
    label,
    className,
    style,
    numFontSize,
    labelFontSize,
}: DigitProps) => (
    <div
        style={style}
        className={`${className} w-full border-white border-r-2 flex flex-col justify-center`}
    >
        <div className={'mb-4'}>
            <p
                style={{ fontSize: numFontSize ? numFontSize : '6em' }}
                className={'text-salmon text-5xl text-center'}
            >
                {zeroPad(String(num), 2)}
            </p>
        </div>
        <div
            style={{
                fontSize: labelFontSize ? labelFontSize : '1.875rem',
            }}
            className={'text-[#C0C0C0] text-center'}
        >
            {label}
        </div>
    </div>
)

export default function Countdown({
    style,
    className,
    children,
    numFontSize,
    labelFontSize,
}: CountdownProps) {
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            const end = launchTime
            const now = m().unix()
            const timeLeft = m.duration(end - now, 'seconds')

            setDays(m.unix(end).diff(m.unix(now), 'days'))
            setHours(timeLeft.hours())
            setMinutes(timeLeft.minutes())
            setSeconds(timeLeft.seconds())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div
            style={style}
            className={`${className} w-full flex flex-row justify-center`}
        >
            <Digit
                numFontSize={numFontSize}
                labelFontSize={labelFontSize}
                className={'ml-0'}
                num={days}
                label={'days'}
            />
            <Digit
                labelFontSize={labelFontSize}
                numFontSize={numFontSize}
                num={hours}
                label={'hours'}
            />
            <Digit
                labelFontSize={labelFontSize}
                numFontSize={numFontSize}
                num={minutes}
                label={'minutes'}
            />
            <Digit
                labelFontSize={labelFontSize}
                numFontSize={numFontSize}
                style={{ border: 'none' }}
                className={'border-0'}
                num={seconds}
                label={'seconds'}
            />
        </div>
    )
}
