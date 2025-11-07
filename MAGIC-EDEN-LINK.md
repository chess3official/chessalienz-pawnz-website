# How to Add Magic Eden Link

When you're ready to add your Magic Eden pre-sale link, follow these steps:

## Step 1: Get Your Magic Eden Launchpad URL
Your Magic Eden launchpad URL will look something like:
```
https://magiceden.io/launchpad/chessalienz_pawnz
```

## Step 2: Update index.html

Find this section in `index.html` (around line 260):

```html
<div class="presale-cta">
    <p class="coming-soon-text">🔗 Magic Eden link will be added here soon</p>
    <p class="stay-tuned">Stay tuned on our social channels for the announcement!</p>
</div>
```

Replace it with:

```html
<div class="presale-cta">
    <a href="YOUR_MAGIC_EDEN_URL" target="_blank" rel="noopener noreferrer" class="presale-button">
        🚀 Mint on Magic Eden
    </a>
    <p class="stay-tuned">Pre-sale is now live!</p>
</div>
```

## Step 3: Add Button Styling

Add this CSS to `styles.css` (around line 1006):

```css
.presale-button {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: var(--text-primary);
    text-decoration: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.3s;
    margin-bottom: 1rem;
}

.presale-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(153, 69, 255, 0.4);
}
```

## Step 4: Commit and Push

```bash
git add index.html styles.css
git commit -m "Add Magic Eden pre-sale link"
git push
```

That's it! The link will be live in ~1 minute after Vercel deploys.
