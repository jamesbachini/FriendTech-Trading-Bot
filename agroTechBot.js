const ethers = require('ethers');
require("dotenv").config();

/*
  Anti-frontrunner trading bot which:
  1. Funds a new wallet address 
  2. Then transfers the funds to a 2nd wallet
  3. Buys 3 shares of itself
  4. Sells 3 shares of itself
  5. Transfers funds back
*/

const friendsAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const provider = new ethers.JsonRpcProvider(`https://mainnet.base.org`);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
let tmpWallet;
const gasPrice = ethers.parseUnits('0.000000000000049431', 'ether');

const run = async () => {
    preTmpWallet = ethers.Wallet.createRandom();
    console.log('Public Key:', preTmpWallet.address);
    console.log('Private Key:', preTmpWallet.privateKey);
    await new Promise(r => setTimeout(r, 10000));
    const preInEth = ethers.parseEther('0.00116');
    const master = wallet.connect(provider);
    const preTX = await master.sendTransaction({
        to: preTmpWallet.address,
        value: preInEth,
        gasPrice,
        provider,
    });
    const rp1 = await preTX.wait();

    tmpWallet = ethers.Wallet.createRandom();

    console.log('Public Key:', tmpWallet.address);
    console.log('Private Key:', tmpWallet.privateKey);
 
    const preBalance = await provider.getBalance(preTmpWallet.address);
    const amountIn = preBalance - 20000000000000n;
    const preAccount = preTmpWallet.connect(provider);
    
    const transferTX = await preAccount.sendTransaction({
        to: tmpWallet.address,
        value: amountIn,
        gasPrice,
        provider,
    });
    const r1 = await transferTX.wait();

    const account = tmpWallet.connect(provider);
    const friends = new ethers.Contract(
      friendsAddress,
      [
        'function buyShares(address arg0, uint256 arg1)',
        'function getBuyPriceAfterFee(address sharesSubject, uint256 amount) public view returns (uint256)',
        'function sharesBalance(address sharesSubject, address holder) public view returns (uint256)',
        'function sharesSupply(address sharesSubject) public view returns (uint256)',
        'function sellShares(address sharesSubject, uint256 amount) public payable',
        'event Trade(address trader, address subject, bool isBuy, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply)',
      ],
      account
    );
    await new Promise(r => setTimeout(r, 62000));
    const tx = await friends.buyShares(tmpWallet.address, 1, {gasPrice});
    const receipt = await tx.wait();     
    await new Promise(r => setTimeout(r, 20000));
    const buyPrice = await friends.getBuyPriceAfterFee(tmpWallet.address, 1);
    const tx2 = await friends.buyShares(tmpWallet.address, 1, {value: buyPrice, gasPrice});
    const receipt2 = await tx2.wait();
    await new Promise(r => setTimeout(r, 20000));
    const buyPrice2b = await friends.getBuyPriceAfterFee(tmpWallet.address, 1);
    const tx2b = await friends.buyShares(tmpWallet.address, 1, {value: buyPrice2b, gasPrice});
    const receipt2b = await tx2b.wait();
    await new Promise(r => setTimeout(r, 20000));
    const tx3 = await friends.sellShares(tmpWallet.address, 1, {gasPrice});
    const receipt3 = await tx3.wait();
    const tx4 = await friends.sellShares(tmpWallet.address, 1, {gasPrice});
    const receipt4 = await tx4.wait();
    const supply = await friends.sharesSupply(tmpWallet.address);
    if (supply > 1) {
      const tx5 = await friends.sellShares(tmpWallet.address, 1, {gasPrice});
      const receipt5 = await tx5.wait();
    } else {
      console.log('Bag Holder, no takers')
    }
    const weiBalance = await provider.getBalance(tmpWallet.address);
    const amountOut = weiBalance - 20000000000000n;
    const transferTX2 = await account.sendTransaction({
        to: wallet.address,
        value: amountOut,
        gasPrice,
        provider,
    });
    const r2 = await transferTX2.wait();
    run();
}

try {
    run();
} catch (error) {
  console.error('ERR:', error);
}

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  try {  
    const account = tmpWallet.connect(provider);
    const weiBalance = await provider.getBalance(tmpWallet.address);
    const amountOut = weiBalance - 20000000000000n;
    const transferTX2 = await account.sendTransaction({
        to: wallet.address,
        value: amountOut,
        gasPrice,
        provider,
    });
    const r2 = await transferTX2.wait();
  } catch (err) {
    console.log('Cant transfer out')
  }
  run();
});