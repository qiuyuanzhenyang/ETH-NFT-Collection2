// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  //コントラクトがコンパイルします
  //コントラクトを扱うために必要なファイルが’artifacts’ディレクトリの直下に生成されます
  const nftContractFactory = await hre.ethers.getContractFactory("MyEpicNFT");
  //HardhatがローカルのEthereumネットワークを作成します
  const nftContract = await nftContractFactory.deploy();
  //コントラクトがミントされ、ローカルのブロックチェーンにデプロイされるまで待ちます。
  await nftContract.deployed();
  console.log("Contract deployed to:", nftContract.address);
  //makeAnEpicNFT関数を呼び出す。NFTがMintされる。
  const txn = await nftContract.makeAnEpicNFT();
  //Mintingが仮想マイナーにより、承認されるのを待つ。
  await txn.wait();
  console.log("Minted NFT #1");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
