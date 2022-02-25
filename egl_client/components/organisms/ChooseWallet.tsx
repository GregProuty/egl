import React from 'react'
import Modal from '../atoms/Modal'
import clsx from 'clsx'

interface handleOutsideClickParameters {
    (): void
}

interface ChooseWalletProps {
    style?: object
    className?: string
    walletAddress: string
    handleOutsideClick: handleOutsideClickParameters
    connectWeb3: Function
}

const supportedWallets = [
    { name: 'Metamask', src: '/metamask.svg' },
    { name: 'Status', src: '/status.png' },
    // { name: 'Trust Wallet', src: 'trustWallet.svg' },
]
export default function ChooseWallet({
    style,
    className,
    walletAddress,
    handleOutsideClick,
    connectWeb3,
}: ChooseWalletProps) {
    return (
        <Modal
            handleOutsideClick={handleOutsideClick}
            className={clsx(className, 'w-108 min-h-108 p-10 z-10')}
            style={{ zIndex: 10, ...style }}
        >
            <div style={{ height: '20em' }}>
                <h1
                    className={clsx(
                        'w-full text-2xl text-center text-semibold',
                        'inline-block font-bold bg-clip-text text-transparent',
                        'bg-gradient-to-r from-pink to-pink-dark'
                    )}
                >
                    {'Choose Web Wallet'}
                </h1>
                {supportedWallets.map((wallet) => {
                    return (
                        <div
                            onClick={() => {
                                connectWeb3()
                            }}
                            style={{ height: '4em' }}
                            className={clsx(
                                'webWalletOption border mt-4 rounded-xl flex flex-row items-center',
                                'bg-gray-200 hover:opacity-50 cursor-pointer px-4'
                            )}
                        >
                            <img width={50} src={wallet.src} />
                            <p className={'ml-6 text-xl font-semibold'}>
                                {wallet.name}
                            </p>
                        </div>
                    )
                })}
            </div>
        </Modal>
    )
}
