# Spider Seat Raffle

A Spider-Verse-styled seat raffle for assigning theatre seats D4–D9 to 6 people.

## How it works
- Seats are shuffled once using a Fisher-Yates shuffle (unbiased — every seat order is equally likely).
- Each person enters their name and clicks "Spin the Web" to reveal the next seat from the shuffled list.
- No seat can repeat, and there's no way to steer a specific seat to a specific person — it's a genuinely fair draw.

## Hosting on GitHub Pages
1. Create a new GitHub repo (e.g. `spider-seat-raffle`).
2. Push these files (`index.html`, `style.css`, `script.js`) to the repo.
3. Go to **Settings → Pages**, set the source branch to `main` (root), and save.
4. Your site will be live at `https://<your-username>.github.io/spider-seat-raffle/`.

## Local preview
Just open `index.html` in a browser — no build step needed.

## Files
- `index.html` — page structure
- `style.css` — Spider-Verse red/blue theme, glassmorphism, flip-card animation
- `script.js` — shuffle + reveal logic
