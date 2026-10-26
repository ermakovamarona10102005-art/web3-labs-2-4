const LabToken = artifacts.require("LabToken");

contract("LabToken", (accounts) => {
  it("assigns initial supply to owner", async () => {
    const token = await LabToken.new("Student Lab Token", "SLT", 1000, { from: accounts[0] });
    assert.equal((await token.balanceOf(accounts[0])).toString(), web3.utils.toWei("1000", "ether"));
  });

  it("allows only owner to mint", async () => {
    const token = await LabToken.new("Student Lab Token", "SLT", 1000, { from: accounts[0] });
    await token.mint(accounts[1], web3.utils.toWei("25", "ether"), { from: accounts[0] });
    assert.equal((await token.balanceOf(accounts[1])).toString(), web3.utils.toWei("25", "ether"));
    try {
      await token.mint(accounts[2], 1, { from: accounts[1] });
      assert.fail("non-owner mint should revert");
    } catch (error) {
      assert.include(error.message, "Ownable: caller is not the owner");
    }
  });
});
