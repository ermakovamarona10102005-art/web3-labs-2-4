const Poster = artifacts.require("Poster");

contract("Poster", (accounts) => {
  it("emits NewPost with author, content and indexed tag", async () => {
    const poster = await Poster.new();
    const tx = await poster.post("Hello, Sepolia!", "hello", { from: accounts[0] });
    assert.equal(tx.logs.length, 1);
    assert.equal(tx.logs[0].event, "NewPost");
    assert.equal(tx.logs[0].args.user, accounts[0]);
    assert.equal(tx.logs[0].args.content, "Hello, Sepolia!");
    assert.equal(tx.logs[0].args.tag, web3.utils.keccak256("hello"));
  });
});
