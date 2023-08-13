const ethers = require('ethers');
const fs = require('fs');
require("dotenv").config();

/*
  Main trading bot which buys shares as soon as someone signs up
  Some quality checks to prevent anti-frontrunner bots based on
  previously seen account balances.
  Also checks users wallet balance and buys up to 3 shares
  depending on how much funds they have in their wallet.
  Price checks to prevent getting frontrun.
*/

const friendsAddress = '0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4';
const provider = new ethers.JsonRpcProvider(`https://mainnet.base.org`); // https://base.blockpi.network/v1/rpc/public

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
const account = wallet.connect(provider);

const friends = new ethers.Contract(
  friendsAddress,
  [
    'function buyShares(address arg0, uint256 arg1)',
    'function getBuyPriceAfterFee(address sharesSubject, uint256 amount) public view returns (uint256)',
    'event Trade(address trader, address subject, bool isBuy, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply)',
  ],
  account
);
const gasPrice = ethers.parseUnits('0.000000000000049431', 'ether');

const balanceArray = [];

const run = async () => {
  let filter = friends.filters.Trade(null,null,null,null,null,null,null,null);

  friends.on(filter, async (event) => {
    if (event.args[2] == true) {
      //console.log(event.args);
      if (event.args[7] <= 1n || (event.args[7] <= 4n && event.args[0] == event.args[1]))  {
        const amigo = event.args[1];
        const weiBalance = await provider.getBalance(amigo);
        // bot check
        for (const botBalance in balanceArray) {
          if (weiBalance > botBalance - 300000000000000 && weiBalance < botBalance + 300000000000000) {
            console.log('Bot detected: ', amigo);
            return false;
          }
        }
        // bot check 2
        if (weiBalance > 95000000000000000 && weiBalance < 105000000000000000) return false; // 0.1
        balanceArray.push(weiBalance);
        if (balanceArray.length < 10) return false;
        if (balanceArray.length > 20) balanceArray.shift();

        if (weiBalance >= 30000000000000000) { // 0.03 ETH
          let qty = 1;
          if (weiBalance >= 90000000000000000) qty = 2;
          if (weiBalance >= 900000000000000000) qty = 3;
          
          
          //const buyPrice = 893750000000000 * qty * qty; //await friends.getBuyPriceAfterFee(amigo, qty);
          const buyPrice = await friends.getBuyPriceAfterFee(amigo, qty);
          console.log(`BUY PRICE: ${buyPrice} ${event.args[7]}`)
          if (qty < 2 && buyPrice > 2000000000000000) return false; // 0.001
          if (buyPrice > 10000000000000000) return false; // 0.01
          console.log('### BUY ###', amigo, buyPrice);
          const tx = await friends.buyShares(amigo, qty, {value: buyPrice, gasPrice});
          fs.appendFileSync('./buys.txt', amigo+"\n");
          try {
            const receipt = await tx.wait();
            console.log('Transaction Mined:', receipt.blockNumber);
          } catch (error) {
            console.log('Transaction Failed:', error);
          }
        } else {
          console.log(`No Money No Honey: ${amigo} ${weiBalance}`);
        }
      }
    }
  });
}

try {
  run();
} catch (error) {
  console.error('ERR:', error);
}

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});