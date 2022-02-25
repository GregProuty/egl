import clsx from 'clsx'
import React from 'react'

interface WalletAddressBadgeProps {
    style?: object
    className?: string
    isSeeder: boolean
    isGenesis: boolean
}

export default function WalletAddressBadge({
    style,
    className,
    isSeeder,
    isGenesis,
}: WalletAddressBadgeProps) {
    return (
        <>
            {isSeeder || isGenesis ? (
                <div
                    style={style}
                    className={clsx(className, 'flex justify-center')}
                >
                    <p
                        style={{
                            width: '100%',
                            marginLeft: '-1.5em',
                            border: `1px solid ${
                                isSeeder ? '#FCC201' : '#BBC2C2'
                            }`,
                            color: isSeeder ? '#FCC201' : '#BBC2C2',
                        }}
                        className={clsx('rounded text-center')}
                    >
                        {isSeeder ? 'SIGNALS' : 'GENESIS'}
                    </p>
                </div>
            ) : null}
        </>
    )
}
