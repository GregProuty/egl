import React, { useState, useRef } from 'react'
import ConnectToWeb3Button from '../molecules/ConnectToWeb3Button'
import NavbarLinkContainer from './NavbarLinkContainer'
import NavbarLink from './NavbarLink'
import NavbarExternalLink from './NavbarExternalLink'
import useMediaQuery from '../hooks/UseMediaQuery'
import Link from 'next/link'
import clsx from 'clsx'
import web3 from 'web3'
import { displayComma, isSeed } from '../lib/helpers'
import WalletAddressBadge from '../molecules/WalletAddressBadge'
import { labelMapping } from '../lib/constants'
import useOutsideClick from '../hooks/UseOutsideClick'
import { calculateEglsLocked } from '../lib/contractMethods'

interface NavBarProps {
    style?: object
    className?: string
    walletAddress: string
    showWallet: boolean
    eglBalance?: string
    isSeeder?: boolean
    isGenesis?: boolean
    setShowChooseWallet?: Function
    votingContract?: any
    bonusEgls?: string
    tokensLocked?: string
    cumulativeRewards?: string
    seederAmount?: string
}

export default function NavBar({
    style,
    className,
    walletAddress,
    showWallet = true,
    eglBalance,
    isSeeder,
    isGenesis,
    setShowChooseWallet,
    votingContract,
    bonusEgls,
    tokensLocked,
    cumulativeRewards,
    seederAmount,
}: NavBarProps) {
    const [open, setOpen] = useState(false)
    const [iconToggle, setIconToggle] = useState(false)

    const isSignal = isSeed(walletAddress, labelMapping)
    const isWide = useMediaQuery('(min-width: 1000px)')
    const isMobile = !useMediaQuery('(min-width: 720px)')
    const ref = useRef()

    useOutsideClick(ref, () => {
        setOpen(false)
        setIconToggle(false)
    })
    return (
        <header
            ref={ref}
            style={{ ...style, width: '100%' }}
            className={clsx(
                className,
                !isWide && !isMobile && 'ml-4 mt-4',
                'inset-0 flex flex-row h-20 bg-dark justify-center'
            )}
        >
            <div
                style={{ width: isWide ? '72.5%' : '100%' }}
                className={'flex flex-row'}
            >
                <div
                    style={{
                        width: '15%',
                    }}
                    className={'h-20 flex justify-start items-center'}
                >
                    {isMobile ? (
                        <img
                            className={
                                'ml-6 mr-4 hover:opacity-50 cursor-pointer'
                            }
                            width={iconToggle ? '30px' : '50px'}
                            src={iconToggle ? '/x.svg' : '/hamburger.svg'}
                            onClick={() => {
                                setOpen(!open)
                                if (!iconToggle) {
                                    setIconToggle(true)
                                } else {
                                    setIconToggle(false)
                                }
                            }}
                        />
                    ) : (
                        <Link href={'/'}>
                            <div
                                className={clsx(
                                    'cursor-pointer hover:opacity-50 flex flex-direction-row justify-start'
                                )}
                            >
                                <img
                                    src={'/egl.svg'}
                                    style={{
                                        width: '90px',
                                    }}
                                />
                            </div>
                        </Link>
                    )}
                </div>
                <div
                    style={{
                        width: '70%',
                    }}
                    className={clsx(
                        'flex flex-row items-center',
                        isWide && 'justify-center'
                    )}
                >
                    <NavbarLinkContainer open={open} isMobile={isMobile}>
                        {isMobile && (
                            <Link href={'/'}>
                                <div
                                    className={clsx(
                                        'flex flex-col w-32 justify-top cursor-pointer h-full hover:opacity-50'
                                    )}
                                >
                                    <a
                                        style={style}
                                        className={`${className} m-4 font-semibold text-white text-xl`}
                                    >
                                        Home
                                    </a>
                                </div>
                            </Link>
                        )}
                        {isGenesis && (
                            <NavbarLink name={'Genesis'} isMobile={isMobile} />
                        )}
                        <NavbarLink name={'Vote'} isMobile={isMobile} />
                        {!isMobile && (
                            <NavbarLink
                                name={'Leaderboard'}
                                isMobile={isMobile}
                            />
                        )}
                        {!isMobile && (
                            <NavbarExternalLink
                                name={'Forum'}
                                link={'https://forum.egl.vote/'}
                                isMobile={isMobile}
                            />
                        )}
                        <NavbarExternalLink
                            name={'Docs'}
                            link={'https://docs.egl.vote/'}
                            isMobile={isMobile}
                        />
                        <NavbarExternalLink
                            name={'Proposals'}
                            link={'https://snapshot.org/#/eglvote.eth'}
                            isMobile={isMobile}
                        />
                        {/* <NavbarLink name={'Status'} isMobile={isMobile} /> */}
                    </NavbarLinkContainer>
                </div>
                <div
                    style={{
                        width: isWide ? '20%' : '50%',
                        marginTop:
                            (isGenesis || isSignal) && walletAddress
                                ? '30px'
                                : 0,
                    }}
                    className={'flex items-center justify-center'}
                >
                    {showWallet && (
                        <div className={'flex flex-row justify-center'}>
                            {votingContract && walletAddress && (
                                <div
                                    style={{ marginBottom: '-20px' }}
                                    className={clsx(
                                        'flex flex-row mr-8',
                                        isMobile && 'flex-wrap mt-3 '
                                    )}
                                >
                                    {eglBalance !== '0' && (
                                        <div
                                            className={clsx(
                                                'flex flex-col justify-start items-center',
                                                tokensLocked !== '0' ||
                                                    seederAmount !== '0' ||
                                                    bonusEgls !== '0'
                                                    ? 'mr-3'
                                                    : 'mr-5'
                                            )}
                                        >
                                            <div
                                                style={{ height: '1.5em' }}
                                                className={
                                                    'text-white bg-salmon px-4 rounded flex flex-row'
                                                }
                                            >
                                                <p>
                                                    {displayComma(
                                                        web3.utils.fromWei(
                                                            eglBalance
                                                                ? eglBalance
                                                                : '0'
                                                        )
                                                    )}
                                                </p>
                                                <p className={'ml-2'}>EGL</p>
                                            </div>
                                            <span
                                                className={
                                                    'text-white text-xs mt-1 smallCaps'
                                                }
                                            >
                                                in wallet
                                            </span>
                                        </div>
                                    )}
                                    {(tokensLocked !== '0' ||
                                        seederAmount !== '0' ||
                                        bonusEgls !== '0') && (
                                        <div
                                            className={clsx(
                                                'flex flex-col justify-start items-center',
                                                isMobile && 'z-10'
                                            )}
                                        >
                                            <div
                                                style={{ height: '1.5em' }}
                                                className={
                                                    'text-white bg-gray-400 px-4 rounded flex flex-row'
                                                }
                                            >
                                                <p>
                                                    {displayComma(
                                                        calculateEglsLocked(
                                                            seederAmount,
                                                            tokensLocked,
                                                            bonusEgls,
                                                            cumulativeRewards
                                                        )
                                                    )}
                                                </p>
                                                <p className={'ml-2'}>EGL</p>
                                            </div>
                                            <span
                                                className={
                                                    'text-white text-xs w-auto mt-1 smallCaps'
                                                }
                                            >
                                                in contract
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div
                                style={{ width: '8em' }}
                                className={
                                    'flex flex-col items-center justify-center'
                                }
                            >
                                <ConnectToWeb3Button
                                    connectWeb3={() =>
                                        setShowChooseWallet(true)
                                    }
                                    walletAddress={walletAddress}
                                />
                                {(isGenesis || isSignal) && walletAddress && (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '2em',
                                        }}
                                        className={'flex justify-center'}
                                    >
                                        <WalletAddressBadge
                                            style={{ width: '5em' }}
                                            className={'mt-1'}
                                            isSeeder={isSignal}
                                            isGenesis={isGenesis}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
