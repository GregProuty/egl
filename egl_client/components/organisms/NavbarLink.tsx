import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

interface NavBarLinkProps {
    style?: object
    className?: string
    name: string
    isMobile?: boolean
}

export default function NavbarLink({
    style,
    className,
    name,
    isMobile,
}: NavBarLinkProps) {
    const router = useRouter()
    const isCurrentPage = router.pathname.includes(name.toLowerCase())

    return (
        <Link href={`/${name.toLowerCase()}`}>
            <div
                className={clsx(
                    !isMobile && 'items-center',
                    'flex flex-col justify-top cursor-pointer h-16 hover:opacity-50'
                )}
            >
                <a
                    style={style}
                    className={`${className} m-4 font-semibold text-white text-xl`}
                >
                    {name}
                </a>

                {isCurrentPage && !isMobile && (
                    <hr
                        style={{
                            width: '50%',
                            marginTop: '-15px',
                            border: 0,
                            borderBottom: '3px solid #f57073',
                        }}
                        className={clsx(isMobile && 'ml-5')}
                    />
                )}
            </div>
        </Link>
    )
}
