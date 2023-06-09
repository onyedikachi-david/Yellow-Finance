import Nav from "@/components/nav";
// import React, { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import ThriftClub from "@/ThriftClub.sol/ThriftClub.json";
import IERC20ABI from "@/artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

function ClubPage() {
  const [thriftData, setThriftData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { clubAddress } = router.query;

  // Use the clubAddress to fetch the club data and display it on the page

  React.useEffect(() => {
    if (!isLoading) {
      getThriftDetails();
      setIsLoading(true);
    }
  }, [thriftData]);
  async function getThriftDetails() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(clubAddress, ThriftClub.abi, signer);
      const thriftClubData = await contract.getThriftClubData();
      console.log(thriftClubData);
      console.log(
        ethers.BigNumber.from(thriftClubData.lastUpdateTimestamp).toNumber()
      );

      const [
        token,
        cycleDuration,
        contributionAmount,
        penalty,
        maxParticipant,
        name,
        description,
        nftContract,
        daoContract,
        t_state,
        lastUpdateTimestamp,
      ] = thriftClubData;
      setThriftData(thriftClubData);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <div className="min-h-screen flex-auto bg-white">
        <Nav />
        {/* <HeaderWrapper> */}
        {!isLoading || !thriftData ? (
          <>
            {/* <div>No thrift data available?a</div> */}
            <div className="mx-auto mt-10 w-full max-w-sm rounded-md border border-blue-300 p-4 shadow">
              <div className=" flex animate-pulse space-x-4 ">
                <div className="h-10  w-10 rounded-full bg-slate-500"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 rounded bg-slate-600"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 h-2 rounded bg-slate-600"></div>
                      <div className="col-span-1 h-2 rounded bg-slate-600"></div>
                    </div>
                    <div className="h-2 rounded bg-slate-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ThriftCard
            thriftName={thriftData.name}
            maxParticipant={ethers.BigNumber.from(
              thriftData.maxParticipant
            ).toNumber()}
            thirftUrl={"url"}
            copiedOnClick={"jkhjs"}
            thriftDescription={thriftData.description}
            lastUpdateTime={ethers.BigNumber.from(
              thriftData.lastUpdateTimestamp
            ).toNumber()}
            cycleDuration={ethers.BigNumber.from(
              thriftData.cycleDuration
            ).toNumber()}
            url={`http://localhost:3000/club/${clubAddress}`}
            t_state={thriftData.t_state}
            daoContract={thriftData.daoContract}
            nftContract={thriftData.nftContract}
            penalty={ethers.BigNumber.from(thriftData.penalty).toNumber()}
            contributionAmount={ethers.BigNumber.from(
              thriftData.contributionAmount
            ).toNumber()}
            token={thriftData.token}
            clubAddress={clubAddress}
          />
        )}
        {/* // Participants list component Here */}
        <h1 className="ml-4 mr-3 mt-4 font-epilogue text-black">
          List of participant that has joined:
        </h1>
        <ParticipantsList contractAddress={clubAddress} />
      </div>
    </>
  );
}

export default ClubPage;

import React, { useState, useRef } from "react";
import { format, differenceInWeeks } from "date-fns";
import {
  // IconCopy,
  ClipboardIcon,
  RiCommunityLine,
  // IconCommunity,
  // IconFlag,
  FaFlag,
  AiOutlineBlock,
  // IconBlock,
} from "@heroicons/react/24/outline";
import { useAddress } from "@thirdweb-dev/react";

const Link = ({ label, iconRight, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center ${className}`}
  >
    <span className="mr-1">{label}</span>
    {iconRight && <span className="ml-1">{iconRight}</span>}
  </button>
);

const ThriftCard = ({
  token,
  cycleDuration,
  contributionAmount,
  penalty,
  maxParticipant,
  thriftName,
  thriftDescription,
  nftContract,
  daoContract,
  t_state,
  lastUpdateTime,
  url,
  clubAddress,
}) => {
  const [showAll, setShowAll] = useState(false);

  const address = useAddress();

  const [tokenAllowance, setTokenAllowance] = useState(false);
  const [penaltyPaid, setPenaltyPaid] = useState(false);

  const copiedOnClick = () => {
    if (!navigator.clipboard) {
      console.error("Failed to copy link because clipboard is not available");
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      console.log(`Copied URL "${url}" to clipboard`);
    });
  };

  const currentDate = new Date();
  const weeks = differenceInWeeks(
    currentDate,
    new Date(currentDate.getTime() - cycleDuration * 1000)
  );
  const formattedCycleDuration = `${weeks} week${weeks !== 1 ? "s" : ""}`;

  const timestamp = lastUpdateTime * 1000; // Convert the timestamp to milliseconds
  const formattedLastUpdateTime = new Date(timestamp).toLocaleString(); // Format the date and time as per the user's locale

  const tStateLabels = {
    OPEN: "Open",
    CLOSED: "Closed",
    PAYMENT_IN_PROGRESS: "Payment in Progress",
    COMPLETED: "Completed",
  };

  React.useEffect(() => {
    if (penalty) {
      if (token == "0x0000000000000000000000000000000000000000") {
        setTokenAllowance(true);
      } else {
        console.log("Checking allowance for inputted amount");

        const checkAllowance = async () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          const signer = provider.getSigner();

          //  const IERC20ABI = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
          let erc20Contract = new ethers.Contract(token, IERC20ABI.abi, signer);

          let data = await erc20Contract.allowance(address, clubAddress);
          console.log(tokenAllowance);
          console.log(penalty * 1e18);
          console.log(parseInt(data._hex) / 1e18);
          // If allowance is smaller set allowance true
          const penaltyAmount = (Number(penalty) * 1e18).toString(); // Assuming `penalty` is the penalty amount
          console.log(
            "These:  ",
            parseInt(data._hex) * 1e18,
            "Others:  ",
            penalty * 1e18
          );
          if (parseInt(data._hex) * 1e18 < penalty * 1e18) {
            setTokenAllowance(true);
          } else {
            setTokenAllowance(false);
          }
        };
        checkAllowance();
      }
    }
  }, [penalty, tokenAllowance]);

  const formattedTState = tStateLabels[t_state] || t_state;
  const handlePayPenalty = async () => {
    if (token == "0x0000000000000000000000000000000000000000") {
      // MAke native payment
      try {
        // let erc20Contract = new ethers.Contract(token, IERC20ABI.abi, signer);

        // let data = await erc20Contract.allowance(address, clubAddress);
        console.log("Here now");
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        console.log(provider);
        // Get the signer
        const signer = provider.getSigner();
        const contractAddress = clubAddress;
        const thriftContract = new ethers.Contract(
          contractAddress,
          ThriftClub.abi,
          signer
        );
        console.log(penalty * 1e18);
        const penaltyAmount = (penalty * 1e18).toString(); // Assuming `penalty` is the penalty amount
        console.log(penaltyAmount);
        let createPenaltyTransaction = await thriftContract.payPenaltyFee(
          token,
          toString(0),
          { value: penalty }
        );

        console.log("Token and penalty amount", token, penaltyAmount);
        setPenaltyPaid(true);

        await createPenaltyTransaction
          .wait()
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.error("Failed to pay penalty fee:", error);
      }
    } else {
      if (!tokenAllowance) {
        try {
          // let erc20Contract = new ethers.Contract(token, IERC20ABI.abi, signer);

          // let data = await erc20Contract.allowance(address, clubAddress);
          console.log("Here now");
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          console.log(provider);
          // Get the signer
          const signer = provider.getSigner();
          const contractAddress = clubAddress;
          const thriftContract = new ethers.Contract(
            contractAddress,
            ThriftClub.abi,
            signer
          );
          console.log(penalty * 1e18);
          const penaltyAmount = (penalty * 1e18).toString(); // Assuming `penalty` is the penalty amount
          console.log(penaltyAmount);
          let createPenaltyTransaction = await thriftContract.payPenaltyFee(
            token,
            ethers.utils.parseEther((penalty * 1e18).toString()),
            {}
          );

          console.log("Token and penalty amount", token, penaltyAmount);
          setPenaltyPaid(true);

          await createPenaltyTransaction
            .wait()
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        } catch (error) {
          console.error("Failed to pay penalty fee:", error);
        }
      } else {
        try {
          console.log(tokenAllowance);
          // Create an Ethereum provider
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          console.log(provider);
          // Get the signer
          const signer = provider.getSigner();

          // Contract address and ABI
          const contractAddress = clubAddress;
          const contractABI = ThriftClub.abi;

          // Create the contract instance
          // const contract = new ethers.Contract(
          //   contractAddress,
          //   contractABI,
          //   signer
          // );

          // var fee = Number(values.value) * 0.005 + token.value;

          const penaltyAmount = (Number(penalty) * 1e18).toString(); // Assuming `penalty` is the penalty amount

          let contract = new ethers.Contract(token, IERC20ABI.abi, signer);
          console.log(contract);

          // Call the Solidity function to pay the penalty fee
          const tokenAddress = token; // Assuming `token` is the token address
          // const penaltyAmount = ethers.utils.parseEther(Number(penalty) * 1e18); // Assuming `penalty` is the penalty amount
          // const penaltyAmount = ethers.utils.parseEther(penalty.toString());
          console.log("Penalty  ", penaltyAmount);
          // const tx = await contract.payPenaltyFee(tokenAddress, penaltyAmount);
          let transaction = await contract.approve(
            contractAddress,
            penaltyAmount
          );

          // Wait for the transaction to be mined
          await transaction.wait().then((res) => {
            console.log(res);
          });
          setTokenAllowance(false);

          // Handle the successful penalty payment
          console.log("Penalty fee approved successfully");
        } catch (error) {
          // Handle the error
          console.error("Failed to approve penalty fee allowance:", error);
        }
      }
    }
  };

  const hasPaidPenalty = async (contract, address) => {
    try {
      const result = await contract.hasPaidPenalty(address);
      return result;
    } catch (error) {
      console.error("Failed to check if user has paid penalty:", error);
      return false;
    }
  };

  // const CheckPenaltyPayment = () => {
  const [paidPenalty, setPaidPenalty] = useState(false);

  React.useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const contractABI = ['function hasPaidPenalty(address) view returns (bool)'];
    const contract = new ethers.Contract(clubAddress, ThriftClub.abi, provider);

    const checkPayment = async () => {
      const result = await hasPaidPenalty(contract, address);
      setPaidPenalty(result);
    };

    checkPayment();
  }, [penaltyPaid]);

  const handleJoinClub = async () => {
    try {
      // Create an a Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer
      const signer = provider.getSigner();

      // Contract address and ABI
      const contractAddress = clubAddress;
      const contractABI = ThriftClub.abi;

      // Create the contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Call the Solidity function to pay the penalty fee
      const tokenAddress = token; // Assuming `token` is the token address
      // const penaltyAmount = ethers.utils.parseEther(Number(penalty)); // Assuming `penalty` is the penalty amount
      const penaltyAmount = ethers.utils.parseEther(penalty.toString());
      const tx = await contract.payPenaltyFee(tokenAddress, penaltyAmount);

      // Wait for the transaction to be mined
      await tx.wait();

      // Handle the successful penalty payment
      console.log("Penalty fee paid successfully");
    } catch (error) {
      // Handle the error
      console.error("Failed to pay penalty fee:", error);
    }
  };

  return (
    <div className="justify-center rounded-lg bg-white p-4 shadow-lg">
      <h1 className="mb-2 text-2xl font-bold text-black">
        Thrift Club Details
      </h1>
      <h2 className="mb-2 text-2xl font-bold text-black">
        Club Name: {thriftName}
      </h2>
      <p className="mb-2 text-gray-600">
        Maximum Participants: {maxParticipant}
      </p>
      <p className="mb-2 text-gray-600">Club Payment Token: {token}</p>
      <div className="mb-2 text-gray-600">
        Club URL:
        <Link
          label={url}
          iconRight={<ClipboardIcon className="h-5 w-5" />}
          onClick={copiedOnClick}
          className="block text-blue-500 hover:text-blue-600"
        />
      </div>
      <p className="mt-2 text-gray-600">
        Cycle Duration: {formattedCycleDuration}
      </p>
      <p className="text-gray-600">Contribution Amount: {contributionAmount}</p>
      <p className="text-gray-600">Penalty: {penalty}</p>
      <p className="text-gray-600">
        NFT Contract: <span className="break-all">{nftContract}</span>
      </p>
      <p className="text-gray-600">
        DAO Contract: <span className="break-all">{daoContract}</span>
      </p>
      <p className="text-gray-600">Tanda State: {formattedTState}</p>
      <p className="text-gray-600">
        Last Update Time: {formattedLastUpdateTime}
      </p>
      <div className="mt-2">
        <p className="text-gray-800">Club Description: {thriftDescription}</p>
      </div>
      <button
        className="mr-6 mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        onClick={() => handlePayPenalty()}
      >
        {tokenAllowance ? "Approve penalty fee" : "Pay Penalty"}
      </button>
      <button
        className={`mr-8 mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600 ${
          !paidPenalty ? "cursor-not-allowed  opacity-50" : ""
        }`}
        onClick={handleJoinClub}
        disabled={!paidPenalty}
      >
        {" "}
        Join Thrift{" "}
      </button>
    </div>
  );
};

function ParticipantsList({ contractAddress }) {
  const [participants, setParticipants] = useState([]);

  React.useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractABI = [
          "function participants(uint256) view returns (address)",
        ];
        const contract = new ethers.Contract(
          contractAddress,
          ThriftClub.abi,
          provider
        );

        // const participantsCount = await contract.participants();
        // const participants = [];

        // for (let i = 0; i < participantsCount; i++) {
        const participant = await contract.participants();
        // participants.push(participant);
        // }

        setParticipants(participant);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      }
    };

    fetchParticipants();
  }, [contractAddress]);

  if (participants.length === 0) {
    return <div>Empty for now</div>; // or render empty JSX if desired
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Participants</h2>
      <ul className="space-y-2">
        {participants.map((participant, index) => (
          <li key={index} className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded-full bg-blue-500"></div>
            <span>{participant}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

//  // Mapping to track users who have paid the penalty fee
//     mapping(address => bool) public hasPaidPenalty;

// uint256 public ThriftPurseBalance;
// mapping(address => uint256) public ThriftPurseTokenBalance;
// uint256 public ThriftPursePenaltyBalance;
// mapping(address => uint256) public ThriftPursePenaltyTokenBalance;
