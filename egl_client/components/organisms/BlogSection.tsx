import React from 'react'
import clsx from 'clsx'
import ArticlePreview from '../molecules/ArticlePreview'
import { ARTICLES } from '../lib/constants'
import _ from 'lodash'
import useMediaQuery from '../hooks/UseMediaQuery'

interface BlogSectionProps {
    style?: object
    className?: string
}

export default function BlogSection({ style, className }: BlogSectionProps) {
    let chunks = 1

    let isPageMedium = useMediaQuery('(min-width: 1000px)')
    let isPageWide = useMediaQuery('(min-width: 1400px)')

    if (isPageMedium) chunks = 2
    if (isPageWide) chunks = 3

    const rows = _.chunk(ARTICLES, chunks)

    return (
        <div
            style={{
                ...style,
                paddingTop: '4em',
                paddingLeft: '2em',
                paddingRight: '2em',
                paddingBottom: '4em',
            }}
            className={`${className} bg-dark`}
        >
            <div className={'w-full'}>
                {rows.map((row) => (
                    <div className={'w-full flex flex-row justify-center'}>
                        {row.map((article) => (
                            <ArticlePreview
                                badge={article.badge}
                                title={article.title}
                                summary={article.summary}
                                link={article.link}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
