const { ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { getMerkleTree, getMerkleRoot, getMerkleProof } = require('../utils/merkletree');

describe("NFT Smart Contract Unit Tests", () => {
    let contract, attacker, attackerConnectedContract, accounts, merkleRoot, merkleTree;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        merkleTree = getMerkleTree(accounts);
        merkleRoot = getMerkleRoot(merkleTree);

        const contractFactory = await ethers.getContractFactory("NFT");
        contract = await contractFactory.deploy();

        attacker = accounts[1];
        attackerConnectedContract = contract.connect(attacker);
    })

    describe("Initial State", () => {
        it("Collection Size should be 1000", async () => {
            const currentValue = await contract.collectionSize();
            const expectedValue = 1000;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Public Mint Price should be 0.1 ETH", async () => {
            const currentValue = await contract.publicMintPrice();
            const expectedValue = ethers.utils.parseEther("0.1");
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Public Max Mint Amount should be 3", async () => {
            const currentValue = await contract.publicMaxMintAmount();
            const expectedValue = 3;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Whitelist Allocation should be 500", async () => {
            const currentValue = await contract.whitelistAllocation();
            const expectedValue = 500;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Whitelist Mint Price should be 0.05 ETH", async () => {
            const currentValue = await contract.whitelistMintPrice();
            const expectedValue = ethers.utils.parseEther("0.05");
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Whitelist Max Mint Amount should be 1", async () => {
            const currentValue = await contract.whitelistMaxMintAmount();
            const expectedValue = 1;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Unrevealed URI should be https://exampleUnrevealedUri.com", async () => {
            const currentValue = await contract.unrevealedUri();
            const expectedValue = "https://exampleUnrevealedUri.com";
            assert.equal(currentValue, expectedValue);
        })

        it("Base Uri should be https://exampleUri.com/", async () => {
            const currentValue = await contract.baseUri();
            const expectedValue = "https://exampleUri.com/";
            assert.equal(currentValue, expectedValue);
        })

        it("Reveal should be false", async () => {
            const currentValue = await contract.isRevealed();
            const expectedValue = false;
            assert.equal(currentValue, expectedValue);
        })

        it("Sale State should be 0 (Closed)", async () => {
            const currentValue = await contract.saleState();
            const expectedValue = 0;
            assert.equal(currentValue.toString(), expectedValue);
        })
    })

    describe("'setCollectionSize()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setCollectionSize(2000)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Collection size should be 2000 after calling function with parameter: 2000", async () => {
            const newCollectionSize = 2000;
            await contract.setCollectionSize(newCollectionSize);

            const currentValue = await contract.collectionSize();
            assert.equal(currentValue.toString(), newCollectionSize);
        })
    })

    describe("'setPublicMintPrice()'", async () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setPublicMintPrice(ethers.utils.parseEther("0.2").toString())).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Public Mint Price should be 0.2 ETH after calling function with parameter: 200000000000000000", async () => {
            const newMintPrice = ethers.utils.parseEther("0.2");
            await contract.setPublicMintPrice(newMintPrice);

            const currentValue = await contract.publicMintPrice();
            assert.equal(currentValue.toString(), newMintPrice);
        })
    })

    describe("'setPublicMaxMintAmount()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setPublicMaxMintAmount(5)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Public Max Mint Amount should be 5 after calling function with parameter: 5", async () => {
            const newMaxMintAmount = 5;
            await contract.setPublicMaxMintAmount(5);

            const currentValue = await contract.publicMaxMintAmount();
            assert.equal(currentValue.toString(), newMaxMintAmount);
        })
    })

    describe("'setWhitelistAllocation()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setWhitelistAllocation(600)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should revert if whitelist allocation is over collection size", async () => {
            await expect(contract.setWhitelistAllocation(1100)).to.be.revertedWith("InvalidWhitelistAllocation");
        })

        it("Whitelist Allocation should be 600 after calling function with parameter: 600", async () => {
            const newWhitelistAllocation = 600;
            await contract.setWhitelistAllocation(600);

            const currentValue = await contract.whitelistAllocation();
            assert.equal(currentValue.toString(), newWhitelistAllocation);
        })
    })

    describe("'setWhitelistMintPrice()'", async () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setWhitelistMintPrice(ethers.utils.parseEther("0.1").toString())).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Whitelist mint price should be 0.1 ETH after calling function with parameter: 100000000000000000", async () => {
            const newMintPrice = ethers.utils.parseEther("0.1");
            await contract.setWhitelistMintPrice(newMintPrice);

            const currentValue = await contract.whitelistMintPrice();
            assert.equal(currentValue.toString(), newMintPrice);
        })
    })

    describe("'setWhitelistMaxMintAmount()'", async () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setWhitelistMaxMintAmount(2)).to.be.revertedWith("Ownable: caller is not the owner");
        }) 

        it("Whitelist Max Mint Amount should be 2 after calling function with parameter: 2", async () => {
            const newMaxMintAmount = 2;
            await contract.setWhitelistMaxMintAmount(2);

            const currentValue = await contract.whitelistMaxMintAmount();
            assert.equal(currentValue.toString(), newMaxMintAmount);
        })
    })

    describe("'setWhitelistMerkleRoot()'", async () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setWhitelistMerkleRoot("0x11d251a3c7c541a8a68635af1ed366692175fbdc9f3b07da18af66c111f85800")).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Whitelist Merkle root should be 0x11d251a3c7c541a8a68635af1ed366692175fbdc9f3b07da18af66c111f85800 after calling function with parameter: 0x11d251a3c7c541a8a68635af1ed366692175fbdc9f3b07da18af66c111f85800", async () => {
            const newMerkleRoot = "0x11d251a3c7c541a8a68635af1ed366692175fbdc9f3b07da18af66c111f85800";
            await contract.setWhitelistMerkleRoot("0x11d251a3c7c541a8a68635af1ed366692175fbdc9f3b07da18af66c111f85800");

            const currentValue = await contract.whitelistMerkleRoot();
            assert.equal(currentValue, newMerkleRoot);
        })
    })

    describe("'setUnrevealedUri()'", async () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setUnrevealedUri("https://newUnrevealedUri.com")).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Unrevealed URI should be https://newUnrevealedUri.com after calling function with parameter: https://newUnrevealedUri.com", async () => {
            const newUri = "https://newUnrevealedUri.com";
            await contract.setUnrevealedUri(newUri);

            const currentValue = await contract.unrevealedUri();
            assert.equal(currentValue, newUri);
        })
    })

    describe("'setBaseUri()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setBaseUri("https://newBaseUri.com/")).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Base URI should be https://newBaseUri.com/ after calling function with parameter: https://newBaseUri.com/", async () => {
            const newUri = "https://newBaseUri.com/";
            await contract.setBaseUri(newUri);

            const currentValue = await contract.baseUri();
            assert.equal(currentValue, newUri);
        })
    })

    describe("'toggleRevealed()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.toggleRevealed()).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Reveal should be true after calling function", async () => {
            await contract.toggleRevealed();

            const currentValue = await contract.isRevealed();
            const expectedValue = true;
            assert.equal(currentValue, expectedValue);
        })
    })

    describe("'setSaleState()'", () => {
        it("Should be reverted if called by non-owner", async () => {
            await expect(attackerConnectedContract.setSaleState(1)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Sale state should be 1 after calling function with parameter: 1", async () => {
            const newSaleState = 1;
            await contract.setSaleState(newSaleState);

            const currentValue = await contract.saleState();
            assert.equal(currentValue.toString(), newSaleState);
        })

        it("Sale state should be 2 after calling function with parameter: 2", async () => {
            const newSaleState = 2;
            await contract.setSaleState(newSaleState);

            const currentValue = await contract.saleState();
            assert.equal(currentValue.toString(), newSaleState);
        })
    })

    describe("'publicMint()'", () => {
        it("Should revert if user has previously minted 3", async () => {
            await contract.setSaleState(2);
            await contract.publicMint(3, { value: ethers.utils.parseEther("0.3") });

            await expect(contract.publicMint(1, { value: ethers.utils.parseEther("0.1") })).to.be.revertedWith("MintingTooMany");
        })

        it("Should revert if sale state isn't 2 (Public)", async () => {
            await expect(contract.publicMint(1, { value: ethers.utils.parseEther("0.1") })).to.be.revertedWith("SaleIsClosed");
        })

        it("Should revert if caller sends insufficient funds", async () => {
            await contract.setSaleState(2);
            await expect(contract.publicMint(1, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith("InsufficientFunds");
        })

        it("Caller's balance should be 3 after minting 3", async () => {
            await contract.setSaleState(2);
            await contract.publicMint(3, { value: ethers.utils.parseEther("0.3") });

            const currentValue = await contract.balanceOf(accounts[0].address);
            const expectedValue = 3;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Total Supply should be 3", async () => {
            await contract.setSaleState(2);
            await contract.publicMint(3, { value: ethers.utils.parseEther("0.3") });

            const currentValue = await contract.totalSupply();
            const expectedValue = 3;
            assert.equal(currentValue.toString(), expectedValue);
        })
    })

    describe("'whitelistMint()'", () => {
        let merkleProof;

        beforeEach(async () => {
            await contract.setWhitelistMerkleRoot(merkleRoot);
            merkleProof = getMerkleProof(merkleTree, accounts[0].address);
        })

        it("Should revert if user has previously minted 1", async () => {
            await contract.setSaleState(1);
            await contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") });

            await expect(contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith("MintingTooMany")
        })

        it("Should revert if sale state isn't 1 (Whitelist)", async () => {
            await expect(contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith("SaleIsClosed");
        })

        it("Should revert if user sends insufficient funds", async () => {
            await contract.setSaleState(1);
            await expect(contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("InsufficientFunds");
        })

        it("Should revert if caller sends invalid merkle proof", async () => {
            await contract.setSaleState(1);
            const mockAddress = "0xb5E8683Aa524069C5714Fc2D8c3e64F78f2862fb"
            const merkleProof = getMerkleProof(merkleTree, mockAddress);

            await expect(contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith("InvalidProof")
        })

        it("Caller's balance should be 1 after minting 1", async () => {
            await contract.setSaleState(1);
            await contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") })

            const currentValue = await contract.balanceOf(accounts[0].address);
            const expectedValue = 1;
            assert.equal(currentValue.toString(), expectedValue);
        })

        it("Total supply should be 1 after minting 1", async () => {
            await contract.setSaleState(1);
            await contract.whitelistMint(merkleProof, 1, { value: ethers.utils.parseEther("0.05") })

            const currentValue = await contract.totalSupply();
            const expectedValue = 1;
            assert.equal(currentValue.toString(), expectedValue);
        })
    })

    describe("'tokenURI()'", () => {
        it("Should return unrevealed URI if reveal is false", async () => {
            const currentValue = await contract.tokenURI(1);
            const expectedValue = "https://exampleUnrevealedUri.com";
            assert.equal(currentValue, expectedValue);
        })

        it("Should return https://exampleUri.com/1.json if reveal is true and calling with parameter: 1", async () => {
            await contract.toggleRevealed();
            const currentValue = await contract.tokenURI(1);
            const expectedValue = "https://exampleUri.com/1.json";
            assert.equal(currentValue, expectedValue);
        })
    })

    describe("'withdraw()'", () => {

        beforeEach(async () => {
            await contract.setSaleState(2);
            const account1ConnnectedContract = contract.connect(accounts[1]);
            await account1ConnnectedContract.publicMint(3, { value: ethers.utils.parseEther("0.3") });
        })

        it("Should revert if called by non-owner", async () => {
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("After minting 3 in the public sale, calling withdraw should send 0.3 ETH to the owner", async () => {
            const ownerStartingBalance = await contract.provider.getBalance(accounts[0].address);
            
            const withdraw = await contract.withdraw();
            const withdrawReceipt = await withdraw.wait();
            const { gasUsed, effectiveGasPrice } = withdrawReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const ownerEndingBalance = await contract.provider.getBalance(accounts[0].address);
            assert.equal(ownerEndingBalance.toString(), ownerStartingBalance.add(ethers.utils.parseEther("0.3")).sub(gasCost).toString())
        })
    })
})