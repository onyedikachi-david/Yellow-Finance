import AuthProvider from "@/components/authProvider";
import { StateContextProvider } from "@/context";
import "@/styles/globals.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Analytics } from "@vercel/analytics/react";
import { MoonbaseAlpha, Mumbai } from "@thirdweb-dev/chains";

// const activeChain = "mumbai";

export default function App({ Component, pageProps }) {
  return (
    // <StateContextProvider>
    <>
      {/* // <StateContextProvider> */}
      <ThirdwebProvider
        activeChain={MoonbaseAlpha}
        supportedChains={[Mumbai, MoonbaseAlpha]}
      >
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThirdwebProvider>
      {/* // </StateContextProvider> */}
      <Analytics />
    </>
  );
}
