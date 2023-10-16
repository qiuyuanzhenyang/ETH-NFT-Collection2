import myEpicNft from "./utils/MyEpicNFT.json";
//フロントエンドとコントラクトを連携するライブラリをインポートします。
import { ethers } from "ethers";

//useEffectとuseState関数をReact.jsからインポートしています。
import React, { useEffect, useState } from 'react';

import "./styles/App.css";
import twitterLogo from './assets/twitter-logo.svg';
// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'factfullness86';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
//const OPENSEA_LINK = '';
//const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x409661842C654CA37b16118f6cF8615970663CF8";

const App = () => {
  /*
   *ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);

  //setupEventListener関数を定義します。
  //MyEpicNFT.solの中でeventがemitされたときに情報を受け取ります。
  const setupEventListener = async () => {
    try{
      const { ethereum } = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //NFTが発行されます。
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer,
        );
        //Eventがemitされる際に、コントラクトから送信される情報を受け取っています。
        connectedContract.on("NewEpicNFTMinted", (from, tolenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットに NFT を送信しました。gemcase に表示されるまで数分かかることがあります。NFT へのリンクはこちらです: https://gemcase.vercel.app/view/evm/sepolia/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`,
            );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   *ユーザーが認証可能なウォレットアドレスを持っているか確認します。
   */
  const checkIfWalletIsConnected = async () => {
    /*
     *ユーザーがMetaMaskを持っているか確認します。
     */
    const { ethereum } = window;
    if(!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /*
		// ユーザーが認証可能なウォレットアドレスを持っている場合は、
    // ユーザーに対してウォレットへのアクセス許可を求める。
    // 許可されれば、ユーザーの最初のウォレットアドレスを
    // accounts に格納する。
     */
    const accounts = await ethereum.request({ method: "eth_accounts"});

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      //****イベントリスナーをここで設定 ****
      //この時点で、ユーザーはウォレット接続が済んでいます。
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   *connectWalletメソッドを実装します。
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       *ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       *ウォレットアドレスをcurrentAccountに紐づけます。
       */
      setCurrentAccount(accounts[0]);

      //****イベントリスナーをここで設定****
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  //NFTをMintする関数を定義しています。
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className='cta-button connect-wallet-button'
    >
      Connect to Wallet
    </button>
  );
  /*
   *ページがロードされたときにuseEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  },[]);
  
  // Mint NFT ボタンをレンダリングするメソッドを定義します。
  const renderMintUI = () => (
    <button
    onClick={askContractToMintNft}
    className="cta-button connect-wallet-button"
    >
      Mint NFT
      </button>
      );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT を Mint しよう💫</p>
          {/*条件付きレンダリングを追加しました
          // すでに接続されている場合は、
          // Connect to Walletを表示しないようにします。*/}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

let chainId = await ethereum.request({method: "eth_chainId"});
console.log("Connected to chain" + chainId);
// 0xaa367(11155111)はSepoliaのIDです。
const sepoliaChainId = "0xaa36a7";
if (chainId !== sepoliaChainId) {
alert("You are not connected to the sepolia Test Network!");
}

export default App;
