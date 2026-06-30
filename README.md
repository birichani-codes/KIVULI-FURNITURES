# Kivuli Homeworks

**Where Creativity Creates Comfort.**

A complete Node.js furniture website for a Kenyan furniture shop based in **Juja, Kiambu County**, serving Nairobi, Kiambu and customers across Kenya.

## Features

- Final logo system added: horizontal logo, icon mark, favicon and brand board
- Furniture collections: living room, bedroom, dining and custom studio
- JSON-driven product, showroom and site content
- Cart using localStorage
- M-Pesa Daraja STK Push checkout endpoint
- AI Custom Studio concept tool:
  - customer enters furniture type, room dimensions, style, storage and material
  - backend returns suggested dimensions
  - backend returns a simple SVG design preview
  - customer can send the generated concept to WhatsApp or pay a deposit
- Three-color visual system: Deep Green, Warm Ivory and Soft Black
- Creative-lab brand principles: Creative Lab, Form & Function, Home Innovation

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

## M-Pesa Daraja

Add your Safaricom Daraja credentials in `.env` before testing payments:

```env
DARAJA_CONSUMER_KEY=
DARAJA_CONSUMER_SECRET=
DARAJA_SHORTCODE=
DARAJA_PASSKEY=
DARAJA_CALLBACK_URL=
```

Use sandbox credentials first, then production credentials after Safaricom approval.

## AI Custom Studio

The current AI assistant is a local rule-based design generator so it works immediately without paid APIs. It can later be upgraded to call an external AI image/design API while keeping the same frontend section.


## Latest logo update

The homepage now uses only the standalone Kivuli Homeworks logo. The previous full brand identity board with essence, icon mark, stacked logo, and color-system explanations has been removed from the visible website. The browser title has also been simplified to `Kivuli Homeworks`, with the logo icon loaded through the favicon links.
# KIVULI-FURNITURES
