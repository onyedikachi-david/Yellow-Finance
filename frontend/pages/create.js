import Nav from "@/components/nav";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";
// import {mycreateThriftClub } from
import { useStateContext } from "@/context";
import { ethers } from "ethers";
import Router from "next/router";
import ThriftClubFactory from "@/ThriftClubFactory.sol/ThriftClubFactory.json";

// const { mycreateThriftClub } = useStateContext();

const tokenOptions = [
  { label: "Native", value: "0x0000000000000000000000000000000000000000" },
  { label: "USDC", value: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23" },
  { label: "USDT", value: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832" },
  { label: "DAI", value: "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F" },
  { label: "WBTC", value: "0x0d787a4a1548f673ed375445535a6c7A1EE56180" },
];

const thriftClubFactoryAddress = "0x7c1215907A5d4AD9B0fC1a147111A657CA8d3A9e";

function Create() {
  const [transactionDetails, setTransactionDetails] = React.useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const [penaltyAmount, setPenaltyAmount] = React.useState("");

  // Thirdweb
  // const { contract } = useContract(
  //   "0x1483EfE8025cCf49b529AE93dc4C1dD7720a2A24"
  // );
  // const { mutateAsync: createThriftClub, isLoading } = useContractWrite(
  //   contract,
  //   "createThriftClub"
  // );

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (formData) => {
    console.log(formData);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const contract = new ethers.Contract(
        thriftClubFactoryAddress,
        ThriftClubFactory.abi,
        signer
      );

      console.log(contract);

      // const data = await createThriftClub({
      //   args: [
      //     formData.token,
      //     formData.cycleDuration * 604800,
      //     formData.contributionAmount,
      //     formData.penalty,
      //     formData.maxParticipant,
      //     formData.name,
      //     formData.description,
      //   ],
      // });
      const overrides = {
        value: ethers.utils.parseEther("0.001"),
      };

      const createThriftTx = await contract.createThriftClub(
        formData.token,
        formData.cycleDuration * 604800,
        formData.contributionAmount,
        formData.penalty,
        formData.maxParticipant,
        formData.name,
        formData.description,
        overrides
      );
      createThriftTx.wait();
      console.log("Club transaction", createThriftTx.hash());
      // console.info("contract call success", data);
      // const creator = data.receipt.events[0].args.creator;
      // const thriftClub = data.receipt.events[0].args.thriftClub;
      // console.log(creator);
      // console.log(thriftClub);
      setTransactionDetails({ creator, thriftClub });
    } catch (err) {
      console.error("contract call failure", err);
    }
  };
  const isHalfOfContributionAmount = (value) => {
    const contributionAmount = watch("contributionAmount");
    return Number(value) === Number(contributionAmount) / 2;
  };

  const handleContributionAmountChange = (e) => {
    const contributionAmount = e.target.value;
    const calculatedPenaltyAmount = contributionAmount / 2;
    setPenaltyAmount(calculatedPenaltyAmount);
  };

  return (
    <>
      <Nav />

      <div className="flex h-screen items-center justify-center bg-slate-400 text-black">
        {isLoading && (
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
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-2/3 rounded-lg bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-bold">Create Thrift Club</h2>
          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="token"
            >
              Token Address:
            </label>
            <select
              name="token"
              id="token"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
            >
              <option value="">Select a token</option>
              {tokenOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  // className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {errors.token && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="cycleDuration"
            >
              Cycle Duration (in weeks):{" "}
            </label>
            <input
              type="number"
              name="cycleDuration"
              id="cycleDuration"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({
                required: true,
                min: 2,
                max: 8, // 8 weeks = 2 months
              })}
            />
            {errors.cycleDuration &&
              errors.cycleDuration.type === "required" && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            {errors.cycleDuration && errors.cycleDuration.type === "min" && (
              <span className="text-sm text-red-500">
                Minimum cycle duration is 2 weeks
              </span>
            )}
            {errors.cycleDuration && errors.cycleDuration.type === "max" && (
              <span className="text-sm text-red-500">
                Maximum cycle duration is 2 months (8 weeks)
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="contributionAmount"
            >
              Contribution Amount:
            </label>
            <input
              type="number"
              name="contributionAmount"
              id="contributionAmount"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
              onChange={handleContributionAmountChange}
            />
            {errors.contributionAmount && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="penalty"
            >
              Penalty fee:
            </label>
            <input
              type="number"
              name="penalty"
              id="penalty"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({
                required: true,
                validate: {
                  isHalfOfContributionAmount: (value) =>
                    parseFloat(value) === penaltyAmount,
                },
              })}
              value={penaltyAmount}
              readOnly
            />
            {errors.penalty &&
              errors.penalty.type === "isHalfOfContributionAmount" && (
                <span className="text-sm text-red-500">
                  The penalty must be half of the contribution amount
                </span>
              )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="maxParticipant"
            >
              Max Participant:
            </label>
            <input
              type="number"
              name="maxParticipant"
              id="maxParticipant"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
            />
            {errors.maxParticipant && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="name"
            >
              Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="description"
            >
              Description:
            </label>
            <input
              type="text"
              name="description"
              id="description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
              // onChange={(e) => setInput(e.target.value)}
            />
            {errors.description && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {/* isLoading */}
            Create Thrift Club
          </button>
        </form>
      </div>
      {/* Alert */}
      {/* Alert */}
      {transactionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-4">
            <div className="mb-4 text-gray-700">Status: Success</div>
            <div className="mb-2 text-gray-700">
              Creator: {transactionDetails.creator}
            </div>
            <div className="mb-4 text-gray-700">
              ThriftClub: {transactionDetails.thriftClub}
            </div>
            <button
              className="rounded-lg bg-blue-500 px-4 py-2 text-white"
              onClick={() =>
                Router.push(`/club/${transactionDetails.thriftClub}`)
              }
            >
              Open Club
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Create;
