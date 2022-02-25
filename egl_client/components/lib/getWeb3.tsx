import Web3 from 'web3'

const resolveWeb3 = (resolve) => {
    // @ts-ignore
    let { web3 } = window
    const alreadyInjected = typeof web3 !== 'undefined' // i.e. Mist/Metamask
    const localProvider = 'http://127.0.0.1:7545'

    if (window.ethereum) {
        web3 = new Web3(window.ethereum)
    } else if (alreadyInjected) {
        console.log(`Injected web3 detected.`)
        web3 = new Web3(web3.currentProvider)
    } else {
        console.log(`No web3 instance injected, using Local web3.`)
        // const provider = new Web3.providers.HttpProvider(
        //     localProvider
        // 'https://ropsten.infura.io/v3/a346a983b9514b9984d057c96b10e382'
        // )
        // web3 = new Web3(provider)
    }

    resolve(web3)
}

export default () =>
    new Promise((resolve) => {
        // Wait for loading completion to avoid race conditions with web3 injection timing.
        window.addEventListener(`load`, () => {
            resolveWeb3(resolve)
        })
        // If document has loaded already, try to get Web3 immediately.
        if (document.readyState === `complete`) {
            resolveWeb3(resolve)
        }
    })
