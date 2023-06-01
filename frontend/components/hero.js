import React from "react";

const Hero = () => {
  return (
    <section className=" bg-blue-700 py-16 text-white">
      <div className="container mx-auto flex flex-col items-center md:flex-row">
        <div className="md:w-1/2">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Explore the IDEAL thrift world
          </h1>
          <p className="mb-4 text-xl">
            Create your own thrift, explore and join any thrift.
          </p>
          <i className=" mb-8 flex">
            Secured by Chainlink VRF, Price Feed and Automation
          </i>

          <a
            href="#"
            className=" mt-10 rounded bg-blue-500 px-6 py-6 text-white hover:bg-blue-600"
          >
            Explore
          </a>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2">
          <img class=" h-50" src="hero.svg" alt="Hero Image" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
