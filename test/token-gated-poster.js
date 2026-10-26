const LabToken = artifacts.require("LabToken");
const TokenGatedPoster = artifacts.require("TokenGatedPoster");

contract("TokenGatedPoster", (accounts) => {
  it("allows holder and rejects account without tokens", async () => {
    const token = await LabToken.new("Test Token", "TT", 100, { from: accounts[0] });
    const threshold = web3.utils.toWei("10", "ether");
    const poster = await TokenGatedPoster.new(token.address, threshold, { from: accounts[0] });
    await poster.post("Allowed", "access", { from: accounts[0] });
    try {
      await poster.post("Rejected", "access", { from: accounts[1] });
      assert.fail("posting without tokens should revert");
    } catch (error) {
      assert.include(error.message, "Not enough tokens");
    }
  });

  it("restricts settings to owner", async () => {
    const token = await LabToken.new("Test Token", "TT", 100, { from: accounts[0] });
    const poster = await TokenGatedPoster.new(token.address, 10, { from: accounts[0] });
    await poster.setThreshold(20, { from: accounts[0] });
    assert.equal((await poster.threshold()).toString(), "20");
    try {
      await poster.setThreshold(1, { from: accounts[1] });
      assert.fail("non-owner update should revert");
    } catch (error) {
      assert.include(error.message, "Ownable: caller is not the owner");
    }
  });
});
