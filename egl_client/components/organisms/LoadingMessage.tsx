import clsx from 'clsx'
import React from 'react'
import Spin from '../molecules/Spin'

interface LoadingMessageProps {
    className?: string
    children?: JSX.Element | JSX.Element[]
    style?: object
    message?: string
}

export default function LoadingMessage({
    className,
    children,
    style,
    message,
}: LoadingMessageProps) {
    return (
        <div
            style={{ ...style }}
            className={
                'fixed inset-0 flex flex-col items-center justify-center h-screen'
            }
        >
            <div
                style={{ animation: `fadeIn .75s`, zIndex: 2 }}
                className={clsx(
                    className,
                    'flex flex-col justify-center items-center'
                )}
            >
                <Spin />
                <p className={'text-white text-center font-bold text-xl'}>
                    {message ? message : '... Loading block data'}
                </p>
            </div>

            <div
                style={{ zIndex: 0 }}
                className='fixed inset-0 bg-black opacity-25 '
            />
        </div>
    )
}
