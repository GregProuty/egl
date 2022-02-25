import React from 'react'
import clsx from 'clsx'

interface BodyHeaderProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    contractAddress?: string
}

export default function BodyHeader({
    style,
    className,
    children,
    contractAddress,
}: BodyHeaderProps) {
    return (
        <div style={style} className={`${className}`}>
            <div className={'flex flex-col'}>
                <p
                    className={clsx(
                        'bg-clip-text text-transparent mt-2',
                        'bg-gradient-to-r from-pink to-pink-dark'
                    )}
                >
                    <span
                        className={clsx(
                            'cursor-pointer hover:text-pink hover:opacity-50',
                            'inline-block font-bold text-xl w-auto'
                        )}
                        onClick={() =>
                            window.open('https://docs.egl.vote/', '_blank')
                        }
                    >
                        {'Learn more'}
                    </span>
                    <span
                        className={clsx(
                            'text-xl w-auto',
                            'inline-block font-bold ml-2'
                        )}
                        onClick={() =>
                            window.open('https://docs.egl.vote/', '_blank')
                        }
                    >
                        |
                    </span>
                    <span
                        className={clsx(
                            'cursor-pointer hover:text-pink hover:opacity-50',
                            'inline-block font-bold mx-2 text-xl w-auto'
                        )}
                        onClick={() => window.open('https://app.balancer.fi/#/pool/0xB0401AB1108BD26C85A07243DFDF09F4821D76A200020000000000000000007F', '_blank')}
                    >
                        {'ETH - EGL Pool'}
                    </span>
                    <span
                        className={clsx(
                            'text-xl w-auto',
                            'inline-block font-bold mr-2'
                        )}
                        onClick={() =>
                            window.open('https://docs.egl.vote/', '_blank')
                        }
                    >
                        |
                    </span>
                    <span
                        className={clsx(
                            'cursor-pointer hover:text-pink hover:opacity-50',
                            'inline-block font-bold text-xl w-auto'
                        )}
                        onClick={() =>
                            window.open(
                                'https://etherscan.io/address/' +
                                    contractAddress,
                                '_blank'
                            )
                        }
                    >
                        {'Contract'}
                    </span>
                </p>
            </div>
        </div>
    )
}
