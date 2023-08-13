const ethers = require('ethers');
require("dotenv").config();

/*
    Provide a list of private keys and it will return the
    balances to the main account
*/

const privateKeys = [
    
];

const recipient = new ethers.Wallet(process.env.PRIVATE_KEY);
console.log('Sending funds to', recipient.address);
const provider = new ethers.JsonRpcProvider(`https://mainnet.base.org`);
const gasPrice = ethers.parseUnits('0.000000000000049431', 'ether');

const init = async () => {
    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey);
        const balance = await provider.getBalance(wallet.address);
        console.log(`Balance of ${wallet.address}: ${ethers.formatEther(balance)}`);
        const amountIn = balance - 20000000000000n;
        if (amountIn > 1) {
            const account = wallet.connect(provider);
            console.log(`Sending ${wallet.address}: ${ethers.formatEther(amountIn)}`)
            const transferTX = await account.sendTransaction({
                to: recipient.address,
                value: amountIn,
                gasPrice,
                provider,
            });
            const r1 = await transferTX.wait();
        }
    }

}


init();