import React from 'react'
import clsx from 'clsx'
import { addCommas } from '../lib/helpers'

interface NumberLabelProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    number: string | number
    title: string
    label?: string
    width?: string | number
    labelSize?: string
}

export default function NumberLabel({
    style,
    className,
    children,
    number,
    title,
    label,
    width,
    labelSize,
}: NumberLabelProps) {
    return (
        <div
            style={{
                ...style,
                padding: '2em',
                maxWidth: width || '400px',
                minWidth: width || '400px',
                height: '175px',
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
                    {addCommas(number)}
                </p>
                <p
                    className={clsx(
                        'text-2xl w-auto',
                        'inline-block font-bold',
                        'text-gray-400'
                    )}
                >
                    {title}
                </p>
                <p
                    className={clsx(
                        labelSize,
                        'w-auto',
                        'inline-block',
                        'text-gray-400'
                    )}
                >
                    {label}
                </p>
            </div>
        </div>
    )
}
