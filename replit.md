# ArtisanPath

## Overview

ArtisanPath is a mobile-first platform connecting Indian artisans with buyers, learners, and event-goers. It celebrates traditional Indian crafts (Handloom sarees, Paintings, Pottery) with a warm, culturally rich aesthetic.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Wouter
- **UI Library**: shadcn/ui + Radix UI

## Architecture

### Frontend (`artifacts/artisan-path`)
- React SPA at path `/`
- Dual-mode login: User mode (buyer) and Artisan mode
- Multilingual UI (English, Hindi, Telugu, Tamil, Marathi, Bengali, Urdu)
- Voice assistant for product descriptions (Web Speech API)
- Voice input for artisans uploading product descriptions

### Backend (`artifacts/api-server`)
- Express 5 REST API at `/api`
- Routes: users, artisans, products, courses, events, chat, ratings, orders

### Database (`lib/db`)
Tables: users, artisans, products, courses, events, event_bookings, chat_messages, ratings, orders

## Key Features

1. **User Mode**: Browse products, learn courses, view teachers, book events, chat with artisans, order products, rate/review
2. **Artisan Mode**: Upload products with voice description, manage courses, register for events, dashboard
3. **Voice Assistant**: Product detail page reads description aloud in selected language
4. **Voice Input**: Artisan dashboard uses SpeechRecognition for product description
5. **Multilingual**: Language switcher affecting UI text and product descriptions
6. **Rating System**: 1-5 star ratings with reviews, items sorted by rating
7. **Events**: Book events (users) or register to showcase (artisans)
8. **Chat**: Real-time chat between users and artisans

## Categories

- **Painting**: Warli, Madhubani, Tanjore, Gond, Pattachitra
- **Handloom**: Kanchipuram Silk Saree, Banarasi Silk Saree, Cotton Saree, Kalamkari Saree, Ikat Saree
- **Pottery**: Clay Pot, Terracotta, Ceramic Vase, Earthen Lamp, Decorative Pot

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/artisan-path run dev` — run frontend locally

## Price Estimation System

Formula: `Estimated Price = Base Price × Trend Factor × Location Factor`
- Returns a price range (min/max), not exact
- Location factors: Mumbai 1.2x, Delhi 1.15x, Hyderabad/Chennai 1.1x, Bangalore 1.12x, Jaipur 1.05x
