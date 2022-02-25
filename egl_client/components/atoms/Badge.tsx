import React from 'react'
import clsx from 'clsx'

interface BadgeProps {
    style?: object
    className?: string
    BadgeType?: string
}

export default function Badge({ BadgeType }: BadgeProps) {
    return (
        <div
            style={{ width: '9em' }}
            className={clsx(
                'px-3 py-1 rounded-2xl',
                BadgeType === 'Article' &&
                    'bg-[#E0E7FF] text-[#6A67BF] border border-[#6A67BF]',
                BadgeType === 'Documentation' &&
                    'bg-[#FBE7F3] text-[#AD3968] border border-[#AD3968]'
            )}
        >
            <p className={'text-center font-semibold'}>{BadgeType}</p>
        </div>
    )
}
