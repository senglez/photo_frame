# photo_frame

wood photo frame website to B

English landing page for overseas buyers of YongMaiHeng wooden photo frames, MDF frames, mirrors, storage boxes, cork products, flag fabrics, picnic mats and crafts. Its single goal is to collect quote requests.

## Structure

```
index.html              Landing page
privacy.html            Privacy policy
terms.html              Terms of use
404.html                Not found page
assets/css/styles.css   Styles
assets/js/main.js       Menu, scroll reveals, inquiry form
assets/img/             Product and certificate images (WebP), og.jpg share image
assets/favicon.svg
```

Plain static HTML, CSS and JavaScript. No build step. Fonts (Manrope) load from Google Fonts and icons (Phosphor) from unpkg.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Before going live

1. **Inquiry delivery.** Set `FORM_ENDPOINT` at the top of `assets/js/main.js` to a form service URL (for example Formspree) or your own API. While it is empty, the form opens the visitor's email app with the inquiry addressed to `INQUIRY_EMAIL`.
2. **Domain.** The site is live at https://senglez.github.io/photo_frame/. If you move it to a custom domain, replace `https://senglez.github.io/photo_frame/` in the `<head>` of `index.html` (canonical, `og:url`, `og:image`, JSON-LD), and change the `/photo_frame/` prefix in `404.html` to `/`.
3. **Privacy policy.** Confirm the retention period and response time in `privacy.html`.
4. **Contact details.** Phone and WhatsApp use +86 137 3240 3321. Check this is the number buyers should use.

## Deploy

Any static host works: GitHub Pages (Settings → Pages → deploy from branch `main`, folder `/`), Cloudflare Pages or Netlify. Point the host's 404 page to `404.html`.
