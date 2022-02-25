import React, { useState } from 'react'
import NavBar from '../organisms/Navbar'
import Head from 'next/head'
import Footer from '../organisms/Footer'
import ChooseWallet from '../organisms/ChooseWallet'
import { OFAC_ADDRESSES } from '../lib/constants'
import useMediaQuery from '../hooks/UseMediaQuery'
import ConnectToMetamask from '../organisms/ConnectToMetamask'

interface connectWeb3Parameters {
    (setShowChooseWallet): void
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
    votingContract?: any
    fixedFooter?: boolean
    bonusEgls?: string
    tokensLocked?: string
    cumulativeRewards?: string
    seederAmount?: string
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
    votingContract,
    fixedFooter,
    bonusEgls,
    tokensLocked,
    cumulativeRewards,
    seederAmount,
}: GenericPageTemplateProps) {
    const [showChooseWallet, setShowChooseWallet] = useState(false)
    const isOfac = OFAC_ADDRESSES.includes(walletAddress)
    let isPageWide = useMediaQuery('(min-width: 1000px)')
    let isPageTall = useMediaQuery('(min-height: 1350px)')
    // let isMobile = !useMediaQuery('(min-width: 720px)')

    if (isOfac) {
        return <div />
    }
    return (
        <div
            style={{
                ...style,
                height: '100%',
                width: '100%',
            }}
        >
            <Head>
                <link rel='icon' sizes='32x32' href='/egl.svg' />
            </Head>
            <div
                style={{ height: '100%', width: '100%', ...style }}
                className={`${className}`}
            >
                <NavBar
                    walletAddress={walletAddress}
                    showWallet={showWallet}
                    eglBalance={eglBalance}
                    isSeeder={isSeeder}
                    isGenesis={isGenesis}
                    setShowChooseWallet={setShowChooseWallet}
                    votingContract={votingContract}
                    bonusEgls={bonusEgls}
                    tokensLocked={tokensLocked}
                    cumulativeRewards={cumulativeRewards}
                    seederAmount={seederAmount}
                />
                <div
                    style={{
                        zIndex: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignContent: 'center',
                        height: '100%',
                    }}
                    className={'flex justify-center items-center w-full'}
                >
                    <div
                        style={{
                            width: isPageWide ? '70%' : '90%',
                            height: '100%',
                        }}
                        className={'h-full flex flex-col'}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                zIndex: 0,
                                minHeight: '700px',
                            }}
                        >
                            {children}
                            {showChooseWallet && (
                                <ChooseWallet
                                    walletAddress={walletAddress}
                                    handleOutsideClick={() =>
                                        setShowChooseWallet(false)
                                    }
                                    connectWeb3={() =>
                                        connectWeb3(setShowChooseWallet)
                                    }
                                />
                            )}
                        </div>
                        <div
                            style={
                                isPageTall && fixedFooter
                                    ? {
                                          width: '100%',
                                          position: 'fixed',
                                          bottom: 0,
                                          left: 0,
                                          right: 0,
                                      }
                                    : {
                                          width: '100%',
                                      }
                            }
                        >
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
