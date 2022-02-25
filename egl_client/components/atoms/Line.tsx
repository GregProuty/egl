import React from 'react'
import clsx from 'clsx'

interface LineProps {
    className?: string
    style?: object
}

const Line = ({ className, style }: LineProps) => (
    <hr
        className={clsx(className, 'w-full')}
        style={{ ...style, border: '1px solid black' }}
    />
)

export default Line
