import React from 'react'
import clsx from 'clsx'
import Badge from '../atoms/Badge'
import Link from 'next/link'

interface ArticlePreviewProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    title?: string
    summary?: string
    badge?: string
    link?: string
}

export default function ArticlePreview({
    style,
    className,
    title,
    summary,
    badge,
    link,
}: ArticlePreviewProps) {
    return (
        <div
            style={{
                ...style,
                marginRight: '1.5%',
                marginLeft: '1.5%',
                animation: `fadeIn .75s`,
                minWidth: '24rem',
                width: '24rem',
            }}
            className={clsx(
                'mt-8 h-72 rounded-xl p-8 bg-[#404040] text-white',
                'hover:bg-gray-200 hover:cursor-pointer hover:text-black'
            )}
            onClick={() => window.open(link, '_blank')}
        >
            <Badge BadgeType={badge} />
            <p className={clsx('mt-4 font-semibold text-xl')}>{title}</p>
            <p className={clsx('mt-4 ')}>{summary}</p>
        </div>
    )
}
