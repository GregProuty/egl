import React from 'react'
import clsx from 'clsx'

interface NavBarLinkContainerProps {
    className?: string
    children?: JSX.Element[] | JSX.Element
    open?: boolean
    isMobile?: boolean
}

export default function NavBarLinkContainer({
    className,
    children,
    open,
    isMobile,
}: NavBarLinkContainerProps) {
    return (
        <div
            style={
                isMobile
                    ? {
                          top: 0,
                          left: 0,
                          marginTop: isMobile ? '5.5em' : 0,
                      }
                    : {}
            }
            className={clsx(
                'flex',
                !isMobile
                    ? 'flex-row items-center'
                    : 'absolute flex-col justify-start w-full bg-dark z-10 px-8 height-transition',
                open ? 'height-transition-show' : 'height-transition-hidden'
            )}
        >
            {children}
        </div>
    )
}
