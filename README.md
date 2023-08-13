# FriendTech Trading Bot

A trading bot for friend.tech written in JS with NodeJS and Ethers.js

Full details at: https://jamesbachini.com/friendtech-trading-bot/

friendsTechBot.js - main trading bot for frontrunning newly created accounts

sellOut.js - the bot above only purchases shares, when you are ready to sell your positions provide a list of user addresses and it will sell all shares.

agroTechBot.js - adversarial trading bot to try and prevent frontrunning competition. 

checkWallet.js - give it a list of transaction hashes and it will decode the data to get the user addresses of shares you've purchased (not needed anymore as it's logged to buys.txt)

collectDust.js - Go through a list of private keys and accumulate any left over funds into a single wallet

transfer.js - Just to do a single transfer of eth from one account to another

```
npm install
// edit .env-sample to .env and add private key from app
node friendsTechBot.js
node sellOut.js
```