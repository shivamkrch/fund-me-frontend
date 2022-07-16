import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectBtn");
const interactionDiv = document.getElementById("interactionDiv");
const fundBtn = document.getElementById("fundBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const balanceBtn = document.getElementById("balanceBtn");
const ethAmountInput = document.getElementById("ethAmount");
const statusSpan = document.getElementById("status");
connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;

async function connect() {
  if (window.ethereum) {
    await ethereum.request({ method: "eth_requestAccounts" });
    connectBtn.innerText = "Connected!";
    interactionDiv.hidden = false;
  } else {
    alert("Please install MetaMask wallet");
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;
  if (!ethAmount) {
    return alert("Please enter a valid amount!");
  }
  console.log(`Funding with ${ethAmount}ETH...`);
  statusSpan.innerText = `Funding with ${ethAmount}ETH...`;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount)
      });
      await listenForTransactionMine(txResponse, provider);
      console.log("Funded!");
      statusSpan.innerText = "Funded!";
      ethAmountInput.value = "";
    } catch (err) {
      console.log(err);
      statusSpan.innerText = "Error occured! Please check console.";
    }
  }
}

function listenForTransactionMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}...`);
  statusSpan.innerText = `Mining ${txResponse.hash}...`;
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations`);
      statusSpan.innerText = `Completed with ${txReceipt.confirmations} confirmations`;
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    statusSpan.innerHTML = `Current Balance: <b>${ethers.utils.formatEther(
      balance
    )}ETH<b>`;
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    statusSpan.innerText = "Withdrawing...";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.cheaperWithdraw();
      await listenForTransactionMine(txResponse, provider);
      console.log("Withdrawn!");
      statusSpan.innerText = "Withdrawn!";
    } catch (err) {
      console.log(err);
      statusSpan.innerText = "Error occured! Please check console.";
    }
  }
}
