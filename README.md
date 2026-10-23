# brodband productions

Source for **brodbandproductions.com**, a plain static site (HTML, CSS and a little JavaScript) deployed on Netlify. There is no build step: Netlify publishes this folder as it is.

## Pages

| Page | File | Address |
|---|---|---|
| Featured | `index.html` | `/` |
| Animated | `animated.html` | `/animated` |
| Improvised | `improvised.html` | `/improvised` |
| Collaborated | `collaborated.html` | `/collaborated` |
| Formulated | `formulated.html` | `/formulated` |
| Connected | `connected.html` | `/connected` |
| Form confirmation | `thank-you.html` | `/thank-you` |
| Not found | `404.html` | any missing page |

## Folders

- `images/` – logo, background waves, social share image, and one folder per page (`animated/`, `improvised/`, `collaborated/`, `players/`, `formulated/`, `gallery/`)
- `audio/` – Casual Loopers session log takes (`.m4a`, named `YYYY-MM-DD-title.m4a`)
- `js/site.js` – menu, back-to-top button, click-to-play YouTube on every page
- `js/improvised.js` – session log audio player and lineup filter
- `js/formulated.js` – photo gallery (the list of gallery photos lives at the top of this file)
- `js/connected.js` – contact form

## Common updates

- **Gallery photo:** add the image to `images/gallery/` and add a line to the `GALLERY` list in `js/formulated.js`.
- **Session log take:** add the audio to `audio/`, add an entry to `LOG` in `js/improvised.js`, and a matching row in `improvised.html`.

## Netlify settings

- Build command: none. Publish directory: `.` (set in `netlify.toml`).
- The contact form uses **Netlify Forms** (form name `contact`). Set the notification email under *Site configuration → Forms → Form notifications*.
- Clean addresses such as `/animated` work through Netlify's Pretty URLs.
