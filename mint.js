// Candy Machine Configuration
const CANDY_MACHINE_ID = 'FNGdN51cFFsCLMiiiySrWiggQB6ASkaMEc7Ud7p4YGNc';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Wallet connection state
let walletConnected = false;
let walletAddress = null;
let connection = null;
let metaplex = null;

// Mint price and limits
const MINT_PRICE = 3; // Fixed price: 3 SOL per NFT
const MAX_MINT_PER_WALLET = 10; // Maximum mints per wallet
let walletMintCount = 0; // Track mints for current wallet

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
        
        // Initialize Solana connection
        connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');
        console.log('Solana connection initialized:', RPC_ENDPOINT);
        
        // Try to initialize Metaplex if available (optional for now)
        if (typeof Metaplex !== 'undefined') {
            try {
                console.log('Metaplex found, initializing...');
                const walletAdapter = {
                    publicKey: window.solana.publicKey,
                    signTransaction: async (tx) => await window.solana.signTransaction(tx),
                    signAllTransactions: async (txs) => await window.solana.signAllTransactions(txs),
                };
                
                metaplex = Metaplex.make(connection).use(Metaplex.walletAdapterIdentity(walletAdapter));
                console.log('Metaplex initialized successfully');
                
                // Fetch current minted count from Candy Machine
                await updateMintedCount();
            } catch (metaplexErr) {
                console.warn('Metaplex initialization failed, using basic mode:', metaplexErr);
                metaplex = null;
            }
        } else {
            console.warn('Metaplex not loaded, using basic wallet connection');
            metaplex = null;
        }
        
        updateWalletUI();
        showMessage('Wallet connected successfully!', 'success');
    } catch (err) {
        console.error('Wallet connection error:', err);
        console.error('Error stack:', err.stack);
        showMessage(`Connection failed: ${err.message}`, 'error');
    }
}

// Disconnect wallet
async function disconnectWallet() {
    if (isPhantomInstalled() && walletConnected) {
        try {
            await window.solana.disconnect();
            walletConnected = false;
            walletAddress = null;
            metaplex = null;
            updateWalletUI();
            showMessage('Wallet disconnected', 'success');
        } catch (err) {
            console.error('Disconnect error:', err);
        }
    }
}

// Update wallet UI
function updateWalletUI() {
    // Update header wallet status
    const headerWalletStatus = document.getElementById('header-wallet-status');
    const headerWalletText = document.getElementById('header-wallet-text');
    const headerConnectBtn = document.getElementById('header-connect-btn');
    
    if (walletConnected) {
        walletStatus.classList.remove('wallet-disconnected');
        walletStatus.classList.add('wallet-connected');
        walletText.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
        connectWalletBtn.textContent = 'Disconnect';
        connectWalletBtn.onclick = disconnectWallet;
        mintControls.style.display = 'block';
        
        // Update header indicator
        if (headerWalletStatus) {
            headerWalletStatus.classList.add('connected');
            headerWalletText.textContent = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
            headerConnectBtn.textContent = 'Disconnect';
            headerConnectBtn.onclick = disconnectWallet;
        }
    } else {
        walletStatus.classList.remove('wallet-connected');
        walletStatus.classList.add('wallet-disconnected');
        walletText.textContent = 'Connect Wallet';
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.onclick = connectWallet;
        mintControls.style.display = 'none';
        
        // Update header indicator
        if (headerWalletStatus) {
            headerWalletStatus.classList.remove('connected');
            headerWalletText.textContent = 'Not Connected';
            headerConnectBtn.textContent = 'Connect';
            headerConnectBtn.onclick = connectWallet;
        }
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

// Fetch current minted count from Candy Machine
async function updateMintedCount() {
    if (!metaplex) {
        console.log('Metaplex not available, skipping minted count update');
        return;
    }
    
    try {
        const candyMachine = await metaplex.candyMachines().findByAddress({
            address: new solanaWeb3.PublicKey(CANDY_MACHINE_ID)
        });
        
        const minted = candyMachine.itemsMinted.toString();
        mintedCount.textContent = minted;
        console.log('Minted count updated:', minted);
    } catch (err) {
        console.error('Error fetching minted count:', err);
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
        // Check if metaplex is initialized
        if (!metaplex) {
            showMessage('⚠️ Metaplex SDK not loaded. Using simulation mode for testing.', 'error');
            
            // Simulate minting for testing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showMessage('✅ Simulated mint successful! (Real minting requires Metaplex SDK)', 'success');
            
            // Update wallet mint count
            walletMintCount += quantity;
            
            // Update simulated minted count
            const currentMinted = parseInt(mintedCount.textContent);
            mintedCount.textContent = currentMinted + quantity;
            
            return;
        }
        
        // Real minting with Metaplex
        for (let i = 0; i < quantity; i++) {
            showMessage(`Minting NFT ${i + 1} of ${quantity}...`, 'info');
            
            try {
                const { nft } = await metaplex.candyMachines().mint({
                    candyMachine: new solanaWeb3.PublicKey(CANDY_MACHINE_ID),
                    collectionUpdateAuthority: new solanaWeb3.PublicKey('D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2')
                });
                
                console.log('Minted NFT:', nft.address.toString());
            } catch (mintError) {
                console.error(`Error minting NFT ${i + 1}:`, mintError);
                throw mintError; // Re-throw to be caught by outer catch
            }
        }
        
        // Update wallet mint count
        walletMintCount += quantity;
        
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
const headerConnectBtn = document.getElementById('header-connect-btn');
if (headerConnectBtn) {
    headerConnectBtn.addEventListener('click', connectWallet);
}
updateTotalPrice();

// Prevent auto-reconnect on page load
if (isPhantomInstalled()) {
    // Disconnect on page load to prevent auto-reconnect
    window.solana.disconnect().catch(() => {});
    
    window.solana.on('disconnect', () => {
        walletConnected = false;
        walletAddress = null;
        updateWalletUI();
    });
}

// All reverse auction logic removed - fixed price of 3 SOL
