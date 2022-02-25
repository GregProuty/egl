import React, { useState } from 'react'
import axios from 'axios'
import {
    coinListStakedAmount,
    ethPriceApi,
    totalEglToBalancer,
} from '../lib/constants'
import { addCommas } from '../lib/helpers'
import GenesisAwardsLine from './GenesisAwardsLine'

interface GenesisAwardsProps {
    style?: object
    className?: string
    ethAmount?: string
    eglAmount?: string
    genesisEnded?: boolean
}

export default function GenesisAwards({
    style,
    className,
    ethAmount,
    eglAmount = '1.25B',
    genesisEnded,
}: GenesisAwardsProps) {
    const [ethPrice, setEthPrice] = useState(0)

    axios.get(ethPriceApi).then((resp) => {
        setEthPrice(resp.data.result.ethusd)
    })
    
    const barHeight = genesisEnded ? '90%' : '65%'

    const committedEth = Math.round(coinListStakedAmount + Number(ethAmount))
    const committedEthValue = getEthUsdValue(committedEth)
    const committedEthPricePerEgl = getEglUnitPrice(committedEthValue)    
    const committedEglValue = getTotalEglValue(committedEthPricePerEgl)

    const level2Eth = Math.ceil((Number(committedEth) + 1000) / 1000) * 1000
    const level2Value = getEthUsdValue(level2Eth)
    const level2PricePerEgl = getEglUnitPrice(level2Value)
    const level2EglValue = getTotalEglValue(level2PricePerEgl)

    const level3Eth = level2Eth + 1000
    const level3Value = getEthUsdValue(level3Eth)
    const level3PricePerEgl = getEglUnitPrice(level3Value)
    const level3EglValue = getTotalEglValue(level3PricePerEgl)

    function getEglUnitPrice(ethValue) {
        return ethValue / totalEglToBalancer
    }

    function getEthUsdValue(totalEth) {        
        return totalEth * ethPrice
    }

    function getTotalEglValue(pricePerEgl) {
        return Math.round((pricePerEgl * 1250000000) / 1000000)
    }

    return (
        <div
            style={{ height: '32em', width: '26em' }}
            className={`${className} flex flex-col justify-center items-center`}
        >
            <div
                style={{ marginBottom: '1rem', width: '100%' }}
                className={'flex flex-row items-center'}
            >
                <p
                    style={{ marginLeft: '2rem', width: '8rem' }}
                    className={'text-white text-center'}
                >
                    ETH Committed
                </p>
                <p
                    style={{ marginLeft: '6rem', width: '8rem' }}
                    className={'text-white text-center'}
                >
                    Value of EGLs Awarded
                </p>
            </div>
            <div
                style={{
                    borderRight: '1px solid white',
                    borderLeft: '1px solid white',
                    width: '14em',
                    height: '20em',
                }}
            >
                {!genesisEnded ? (<>
                    <GenesisAwardsLine
                        eglValue={level3EglValue}
                        committedEth={level3Eth}
                        dollarPricePerEgl={level3PricePerEgl}
                        isActive={false}
                    />
                    <GenesisAwardsLine
                        eglValue={level2EglValue}
                        committedEth={level2Eth}
                        dollarPricePerEgl={level2PricePerEgl}
                        isActive={false}
                    />                
                </>) : ''}
                <GenesisAwardsLine
                    eglValue={committedEglValue}
                    committedEth={committedEth}
                    dollarPricePerEgl={committedEthPricePerEgl}
                    isActive={true}
                />
                <div
                    style={{ height: barHeight, marginTop: '-0.5rem' }}
                    className={'flex flex-row w-full'}
                >
                    <div className={'w-1/2 h-full flex justify-end'}>
                        <div
                            style={{
                                marginRight: '0.75rem',
                            }}
                            className={
                                'bg-salmon h-full w-1/2 rounded flex items-center justify-center'
                            }
                        >
                            <div
                                className={
                                    'flex flex-col justify-center w-full'
                                }
                            >
                                <p className={'text-white text-sm text-center'}>
                                    {addCommas(committedEth)}
                                </p>
                                <p className={'text-white text-sm text-center'}>
                                    ETH
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={'w-1/2 h-full flex justify-start'}>
                        <div
                            style={{
                                backgroundColor: '#EF3E5E',
                                marginLeft: '0.75rem',
                            }}
                            className={
                                'h-full w-1/2 rounded flex items-center justify-center'
                            }
                        >
                            <div
                                className={
                                    'flex flex-col justify-center w-full'
                                }
                            >
                                <p className={'text-white text-sm text-center'}>
                                    {eglAmount}
                                </p>
                                <p className={'text-white text-sm text-center'}>
                                    EGLS
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {!genesisEnded ? (
                <>
                    <div
                        style={{ marginTop: '1rem', width: '60%' }}
                        className={'flex flex-col'}
                    >
                        <p
                            style={{ marginLeft: '2.65em' }}
                            className={'text-white text-left'}
                        >
                            Committed
                        </p>
                        <p
                            style={{ marginLeft: '1em' }}
                            className={'text-white text-left text-sm mt-2'}
                        >
                            {'*Includes '}
                            <span
                                className={'hover:opacity-50 cursor-pointer underline'}
                                onClick={() =>
                                    window.open(
                                        'https://sales.coinlist.co/egl',
                                        '_blank'
                                    )
                                }
                            >
                                {'CoinList'}
                            </span>
                            {' ETH that may not have been staked yet'}
                        </p>
                    </div>
                </>
            ) : ""}
        </div>
    )
}
