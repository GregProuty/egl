# EGL Client

Initialize

Globally Install Node.js

Install yarn
```
npm install --global yarn 
```
Install Wed3 
```
sudo yarn install —g web3 optional 
```
Truffle and Ganache are required to compile, test and deploy the smart contracts.

Install Truffle (the version is important)
```
yarn global add truffle@5.1.61
```
Install Ganache 
```
sudo npm install -g ganache / npm install ganache --global 
```
Install Ganache - cli 
```
yarn global add ganache-cli / sudo npm install -g ganache-cli
```

To deploy egl, clone the egl_client repo, egl_genesis repo, and egl repo

Suggested file structure: 

```
    ./egl_master
    ├── package.json
    ├── /egl_client
    ├── /genesis (egl_genesis)
    ├── /voting (egl)
```

create package.json in egl_master folder

```
{
    "name": "egl_master",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "get-genesis-abis": "cd ./egl_genesis && yarn compile && truffle migrate && cp ./build/contracts/* ../egl_client/lib/contracts && cd ..",
        "get-voting-abis": "cd ./egl && yarn compile && truffle migrate && cp ./build/contracts/* ../egl_client/lib/contracts && cd ..",
        "get-abis": "yarn get-genesis-abis && yarn get-voting-abis",
        "install-all": "cd egl_client && yarn install && cd ../genesis && yarn install && cd ../voting && yarn install && cd ..",
        "dev": "cd ./egl_client && yarn dev",
        "build": "yarn get-genesis-abis && get-voting-abis && cd ./egl_client && next build && next export",
        "start": "yarn get-genesis-abis && get-voting-abis && cd ./egl_client && next start",
        "rmabi": "rm -rf ./egl_client/lib/contracts/* && rm -rf  ./genesis/build/contracts/* && rm -rf ./voting/build/contracts/*"
    },
    "author": "Greg Prouty",
    "license": "ISC"
}
```

Install npm modules in each folder

```
yarn install
```

Make sure truffle and ganache-cli are installed globally
```
npm i -g truffle
npm i -g ganache-cli
```
## TO DEPLOY LOCALLY

Start ganache in a separate terminal
```
ganache-cli --port 7545 --networkId 5777
```
Deploy genesis contracts (in egl_master)
```
yarn get-genesis-abis
```
Navigate to the egl_client folder and start web app
```
cd ./egl_client
yarn dev
```
Add ganache to metamask (if haven't already)
```
Network Name: ganache-cli
New RPC URL: http://127.0.0.1:7545
Chain ID: 1337
```
Add one of the addresses (not 0 or 1) provided by ganache to metamask, should have 100 ETH

Participate in Genesis (click JOIN), send 10 ETH to close genesis

Once genesis is closed, copy the EGL Genesis address (logged by the deploy script), navigate to the voting/migrations/3_deploy_egl_voting.js, in the code section ```if (network === 'ganache') {}``` replace eglGenesisAdress with the ```EGL Genesis deployed to address:``` address

Navigate back to egl_master, deploy voting contracts
```
yarn get-voting-abis
```
Start the egl_client
```
yarn dev
```

Return to localhost:3000 in your browser, client should have voting abis and be fully functional

Start using EGL locally

## TO DEPLOY TO ROPSTEN
congigure .env with a metamask pneumonic that is funded with ropsten ETH in both genesis and egl folders

Navigate to egl_genesis, deploy contracts to ropsten
```
yarn mig-ropsten
```
After contracts are deployed to ropsten, navigate to /genesis/build/contracts, copy all the abis (.json files), paste to /egl_client/lib/contracts

Contribute enough ropsten ETH to genesis to close the genesis.

navigate to /egl (voting contracts), copy the genesis address to the deploy script.

make sure there are two addresses in metamask that are funded with ETH

deploy voting contracts

```
yarn mig-ropsten
```

In egl_client, build production client
```
yarn build
```

After that is done, copy the /out folder to an S3 bucket, or any preferred deployment