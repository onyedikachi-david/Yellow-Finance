import Nav from "@/components/nav";
import React from "react";
import { useForm } from "react-hook-form";
import { useContract, useContractWrite } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";

function Create() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Thirdweb
  const { contract } = useContract(
    "0x25BeBb3a758262b5A640f2f9011b420419eacE69"
  );
  const { mutateAsync: createThriftClub, isLoading } = useContractWrite(
    contract,
    "createThriftClub"
  );

  const onSubmit = async (data) => {
    // Call the Solidity function here with the form data
    // For example:
    // createThriftClub(data.token, data.cycleDuration, data.contributionAmount, data.penalty, data.maxParticipant, data.name, data.description);
    console.log(data);
    try {
      const data = await createThriftClub({
        args: [
          data.token,
          data.cycleDuration,
          data.contributionAmount,
          data.penalty,
          data.maxParticipant,
          data.name,
          data.description,
        ],
      });
      console.info("contract call success", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  return (
    <>
      <Nav />
      <div className="flex h-screen items-center justify-center bg-slate-400 text-black">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg bg-white p-8 shadow-lg"
        >
          <h2 className="mb-6 text-2xl font-bold">Create Thrift Club</h2>

          <div className="mb-4">
            <label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="token"
            >
              Token Address:
            </label>
            <input
              type="text"
              name="token"
              id="token"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
            />
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
              Cycle Duration:
            </label>
            <input
              type="number"
              name="cycleDuration"
              id="cycleDuration"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              ref={register({ required: true })}
            />
            {errors.cycleDuration && (
              <span className="text-sm text-red-500">
                This field is required
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
              ref={register({ required: true })}
            />
            {errors.penalty && (
              <span className="text-sm text-red-500">
                This field is required
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
            Create Thrift Club
          </button>
        </form>
      </div>
    </>
  );
}

export default Create;
