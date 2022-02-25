import { BonusEglSupply } from './constants'
import web3 from 'web3'
import BigNumber from 'bignumber.js'
import { getTokenReleaseDate } from './helpers'
import {
    REWARD_MULTIPLIER,
    epochLengthSeconds,
    totalEglToBalancer,
} from './constants'
import m from 'moment'

export const sendEth = (
    web3,
    contract,
    walletAddress,
    amount,
    setPending,
    setError,
    setSuccessful
) => {
    web3.eth
        .sendTransaction({
            from: walletAddress,
            to: contract._address,
            value: web3.utils.toWei(amount),
        })
        .on('transactionHash', function (hash) {
            console.log('transactionHash', hash)
            setPending(true)
        })
        .on('receipt', function (receipt) {
            console.log(receipt)
            setPending(false)
            setSuccessful(true)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
}

export const claimSeederEgls = async (
    votingContract,
    walletAddress,
    desiredLimit,
    weeksLocked,
    setPending,
    setError,
    setSuccessful
) => {
    const response = await votingContract.methods
        .claimSeederEgls(String(desiredLimit), weeksLocked)
        .send({ from: walletAddress })
        .on('transactionHash', function (hash) {
            console.log('transactionHash', hash)
            setPending(true)
        })
        .on('receipt', function (receipt) {
            console.log(receipt)
            setPending(false)
            setSuccessful(true)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
    return response
}
export const claimSupporterEgls = async (
    votingContract,
    walletAddress,
    desiredLimit,
    weeksLocked,
    setPending,
    setError,
    setSuccessful
) => {
    const response = await votingContract.methods
        .claimSupporterEgls(String(desiredLimit), weeksLocked)
        .send({ from: walletAddress })
        .on('transactionHash', function (hash) {
            setPending(true)
        })
        .on('receipt', function (receipt) {
            setPending(false)
            setSuccessful(true)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
    return response
}

export const getLatestGasLimit = async (Web3) => {
    const result = await Web3.eth
        .getBlock('latest', false)
        .then((result, e) => {
            if (e) console.log(e)
            return result.gasLimit
        })
    return result
}

export const vote = async (
    contract,
    token,
    walletAddress,
    eglAmount,
    desiredChange,
    weeksLocked,
    callback,
    setPending,
    setError,
    setSuccessful
) => {
    if (
        !contract ||
        !token ||
        !walletAddress ||
        eglAmount === undefined ||
        desiredChange === undefined ||
        weeksLocked === undefined ||
        eglAmount === '' ||
        desiredChange === '' ||
        weeksLocked === '' ||
        eglAmount < 0 ||
        desiredChange < 0 ||
        weeksLocked < 0
    ) {
        alert('Vote called with invalid parameters')
        return
    }

    const allowance = await token.methods
        .allowance(walletAddress, contract._address)
        .call()

    if (allowance === '0') {
        await token.methods
            .increaseAllowance(
                contract._address,
                web3.utils.toWei('500000000000000')
            )
            .send({ from: walletAddress })
    }

    const response = await contract.methods
        .vote(
            desiredChange, // desired change enum
            web3.utils.toWei(String(eglAmount)),
            String(weeksLocked)
        )
        .send({ from: walletAddress })
        .on('transactionHash', function (hash) {
            setPending(true)
        })
        .on('receipt', function (receipt) {
            setPending(false)
            setSuccessful(true)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
        .then((result, e) => {
            if (!e) {
                console.log('Waiting for tx to be mined...', result)
            } else {
                console.log('Unable to send trans action', e)
            }
            callback()

            return result
        })
        .catch((e) => {
            console.log('eee', e)
            callback()
        })

    return response
}

export const revote = async (
    contract,
    token,
    walletAddress,
    eglAmount,
    desiredChange,
    weeksLocked,
    callback,
    setPending,
    setError,
    setSuccessful
) => {
    if (
        !contract ||
        !token ||
        !walletAddress ||
        eglAmount === undefined ||
        desiredChange === undefined ||
        weeksLocked === undefined ||
        eglAmount === '' ||
        desiredChange === '' ||
        weeksLocked === '' ||
        eglAmount < 0 ||
        desiredChange < 0 ||
        weeksLocked < 0
    ) {
        alert('revote called with invalid parameters')
        return
    }

    const allowance = await token.methods
        .allowance(walletAddress, contract._address)
        .call()

    if (allowance === '0') {
        await token.methods
            .increaseAllowance(
                contract._address,
                web3.utils.toWei('500000000000000')
            )
            .send({ from: walletAddress })
    }

    const response = await contract.methods
        .reVote(desiredChange, web3.utils.toWei(String(eglAmount)), weeksLocked)
        .send({ from: walletAddress })
        .on('transactionHash', function (hash) {
            setPending(true)
        })
        .on('receipt', function (receipt) {
            setPending(false)
            setSuccessful(true)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
        .then((result, e) => {
            if (!e) {
                console.log('Waiting for tx to be mined...', result)
            } else {
                console.log('Unable to send trans action', e)
            }
            callback()
            return result
        })
        .catch((e) => {
            console.log(e)
            callback()
        })

    return response
}

export const calculateCumulativeRewards = async (
    voteEpoch,
    currentEpoch,
    tokensLocked,
    lockupDuration,
    contract
) => {
    if (Number(currentEpoch) > 52) return '0'
    const voteWeight = new BigNumber(tokensLocked).multipliedBy(
        new BigNumber(lockupDuration)
    )

    let totalVoteWeight
    let totalIndividualReward = new BigNumber(0)
    let epochReward

    for (let i = 1; i <= currentEpoch - voteEpoch; i++) {
        const relevantEpoch = currentEpoch - i
        let voterRewardSums = await contract.methods // 1 to lockupdur
            .voterRewardSums(relevantEpoch)
            .call()

        totalVoteWeight = new BigNumber(voterRewardSums)

        epochReward = new BigNumber(REWARD_MULTIPLIER).multipliedBy(
            new BigNumber(52 - relevantEpoch) // epoch numbers
        )

        const individualPercent = voteWeight.dividedBy(voterRewardSums)
        const individualEpochReward =
            epochReward.multipliedBy(individualPercent)

        if (isFinite(individualEpochReward.toFixed())) {
            totalIndividualReward = totalIndividualReward.plus(
                individualEpochReward
            )
        }
    }

    return totalIndividualReward.toFixed()
}

export const getAllEventsForType = async (contract, eventName) => {
    return await contract.getPastEvents(eventName, {
        fromBlock: 0,
        toBlock: 'latest',
    })
}

export const calculateBonusEgls = (firstEgl, lastEgl) =>
    (lastEgl ** 4 - firstEgl ** 4) / ((81 / 128) * 10 ** 27)

export const increaseAllowance = async (
    votingContract,
    tokenContract,
    walletAddress,
    callback,
    setPending,
    setError,
    setSuccessful
) => {
    const allowance = await tokenContract.methods
        .increaseAllowance(
            votingContract._address,
            web3.utils.toWei('500000000000000')
        )
        .send({ from: walletAddress })
        .on('transactionHash', function (hash) {
            setPending(true)
        })
        .on('receipt', function (receipt) {
            setPending(false)
            setSuccessful(true)
            console.log('receipt', receipt)
        })
        .on('error', function (error, receipt) {
            console.log('error', error.message, receipt)
            console.log(Object.keys(error.message))
            setError(error.message)
            setPending(false)
        })
        .then((result, e) => {
            if (!e) {
                console.log('Waiting for tx to be mined...', result)
            } else {
                console.log('Unable to send trans action', e)
            }
            callback()
            return result
        })
        .catch((e) => {
            console.log(e)
            callback()
        })

    return allowance
}

export const voteExpirationDate = (
    firstEpochStartDate,
    voteEpoch,
    lockupDuration
) =>
    Number(firstEpochStartDate) +
    (Number(voteEpoch) + Number(lockupDuration)) * Number(epochLengthSeconds)

export const calculateGenesisWithdrawDate = (
    firstEpochStartDate,
    voterData,
    contractBalance,
    contributorCumulativeBalance,
    amountContributed,
    votingStartDate
) => {
    const ethEglRatio =
        totalEglToBalancer / Number(web3.utils.fromWei(contractBalance))
    const firstEgl =
        (Number(web3.utils.fromWei(contributorCumulativeBalance)) -
            Number(web3.utils.fromWei(amountContributed))) *
        ethEglRatio
    const serializedEgl =
        Number(web3.utils.fromWei(amountContributed)) * ethEglRatio

    const lastEgl = firstEgl + serializedEgl

    const unlockTokenEndDate = m
        .unix(parseFloat(votingStartDate) + getTokenReleaseDate(lastEgl))
        .unix()

    return Math.max(
        Number(firstEpochStartDate) +
            Number(voterData.voteEpoch * epochLengthSeconds) +
            Number(voterData.lockupDuration * epochLengthSeconds),
        unlockTokenEndDate
    )
}

export const hasWithdrawn = (walletAddress, eventWithdraw) => {
    let userHasWithdrawn = false

    eventWithdraw.forEach((event) => {
        if (event.returnValues.caller === walletAddress) userHasWithdrawn = true
    })

    return userHasWithdrawn
}

export const calculateEglsLocked = (
    seederAmount,
    tokensLocked,
    bonusEgls,
    cumulativeRewards
) => {
    if (seederAmount !== '0' && tokensLocked === '0') {
        return web3.utils.fromWei(seederAmount)
    }
    if (tokensLocked !== '0' && tokensLocked) {
        return (
            Number(web3.utils.fromWei(tokensLocked)) + Number(cumulativeRewards)
        )
    }
    return String(Number(bonusEgls))
}
