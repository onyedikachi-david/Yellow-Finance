# Yellow-Finance
The Ideal Thrift
🚧👷 Under Construction👷🚧

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
