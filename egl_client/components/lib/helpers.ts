import web3 from 'web3'
import { epochLengthSeconds, totalEglToBalancer } from './constants'
import m from 'moment'

const pad = (int, digits) =>
    int.length >= digits
        ? int
        : new Array(digits - int.length + 1).join('0') + int

export const zeroPad = (str, digits) => {
    str = String(str)
    const nums = str.match(/[0-9]+/g)

    nums.forEach((num) => {
        str = str.replace(num, pad(num, digits))
    })

    return str
}

export const addCommas = (num) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const formatUsd = (num) => addCommas(Number.parseFloat(num).toFixed(2))

export const removeNonNumeric = (num) => String(num).replace(/[^0-9.]/g, '')

export const fromWei = (num) => web3.utils.fromWei(String(num))

export const toWei = (num) => web3.utils.toWei(String(num))

export const fromWeiCommas = (num) => addCommas(web3.utils.fromWei(String(num)))

export const truncateEthAddress = (address) =>
    address.slice(0, 6) +
    '...' +
    address.slice(address.length - 4, address.length)

export const displayComma = (num) =>
    parseFloat(num).toLocaleString('en-US', {
        maximumFractionDigits: 3,
    })

export const formatFromWei = (num) => displayComma(fromWei(num))

export const getAllEventsForType = async (votingContract, eventName) => {
    return await votingContract.getPastEvents(eventName, {
        fromBlock: 0,
        toBlock: 'latest',
    })
}

export const getTokenReleaseDate = (eglNumber) =>
    Math.pow(eglNumber / totalEglToBalancer, 1 / 4) *
        (epochLengthSeconds * 52 - epochLengthSeconds * 10) +
    epochLengthSeconds * 10

export const getCurrentSerializedEgl = (votingStartDate) =>
    ((m().unix() - parseFloat(votingStartDate) - 10 * epochLengthSeconds) /
        (epochLengthSeconds * 52 - 10 * epochLengthSeconds)) **
        4 *
    750000000

export const calculateBonusEgls = (firstEgl, lastEgl) =>
    (lastEgl ** 4 - firstEgl ** 4) / ((81 / 128) * 10 ** 27)

export const tryRequire = (path) => {
    try {
        return require(path)
    } catch (err) {
        console.log(err)
        return null
    }
}

export const isSeed = (walletAddress, labelMapping) => {
    for (let i = 0; i < labelMapping.length; i++) {
        if (labelMapping[i].address === walletAddress) {
            return true
        }
    }
    return false
}

export const filterVoteEvents = (
    voteEvents,
    firstEpochStartDate,
    epochLength
) => {
    let struct = {}

    voteEvents.forEach((event) => {
        const eventData = event.returnValues

        if (!struct[eventData.caller]) {
            struct[eventData.caller] = eventData
        } else {
            if (
                Number(eventData.date) > Number(struct[eventData.caller].date)
            ) {
                struct[eventData.caller] = eventData
            }
        }

        const voteExpiryDate =
            Number(firstEpochStartDate) +
            // @ts-ignore
            (Number(struct[eventData.caller].currentEpoch) +
                Number(struct[eventData.caller].lockupDuration)) *
                Number(epochLength)

        if (Number(voteExpiryDate) < m().unix()) {
            delete struct[eventData.caller]
        }
    })

    return Object.values(struct).sort((a, b) => {
        return (
            // @ts-ignore
            Number(b.eglAmount) * Number(b.lockupDuration) -
            // @ts-ignore
            Number(a.eglAmount) * Number(a.lockupDuration)
        )
    })
}

export const getBptsWithdrawn = (eventList, walletAddress) => {
    let bptsWithdrawn = 0
    eventList.forEach((event) => {
        const eventData = event.returnValues
        if (eventData.caller === walletAddress) {
            bptsWithdrawn += Number(web3.utils.fromWei(eventData.poolTokensDue))
        }
    })
    return bptsWithdrawn
}

export const getPauseTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(seconds / (60 * 60))

    if (hours) {
        return `${hours} hour`
    } else if (minutes) {
        return `${minutes} minute`
    }
    return `${seconds} second`
}

export const formFormat = (str) => {
    if (!str) return '0'
    if (str.includes('.')) {
        let [wholeNumber, decimal] = separateByDecimal(
            removeNonNumeric(String(str))
        )

        wholeNumber = addCommas(String(parseInt(wholeNumber)))
        decimal = String(decimal).replace(/[^0-9]/g, '')

        return wholeNumber + '.' + decimal
    }

    return addCommas(parseInt(removeNonNumeric(String(str))))
}

export const separateByDecimal = (str) => {
    let wholeNumber
    let decimal

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '.') {
            wholeNumber = str.split('').splice(0, i).join('')
            decimal = str
                .split('')
                .splice(i + 1, str.length)
                .join('')
            break
        }
    }
    return [wholeNumber, decimal]
}
