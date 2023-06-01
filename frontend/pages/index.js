import Image from "next/image";
import { Inter } from "next/font/google";
import { ConnectWallet } from "@thirdweb-dev/react";
import Nav from "@/components/nav";
import Hero from "@/components/hero";
import CardList from "@/components/cardlist";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <CardList />
    </>
  );
}
