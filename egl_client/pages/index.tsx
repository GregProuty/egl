import React, { useState } from 'react'
import clsx from 'clsx'
import Img from '../components/atoms/Img'
import Button from '../components/atoms/Button'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useMediaQuery from '../components/hooks/UseMediaQuery'
import { CONDITIONAL_REQUIRE } from '../components/lib/constants'
import BlogSection from '../components/organisms/BlogSection'

const pngImage = '/egl.svg'
const votingBird = '/votingBird.png'
const desiredGasLimit = '/desiredGasLimit.png'
const mineBlock = '/mineBlock.png'
const bloxroute = '/bloxroute.png'
const halborn = '/halborn.png'
const gitbook = '/gitbook.svg'

export default function Index() {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(null)

    const getIsMobile = async () => {
        const isWide = await useMediaQuery('(min-width: 768px)')
        setIsMobile(!isWide)
    }

    getIsMobile()

    let genesisDeployed = false
    try {
        require(`../lib/contracts/EglGenesis.json${CONDITIONAL_REQUIRE}`)
        genesisDeployed = true
    } catch (err) {
        console.log('Genesis not deployed')
    }

    let votingDeployed = false
    try {
        require(`../lib/contracts/EglContract.json${CONDITIONAL_REQUIRE}`)
        votingDeployed = true
    } catch (err) {
        console.log('Voting not deployed')
    }

    if (typeof isMobile !== 'boolean') return null
    return (
        <div
            style={{ height: '100%', overflowX: 'hidden' }}
            className={'bg-dark flex flex-col h-full'}
        >
            <Head>
                <link rel='icon' sizes='32x32' href='egl.svg' />
            </Head>
            {!isMobile ? (
                <>
                    <div className={'w-full h-screen'}>
                        <div
                            style={{
                                width: '100%',
                                height: '90%',
                            }}
                            className={'flex justify-end mr-96'}
                        >
                            <div
                                style={{
                                    height: '100%',
                                    width: '50%',
                                }}
                                className={
                                    'flex items-center justify-start mt-20'
                                }
                            >
                                <img
                                    style={{
                                        marginRight: '45%',
                                        width: '1100px',
                                        right: 0,
                                    }}
                                    className={'mr-96 absolute'}
                                    src={pngImage}
                                />
                            </div>
                            <div
                                style={{
                                    height: '100%',
                                    width: '50%',
                                }}
                                className={
                                    'flex items-center justify-start mt-32'
                                }
                            >
                                <div
                                    style={{ width: '40.5em' }}
                                    className={'p-4 absolute rounded-xl z-10'}
                                >
                                    <div className={'mb-4 text-white'}>
                                        <p
                                            style={{ fontSize: '4rem' }}
                                            className={'font-bold'}
                                        >
                                            INFLUENCE THE GAS LIMIT.
                                        </p>
                                        <p className={'mt-4 text-xl'}>
                                            The Ethereum Eagle project (EGL) is
                                            a community led effort to bridge the
                                            incentive misalignment and lack of
                                            transparency between the community
                                            and block producers (miners).
                                        </p>
                                        <p className={'mt-4 text-xl'}>
                                            EGL holders can influence ETH’s gas
                                            limit and miners are rewarded for
                                            listening to the community’s
                                            preference.
                                        </p>
                                    </div>
                                    {(votingDeployed || genesisDeployed) && (
                                        <Button
                                            className={clsx(
                                                'bg-salmon hover:bg-salmon-dark hover:text-white',
                                                'w-28 h-12 rounded-2xl text-dark'
                                            )}
                                            style={{color: 'white'}}                                            
                                            handleClick={() => {
                                                if (votingDeployed) {
                                                    router.push('/vote')
                                                } else if (genesisDeployed) {
                                                    router.push('/genesis')
                                                } else {
                                                    alert('no abi found')
                                                }
                                            }}
                                        >
                                            <p
                                                className={
                                                    'font-semibold text-center'
                                                }
                                            >
                                                Join Now
                                            </p>
                                        </Button>
                                    )}
                                    <div
                                        className={'flex flex-col mt-8'}
                                    >
                                        <form
                                            action='https://formspree.io/f/xbjqdjbr'
                                            method='POST'
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    height: '3em',
                                                }}
                                            >
                                                <input
                                                    style={{
                                                        minWidth: '70%',
                                                        borderStyle:
                                                            'none',
                                                        borderRadius:
                                                            '5px',
                                                        paddingLeft:
                                                            '2em',
                                                        marginRight:
                                                            '1em',
                                                    }}
                                                    type='email'
                                                    id='notify_value'
                                                    name='email'
                                                    aria-describedby='emailHelp'
                                                    placeholder='Enter your email address'
                                                />
                                                <button
                                                    style={{
                                                        width: '8em',
                                                        borderStyle:
                                                            'none',
                                                        borderRadius:
                                                            '5px',
                                                        fontWeight:
                                                            'bold',
                                                        cursor: 'pointer',
                                                        color: 'white',
                                                        backgroundColor:
                                                            '#995e94',
                                                    }}
                                                    type='submit'
                                                    id='notify'
                                                >
                                                    Notify me
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    <div
                                        style={{
                                            height: '100%',
                                        }}
                                        className={`flex flex-row items-center`}
                                    >
                                        <Img
                                            width={'35px'}
                                            src={'discord.svg'}
                                            href={
                                                'https://discord.gg/5TP84xk535'
                                            }
                                        />
                                        <Img
                                            src={'/discourse.svg'}
                                            href={'https://forum.egl.vote/'}
                                        />
                                        <Img
                                            src={'github.svg'}
                                            href={'https://github.com/eglvote'}
                                        />
                                        <Img
                                            src={'medium.svg'}
                                            href={'https://medium.com/@eglvote'}
                                        />
                                        <Img
                                            src={'twitter.svg'}
                                            href={'https://twitter.com/ETH_EGL'}
                                        />
                                        <Img
                                            src={'/gitbook.svg'}
                                            href={'https://docs.egl.vote/'}
                                        />
                                        <Img
                                            width={'15px'}
                                            src={'/bolt.svg'}
                                            href={
                                                'https://snapshot.org/#/eglvote.eth/'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            'w-full flex justify-center items-center mt-20'
                        }
                    >
                        <div
                            style={{
                                width: '90%',
                                marginBottom: '5%',
                            }}
                        >
                            <div
                                className={'flex flex-row items-center h-full'}
                            >
                                <p
                                    className={
                                        'text-white font-bold text-5xl ml-4'
                                    }
                                >
                                    How EGL Works
                                </p>
                            </div>
                            <div
                                className={
                                    'flex flex-col justify-center items-center h-full mt-24'
                                }
                            >
                                <div
                                    style={{
                                        width: '60em',
                                        border: '1px solid white',
                                        paddingLeft: '4em',
                                        paddingTop: '4em',
                                        paddingBottom: '4em',
                                        borderStyle: 'dashed',
                                        height: '11em',
                                    }}
                                    className={'rounded-xl relative'}
                                >
                                    <p
                                        style={{
                                            marginTop: '-2.35em',
                                            width: '4.5em',
                                        }}
                                        className={
                                            'text-4xl font-bold text-salmon text-center bg-dark'
                                        }
                                    >
                                        01. VOTE
                                    </p>
                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginTop: '2.25em',
                                            marginLeft: '0.25em',
                                            width: '60%',
                                        }}
                                        className={'text-gray-400 text-2xl'}
                                    >
                                        {'Each week EGL holders '}
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            vote
                                        </span>
                                        {' on a desired gas limit.'}
                                    </p>
                                    <img
                                        width={650}
                                        src={votingBird}
                                        style={{
                                            marginTop: '-20em',
                                            marginLeft: '13em',
                                        }}
                                        className={'absolute'}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '60em',
                                        border: '1px solid white',
                                        padding: '4em',
                                        borderStyle: 'dashed',
                                        height: '11em',
                                    }}
                                    className={
                                        'rounded-xl relative flex justify-end mt-48'
                                    }
                                >
                                    <img
                                        width={250}
                                        src={desiredGasLimit}
                                        style={{
                                            marginTop: '-2em',
                                            marginRight: '37.5em',
                                        }}
                                        className={'absolute'}
                                    />
                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginRight: '-8em',
                                            width: '60%',
                                        }}
                                        className={'text-gray-400 text-2xl'}
                                    >
                                        {
                                            'Once a week the desired gas limit is '
                                        }
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            set
                                        </span>
                                        {'.'}
                                    </p>

                                    <p
                                        style={{
                                            marginTop: '-2.35em',
                                            width: '3.75em',
                                            height: '1.25em',
                                            display: 'inline-block',
                                        }}
                                        className={
                                            'text-4xl font-bold text-salmon text-center bg-dark'
                                        }
                                    >
                                        02. SET
                                    </p>
                                </div>
                                <div
                                    style={{
                                        width: '60em',
                                        height: '11em',
                                        border: '1px solid white',
                                        padding: '4em',
                                        borderStyle: 'dashed',
                                    }}
                                    className={'rounded-xl relative mt-48'}
                                >
                                    <p
                                        style={{
                                            marginTop: '-2.35em',
                                            width: '5em',
                                        }}
                                        className={
                                            'text-4xl font-bold text-salmon text-center bg-dark'
                                        }
                                    >
                                        03. CLAIM
                                    </p>
                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginTop: '1.5em',
                                            width: '80%',
                                        }}
                                        className={'text-gray-400 text-2xl'}
                                    >
                                        {'Miners can '}
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            earn
                                        </span>
                                        {
                                            " EGLs by mining a block that follows the EGL holder's vote."
                                        }
                                    </p>
                                    <img
                                        width={400}
                                        src={mineBlock}
                                        style={{
                                            marginTop: '-16em',
                                            marginLeft: '33em',
                                        }}
                                        className={'absolute'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className={
                            'w-full mt-8 flex flex-col justify-center items-center'
                        }
                    >
                        <div
                            style={{
                                width: '90%',
                            }}
                            className={'w-full'}
                        >
                            <p
                                style={{ fontWeight: 700 }}
                                className={'text-5xl text-white '}
                            >
                                From the Blog
                            </p>
                            <p className={'mt-2 text-white text-2xl'}>
                                {'Read more on '}
                                <span
                                    className={
                                        'hover:opacity-50 cursor-pointer underline'
                                    }
                                    onClick={() =>
                                        window.open(
                                            'https://medium.com/@eglvote',
                                            '_blank'
                                        )
                                    }
                                >
                                    Medium
                                </span>
                            </p>
                        </div>
                        <div
                            style={{
                                width: '80%',
                            }}
                        >
                            <BlogSection />
                        </div>
                    </div>
                    <div className={'w-full flex justify-center items-center'}>
                        <div
                            style={{
                                width: '90%',
                                marginTop: '5%',
                            }}
                            className={'flex flex-row items-center'}
                        >
                            <p
                                className={
                                    'text-white text-4xl font-bold w-52 mr-2 ml-4'
                                }
                            >
                                {'Built by '}
                            </p>
                            <Img
                                src={bloxroute}
                                width={'300px'}
                                href={'https://bloxroute.com/'}
                            />
                        </div>
                    </div>
                    <div
                        className={
                            'w-full flex justify-center items-center mt-8'
                        }
                    >
                        <div
                            style={{
                                width: '90%',
                                marginBottom: '5%',
                            }}
                            className={'flex flex-row items-center'}
                        >
                            <p
                                className={
                                    'text-white text-4xl font-bold w-52 mr-2 ml-4'
                                }
                            >
                                {'Audited by '}
                            </p>
                            <Img
                                src={halborn}
                                width={'300px'}
                                href={'https://docs.egl.vote/appendix/audits'}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '15%',
                            zIndex: 0,
                        }}
                        className={'flex items-end flex-col'}
                    >
                        <div
                            style={{ height: '100%', width: '100%' }}
                            className={`flex flex-row justify-center`}
                        >
                            <form
                                action='https://formspree.io/f/xbjqdjbr'
                                method='POST'
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        height: '3em',
                                    }}
                                >
                                    <input
                                        style={{
                                            minWidth: '70%',
                                            borderStyle: 'none',
                                            borderRadius: '5px',
                                            paddingLeft: '2em',
                                            marginRight: '1em',
                                        }}
                                        type='email'
                                        id='notify_value'
                                        name='email'
                                        aria-describedby='emailHelp'
                                        placeholder='Enter your email address'
                                    />
                                    <button
                                        style={{
                                            width: '8em',
                                            borderStyle: 'none',
                                            borderRadius: '5px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            color: 'white',
                                            backgroundColor: '#995e94',
                                        }}
                                        type='submit'
                                        id='notify'
                                    >
                                        Notify me
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div
                            style={{ height: '100%', width: '100%' }}
                            className={`flex flex-row justify-center`}
                        >
                            <div
                                style={{ height: '100%' }}
                                className={`flex flex-row items-center mt-6`}
                            >
                                <Img
                                    className={'mr-4'}
                                    width={'35px'}
                                    src={'discord.svg'}
                                    href={'https://discord.gg/5TP84xk535'}
                                />
                                <Img
                                    className={'mr-4'}
                                    src={'/discourse.svg'}
                                    href={'https://forum.egl.vote/'}
                                />
                                <Img
                                    src={'/github.svg'}
                                    className={'mr-4'}
                                    href={'https://github.com/eglvote'}
                                />
                                <h1
                                    onClick={() =>
                                        window.open(
                                            'https://eglterms.s3-us-west-1.amazonaws.com/Terms+of+Service.pdf',
                                            '_blank'
                                        )
                                    }
                                    className={
                                        'my-2 text-white cursor-pointer hover:opacity-50 mr-8'
                                    }
                                >
                                    Terms
                                </h1>
                                <Img
                                    className={'mr-4'}
                                    src={'medium.svg'}
                                    href={'https://medium.com/@eglvote'}
                                />
                                <Img
                                    className={'mr-4'}
                                    src={'twitter.svg'}
                                    href={'https://twitter.com/ETH_EGL'}
                                />
                                <Img
                                    className={'mr-4'}
                                    src={'/gitbook.svg'}
                                    href={'https://docs.egl.vote/'}
                                />
                                <Img
                                    width={'15px'}
                                    src={'/bolt.svg'}
                                    href={'https://snapshot.org/#/eglvote.eth/'}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={'w-full'}>
                        <div style={{ width: '100%' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: '100%',
                                }}
                                className={'flex justify-start'}
                            >
                                <div className={'mt-10 rounded-xl bg-dark'}>
                                    <div className={'text-white p-4 '}>
                                        <p className={'font-bold text-xl'}>
                                            INFLUENCE THE GAS LIMIT.
                                        </p>
                                        <p className={'mt-4 text-sm'}>
                                            The Ethereum Eagle project (EGL) is
                                            a community led effort to bridge the
                                            incentive misalignment and lack of
                                            transparency between the community
                                            and block producers (miners).
                                        </p>
                                        <p className={'mt-4 text-sm'}>
                                            EGL holders can influence ETH’s gas
                                            limit and miners are rewarded for
                                            listening to the community’s
                                            preference.
                                        </p>
                                    </div>
                                    {(votingDeployed || genesisDeployed) && (
                                        <Button
                                            style={{
                                                width: '6em',
                                                borderStyle:
                                                    'none',
                                                borderRadius:
                                                    '5px',
                                                fontWeight:
                                                    'bold',
                                                height: '2em',
                                                cursor: 'pointer',
                                                color: 'white',
                                                backgroundColor:
                                                    '#f57073',
                                                marginLeft: '10px',
                                            }}
                                            handleClick={() => {
                                                if (votingDeployed) {
                                                    router.push('/vote')
                                                } else if (genesisDeployed) {
                                                    router.push('/genesis')
                                                } else {
                                                    alert('no abi found')
                                                }
                                            }}
                                        >
                                            <p
                                                className={
                                                    'text-sm'
                                                }
                                            >
                                                Join Now
                                            </p>
                                        </Button>
                                    )}
                                    <div
                                        className={
                                            'flex flex-col px-2 mt-4 w-full'
                                        }
                                    >
                                        <form
                                            action='https://formspree.io/f/xbjqdjbr'
                                            method='POST'
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    height: '2em',
                                                }}
                                            >
                                                <input
                                                    style={{
                                                        minWidth: '65%',
                                                        borderStyle:
                                                            'none',
                                                        borderRadius:
                                                            '5px',
                                                        paddingLeft:
                                                            '1em',
                                                        marginRight:
                                                            '1em',
                                                    }}
                                                    type='email'
                                                    id='notify_value'
                                                    name='email'
                                                    aria-describedby='emailHelp'
                                                    placeholder='Enter your email address'
                                                />
                                                <button
                                                    style={{
                                                        width: '6em',
                                                        borderStyle:
                                                            'none',
                                                        borderRadius:
                                                            '5px',
                                                        fontWeight:
                                                            'bold',
                                                        cursor: 'pointer',
                                                        color: 'white',
                                                        backgroundColor:
                                                            '#995e94',
                                                    }}
                                                    type='submit'
                                                    id='notify'
                                                >
                                                    <p
                                                        className={
                                                            'text-sm'
                                                        }
                                                    >
                                                        Notify me
                                                    </p>
                                                </button>
                                            </div>
                                        </form>
                                        <div
                                            style={{
                                                height: '100%',
                                            }}
                                            className={`flex flex-row items-center`}
                                        >
                                            <Img
                                                width={'20px'}
                                                src={'discord.svg'}
                                                href={
                                                    'https://discord.gg/5TP84xk535'
                                                }
                                            />

                                            <Img
                                                width={'20px'}
                                                src={'medium.svg'}
                                                href={
                                                    'https://medium.com/@eglvote'
                                                }
                                            />
                                            <Img
                                                width={'20px'}
                                                src={'github.svg'}
                                                href={
                                                    'https://github.com/eglvote'
                                                }
                                            />
                                            <Img
                                                width={'20px'}
                                                src={'twitter.svg'}
                                                href={
                                                    'https://twitter.com/ETH_EGL'
                                                }
                                            />
                                            <Img
                                                width={'20px'}
                                                src={'/gitbook.svg'}
                                                href={
                                                    'https://docs.egl.vote/'
                                                }
                                            />
                                            <Img
                                                width={'15px'}
                                                src={'/bolt.svg'}
                                                href={
                                                    'https://snapshot.org/#/eglvote.eth/'
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'w-full'}>
                        <div
                            style={{
                                width: '100%',
                                marginTop: '15%',
                                marginBottom: '5%',
                            }}
                        >
                            <div
                                className={'flex flex-row items-center h-full'}
                            >
                                <p
                                    className={
                                        'text-white font-bold text-2xl ml-4'
                                    }
                                >
                                    How EGL Works
                                </p>
                            </div>
                            <div
                                className={
                                    'flex flex-col justify-center items-center h-full mt-24'
                                }
                            >
                                <div
                                    style={{
                                        width: '20em',
                                    }}
                                    className={'rounded-xl relative'}
                                >
                                    <p
                                        className={
                                            'text-2xl font-bold text-salmon'
                                        }
                                    >
                                        01. VOTE
                                    </p>
                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginTop: '1em',
                                            width: '70%',
                                        }}
                                        className={'text-gray-400'}
                                    >
                                        {'Each week EGL holders '}
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            vote
                                        </span>
                                        {' on a desired gas limit.'}
                                    </p>
                                    <img
                                        width={200}
                                        src={votingBird}
                                        style={{
                                            marginTop: '-8em',
                                            marginLeft: '7em',
                                        }}
                                        className={'absolute'}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '20em',
                                    }}
                                    className={
                                        'rounded-xl relative mt-32 flex flex-col items-end justify-end'
                                    }
                                >
                                    <p
                                        style={{
                                            width: '3.75em',
                                            height: '1.25em',
                                            display: 'inline-block',
                                        }}
                                        className={
                                            'text-2xl font-bold text-salmon text-center bg-dark'
                                        }
                                    >
                                        02. SET
                                    </p>

                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginRight: '-1em',
                                            marginTop: '1em',
                                            width: '70%',
                                        }}
                                        className={'text-gray-400'}
                                    >
                                        {
                                            'Once a week the desired gas limit is '
                                        }
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            set
                                        </span>
                                        {'.'}
                                    </p>
                                    <img
                                        width={110}
                                        src={desiredGasLimit}
                                        style={{
                                            marginRight: '14em',
                                            marginTop: '-3em',
                                        }}
                                        className={'relative'}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: '20em',
                                    }}
                                    className={'rounded-xl relative mt-32'}
                                >
                                    <p
                                        className={
                                            'text-2xl font-bold text-salmon '
                                        }
                                    >
                                        03. CLAIM
                                    </p>
                                    <p
                                        style={{
                                            zIndex: 0,
                                            marginTop: '1.5em',
                                            width: '75%',
                                        }}
                                        className={'text-gray-400'}
                                    >
                                        {'Miners can '}
                                        <span
                                            className={'text-white font-bold'}
                                        >
                                            earn
                                        </span>
                                        {
                                            " EGLs by mining a block that follows the EGL holder's vote."
                                        }
                                    </p>
                                    <img
                                        width={150}
                                        src={mineBlock}
                                        style={{
                                            marginTop: '-7em',
                                            marginLeft: '12em',
                                        }}
                                        className={'absolute'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={'w-full flex flex-col justify-start pl-4'}>
                        <div
                            style={{
                                width: '70%',
                                marginTop: '5em',
                            }}
                            className={'flex flex-row items-center'}
                        >
                            <p
                                className={
                                    'text-white text-2xl font-bold w-72 mr-2'
                                }
                            >
                                {'Built by '}
                            </p>
                            <Img
                                src={bloxroute}
                                width={'300px'}
                                href={'https://bloxroute.com/'}
                            />
                        </div>
                        <div
                            style={{
                                width: '70%',
                                marginBottom: '3em',
                            }}
                            className={'flex flex-row items-center'}
                        >
                            <p
                                className={
                                    'text-white text-2xl font-bold w-72 mr-2'
                                }
                            >
                                {'Audited by '}
                            </p>
                            <Img
                                src={halborn}
                                width={'300px'}
                                href={'https://docs.egl.vote/appendix/audits'}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            width: '100%',
                            height: '15%',
                            zIndex: 0,
                        }}
                        className={'flex items-end flex-col'}
                    >
                        <div
                            style={{ height: '100%', width: '100%' }}
                            className={`flex flex-row justify-center`}
                        >
                            <form
                                action='https://formspree.io/f/xbjqdjbr'
                                method='POST'
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        height: '3em',
                                    }}
                                >
                                    <input
                                        style={{
                                            minWidth: '70%',
                                            borderStyle: 'none',
                                            borderRadius: '5px',
                                            paddingLeft: '2em',
                                            marginRight: '1em',
                                        }}
                                        type='email'
                                        id='notify_value'
                                        name='email'
                                        aria-describedby='emailHelp'
                                        placeholder='Enter your email address'
                                    />
                                    <button
                                        style={{
                                            width: '8em',
                                            borderStyle: 'none',
                                            borderRadius: '5px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            color: 'white',
                                            backgroundColor: '#995e94',
                                        }}
                                        type='submit'
                                        id='notify'
                                    >
                                        Notify me
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div
                            style={{ height: '100%', width: '100%' }}
                            className={`flex flex-row justify-center`}
                        >
                            <div
                                style={{ height: '100%' }}
                                className={`flex flex-row items-center mt-6`}
                            >
                                <Img
                                    width={'35px'}
                                    src={'discord.svg'}
                                    href={'https://discord.gg/5TP84xk535'}
                                />
                                <Img
                                    src={'/discourse.svg'}
                                    href={'https://forum.egl.vote/'}
                                />
                                <Img
                                    src={'/github.svg'}
                                    href={'https://github.com/eglvote'}
                                />
                                <h1
                                    onClick={() =>
                                        window.open(
                                            'https://eglterms.s3-us-west-1.amazonaws.com/Terms+of+Service.pdf',
                                            '_blank'
                                        )
                                    }
                                    className={
                                        'my-2 text-white cursor-pointer hover:opacity-50 mr-4'
                                    }
                                >
                                    Terms
                                </h1>
                                <Img
                                    src={'medium.svg'}
                                    href={'https://medium.com/@eglvote'}
                                />
                                <Img
                                    src={'twitter.svg'}
                                    href={'https://twitter.com/ETH_EGL'}
                                />
                                <Img
                                    src={'/gitbook.svg'}
                                    href={'https://docs.egl.vote/'}
                                />
                                <Img
                                    width={'15px'}
                                    src={'/bolt.svg'}
                                    href={'https://snapshot.org/#/eglvote.eth/'}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
