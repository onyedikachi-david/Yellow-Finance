const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
// const { ethers } = require("ethers");

describe("ThriftClubFactory", function () {
  async function deployThriftClubFixture() {
    const [admin, user] = await ethers.getSigners();

    const ThriftClubFactory = await hre.ethers.getContractFactory(
      "ThriftClubFactory"
    );
    const Factory = await ThriftClubFactory.deploy(
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      "0x57A4a13b35d25EE78e084168aBaC5ad360252467"
    );
    // const Factory = await hre.ethers.getContractFactory("ThriftClubFactory", [
    //   "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    //   "0x57A4a13b35d25EE78e084168aBaC5ad360252467",
    // ]);
    // const factory = await Factory.deploy();
    await Factory.deployed();
    console.log(Factory.address);

    // Deploy the ThriftClub contract using the factory
    const tokenAddress = "0x0000000000000000000000000000000000000000";
    const cycleDuration = 20;
    const contributionAmount = 5;
    const penalty = 5;
    const maxParticipants = 2;
    const name = "Work";
    const description = "Is boring";

    await factory.createThriftClub(
      tokenAddress,
      cycleDuration,
      contributionAmount,
      penalty,
      maxParticipants,
      name,
      description
    );

    const createdClubs = await factory.getThriftClubs();
    const thriftClub = await ethers.getContractAt(
      "ThriftClub",
      createdClubs[0]
    );

    // Return the necessary variables
    return { factory, thriftClub, admin, user, createdClubs };
  }

  it("Deploy and check thriftClubs", async function () {
    const { createdClubs } = await loadFixture(deployThriftClubFixture);

    // Call getThriftClubs directly and assert the result
    const result = await this.factory.getThriftClubs();
    expect(result).to.deep.equal(createdClubs);
  });
});
