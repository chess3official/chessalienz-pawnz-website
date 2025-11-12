# Presale Site Files

## Overview
Two versions of the presale site for different environments:

---

## 📁 Files

### 1. `presale.html` - DEVNET (Testing)
**Purpose**: For testing on Solana Devnet

**Configuration**:
- Network: `https://api.devnet.solana.com`
- Badge: `🔧 DEVNET - API POWERED`
- Pre-filled wallet: `D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2`
- Price: 0.5 SOL (devnet SOL)
- Authority Wallet: `D2nUJVgRMHgeAH8Zw3gCMjhgRZin9xmjSuStSZjtqkC2`

**Use Case**:
- Testing the presale flow
- Testing wallet connections
- Testing API integration
- No real money involved

---

### 2. `presale-mainnet.html` - MAINNET (Production)
**Purpose**: For live production deployment on Solana Mainnet

**Configuration**:
- Network: `https://api.mainnet-beta.solana.com` ✅ MAINNET
- Badge: `🚀 MAINNET - LIVE`
- Pre-filled wallet: Empty (user must connect)
- Price: 0.5 SOL (real SOL)
- Authority Wallet: `YOUR_MAINNET_WALLET_ADDRESS` ⚠️ **NEEDS TO BE UPDATED**

**Use Case**:
- Live presale with real SOL
- Production deployment
- Real NFT minting

---

## 🚀 Deployment Workflow

### Testing Phase (Current)
1. Use `presale.html` for all testing
2. Test with devnet SOL
3. Verify all functionality works

### Going Live
1. **Update `presale-mainnet.html`**:
   - Replace `YOUR_MAINNET_WALLET_ADDRESS` with your actual mainnet wallet address (line 331)
   - Verify API_URL points to production API
   - Test once more on devnet if needed

2. **Commit the mainnet version**:
   ```bash
   git add presale-mainnet.html
   git commit -m "Add mainnet presale site"
   git push origin main
   ```

3. **Deploy**:
   - Rename `presale.html` to `presale-devnet.html` (backup)
   - Rename `presale-mainnet.html` to `presale.html`
   - Commit and push

---

## ⚠️ Important Differences

| Feature | Devnet (`presale.html`) | Mainnet (`presale-mainnet.html`) |
|---------|------------------------|----------------------------------|
| Network | Devnet | Mainnet-beta |
| SOL | Fake/Test | Real |
| Badge | 🔧 DEVNET | 🚀 MAINNET - LIVE |
| Presale Price | 0.5 SOL | **2 SOL** |
| Public Price | 1 SOL | **3 SOL** |
| Wallet Pre-fill | Yes | No |
| Authority Wallet | Devnet wallet | **MUST UPDATE** |
| Risk | Zero | Real money |

---

## 📝 TODO Before Going Live

- [ ] Update `AUTHORITY_WALLET` in `presale-mainnet.html` (line 331)
- [ ] Verify API is configured for mainnet
- [ ] Test the mainnet file on devnet first (change network temporarily)
- [ ] Ensure you have enough SOL in authority wallet for gas fees
- [ ] Double-check all pricing is correct
- [ ] Backup current `presale.html` before replacing

---

## 🔄 Quick Switch Commands

### To go live:
```bash
# Backup devnet version
mv presale.html presale-devnet.html

# Activate mainnet version
mv presale-mainnet.html presale.html

# Commit and push
git add .
git commit -m "Switch to mainnet presale"
git push origin main
```

### To revert to devnet:
```bash
# Restore devnet version
mv presale.html presale-mainnet.html
mv presale-devnet.html presale.html

# Commit and push
git add .
git commit -m "Revert to devnet for testing"
git push origin main
```

---

## 💡 Best Practices

1. **Always test on devnet first** before deploying to mainnet
2. **Keep both files** - never delete the devnet version
3. **Update authority wallet** before going live
4. **Verify network** in browser console before accepting real payments
5. **Monitor transactions** closely when first going live

---

## 🛡️ Security Notes

- Mainnet file uses real SOL - handle with care
- Never commit private keys or seed phrases
- Verify authority wallet address is correct before deployment
- Test transaction flow thoroughly on devnet first
- Monitor for any errors or issues during live deployment
