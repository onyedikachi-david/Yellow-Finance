import React from "react";
import { useEffect, useState, useRef } from "react";
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import ThriftClub from "@/ThriftClub.sol/ThriftClub.json";
import { format, differenceInWeeks } from "date-fns";

function CardList({ props }) {
  const [thriftContracts, setThriftContracts] = useState([]);

  const [thriftDataList, setThriftDataList] = useState([]);
  const { contract } = useContract(
    "0x11277e0BEACe37deBEF8578619A2afC3F66ab4F1"
  );
  const { data, isLoading } = useContractRead(contract, "getThriftClubs", []);

  useEffect(() => {
    if (!isLoading && data.length > 0) {
      setThriftContracts(data);
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (thriftContracts.length > 0) {
      getThriftDetails();
    }
  }, [thriftContracts]);

  async function getThriftDetails() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    try {
      const contractPromises = thriftContracts.map(async (contractAddress) => {
        const contract = new ethers.Contract(
          contractAddress,
          ThriftClub.abi,
          signer
        );
        const thriftClubData = await contract.getThriftClubData();

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

        const thriftData = {
          token,
          cycleDuration: cycleDuration,
          contributionAmount: contributionAmount,
          penalty: penalty,
          maxParticipant: maxParticipant,
          name,
          description,
          nftContract,
          daoContract,
          t_state,
          lastUpdateTimestamp: lastUpdateTimestamp,
        };

        return thriftData;
      });

      const results = await Promise.all(contractPromises);
      console.log(results);

      setThriftDataList(results);
    } catch (error) {
      console.log(error);
    }
  }

  // const currentDate = new Date();
  // const weeks = differenceInWeeks(
  //   currentDate,
  //   cycleD,
  //   new Date(currentDate.getTime() - cycleD * 1000)
  // );
  // const formattedCycleDuration = `${weeks} week${weeks !== 1 ? "s" : ""}`;

  return (
    <>
      <div className="flex flex-col bg-[#E5E5E5] font-epilogue text-black">
        {/* <!-- main card --> */}
        <div className="rounded-xl bg-[#F4F5FA] p-10">
          {/* <!-- headers content--> */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="max-w-lg font-epilogue text-4xl font-extrabold">
              Browse and join your favorite club
            </div>
            {/* <div className="mt-5 max-w-lg text-sm font-light">
              All devices come with free delivery or pickup as standard. See
              information on available shopping options for your location.
            </div> */}
          </div>
          {/* <div className="mt-10 flex flex-col grow items-center justify-center space-x-0 space-y-12 md:flex-row md:space-x-8 md:space-y-0"> */}
          {/* <div className="mt-10 flex-grow overflow-ellipsis"> */}
          {/* <div className="flex space-x-8"> */}
          <div className="mt-10 flex flex-wrap justify-center">
            {thriftDataList.length > 0 ? (
              thriftContracts.map((contractAddress, index) => {
                const thriftData = thriftDataList[index];
                const currentDate = new Date();
                const weeks = differenceInWeeks(
                  currentDate,
                  new Date(
                    currentDate.getTime() - thriftData.cycleDuration * 1000
                  )
                );
                const formattedCycleDuration = `${weeks} week${
                  weeks !== 1 ? "s" : ""
                }`;

                return (
                  <div
                    key={contractAddress}
                    className="mx-10 mb-8 rounded-xl bg-[#f1c830]"
                  >
                    <div className="flex w-96 translate-x-4 translate-y-4 flex-col rounded-xl bg-white p-8 shadow-xl hover:bg-blue-400 md:w-auto">
                      <img
                        src={`https://avatars.dicebear.com/api/male/${contractAddress}.svg`}
                        className="w-8"
                      />
                      <div className="mt-3  text-lg font-semibold">
                        {thriftData.name}
                      </div>
                      <div className="text-sm font-light">
                        {thriftData.description}
                      </div>
                      <div className="my-4">
                        <span className="text-base font-bold">
                          {ethers.BigNumber.from(
                            thriftData.contributionAmount
                          ).toNumber()}
                        </span>
                        <span className="text-sm font-light">/Week</span>
                      </div>

                      <div>
                        Token:{" "}
                        {thriftData.token ===
                        "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23"
                          ? "USDC"
                          : thriftData.token ===
                            "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832"
                          ? "USDT"
                          : thriftData.token ===
                            "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F"
                          ? "DAI"
                          : thriftData.token ===
                            "0x0d787a4a1548f673ed375445535a6c7A1EE56180"
                          ? "WBTC"
                          : "Native Coin"}
                      </div>
                      <div>Cycle Duration: {formattedCycleDuration}</div>
                      <div>
                        Max Participants:{" "}
                        {ethers.BigNumber.from(
                          thriftData.maxParticipant
                        ).toNumber()}
                      </div>
                      <div>
                        Penalty:{" "}
                        {ethers.BigNumber.from(thriftData.penalty).toNumber()}
                      </div>
                      {/* Include other fields from the ThriftClubData struct */}

                      <button
                        className="mt-4 rounded-full border border-[#57578d] bg-[#98a6eb] px-4 py-3 shadow-xl shadow-slate-600 hover:bg-sky-500"
                        onClick={() => {
                          const clubAddress = contractAddress;
                          window.location.href = `club/${clubAddress}`;
                        }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
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
            )}
          </div>
          {/* </div> */}

          <div className="flex justify-center">
            <button className="mt-12 rounded-full bg-slate-900 px-4 py-3 text-white">
              More
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardList;
