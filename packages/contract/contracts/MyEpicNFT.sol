// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// いくつかの OpenZeppelin のコントラクトをインポートします。
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// utils ライブラリをインポートして文字列の処理を行います。
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

//Base64.solコントラクトからSVGとJSONをBase64に変換する関数をインポートします。
import { Base64 } from "./libraries/Base64.sol";

//インポートしたOpenZeppelinのコントラクトを継承しています。
//継承したコントラクトのメソッドにアクセスできるようになります。
contract MyEpicNFT is ERC721URIStorage {

    //openzeppelinがtokenIdsを簡単に追跡するために提供するライブラリを呼び出しています。
    using Counters for Counters.Counter;

    //_tokenIdsを初期化（_tokenIds = 0）
    Counters.Counter private _tokenIds;

    //SVGコードを作成します。
    //変更されるのは、表示される単語だけです。
    //全てのNFTにSVGコードを適用するために、baseSvg変数を作成します。
    string baseSvg = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    //3つの配列string[]に、それぞれランダムな単語を設定しましょう。
    string[] firstWords = ["JAPAN", "U.S", "CHINA", "THAI", "KOREA", "GERMANY"];
    string[] secondWords = ["JAN", "FEB", "MAR", "APL", "MAY", "JUNE"];
    string[] thirdWords = ["DOG", "CAT", "BIRD", "COW", "PIG", "HUMAN"];

    event NewEpicNFTMinted(address sender, uint256 tokenId);

    //NFTトークンの名前とそのシンボルを渡します。
    constructor() ERC721 ("SquareNFT", "SQUARE") {
        console.log("This is my NFT contract.");
    }

    //シードを生成する関数を作成します。
    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    //各配列からランダムに単語を選ぶ関数を３つ作成します。
    //pickRandomFirstWord関数は、最初の単語を選びます。
    function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {

        //pickRandomFirstWord関数のシードとなるrandを作成します。
        uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));

        //seed rand をターミナルに出力する。
        console.log("rand - seed:", rand);

        //firstWords配列の長さを基準に、rand番目の単語を選びます。
        rand = rand % firstWords.length;

        //firstWords配列から何番目の単語が選ばれるかターミナルに出力する。
        console.log("rand - first word:", rand);
        return firstWords[rand];
    }

    //pickRandomSecondWord関数は、２番目に表示される単語を選びます。
    function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {

        //pickRandomSecondWord関数のシードとなるrandを作成します。
        uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    //pickRandomThirdWord関数は、３番目に表示される単語を選びます。
    function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {

        //pickRandomThirdWord関数のシードとなるrandを作成します。
        uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }

    //ユーザーがNFTを取得するために実行する関数です。
    function makeAnEpicNFT() public {

        //NFTがMintされるときのカウンターをインクリメントします。
        _tokenIds.increment();

        //現在のtokenIdsを取得します。tokenIdsは1から始まります。
        uint256 newItemId = _tokenIds.current();

        //３つの配列からそれぞれ１つの単語をランダムに取り出します。
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);

        //３つの単語を連携して格納する変数 combinedWord を定義します。
        string memory combinedWord = string(abi.encodePacked(first, second, third));

        // 3つの単語を連結して、<text>タグと<svg>タグで閉じます。
        string memory finalSvg = string(abi.encodePacked(baseSvg, first, second, third, "</text></svg>"));

	      // NFTに出力されるテキストをターミナルに出力します。
        console.log("\n--------------------");
        console.log(finalSvg);
        console.log("--------------------\n");

        //JSONファイルを所定の位置に取得し、base64としてエンコードします。
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        //NFTのタイトルを生成される言葉に設定します。
                        combinedWord,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '"}'
                    )
                )
            )
        );

        //データの先頭に data:application/json;base64 を追加します。
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n----- Token URI ----");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        //msg.senderを使ってNFTを送信者にMintします。
        _safeMint(msg.sender, newItemId);

        // tokenURI は後で設定します。
        _setTokenURI(newItemId, finalTokenUri);

        //NFTがいつ誰に作成されたかを確認します。
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
}