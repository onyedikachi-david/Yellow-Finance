import "@/styles/globals.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";

const activeChain = "ethereum";

export default function App({ Component, pageProps }) {
  return (
    <ThirdwebProvider activeChain={activeChain}>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}
