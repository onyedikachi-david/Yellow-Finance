import Nav from "@/components/nav";
import React from "react";
import { useForm } from "react-hook-form";
import { useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";
// import {mycreateThriftClub } from
import { useStateContext } from "@/context";

// const { mycreateThriftClub } = useStateContext();

const tokenOptions = [
  { label: "USDC", value: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23" },
  { label: "USDT", value: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832" },
  { label: "DAI", value: "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F" },
  { label: "WBTC", value: "0x0d787a4a1548f673ed375445535a6c7A1EE56180" },
];

function Create() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  // Thirdweb
  const { contract } = useContract(
    "0x25BeBb3a758262b5A640f2f9011b420419eacE69"
  );
  const { mutateAsync: createThriftClub, isLoading } = useContractWrite(
    contract,
    "createThriftClub"
  );

  const onSubmit = async (formData) => {
    // Call the Solidity function here with the form data
    // For example:
    // createThriftClub(data.token, data.cycleDuration, data.contributionAmount, data.penalty, data.maxParticipant, data.name, data.description);
    console.log(formData);
    try {
      const data = await createThriftClub({
        args: [
          formData.token,
          formData.cycleDuration * 604800,
          formData.contributionAmount,
          formData.penalty,
          formData.maxParticipant,
          formData.name,
          formData.description,
        ],
      });
      console.info("contract call success", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const isHalfOfContributionAmount = (value) => {
    const contributionAmount = watch("contributionAmount");
    return Number(value) === Number(contributionAmount) / 2;
  };

  return (
    <>
      <Nav />
      <div className="flex h-screen items-center justify-center bg-slate-400 text-black">
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
              Penalty:
            </label>
            <input
              type="number"
              name="penalty"
              id="penalty"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({
                required: true,
                validate: {
                  isHalfOfContributionAmount: isHalfOfContributionAmount,
                },
              })}
            />
            {errors.penalty &&
              errors.penalty.type === "isHalfOfContributionAmount" && (
                <span>The penalty must be half of the contribution amount</span>
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
          {/* <Web3Button
            contractAddress="0x434be29697DA9Fa72D3500662144a06738424192"
            action={(contract) => {
              contract.call("createThriftClub", [
                formData.token,
                formData.cycleDuration,
                formData.contributionAmount,
                formData.penalty,
                formData.maxParticipant,
                formData.name,
                formData.description,
              ]);
            }}
          >
            createThriftClub
          </Web3Button> */}
        </form>
      </div>
    </>
  );
}

export default Create;
