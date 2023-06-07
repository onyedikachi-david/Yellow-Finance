import { createContext, useContext } from "react";
import { useContract, useContractWrite, Web3Button } from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0x25BeBb3a758262b5A640f2f9011b420419eacE69"
  );
  const { mutateAsync: createThriftClub, isLoading } = useContractWrite(
    contract,
    "createThriftClub"
  );

  const cThriftClub = async (myFormData) => {
    try {
      const data = await createThriftClub({
        args: [
          myFormData.token,
          myFormData.cycleDuration,
          myFormData.contributionAmount,
          myFormData.penalty,
          myFormData.maxParticipant,
          myFormData.name,
          myFormData.description,
        ],
      });
      console.info("contract call success", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  return (
    <StateContext.Provider
      value={{
        createContext,
        mycreateThriftClub: cThriftClub,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
