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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded-lg bg-white p-4">
                <div className="mb-2 flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-gray-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-1.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-700">Loading...</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Dashboard
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
            <div className="mx-7 flex items-center justify-center">
              <div className="grid gap-4">
                <Card title="Participants">
                  <ParticipantList contractAddress={clubAddress} />
                </Card>
              </div>
            </div>
          </>
        )}
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

const ParticipantItem = ({ address }) => {
  return (
    <div className=" flex items-center space-x-2 text-black">
      <img
        src={`https://avatars.dicebear.com/api/male/${address}.svg`}
        alt="Avatar"
        className="h-8 w-8 rounded-full"
      />
      <span>{address}</span>
    </div>
  );
};

const ParticipantList = ({ contractAddress }) => {
  const [participants, setParticipants] = useState([]);

  React.useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const contract = new ethers.Contract(
          contractAddress,
          ThriftClub.abi,
          provider
        );

        console.log(contract);

        // const participantsCount = await contract.participants();
        // const participants = [];

        // for (let i = 0; i < participantsCount; i++) {
        const participant = await contract.participants([]);
        // participants.push(participant);
        // }

        setParticipants(participant);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      }
    };

    fetchParticipants();
  }, [contractAddress]);
  return (
    <div className="grid grid-cols-2 gap-2 text-black">
      {participants.length > 0 ? (
        participants.map((participant) => (
          <ParticipantItem key={participant} address={participant} />
        ))
      ) : (
        <>
          <div className="flex items-center justify-center py-4">
            <img src="/empty-avatar.svg" alt="Empty Avatar" className="" />
          </div>
          <h5 className="flex items-center space-x-2 font-epilogue text-lg font-extrabold text-black">
            No participant yet
          </h5>
        </>
      )}
    </div>
  );
};

const Card = ({ title, children }) => {
  return (
    <div className="mb-4 rounded-lg bg-amber-300 p-4 shadow-lg">
      <h2 className="mb-2 font-epilogue text-lg font-bold text-black">
        {title}
      </h2>
      {children}
    </div>
  );
};

const Dashboard = ({
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
  }, [penalty, tokenAllowance, token]);

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
          { value: penaltyAmount }
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
            "2000000000000000000",
            { value: "0" }
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

  const [isCopied, setIsCopied] = useState(false);

  const handleShareUrl = () => {
    // Logic to copy the URL to the clipboard
    const el = document.createElement("textarea");
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    setIsCopied(true);
  };
  return (
    <div className="container mx-auto px-4 py-8 font-epilogue text-black">
      <h1 className="mb-4 text-2xl font-bold">{thriftName}</h1>
      <p className="mb-4 text-gray-600">{thriftDescription}</p>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Thrift Club Details">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">Token:</span>
              <span className="text-lg font-bold">
                {token === "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
                  ? "USDC"
                  : token === "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832"
                  ? "USDT"
                  : token === "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F"
                  ? "DAI"
                  : token === "0x0d787a4a1548f673ed375445535a6c7A1EE56180"
                  ? "WBTC"
                  : "Native Coin"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">Cycle Duration:</span>
              <span className="text-lg font-bold">
                {formattedCycleDuration}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">
                Contribution Amount:
              </span>
              <span className="text-lg font-bold">{contributionAmount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">Penalty:</span>
              <span className="text-lg font-bold">{penalty}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">
                Max Participants:
              </span>
              <span className="text-lg font-bold">{maxParticipant}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">
                Last Update Time:
              </span>
              <span className="text-lg font-bold">
                {formattedLastUpdateTime}
              </span>
            </div>
          </div>
        </Card>
        <Card title="More Details">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">NFT Contract:</span>
              <span className="text-lg font-bold">{nftContract}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">DAO Contract:</span>
              <span className="text-lg font-bold">{daoContract}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-600">Thrift State:</span>
              <span className="text-lg font-bold">{formattedTState}</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-8 flex justify-between">
        <button
          className="mr-6 mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
          onClick={() => handlePayPenalty()}
        >
          {token === "0x0000000000000000000000000000000000000000"
            ? "Pay penalty"
            : tokenAllowance
            ? "Approve penalty"
            : "Pay penalty"}
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
        <button
          onClick={handleShareUrl}
          className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
        >
          {isCopied ? "URL Copied!" : "Share Club URL"}
        </button>
      </div>
    </div>
  );
};

//  // Mapping to track users who have paid the penalty fee
//     mapping(address => bool) public hasPaidPenalty;

// uint256 public ThriftPurseBalance;
// mapping(address => uint256) public ThriftPurseTokenBalance;
// uint256 public ThriftPursePenaltyBalance;
// mapping(address => uint256) public ThriftPursePenaltyTokenBalance;
