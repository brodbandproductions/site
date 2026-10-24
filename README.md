# brodband productions

Source for **brodbandproductions.com**, a plain static site (HTML, CSS and a little JavaScript) deployed on Netlify. Netlify publishes the `public/` folder as it is, with no build step on their side.

## Folders

- `public/` – **the website**. Everything Netlify serves lives here.
  - `images/` – logo, background waves, social share image, opening plates (`plates/`), and one folder per page (`animated/`, `improvised/`, `collaborated/`, `players/`, `formulated/`, `gallery/`)
  - `audio/` – Casual Loopers session log takes (`.m4a`, named `YYYY-MM-DD-title.m4a`)
  - `js/site.js` – menu, back-to-top button, click-to-play YouTube, page opens at the top
  - `js/improvised.js` – session log audio player and lineup filter
  - `js/formulated.js` – "captured moments" gallery (shuffled on every visit)
  - `js/connected.js` – contact form
- `design/` – the design canvas pages (`.dc.html`) the site is generated from
- `tools/` – `build.py` turns `design/` into `public/`; `serve.py` previews `public/` locally at http://127.0.0.1:8765

## Pages

| Page | File | Address |
|---|---|---|
| Featured | `public/index.html` | `/` |
| Animated | `public/animated.html` | `/animated` |
| Improvised | `public/improvised.html` | `/improvised` |
| Collaborated | `public/collaborated.html` | `/collaborated` |
| Formulated | `public/formulated.html` | `/formulated` |
| Connected | `public/connected.html` | `/connected` |
| Form confirmation | `public/thank-you.html` | `/thank-you` |
| Not found | `public/404.html` | any missing page |

## Common updates

- **Gallery photo:** add `studio-moment-NN.jpg` to `public/images/gallery/` and raise the count (20) at the top of `public/js/formulated.js`.
- **Swap an image:** replace the file in `public/images/` with one of the same name and shape.
- **Session log take:** add the audio to `public/audio/`, add an entry to `LOG` in `public/js/improvised.js`, and a matching row in `public/improvised.html`.

Every push to `main` deploys, so batch changes into one push when you can.

## Netlify settings

- Build command: none. Publish directory: `public` (set in `netlify.toml`).
- The contact form uses **Netlify Forms** (form name `contact`). Form detection must be on under *Forms*; set the notification email under *Site configuration → Forms → Form notifications*.
- Clean addresses such as `/animated` work through Netlify's Pretty URLs.
