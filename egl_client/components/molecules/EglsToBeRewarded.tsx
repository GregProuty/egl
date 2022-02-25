import clsx from 'clsx'
import React from 'react'

interface EglsToBeRewardedProps {
    style?: object
    className?: string
    amount: string
}

export default function EglsToBeRewarded({
    style,
    className,
    amount,
}: EglsToBeRewardedProps) {
    return (
        <div
            style={style}
            className={clsx(
                className,
                'text-white flex justify-center flex-col w-72'
            )}
        >
            <p
                className={clsx(
                    'text-4xl w-auto inline-block font-bold text-center',
                    'bg-clip-text text-transparent bg-gradient-to-r from-pink to-pink-dark'
                )}
            >
                {amount}
            </p>
            <p className={'text-2xl text-center justify-center'}>
                {'egls to be rewarded'}
            </p>
        </div>
    )
}
