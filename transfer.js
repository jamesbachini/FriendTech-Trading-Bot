const ethers = require('ethers');
require("dotenv").config();

const finalDestination = '';

const transferOut = async () => {
    const wallet = new ethers.Wallet(process.env.AGRO_KEY);
    const account = wallet.connect(provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance of ${wallet.address}: ${ethers.formatEther(balance)}`);
    const amountIn = balance - 20000000000000n;
    const transferTX = await account.sendTransaction({
        to: recipient.address,
        value: amountIn,
        gasPrice,
        provider,
    });
    const r1 = await transferTX.wait();
}

transferOut();