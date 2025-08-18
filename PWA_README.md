PWA setup notes
================

This project has basic PWA support added:

- `public/manifest.json` updated and links added in `pages/_document.tsx`.
- `public/service-worker.js` replaced with a safer, manual service worker.
- `pages/_app.tsx` registers the service worker client-side.
- `next.config.js` updated to use `next-pwa` (requires adding the dependency).

What you still need to do locally:

1. Install the `next-pwa` package:

   npm install next-pwa --save

2. Provide PNG icons for broader device support at:

   public/icons/icon-192.png
   public/icons/icon-512.png

3. Optionally switch to `next-pwa` generated service worker by letting it build the SW during `next build`.

4. Ensure you serve the site over HTTPS in production (service workers require secure contexts).

Testing locally:

1. Run the dev server (note: next-pwa is disabled in development by default):

   npm run dev

2. Build and preview (this will generate the SW when next-pwa is installed):

   npm run build
   npm start

If you want, I can add sample PNG icons (very small placeholders) and add `next-pwa` to `package.json` dependencies, then run `npm install` — say the word.
