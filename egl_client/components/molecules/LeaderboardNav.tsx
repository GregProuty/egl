import React from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'

interface handleClickParameters {
    (): void
}
interface LeaderboardNavProps {
    style?: object
    className?: string
    numberOfPages?: number
    pageNumber?: number
    numberOfEvents: number
    onClickLeft?: handleClickParameters
    onClickRight?: handleClickParameters
    listLength?: number
    viewMore?: boolean
}

export default function LeaderboardNav({
    style,
    className,
    numberOfPages,
    pageNumber,
    numberOfEvents,
    onClickLeft,
    onClickRight,
    listLength = 10,
    viewMore = false,
}: LeaderboardNavProps) {
    const onFirstPage = pageNumber === 0
    const onLastPage = numberOfEvents < listLength
    const router = useRouter()

    return (
        <div
            style={style}
            className={`${className} flex justify-center items-center px-8 h-full`}
        >
            <div
                style={{ width: '45%' }}
                onClick={() => (!onFirstPage ? onClickLeft() : null)}
                className={`px-4 hover:opacity-50 ${
                    !onFirstPage ? 'cursor-pointer' : 'opacity-50'
                }`}
            >
                {!onFirstPage && numberOfPages > 1 && (
                    <p
                        style={{ fontVariant: 'small-caps' }}
                        className={clsx('text-salmon font-bold text-lg')}
                    >
                        {'< Last Page'}
                    </p>
                )}
            </div>
            <div style={{ width: '10%' }}>
                {!viewMore && (
                    <p className={'text-center flex items-start'}>
                        {numberOfPages > 1
                            ? pageNumber + 1 + ' of ' + numberOfPages
                            : '1 of 1'}
                    </p>
                )}
            </div>
            <div
                style={{ width: '45%' }}
                className={`px-4 hover:opacity-50 cursor-pointer`}
            >
                {viewMore ? (
                    <p
                        style={{ fontVariant: 'small-caps' }}
                        className={clsx(
                            'text-salmon font-bold text-lg text-right'
                        )}
                        onClick={() => router.push('/leaderboard')}
                    >
                        {'View Leaderboard >'}
                    </p>
                ) : (
                    !onLastPage &&
                    numberOfPages > 1 && (
                        <p
                            style={{ fontVariant: 'small-caps' }}
                            className={clsx(
                                'text-salmon font-bold text-lg text-right'
                            )}
                            onClick={() =>
                                !onLastPage ? onClickRight() : null
                            }
                        >
                            {'Next Page >'}
                        </p>
                    )
                )}
            </div>
        </div>
    )
}
