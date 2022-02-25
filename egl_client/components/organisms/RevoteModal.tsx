import React, { useState, useEffect } from 'react'
import Modal from '../atoms/Modal'
import Button from '../atoms/Button'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { getLatestGasLimit, revote } from '../lib/contractMethods'
import Spin from '../molecules/Spin'
import Line from '../atoms/Line'
import DragLine from './DragLine'
import ModalBadge from '../molecules/ModalBadge'
import {
    isSeed,
    formatUsd,
    addCommas,
    removeNonNumeric,
    formFormat,
} from '../lib/helpers'
import { MAXIMUM_LOCKUP_PERIODS } from '../lib/constants'
import { labelMapping } from '../lib/constants'

interface handleOutsideClickParameters {
    (): void
}

interface RevoteModalProps {
    style?: object
    className?: string
    web3: any
    walletAddress: string
    handleOutsideClick: handleOutsideClickParameters
    tokenContract: any
    votingContract: any
    voterData: any
    cumulativeRewards: string
    isSeeder: boolean
    isGenesis: boolean
    pending: boolean
    setPending: Function
    unlockTokenEndDate: number
    hasWithdrawnPoolTokens: boolean
}

export default function RevoteModal({
    style,
    className,
    web3,
    walletAddress,
    handleOutsideClick,
    tokenContract,
    votingContract,
    voterData,
    cumulativeRewards,
    isSeeder,
    isGenesis,
    pending,
    setPending,
    unlockTokenEndDate,
    hasWithdrawnPoolTokens,
}: RevoteModalProps) {
    const [error, setError] = useState(null)
    const [sliderPosition, setSliderPosition] = useState({ x: 0, y: 0 })
    const [weeksLocked, setWeeksLocked] = useState('8')
    const [amount, setAmount] = useState('0')
    const [currentGasLimit, setCurrentGasLimit] = useState('0')
    const [desiredLimit, setDesiredLimit] = useState(currentGasLimit)
    const [eglBalance, setEglBalance] = useState('0')
    const [successful, setSuccessful] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const isSignal = isSeed(walletAddress, labelMapping)
    const LineLabel = Number(Number(currentGasLimit) / 1000000).toFixed(1)

    let lockupOptions = [...Array(MAXIMUM_LOCKUP_PERIODS).keys()].map(
        (x) => x + 1
    )
    //     .filter(
    //         (x) =>
    //             Number(
    //                 isGenesis && !hasWithdrawnPoolTokens
    //                     ? unlockTokenEndDate
    //                     : voterData.releaseDate
    //             ) <
    //             m().unix() + Number(epochLengthSeconds) * x
    //     )

    // if (!lockupOptions.length) lockupOptions.push(8)

    useEffect(() => {
        const getGasLimit = async () => {
            const gasLimit = await getLatestGasLimit(web3)
            setCurrentGasLimit(gasLimit)
            setDesiredLimit(gasLimit)

            const balance = await tokenContract.methods
                .balanceOf(walletAddress)
                .call()

            setEglBalance(balance)
        }
        getGasLimit()
    }, [])

    const onSubmit = async (data) => {
        try {
            revote(
                votingContract,
                tokenContract,
                walletAddress,
                removeNonNumeric(amount),
                desiredLimit,
                weeksLocked,
                () => console.log('callback :)'),
                setPending,
                setError,
                setSuccessful
            )
        } catch (e) {
            console.log(e)
        }
    }

    const handlePositionChange = (limit) => {
        if (typeof limit === 'string') limit = limit.replace(/,/g, '')

        // range mapping [-150, 0, 150] -> [3.7M, 6.7M, 9.7M]
        let position = ((limit - Number(currentGasLimit)) / 3000000) * 150 // 150 is max steps

        if (position < -150) position = -150
        if (position > 150) position = 150

        setSliderPosition({ x: position, y: 0 })
    }

    const handleLimitChanged = (limit) => {
        if (typeof limit === 'string') limit = parseInt(limit.replace(/,/g, ''))

        const lowerLimit = Number(currentGasLimit) - 3000000 // 3M is max variance
        const upperLimit = Number(currentGasLimit) + 3000000

        if (limit < lowerLimit) {
            setDesiredLimit(String(lowerLimit))
        } else if (limit > upperLimit) {
            setDesiredLimit(String(upperLimit))
        } else {
            setDesiredLimit(limit)
        }
    }

    const handleDrag = (data) => {
        const steps = data.x

        // range mapping [-150, 0, 150] -> [3.7M, 6.7M, 9.7M]
        const newLimit = Number(currentGasLimit) + steps * 20000 // 3M / 150 = 20000

        setDesiredLimit(String(newLimit))
        handlePositionChange(newLimit)
    }

    const handleChangeLimit = (event) => {
        setDesiredLimit(addCommas(removeNonNumeric(event.target.value)))
    }

    const handleChangeAmount = (event) => {
        setAmount(formFormat(event.target.value))
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handlePositionChange(event.target.value)
        }
    }

    const checkKeyDown = (e) => {
        if (e.code === 'Enter') e.preventDefault()
    }

    return (
        <Modal
            handleOutsideClick={handleOutsideClick}
            className={`${className} w-108 min-h-108 p-10 z-10 ${
                pending && 'overflow-hidden'
            }`}
            style={{ ...style }}
        >
            {error ? (
                <div
                    style={{ minHeight: '40vh' }}
                    className={'flex justify-center items-center flex-col'}
                >
                    <h1
                        className={clsx(
                            'w-full text-xl text-center text-semibold mt-4',
                            'inline-block font-bold bg-clip-text'
                        )}
                    >
                        {'Transaction Failed'}
                    </h1>
                    <p>{'Check Metamask for details'}</p>
                </div>
            ) : successful ? (
                <div
                    style={{ minHeight: '40vh' }}
                    className={'flex justify-center items-center flex-col'}
                >
                    <>
                        <img
                            className={'animate-bounce'}
                            width={150}
                            src={'/check-circle.svg'}
                        />
                        <h1
                            className={clsx(
                                'w-full text-xl text-center text-semibold mt-16',
                                'inline-block font-bold bg-clip-text'
                            )}
                        >
                            {'Transaction Successful!'}
                        </h1>
                    </>
                </div>
            ) : pending ? (
                <div
                    style={{ minHeight: '40vh' }}
                    className={'flex justify-center items-center flex-col'}
                >
                    <>
                        <Spin />
                        <h1
                            className={clsx(
                                'w-full text-xl text-center text-semibold mt-4',
                                'inline-block font-bold bg-clip-text text-[#8A8A8A]'
                            )}
                        >
                            {'Transaction Pending...'}
                        </h1>
                    </>
                </div>
            ) : (
                <form
                    style={{ minHeight: '40vh' }}
                    onSubmit={handleSubmit(onSubmit)}
                    onKeyDown={(e) => checkKeyDown(e)}
                    className={'flex flex-col justify-center items-center'}
                >
                    <ModalBadge isSeeder={isSignal} isGenesis={isGenesis} />
                    <h1
                        className={clsx(
                            'w-full text-3xl text-center text-semibold',
                            'inline-block font-semibold bg-clip-text mb-2'
                        )}
                    >
                        {'REVOTE'}
                    </h1>
                    <Line />
                    <div
                        className={
                            'w-full py-4 flex flex-col justify-center items-center'
                        }
                    >
                        <div className={'w-full flex justify-start mb-4'}>
                            <p className={'text-darkSalmon text-xl'}>
                                Desired Gas Limit
                            </p>
                        </div>
                        <DragLine
                            sliderPosition={sliderPosition}
                            handleDrag={handleDrag}
                            currentGasLimit={currentGasLimit}
                            desiredLimit={desiredLimit}
                            handleChangeLimit={handleChangeLimit}
                            handlePositionChange={handlePositionChange}
                            handleLimitChanged={handleLimitChanged}
                            handleKeyPress={handleKeyPress}
                        />
                        <hr
                            style={{ width: '88%' }}
                            className={'border border-gray-300 -mt-3'}
                        />
                        <div
                            style={{ width: '95%' }}
                            className={
                                'w-full flex flex-row mt-2 text-gray-400'
                            }
                        >
                            <div className={'w-1/3 flex flex-col'}>
                                <p>{`${Number(Number(LineLabel) - 3).toFixed(
                                    1
                                )} M`}</p>
                                <p className={'text-sm ml-1'}>min</p>
                            </div>
                            <div className={'w-1/3 flex flex-col text-center'}>
                                <p>{`${Number(LineLabel).toFixed(1)} M`}</p>
                                <p className={'text-sm'}>current gas limit</p>
                            </div>
                            <div
                                className={
                                    'w-1/3 flex flex-col text-right -mr-2'
                                }
                            >
                                <p>{`${Number(Number(LineLabel) + 3).toFixed(
                                    1
                                )} M`}</p>
                                <p className={'text-sm mr-1'}>max</p>
                            </div>
                        </div>
                    </div>
                    <div className={'w-full'}>
                        <p className={'text-darkSalmon text-xl'}>
                            {'Locked EGLs'}
                        </p>
                        <p className={'text-gray-400'}>
                            {'Initial EGLs Voted'}
                        </p>
                        <div
                            className={clsx(
                                'flex my-4 pl-2 flex-row bg-[#F5F5F5]',
                                'rounded border border-gray-300 h-12 w-full items-center'
                            )}
                        >
                            <p className={'text-xl ml-2 text-[#ACACAC]'}>
                                EGLs｜
                            </p>
                            <input
                                type='text'
                                step={0.001}
                                min={0.001}
                                value={
                                    voterData &&
                                    formatUsd(
                                        Number(
                                            web3.utils.fromWei(
                                                voterData.tokensLocked
                                            )
                                        )
                                    )
                                }
                                placeholder='###'
                                disabled
                                className={
                                    'bg-[#F5F5F5] text text-left flex flex-grow	ml-2'
                                }
                            />
                        </div>
                        <p>{'+'}</p>

                        <p className={'text-gray-400'}>{'Reward EGLs'}</p>
                        <div
                            className={clsx(
                                'flex my-4 pl-2 flex-row bg-[#F5F5F5]',
                                'rounded border border-gray-300 h-12 w-full items-center'
                            )}
                        >
                            <p className={'text-xl ml-2 text-[#ACACAC]'}>
                                EGLs｜
                            </p>
                            <input
                                type='text'
                                step={0.001}
                                min={0.001}
                                value={
                                    voterData &&
                                    formatUsd(Number(cumulativeRewards))
                                }
                                placeholder='###'
                                disabled
                                className={
                                    'bg-[#F5F5F5] text text-left flex flex-grow	ml-2'
                                }
                            />
                        </div>
                        <p>{'+'}</p>
                        <p className={'font-semibold mt-2'}>Additional EGLs</p>
                        <div className={'flex mt-2'}>
                            <p>
                                {'EGLs available:'}
                                <span className={'ml-4'}>
                                    {formatUsd(web3.utils.fromWei(eglBalance))}
                                </span>
                            </p>
                        </div>
                        <div
                            className={clsx(
                                'flex my-4 pl-2 flex-row bg-white',
                                'rounded border border-gray-300 h-12 w-full items-center'
                            )}
                        >
                            <p className={'text-xl ml-2 text-[#ACACAC]'}>
                                EGLs｜
                            </p>
                            <input
                                {...register('amount')}
                                type='text'
                                step={0.001}
                                min={0.001}
                                value={amount}
                                onChange={(e) => handleChangeAmount(e)}
                                placeholder='###'
                                className={
                                    'bg-white text text-left flex flex-grow	ml-2'
                                }
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className={'w-full'}>
                        <p className={'text-darkSalmon text-xl mb-2'}>Weeks</p>
                        <select
                            name='weeksLocked'
                            className={
                                'w-32 h-12 text rounded border border-gray-300 pl-3'
                            }
                            value={weeksLocked}
                            onChange={(e) => {
                                setWeeksLocked(e.target.value)
                            }}
                        >
                            {lockupOptions.map((i) => (
                                <option
                                    value={String(i)}
                                    label={`${i} Week${i !== 1 ? 's' : ''}`}
                                    key={i}
                                >{`${i} Week${i !== 1 ? 's' : ''}`}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        className={clsx(
                            'my-4 py-2 px-8 bg-gradient-to-r',
                            'hover:from-pink-dark hover:to-pink',
                            'from-pink to-pink-dark rounded-xl'
                        )}
                        handleClick={() => {}}
                    >
                        <p className={'text-white text-xl text-semibold'}>
                            SUBMIT
                        </p>
                    </Button>
                    <p className={'text-gray-400 text-xs w-full'}>
                        {
                            'You can change your vote for a given epoch while voting is still open using the re-vote function. See documentation for more information.'
                        }
                    </p>
                </form>
            )}
        </Modal>
    )
}
