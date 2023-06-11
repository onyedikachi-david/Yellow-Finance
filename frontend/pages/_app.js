import AuthProvider from "@/components/authProvider";
import { StateContextProvider } from "@/context";
import "@/styles/globals.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";

const activeChain = "mumbai";

export default function App({ Component, pageProps }) {
  return (
    // <StateContextProvider>
    <>
      {/* // <StateContextProvider> */}
      <ThirdwebProvider activeChain={activeChain}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThirdwebProvider>
      {/* // </StateContextProvider> */}
      <Analytics />
    </>
  );
}
