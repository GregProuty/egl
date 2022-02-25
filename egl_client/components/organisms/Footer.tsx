import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import classNames from 'classnames'

interface FooterProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
}

interface ImgProps {
    src: string
    width?: string
    href: string
    className?: string
}

const Img = ({ src, width, href, className }: ImgProps) => (
    <Link href={href}>
        <a target='_blank' rel='noreferrer'>
            <img
                className={clsx(
                    className,
                    'my-2 text-white cursor-pointer hover:opacity-50'
                )}
                width={width || '27px'}
                src={src}
            />
        </a>
    </Link>
)

export default function Footer({ style, className, children }: FooterProps) {
    return (
        <div
            style={{ height: '100%', width: '100%', ...style }}
            className={`${className} flex flex-row justify-center items-center mt-6`}
        >
            <Img
                className={'mr-8'}
                width={'35px'}
                src={'/discord.svg'}
                href={'https://discord.gg/5TP84xk535'}
            />
            <Img
                className={'mr-8'}
                src={'/discourse.svg'}
                href={'https://forum.egl.vote/'}
            />
            <Img
                className={'mr-8'}
                src={'/github.svg'}
                href={'https://github.com/eglvote'}
            />
            <h1
                onClick={() =>
                    window.open(
                        'https://eglterms.s3-us-west-1.amazonaws.com/Terms+of+Service.pdf',
                        '_blank'
                    )
                }
                className={
                    'my-2 text-white cursor-pointer hover:opacity-50 mr-8'
                }
            >
                Terms
            </h1>
            <Img
                className={'mr-8'}
                src={'/medium.svg'}
                href={'https://medium.com/@eglvote'}
            />
            <Img
                className={'mr-8'}
                src={'/twitter.svg'}
                href={'https://twitter.com/ETH_EGL'}
            />
            <Img
                className={'mr-8'}
                src={'/gitbook.svg'}
                href={'https://docs.egl.vote/'}
            />
            <Img
                width={'15px'}
                src={'/bolt.svg'}
                href={'https://snapshot.org/#/eglvote.eth/'}
            />
        </div>
    )
}
