# KANA Flipbook Generator

A local 3D flipbook video generator. Upload text, images, and videos, preview the flipbook animation in the browser, and export a `.mov` filename video for SNS publishing.

The public project documentation and implementation notes are written in English. The app UI supports English and Japanese, with Japanese available through the in-app language switcher or the `?lang=ja` URL parameter.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Features

- Multi-file image and video uploads
- Mobile-friendly MOV, MP4, and M4V video selection
- Text pages with separate title and content fields, with automatic pagination for long content
- Select and drag pages to reorder them
- SNS aspect ratios: 9:16, 3:4, 1:1, 4:3, and 16:9
- Adjustable page interval, flip duration, background color, and optional background image
- Open-spread start, front/back page textures, and stacked paper thickness
- Three.js 3D flipbook preview
- Browser-side MediaRecorder export with a `.mov` filename, prioritizing MP4/H.264 recording support
- English and Japanese UI modes for public GitHub Pages deployment

## Copyright

Copyright © Tokyo AI Visuals LLC

## Support Future Development

Help fund GPU time, testing, and future updates.

GPU Support — ¥500 JPY (approx. $3 USD)  
https://www.paypal.com/paypalme/kanaworksai/500

Future Development Support — ¥1500 JPY (approx. $10 USD)  
https://www.paypal.com/paypalme/kanaworksai/1500
