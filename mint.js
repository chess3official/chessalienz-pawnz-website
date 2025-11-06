// Wallet connection state
let walletConnected = false;
let walletAddress = null;

// Mint price (update this with your actual price)
const MINT_PRICE = 2; // SOL per NFT

// DOM elements
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletStatus = document.getElementById('wallet-status');
const walletText = document.getElementById('wallet-text');
const mintControls = document.getElementById('mint-controls');
const mintQuantity = document.getElementById('mint-quantity');
const decreaseBtn = document.getElementById('decrease-btn');
const increaseBtn = document.getElementById('increase-btn');
const mintBtn = document.getElementById('mint-btn');
const totalPrice = document.getElementById('total-price');
const mintMessage = document.getElementById('mint-message');
const mintedCount = document.getElementById('minted-count');

// Check if Phantom wallet is installed
function isPhantomInstalled() {
    return window.solana && window.solana.isPhantom;
}

// Connect wallet
async function connectWallet() {
    if (!isPhantomInstalled()) {
        showMessage('Please install Phantom wallet!', 'error');
        window.open('https://phantom.app/', '_blank');
        return;
    }

    try {
        const resp = await window.solana.connect();
        walletAddress = resp.publicKey.toString();
        walletConnected = true;
        
        updateWalletUI();
        showMessage('Wallet connected successfully!', 'success');
    } catch (err) {
        console.error('Wallet connection error:', err);
        showMessage('Failed to connect wallet', 'error');
    }
}

// Disconnect wallet
async function disconnectWallet() {
    if (isPhantomInstalled() && walletConnected) {
        await window.solana.disconnect();
        walletConnected = false;
        walletAddress = null;
        updateWalletUI();
        showMessage('Wallet disconnected', 'success');
    }
}

// Update wallet UI
function updateWalletUI() {
    if (walletConnected) {
        walletStatus.classList.remove('wallet-disconnected');
        walletStatus.classList.add('wallet-connected');
        walletText.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        connectWalletBtn.textContent = 'Disconnect';
        connectWalletBtn.onclick = disconnectWallet;
        mintControls.style.display = 'block';
    } else {
        walletStatus.classList.remove('wallet-connected');
        walletStatus.classList.add('wallet-disconnected');
        walletText.textContent = 'Connect Wallet';
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.onclick = connectWallet;
        mintControls.style.display = 'none';
    }
}

// Update total price
function updateTotalPrice() {
    const quantity = parseInt(mintQuantity.value);
    const total = (quantity * MINT_PRICE).toFixed(2);
    totalPrice.textContent = `${total} SOL`;
}

// Decrease quantity
decreaseBtn.addEventListener('click', () => {
    const current = parseInt(mintQuantity.value);
    if (current > 1) {
        mintQuantity.value = current - 1;
        updateTotalPrice();
    }
});

// Increase quantity
increaseBtn.addEventListener('click', () => {
    const current = parseInt(mintQuantity.value);
    if (current < 10) {
        mintQuantity.value = current + 1;
        updateTotalPrice();
    }
});

// Mint NFT
async function mintNFT() {
    if (!walletConnected) {
        showMessage('Please connect your wallet first', 'error');
        return;
    }

    const quantity = parseInt(mintQuantity.value);
    mintBtn.disabled = true;
    mintBtn.textContent = 'MINTING...';

    try {
        // TODO: Implement actual minting logic with Metaplex/Candy Machine
        // This is a placeholder for the minting process
        
        // Simulate minting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showMessage(`Successfully minted ${quantity} Chessalienz: Pawnz NFT${quantity > 1 ? 's' : ''}!`, 'success');
        
        // Update minted count (this should come from your smart contract)
        const currentMinted = parseInt(mintedCount.textContent);
        mintedCount.textContent = currentMinted + quantity;
        
    } catch (err) {
        console.error('Minting error:', err);
        showMessage('Minting failed. Please try again.', 'error');
    } finally {
        mintBtn.disabled = false;
        mintBtn.textContent = 'MINT NOW';
    }
}

// Show message
function showMessage(text, type) {
    mintMessage.textContent = text;
    mintMessage.className = `mint-message ${type}`;
    
    setTimeout(() => {
        mintMessage.className = 'mint-message';
    }, 5000);
}

// Initialize
connectWalletBtn.addEventListener('click', connectWallet);
mintBtn.addEventListener('click', mintNFT);
updateTotalPrice();

// Check if wallet is already connected
if (isPhantomInstalled()) {
    window.solana.on('connect', () => {
        walletAddress = window.solana.publicKey.toString();
        walletConnected = true;
        updateWalletUI();
    });

    window.solana.on('disconnect', () => {
        walletConnected = false;
        walletAddress = null;
        updateWalletUI();
    });
}
