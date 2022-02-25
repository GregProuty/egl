import React from 'react'
import { addCommas } from '../lib/helpers'
import clsx from 'clsx'

interface GenesisAwardsProps {
    style?: object
    className?: string
    committedEth?: number
    dollarPricePerEgl?: number
    eglValue?: number
    isActive?: boolean
}

export default function GenesisAwards({
    style,
    className,
    committedEth,
    dollarPricePerEgl,
    eglValue,
    isActive,
}: GenesisAwardsProps) {
    return (
        <div className={'flex flex-col'}>
            <div
                style={{
                    width: '100%',
                }}
                className={'flex flex-row items-center justify-end'}
            >
                <p
                    style={{ marginRight: '3.9em' }}
                    className={clsx(
                        isActive ? 'text-white' : 'text-gray-400',
                        'text-sm w-auto'
                    )}
                >
                    ${eglValue}M
                </p>
            </div>
            <div
                style={{
                    width: '203%',
                    marginLeft: '-43.25%',
                }}
                className={'flex flex-row items-center'}
            >
                <div
                    style={{
                        width: '20%',
                        marginRight: '.25em',
                    }}
                    className={'flex justify-center'}
                >
                    <p
                        className={clsx(
                            isActive ? 'text-white' : 'text-gray-400',
                            'text-sm'
                        )}
                    >{`${addCommas(committedEth)} ETH`}</p>
                </div>
                <div
                    style={{
                        width: '59.5%',
                    }}
                >
                    <hr
                        style={{
                            height: 0,
                            border: isActive
                                ? '1px solid white'
                                : '1px solid #9CA3AF',
                            borderStyle: 'dashed',
                        }}
                    />
                </div>
                <div
                    style={{
                        width: '30%',
                    }}
                    className={'flex justify-center'}
                >
                    <p
                        style={{ width: '7.5em' }}
                        className={clsx(
                            isActive ? 'text-white' : 'text-gray-400',
                            'text-sm'
                        )}
                    >
                        1 EGL = ${dollarPricePerEgl.toFixed(3)}
                    </p>
                </div>
            </div>
        </div>
    )
}
