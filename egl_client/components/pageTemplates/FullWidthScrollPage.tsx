import React, { useState } from 'react'
import NavBar from '../organisms/Navbar'
import Head from 'next/head'

interface connectWeb3Parameters {
    (): void
}

interface GenericPageTemplateProps {
    style?: object
    className?: string
    children?: JSX.Element[] | JSX.Element
    connectWeb3: connectWeb3Parameters
    walletAddress: string
    showWallet?: boolean
    eglBalance?: string
    isSeeder?: boolean
    isGenesis?: boolean
}

export default function GenericPage({
    style,
    className,
    children,
    connectWeb3 = () => {},
    walletAddress,
    showWallet,
    eglBalance,
    isSeeder,
    isGenesis,
}: GenericPageTemplateProps) {
    const [showChooseWallet, setShowChooseWallet] = useState(false)

    return (
        <div
            style={{
                ...style,
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <Head>
                <link rel='icon' sizes='32x32' href='egl.svg' />
            </Head>
            <div style={{ ...style }} className={`${className} h-full`}>
                <NavBar
                    walletAddress={walletAddress}
                    showWallet={showWallet}
                    eglBalance={eglBalance}
                    isSeeder={isSeeder}
                    isGenesis={isGenesis}
                    setShowChooseWallet={setShowChooseWallet}
                />
                <div
                    style={{
                        width: '100%',
                        zIndex: -1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}
                    className={
                        'flex justify-center items-center bg-dark h-full'
                    }
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                        className={'h-full flex flex-row'}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                zIndex: 1,
                                overflow: 'scroll',
                            }}
                            className={''}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
