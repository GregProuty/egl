import React from 'react'
import Modal from '../atoms/Modal'
import clsx from 'clsx'
import useMediaQuery from '../hooks/UseMediaQuery'

interface ConnectToMetamaskProps {
    style?: object
    className?: string
}

export default function ConnectToMetamask({
    style,
    className,
}: ConnectToMetamaskProps) {
    let isMobile = !useMediaQuery('(min-width: 720px)')

    return (
        <Modal
            handleOutsideClick={() => {}}
            className={clsx(className, 'w-108 min-h-108 p-10 z-10')}
            style={{ zIndex: 10, ...style }}
        >
            {isMobile ? (
                <div
                    style={{ height: '20em' }}
                    className={'flex justify-center items-center flex-col'}
                >
                    <img width={150} src={'/metamask.svg'} />
                    <p
                        className={
                            'ml-6 text-xl text-center mb-4 font-semibold'
                        }
                    >
                        {
                            'On mobile please open egl.vote directly in the metamask browser or use on desktop.'
                        }
                    </p>
                    <p
                        onClick={() =>
                            window.open(
                                'https://play.google.com/store/apps/details?id=io.metamask&hl=en_US&gl=US',
                                '_blank'
                            )
                        }
                        className={'underline hover:opacity-50 cursor-pointer'}
                    >
                        {'Android'}
                    </p>
                    <p
                        onClick={() =>
                            window.open(
                                'https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202',
                                '_blank'
                            )
                        }
                        className={'underline hover:opacity-50 cursor-pointer'}
                    >
                        {'iOS'}
                    </p>
                </div>
            ) : (
                <div
                    style={{ height: '20em' }}
                    className={'flex justify-center items-center flex-col'}
                >
                    <img width={150} src={'/metamask.svg'} />
                    <p
                        className={
                            'ml-6 text-xl font-semibold text-center mb-4'
                        }
                    >
                        {
                            'Web3 not found.  Please add Metamask to your browser and refresh the page.'
                        }
                    </p>
                    <p
                        onClick={() =>
                            window.open(
                                'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
                                '_blank'
                            )
                        }
                        className={'underline hover:opacity-50 cursor-pointer'}
                    >
                        {'Chrome'}
                    </p>
                    <p
                        onClick={() =>
                            window.open(
                                'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/',
                                '_blank'
                            )
                        }
                        className={'underline hover:opacity-50 cursor-pointer'}
                    >
                        {'Firefox'}
                    </p>
                </div>
            )}
        </Modal>
    )
}
