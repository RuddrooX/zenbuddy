# ZenBuddy · Zenfresh ON Desk

A static web app (HTML, CSS and JavaScript, no build step) with five tools:

| Tool | What it does |
|---|---|
| Viva Coach | Mock job, admission or thesis viva in English or Bangla. Type or speak (Chrome), get a score out of 10 with feedback. |
| 7-to-7 Planner | Plan 7 am to 7 pm, focus timer, 7 pm check-in streak (saved in your browser). |
| Fresh Forecast | Live weather from Open-Meteo (free, no key) turned into a Bangla line and tips. |
| ভালো কাজ Board | Join a sample drive, verify hours with the lead's code (demo: `ON2026`), download a certificate. |
| Smile Camp | 16 upazila camp dates; add to calendar (.ics) or share. |

Concept prototype for CaseSprint Season 2 by Team Daal Bhaat. Not an official Dabur or Zenfresh website. Drives and camp dates are sample data.

## Run it on your computer

Open `index.html` in a browser, or run a tiny server from this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Put it online with GitHub Pages (free)

1. Sign in at https://github.com and click **New repository**. Name it `zenbuddy`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in everything from this folder: `index.html`, `styles.css`, `app.js`, `README.md`, `.nojekyll` and the whole `assets` folder. Click **Commit changes**.
   - If `.nojekyll` is hidden on your computer, you can skip it; the site still works.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, then click **Save**.
4. Wait about a minute and refresh the page. Your link appears at the top: `https://YOUR-USERNAME.github.io/zenbuddy/`.

### Or with the command line

```bash
cd zenbuddy
git init
git add .
git commit -m "ZenBuddy concept site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/zenbuddy.git
git push -u origin main
```

Then do step 3 above.

### Prefer Vercel?

Go to https://vercel.com/new, import the GitHub repository, keep the defaults (no framework, no build command) and click **Deploy**.

## Edit content

- Viva questions: `Q` in `app.js`
- Volunteer drives: `DRIVES` in `app.js`
- Smile Camp dates: `CAMP` in `app.js`
- Colours: the `:root` variables at the top of `styles.css`
