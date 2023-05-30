# Yellow-Finance
The Ideal Thrift
🚧👷 Under Construction👷🚧

### Chainlink Price feed Address (Mumbai)

- MATIC/USD: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
- USDC/USD: 0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0
- USDT/USD: 0x92C09849638959196E976289418e5973CC96d645
- DAI/USD: 0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046
- BTC/USD: 0x007A22900a3B98143368Bd5906f8E17e9867581b

"0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
"20"
"2"
"1"
"2"
"Test 2"
"This must work"

["Me","",a20a98a749C0ACe7A3CCCd19713dc7bf7d6d30Cc,500000,d7428FE16d8663EF26df381835565C51B0641AEe,"","",100000000000000000]

["Me", bytes(""), "0xa20a98a749C0ACe7A3CCCd19713dc7bf7d6d30Cc", 500000, "0xd7428FE16d8663EF26df381835565C51B0641AEe", bytes(""), bytes(""), 100000000000000000]

0xd7428FE16d8663EF26df381835565C51B0641AEe


### Mumbai contract Address

- USDCAddress: 0x0FA8781a83E46826621b3BC094Ea2A0212e71B23
- USDTAddress: 0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832
- DAIAddress: 0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F
- WBTCAddress: 0x0d787a4a1548f673ed375445535a6c7A1EE56180

- link: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
- registrar: 0x57A4a13b35d25EE78e084168aBaC5ad360252467

[  "Me",  "0x",  "0xa20a98a749C0ACe7A3CCCd19713dc7bf7d6d30Cc",  500000,  "0xd7428FE16d8663EF26df381835565C51B0641AEe",  "0x",  "0x",  100000000000000000]
[  "Me",  "0x",  "0xa20a98a749C0ACe7A3CCCd19713dc7bf7d6d30Cc",  500000,  "0xd7428FE16d8663EF26df381835565C51B0641AEe",  "0x",  "0x",  100000000000000000]
0xd7428FE16d8663EF26df381835565C51B0641AEe
   0x7ceB88175d62652eD6652BA8983b5cEFe07915d7
[  "Me",  "0x",  "0x67eFa5A9404f48deDC2A30c2D8A8e3AbDecEe3f1",  500000,  "0x7ceB88175d62652eD6652BA8983b5cEFe07915d7",  "0x",  "0x",  100000000000000000]


# DAO-based Thrift DApp

This markdown document describes the features of a DAO-based thrift decentralized application (DApp) implemented as a smart contract in Solidity.

## Contract Features

The `ThriftClub` contract implements the following features:

1. Membership Management:
   - [x] Allow participants to join the thrift club by paying a penalty fee.
   - [x] Mint an NFT for each participant.
   - [x] Track participants and prevent duplicate entries.
   - [x] Only allow participants who have paid the penalty fee to join the club.

2. Cycle Management:
   - [x] Start a new cycle when the maximum number of participants is reached.
   - [x] Determine the winner of the thrift pot using a Chainlink contract.
   - [x] Distribute the thrift pot to the winner.

3. DAO Integration:
   - [x] Integrate with a DAO contract to manage membership size, penalty fee, and contribution amount.
   - [x] Allow DAO members to vote on changes to the membership size, penalty fee, and contribution amount.

4. Price Conversion and Fee Collection:
   - [x] Convert token prices to USD using Chainlink price feeds.
   - [x] Collect service fees in both Ether and tokens.
   - [x] Track balances for the service fee purse and thrift purse.
   - [x] Collect penalty fees in both Ether and tokens.
   - [x] Track balances for the thrift purse penalty.

5. Chainlink VRF Integration:
   - [x] Integrate with Chainlink VRF (Verifiable Random Function) for generating random numbers.
   - [x] Request random words from Chainlink VRF.
   - [x] Perform actions when the payment period is over using random words.

6. Upkeep Functionality:
   - [x] Implement an upkeep function to check and perform necessary actions based on the current state and timestamp.

## Contract Structure

The contract is structured as follows:

1. Libraries and Interfaces:
   - OpenZeppelin ERC20 and ERC721 libraries.
   - IERC721 and IERC721Receiver interfaces.
   - Chainlink interfaces for AggregatorV3, VRFCoordinatorV2, and LinkToken.

2. Structs and Enums:
   - `ThriftClubData` struct to store thrift club data, including token, cycle duration, contribution amount, penalty, max participants, name, description, NFT contract, DAO contract, state, and last update timestamp.
   - `TANDA_STATE` enum to represent the different states of the thrift club (OPEN, CLOSED, PAYMENT_IN_PROGRESS, COMPLETED).

3. Contract Variables:
   - Storage variables for the thrift club data, paid participants count, VRF coordinator and link token contracts, key hash, callback gas limit, request confirmations, number of random words, random words storage, request ID, subscription ID, owner address, price feed interfaces, token addresses, maximum fee in USD, isParticipant mapping, participants array, hasPaidPenalty mapping, NFT contract, DAO contract, and service fee and thrift balances.

4. Constructor:
   - Initializes the contract with the provided thrift club data, VRF coordinator, link token, and price feed interfaces.
   - Sets the price feed token based on the provided token address.

5. Fee Collection Functions:
   - `payPenaltyFee`: Allows participants to pay the penalty fee in Ether or tokens.
   - `joinThriftClub`: Allows participants to join the thrift club by paying the required amount and minting an NFT.
   - `startCycle`: Starts a new cycle when the maximum number of participants is reached.

6. Chainlink Integration Functions:
   - `requestRandomWords`: Requests random words from Chainlink VRF.
   - `fulfillRandomWords`: Callback function to store the random words returned by Chainlink VRF.

7. Upkeep Functions:
   - `checkPaymentPeriod`: Checks if the payment period is over and performs necessary actions using random words.

8. DAO Integration Functions:
   - `setMembershipSize`: Allows DAO members to vote and set the membership size.
   - `setPenaltyFee`: Allows DAO members to vote and set the penalty fee.
   - `setContributionAmount`: Allows DAO members to vote and set the contribution amount.
