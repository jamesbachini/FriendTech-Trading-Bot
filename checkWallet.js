const ethers = require('ethers');
require("dotenv").config();

/*
  Pulls a list of friends purchased from txHash data
  which you can get off Etherscan. Shouldn't need this
  now as there's a list in buys.txt
*/

const txHashes = [
  
];

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const provider = new ethers.JsonRpcProvider(`https://mainnet.base.org`);
const account = wallet.connect(provider);

const init = async () => {
    for (const txHash of txHashes) {
        //console.log(txHash) 
        const txReceipt = await provider.getTransaction(txHash);
        //console.log(txReceipt.data);
        const iface = new ethers.Interface(['function buyShares(address arg0, uint256 arg1)'])
        const decoded = iface.decodeFunctionData('buyShares',txReceipt.data);
        console.log(decoded[0]);
    }
}

init();
