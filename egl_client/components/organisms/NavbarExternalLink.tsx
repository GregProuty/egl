import React from 'react'
import clsx from 'clsx'

interface NavbarExternalLinkProps {
    style?: object
    className?: string
    name: string
    link: string
    isMobile?: boolean
}

export default function NavbarExternalLink({
    style,
    className,
    name,
    link,
    isMobile,
}: NavbarExternalLinkProps) {
    return (
        <div
            className={clsx(
                !isMobile && 'items-center',
                'flex flex-col justify-top cursor-pointer h-16 hover:opacity-50'
            )}
            onClick={() => window.open(link, '_blank')}
        >
            <a
                style={style}
                className={`${className} m-4 font-semibold text-white text-xl`}
            >
                {name}
            </a>
        </div>
    )
}
