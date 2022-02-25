import React, { useState } from 'react'
import { truncateEthAddress } from '../lib/helpers'
import copy from 'copy-to-clipboard'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import clsx from 'clsx'

interface ConnectWeb3Parameters {
    (): void
}

interface ConnectWeb3ButtonProps {
    children?: object
    connectWeb3: ConnectWeb3Parameters
    walletAddress?: string
}

interface ButtonProps {
    className?: string
    handleClicked?: any
    children: JSX.Element | JSX.Element[]
}

const Button = ({ className, handleClicked, children }: ButtonProps) => {
    return (
        <button
            className={clsx(
                className,
                'rounded-xl mr-10 font-semibold',
                'text-center transition duration-500'
            )}
            onClick={handleClicked}
        >
            {children}
        </button>
    )
}

export default function ConnectToWeb3Button({
    connectWeb3,
    walletAddress,
}: ConnectWeb3ButtonProps) {
    const [clicked, setClicked] = useState(false)

    const handleSetClicked = () => {
        copy(walletAddress)

        setClicked(true)
        setTimeout(() => setClicked(false), 1000)
    }

    if (!clicked) {
        if (walletAddress) {
            return (
                <Button handleClicked={handleSetClicked}>
                    <div className={'flex items-center justify-center'}>
                        <Jazzicon
                            diameter={20}
                            seed={jsNumberForAddress(walletAddress)}
                        />
                        <p className={'ml-2 font-semibold text-white'}>
                            {truncateEthAddress(walletAddress)}
                        </p>
                    </div>
                </Button>
            )
        } else {
            return (
                <Button
                    className={clsx(
                        'text-black bg-salmon hover:bg-salmon-dark hover:text-white',
                        'hover:border-2 hover:border-white hover:text-white w-32 h-8 rounded-2xl'
                    )}
                    handleClicked={connectWeb3}
                >
                    <p className={'font-semibold'}>Wallet</p>
                </Button>
            )
        }
    } else {
        return (
            <Button className={'text-white px-2'}>
                <p className={''}>Copied!</p>
            </Button>
        )
    }
}