import React from 'react'
import Link from 'next/link'

interface ImgProps {
    className?: string
    src: string
    width?: string
    href: string
}

const Img = ({ className, src, width, href }: ImgProps) => (
    <Link href={href}>
        <a className={className} target='_blank' rel='noreferrer'>
            <img
                className={
                    'my-2 text-white cursor-pointer hover:opacity-50 mr-4'
                }
                width={width || '27px'}
                src={src}
            />
        </a>
    </Link>
)

export default Img
