import React, { useState } from 'react'
import Modal from '../atoms/Modal'
import Button from '../atoms/Button'
import clsx from 'clsx'
import Line from '../atoms/Line'
import web3 from 'web3'
import { useForm } from 'react-hook-form'
import { increaseAllowance } from '../lib/contractMethods'
import Spin from '../molecules/Spin'

interface handleOutsideClickParameters {
    (): void
}

interface ConnectModalProps {
    style?: object
    className?: string
    handleOutsideClick: handleOutsideClickParameters
    setHasConnected: Function
    votingContract: any
    tokenContract: any
    walletAddress: string
    setPending: Function
    pending: boolean
}

export default function ConnectModal({
    style,
    className,
    handleOutsideClick,
    setHasConnected,
    votingContract,
    tokenContract,
    walletAddress,
    setPending,
    pending,
}: ConnectModalProps) {
    const [checked, setChecked] = useState(false)
    const [error, setError] = useState(null)
    const [successful, setSuccessful] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const handleCheck = (event) => {
        setChecked(event.target.checked)
    }

    const checkKeyDown = (e) => {
        if (e.code === 'Enter') e.preventDefault()
    }

    const onSubmit = (data) => {
        console.log('hello')

        increaseAllowance(
            votingContract,
            tokenContract,
            walletAddress,
            () => {},
            setPending,
            setError,
            setSuccessful
        )

        // tokenContract.methods
        //     .increaseAllowance(
        //         walletAddress,
        //         web3.utils.toWei('500000000000000')
        //     )
        //     .send({ from: walletAddress })
    }

    return (
        <Modal
            handleOutsideClick={handleOutsideClick}
            className={`${className} w-108 min-h-108 p-10 z-10`}
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
                    style={{ minHeight: '30vh' }}
                    onKeyDown={(e) => checkKeyDown(e)}
                    onSubmit={handleSubmit(onSubmit)}
                    className={'flex flex-col justify-center items-center'}
                >
                    <h1
                        className={clsx(
                            'w-full text-3xl text-center text-semibold',
                            'inline-block font-semibold bg-clip-text mb-2'
                        )}
                    >
                        {'CONNECT'}
                    </h1>
                    <Line />
                    <div
                        className={
                            'w-full py-4 flex flex-col justify-center items-center'
                        }
                    >
                        <div className={'w-full text-center inline-block mb-4'}>
                            <p className={'text-darkSalmon text-xl'}>
                                Allow interaction with EGL contract
                            </p>
                        </div>
                    </div>
                    <div className={'flex items-center flex-row'}>
                        <input
                            name='isGoing'
                            type='checkbox'
                            checked={checked}
                            onChange={handleCheck}
                        />
                        <p className={'px-4 text-darkSalmon text-xl mb-2'}>
                            Accept terms and conditions
                        </p>
                    </div>
                    <Button
                        className={clsx(
                            'my-4 py-2 px-8 bg-gradient-to-r',
                            'hover:from-pink-dark hover:to-pink',
                            'from-pink to-pink-dark rounded-xl'
                        )}
                        disabled={!checked}
                        handleClick={() => {
                            // setHasConnected(true)
                        }}
                    >
                        <p className={'text-white text-xl text-semibold'}>
                            SUBMIT
                        </p>
                    </Button>
                </form>
            )}
        </Modal>
    )
}
