import React, { useState } from 'react'
import Modal from '../atoms/Modal'
import Button from '../atoms/Button'
import clsx from 'clsx'
import { useForm } from 'react-hook-form'
import { sendEth } from '../lib/contractMethods'
import Spin from '../molecules/Spin'

interface handleOutsideClickParameters {
    (): void
}

interface ParticipateModalProps {
    style?: object
    className?: string
    web3: any
    walletAddress: string
    contract: any
    pending: boolean
    setPending: Function
    handleOutsideClick: handleOutsideClickParameters
}

export default function ParticipateModal({
    style,
    className,
    web3,
    walletAddress,
    contract,
    pending,
    setPending,
    handleOutsideClick,
}: ParticipateModalProps) {
    const [terms, setTerms] = useState(false)
    const [successful, setSuccessful] = useState(false)
    const [error, setError] = useState(null)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()
    const onSubmit = (data) => {
        sendEth(
            web3,
            contract,
            walletAddress,
            data.amount,
            setPending,
            (e) => setError(e),
            setSuccessful
        )
    }

    return (
        <Modal
            handleOutsideClick={handleOutsideClick}
            className={clsx(
                className,
                'w-108 min-h-108 p-10 z-10 ',
                pending && 'overflow-hidden'
            )}
            style={{ zIndex: 10, ...style }}
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
                        <>
                            <h1
                                className={clsx(
                                    'w-full text-center mt-4 text-xl',
                                    'inline-block text-dark font-semibold'
                                )}
                            >
                                {'Transaction Pending...'}
                            </h1>
                        </>
                    </>
                </div>
            ) : (
                <form
                    style={{ minHeight: '40vh' }}
                    onSubmit={handleSubmit(onSubmit)}
                    className={'flex flex-col justify-center items-center'}
                >
                    <h1
                        className={clsx(
                            'w-full text-4xl text-center text-semibold',
                            'inline-block font-bold bg-clip-text text-transparent',
                            'bg-gradient-to-r from-pink to-pink-dark'
                        )}
                    >
                        {'Amount'}
                    </h1>
                    <div
                        className={clsx(
                            'flex my-8 pl-2 flex-row bg-[#EAEAEA]',
                            'rounded-xl border h-12 w-full items-center'
                        )}
                    >
                        <p className={'text-xl ml-2'}>ETH｜</p>
                        <input
                            style={{ appearance: 'textfield' }}
                            {...register('amount')}
                            type='number'
                            step={0.00000000000000001}
                            min={0.0001}
                            placeholder='###'
                            className={'bg-[#EAEAEA] text-xl text-right'}
                            autoFocus
                        />
                    </div>
                    <div className={'flex flex-row items-center'}>
                        <input
                            className={'mr-4 cursor-pointer hover:opacity-50'}
                            name='terms'
                            defaultChecked={terms}
                            onChange={(e: any) => setTerms(e.target.checked)}
                            type='checkbox'
                        />
                        <p
                            onClick={() =>
                                window.open(
                                    'https://eglterms.s3-us-west-1.amazonaws.com/Terms+of+Service.pdf',
                                    '_blank'
                                )
                            }
                            className={
                                'text-[#8A8A8A] cursor-pointer hover:opacity-50'
                            }
                        >
                            {'Accept Terms & Conditions'}
                        </p>
                    </div>
                    <Button
                        className={clsx(
                            'my-8 py-2 px-12 bg-gradient-to-r',
                            terms && 'hover:from-pink-dark hover:to-pink',
                            'from-pink to-pink-dark rounded-3xl'
                        )}
                        disabled={!terms}
                        handleClick={() => {}}
                    >
                        <p className={'text-white text-xl text-semibold'}>
                            SUBMIT
                        </p>
                    </Button>
                    <p className={'text-[#8A8A8A] text-xs mb-3 mx-4'}>
                        {'Note: Each '}{' '}
                        <span
                            onClick={() =>
                                window.open(
                                    'https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-Create-an-Additional-Account-in-your-MetaMask-Wallet',
                                    '_blank'
                                )
                            }
                            className={
                                'underline hover:opacity-50 cursor-pointer'
                            }
                        >
                            {'address'}
                        </span>
                        {' can only participate once in the Genesis. ' +
                            'If you’d like to participate again, you will have to use a different address.'}
                    </p>
                </form>
            )}
        </Modal>
    )
}
