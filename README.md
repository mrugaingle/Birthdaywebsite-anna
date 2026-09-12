# Happy Birthday Corkboard 🎉

A one-page birthday site styled like photos pinned to a softboard. Deploys straight to GitHub Pages, no build step.

## Add your own photos (nothing gets sent anywhere)

1. Drop your photo files into the `photos/` folder, replacing the placeholder images (or add new ones alongside them).
2. Open `config.js` and list the filenames you used, plus an optional caption for each:

   ```js
   photos: [
     { file: "grandma-bday.jpg", caption: "the trip that started it all" },
     { file: "us-at-the-lake.jpg", caption: "" },
   ],
   ```

3. Update `name`, `message`, and `from` at the top of `config.js` to whatever you want the note to say.

That's it — the page reads directly from `config.js` and the `photos` folder on your own computer/repo. You never need to upload or share the photos with anyone else to build the site.

## Preview it locally

Any simple local server works, e.g. from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deploy with GitHub Pages

1. Create a new GitHub repository and push everything in this folder to it (including the `photos` folder).
2. On GitHub, go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`, pick your default branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
4. Wait a minute or two — GitHub will give you a live URL like `https://yourusername.github.io/repo-name/`.

Any time you push new photos or edit `config.js`, the live page updates automatically within a minute or so.

## Notes

- Photos are shown as square-ish crops (`object-fit: cover`), so square or portrait photos tend to look best, but anything works.
- The scatter/rotation of photos and pins/tape is randomized a little each time the page loads sizing, but stays visually consistent — feel free to pin exact rotation for any photo with `rotate: -6` in its entry in `config.js`.
- Everything is plain HTML/CSS/JS — open `style.css` if you want to tweak colors (there's a small palette at the top of the file) or `script.js` for layout behavior.
