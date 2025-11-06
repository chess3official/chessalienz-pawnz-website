# Pawnz NFT Collection Website

Modern, responsive website for the Pawnz NFT collection on Solana.

## Features

### Landing Page (index.html)
- **Hero Section** - Eye-catching introduction with CTA buttons
- **Mission Section** - Project mission and vision
- **Utility Roadmap** - 4-phase development timeline
- **Community Section** - Social media links
- **About CHESS3** - Project details and holder benefits
- **Side Navigation** - Quick access to all sections
- **Responsive Design** - Works on all devices

### Minting Page (mint.html)
- **Wallet Connection** - Phantom wallet integration
- **Quantity Selector** - Mint 1-10 NFTs per transaction
- **Live Price Calculator** - Real-time total calculation
- **Mint Statistics** - Total supply and minted count
- **Feature Highlights** - Key collection benefits

## Setup

1. **Open the website**
   - Simply open `index.html` in a web browser
   - Or use a local server for development

2. **Local Development Server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

3. **Access the site**
   - Navigate to `http://localhost:8000`

## Customization

### Update Content
- Edit text in `index.html` and `mint.html`
- Modify colors in `styles.css` (see CSS variables at top)
- Update mint price in `mint.js` (MINT_PRICE constant)

### Add Social Links
Replace `#` in the social links with your actual URLs:
```html
<a href="https://discord.gg/your-invite" class="social-link">Discord</a>
<a href="https://twitter.com/your-handle" class="social-link">Twitter</a>
```

### Implement Minting
The minting functionality is a placeholder. To implement actual minting:
1. Set up a Candy Machine using Metaplex
2. Update `mint.js` with your Candy Machine ID
3. Implement the minting transaction logic

## Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **JavaScript** - Interactivity
- **Solana Web3.js** - Blockchain integration
- **Phantom Wallet** - Wallet connection

## File Structure

```
pawnz-website/
├── index.html          # Landing page
├── mint.html           # Minting page
├── styles.css          # All styles
├── script.js           # Landing page scripts
├── mint.js             # Minting functionality
└── README.md           # Documentation
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Next Steps

1. Add your logo/branding
2. Update social media links
3. Add actual NFT preview images
4. Implement Candy Machine integration
5. Deploy to hosting (Vercel, Netlify, etc.)

## Notes

- The mint price is currently set to 0.5 SOL (update in `mint.js`)
- Wallet connection requires Phantom browser extension
- Minting logic needs to be connected to your Candy Machine
