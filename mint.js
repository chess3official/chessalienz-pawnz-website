// Candy Machine Configuration
const CANDY_MACHINE_ID = 'FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Wallet connection state
let walletConnected = false;
let walletAddress = null;
let connection = null;
let metaplex = null;

// Mint price and limits
const STARTING_MINT_PRICE = 3; // Starting SOL per NFT (reverse auction)
const PRICE_DECREASE = 0.03; // SOL decrease per interval
const PRICE_INTERVAL = 60000; // 60 seconds in milliseconds
let MINT_PRICE = STARTING_MINT_PRICE; // Current mint price
const MAX_MINT_PER_WALLET = 10; // Maximum mints per wallet
let walletMintCount = 0; // Track mints for current wallet
let lastMintTime = null; // Will be fetched from blockchain
let auctionStartTime = null; // Auction start time from blockchain

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
        
        // Initialize Solana connection and Metaplex
        connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
        
        // Initialize Metaplex with wallet adapter
        const walletAdapter = {
            publicKey: window.solana.publicKey,
            signTransaction: async (tx) => await window.solana.signTransaction(tx),
            signAllTransactions: async (txs) => await window.solana.signAllTransactions(txs),
        };
        
        metaplex = Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter));
        
        // Fetch current minted count from Candy Machine
        await updateMintedCount();
        
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

// Fetch current minted count and auction timing from Candy Machine
async function updateMintedCount() {
    try {
        const candyMachine = await metaplex.candyMachines().findByAddress({
            address: new solanaWeb3.PublicKey(CANDY_MACHINE_ID)
        });
        
        const minted = candyMachine.itemsMinted.toString();
        mintedCount.textContent = minted;
        
        // Get the Candy Machine account to fetch timestamps
        const candyMachineAccount = await connection.getAccountInfo(
            new solanaWeb3.PublicKey(CANDY_MACHINE_ID)
        );
        
        // If no mints yet, use a fixed start time (deployment time)
        // For production, you'd store this in your config or on-chain
        if (!auctionStartTime) {
            // Use a fixed auction start time - update this to your actual launch time
            // For now, using Candy Machine deployment time as reference
            auctionStartTime = Date.now(); // This will be synced on first load
            
            // Try to get last mint timestamp from recent transactions
            const signatures = await connection.getSignaturesForAddress(
                new solanaWeb3.PublicKey(CANDY_MACHINE_ID),
                { limit: 1 }
            );
            
            if (signatures.length > 0) {
                const tx = await connection.getTransaction(signatures[0].signature, {
                    maxSupportedTransactionVersion: 0
                });
                if (tx && tx.blockTime) {
                    lastMintTime = tx.blockTime * 1000; // Convert to milliseconds
                    console.log('Last mint time from blockchain:', new Date(lastMintTime));
                }
            }
            
            // If no mints yet, set lastMintTime to auction start
            if (!lastMintTime) {
                lastMintTime = auctionStartTime;
            }
        }
        
    } catch (err) {
        console.error('Error fetching minted count:', err);
        // Fallback to current time if blockchain fetch fails
        if (!lastMintTime) {
            lastMintTime = Date.now();
        }
    }
}

// Mint NFT
async function mintNFT() {
    if (!walletConnected) {
        showMessage('Please connect your wallet first', 'error');
        return;
    }

    const quantity = parseInt(mintQuantity.value);
    
    // Check wallet mint limit
    if (walletMintCount + quantity > MAX_MINT_PER_WALLET) {
        const remaining = MAX_MINT_PER_WALLET - walletMintCount;
        showMessage(`Wallet limit reached! You can only mint ${remaining} more NFT${remaining !== 1 ? 's' : ''}.`, 'error');
        return;
    }
    
    mintBtn.disabled = true;
    mintBtn.textContent = 'MINTING...';

    try {
        // Mint NFTs from Candy Machine
        for (let i = 0; i < quantity; i++) {
            showMessage(`Minting NFT ${i + 1} of ${quantity}...`, 'info');
            
            const { nft } = await metaplex.candyMachines().mint({
                candyMachine: new solanaWeb3.PublicKey(CANDY_MACHINE_ID),
                collectionUpdateAuthority: new solanaWeb3.PublicKey('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2')
            });
            
            console.log('Minted NFT:', nft.address.toString());
        }
        
        // Update wallet mint count
        walletMintCount += quantity;
        
        // Reset auction price on successful mint
        onMintSuccess();
        
        // Update minted count from blockchain
        await updateMintedCount();
        
        showMessage(`Successfully minted ${quantity} Chessalienz: Pawnz NFT${quantity > 1 ? 's' : ''}! Check your wallet! (${walletMintCount}/${MAX_MINT_PER_WALLET} used)`, 'success');
        
        // Update max quantity if approaching limit
        const remaining = MAX_MINT_PER_WALLET - walletMintCount;
        if (remaining < 10) {
            mintQuantity.max = remaining;
            if (parseInt(mintQuantity.value) > remaining) {
                mintQuantity.value = remaining;
                updateTotalPrice();
            }
        }
        
    } catch (err) {
        console.error('Minting error:', err);
        let errorMessage = 'Minting failed. Please try again.';
        
        if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient SOL balance. Please add more SOL to your wallet.';
        } else if (err.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user.';
        }
        
        showMessage(errorMessage, 'error');
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

// Reverse Auction Price Update
function updateAuctionPrice() {
    const currentTime = Date.now();
    const timeSinceLastMint = currentTime - lastMintTime;
    const intervalsElapsed = Math.floor(timeSinceLastMint / PRICE_INTERVAL);
    
    // Calculate time until next price drop
    const timeUntilNextDrop = PRICE_INTERVAL - (timeSinceLastMint % PRICE_INTERVAL);
    const secondsRemaining = Math.ceil(timeUntilNextDrop / 1000);
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    
    // Update countdown timer
    const countdownElement = document.getElementById('countdown-timer');
    if (countdownElement) {
        countdownElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    if (intervalsElapsed > 0) {
        // Decrease price by 0.03 SOL per interval
        const newPrice = STARTING_MINT_PRICE - (intervalsElapsed * PRICE_DECREASE);
        // Don't go below a minimum price (e.g., 0.5 SOL)
        MINT_PRICE = Math.max(0.5, newPrice);
        
        // Update price display
        const priceElement = document.getElementById('current-price');
        if (priceElement) {
            priceElement.textContent = `${MINT_PRICE.toFixed(2)} SOL`;
        }
        
        // Update total price
        updateTotalPrice();
    }
}

// Reset price when a mint occurs
function onMintSuccess() {
    // Update lastMintTime to current time (will be synced from blockchain on next refresh)
    lastMintTime = Date.now();
    MINT_PRICE = STARTING_MINT_PRICE;
    
    // Update price display
    const priceElement = document.getElementById('current-price');
    if (priceElement) {
        priceElement.textContent = `${MINT_PRICE.toFixed(2)} SOL`;
    }
    
    // Broadcast the mint event so other users can sync
    // In production, this would be handled by polling the blockchain
    console.log('Mint successful at:', new Date(lastMintTime));
}

// Sync with blockchain periodically to catch mints from other users
async function syncWithBlockchain() {
    if (!connection) return;
    
    try {
        // Check for new mints by fetching latest transaction
        const signatures = await connection.getSignaturesForAddress(
            new solanaWeb3.PublicKey(CANDY_MACHINE_ID),
            { limit: 1 }
        );
        
        if (signatures.length > 0) {
            const tx = await connection.getTransaction(signatures[0].signature, {
                maxSupportedTransactionVersion: 0
            });
            if (tx && tx.blockTime) {
                const blockchainMintTime = tx.blockTime * 1000;
                
                // If there's a new mint, update our timer
                if (blockchainMintTime > lastMintTime) {
                    console.log('New mint detected! Syncing timer...');
                    lastMintTime = blockchainMintTime;
                    MINT_PRICE = STARTING_MINT_PRICE;
                    
                    // Update displays
                    const priceElement = document.getElementById('current-price');
                    if (priceElement) {
                        priceElement.textContent = `${MINT_PRICE.toFixed(2)} SOL`;
                    }
                    updateTotalPrice();
                    
                    // Update minted count
                    const candyMachine = await metaplex.candyMachines().findByAddress({
                        address: new solanaWeb3.PublicKey(CANDY_MACHINE_ID)
                    });
                    mintedCount.textContent = candyMachine.itemsMinted.toString();
                }
            }
        }
    } catch (err) {
        console.error('Error syncing with blockchain:', err);
    }
}

// Update price every second
setInterval(updateAuctionPrice, 1000);

// Sync with blockchain every 10 seconds to catch other users' mints
setInterval(syncWithBlockchain, 10000);

// Initial price update
updateAuctionPrice();
