const Poster = artifacts.require("Poster");
const LabToken = artifacts.require("LabToken");
const TokenGatedPoster = artifacts.require("TokenGatedPoster");

module.exports = async function (deployer) {
  await deployer.deploy(Poster);
  await deployer.deploy(LabToken, "Student Lab Token", "SLT", 1000);
  const token = await LabToken.deployed();
  await deployer.deploy(TokenGatedPoster, token.address, web3.utils.toWei("10", "ether"));
};
