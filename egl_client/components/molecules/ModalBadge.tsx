import clsx from 'clsx'
import React from 'react'

interface ModalBadgeProps {
    style?: object
    className?: string
    isSeeder: boolean
    isGenesis: boolean
}

export default function ModalBadge({
    style,
    className,
    isSeeder,
    isGenesis,
}: ModalBadgeProps) {
    return (
        <>
            {isSeeder || isGenesis ? (
                <div style={style} className={clsx(className, 'w-full')}>
                    <p
                        style={{
                            backgroundColor: isSeeder ? '#9900FF' : '#3F85F4',
                            width: '5em',
                        }}
                        className={'text-center text-white px-2 rounded'}
                    >
                        {isSeeder ? 'SIGNALS' : 'GENESIS'}
                    </p>
                </div>
            ) : null}
        </>
    )
}
