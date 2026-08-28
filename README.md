# Keepsake (Personal Cloud Photo Vault)

A production-grade, self-hosted, private cloud-native alternative to Apple Photos & Google Photos engineered for complete ownership of your high-resolution memories. Features direct browser-to-S3 pre-signed encrypted streams, multi-tier Sharp progressive thumbnail generation, Apple HEIC & RAW lossless digital negative preservation, offline-first GPS reverse geocoding with interactive Dark Matter world map clustering, nostalgic "On This Day" retrospective memory story carousels, a client-side non-destructive photo editor and film preset studio, motion video & Apple Live Photo paired playback with hover scrub previews, a floating multi-select batch operations action dock, streaming ZIP archives with JSON manifest exports, SHA-256 deduplication telemetry, comprehensive storage analytics, and cryptographically secure expiring share links with instant owner revocation.

## Features

### Core Functionality
- **Direct-to-S3 Encrypted Ingestion**: Files stream directly from your browser to your private AWS S3 bucket via time-limited pre-signed PUT URLs. Zero server memory or bandwidth bottlenecks.
- **Batch Multi-File Processing**: Granular per-file XHR upload progress meters, concurrent job queuing with `p-queue`, graceful network error recovery, and automatic retry capabilities.
- **Lossless Format Preservation**: Lossless storage for camera RAW formats (`.dng`, `.cr2`, `.arw`), Apple HEIC/HEIF images, standard JPEGs/PNGs, and high-framerate MP4/MOV videos.
- **Chronological Timeline Grid**: Virtualized responsive media grid with sticky date headers (Today, Yesterday, Full Dates), shimmer skeleton loaders, and blur-up loading telemetry.
- **Full-Screen Lightbox Studio**: Distraction-free full-screen viewer with EXIF metadata sidebar, keyboard shortcuts (`←`, `→`, `Esc`, `I`), and direct map navigation.
- **Album Management**: Create, rename, delete, and curate custom albums with multi-select photo selection dialogs and dynamic cover rendering.
- **Multi-Criteria Search & Filter**: Instant debounced query engine supporting filename text match, camera make/model filter, date ranges, and GPS-tagged items.
- **Cryptographic Link Sharing**: 128-bit cryptographically secure random tokens (`/share/[token]`) with configurable expiration (1, 7, 30 days, or permanent) and instant 1-click owner revocation.
- **User Authentication**: Secure email/password authentication backed by NextAuth v5 (Auth.js) and bcrypt password hashing.

### Advanced Features
- **Interactive World Map & Geolocation Explorer (`/map`)**: An interactive CartoDB Dark Matter map plotting all geotagged photos as pins and clusters. Features spatial bounding box calculations, photo count badges, and an interactive marker preview popup with a 1-click Lightbox launcher.
- **Offline Reverse Geocoder Engine**: Fast, local spatial bounding box coordinate resolution engine that maps raw GPS coordinates into City, Country, and formatted place names (e.g., `Kyoto, Japan` or `San Francisco, United States`) without external API latency or fees.
- **"On This Day" Throwback Memories Engine**: Scans your vault for photos taken on today's calendar date across previous years (1 year ago, 2 years ago, 5 years ago) and groups them into nostalgic Memory Story Capsules.
- **Memories Story Carousel**: Instagram & Apple Photos-inspired horizontal story card carousel on the Library header featuring cover previews, ambient radial glow, and golden timestamp tags.
- **Smart Dynamic Collections**: Automated sidebar collection filters with live item counts:
  - **Favorites**: 1-click starred memories with optimistic UI updates.
  - **Videos & Motion**: Dedicated video gallery with duration badges.
  - **Panoramas**: Auto-detected ultra-wide perspective captures (aspect ratio ≥ 2:1).
  - **Documents & Scans**: Receipts, whiteboard notes, and screenshots.
- **Non-Destructive In-Browser Photo Editor**: Full-featured studio canvas dialog integrated into the Lightbox:
  - **Live Adjustments**: Real-time slider controls for Exposure/Brightness, Contrast, Saturation, Temperature (Warm/Cool), and Vignette.
  - **Curated Film Looks**: 6 film presets (*Vivid Pop*, *Monochrome Noir*, *Warm Vintage*, *Cinematic Cool*, *Golden Hour*, *Original*).
  - **Crop & Rotate**: Non-destructive 90° rotation controls and aspect ratio framing (Free, 1:1, 4:5, 3:2, 16:9, 9:16).
  - **Version History Pipeline**: Tracks non-destructive editing history in the `photo_versions` table and uploads newly saved copies directly to S3.
- **Live Photo & Motion Video Suite**:
  - **Custom Dark Video Player**: Built-in HTML5 player with scrubber progress bar, playback speed rate control (0.5x, 1.0x, 1.5x, 2.0x), mute/volume, and fullscreen toggle.
  - **Animated Hover Scrub Previews**: Hovering over any video card on the timeline automatically plays a muted live preview clip.
  - **Apple Live Photo Pairing**: Automatically detects paired `.heic` + `.mov` assets, rendering a sleek **"LIVE"** badge and interactive hold-to-play motion playback.
  - **Video Duration Extraction**: Auto-extracts exact runtimes and dimensions during ingestion.
- **Floating Batch Operations Action Dock**: Bottom-docked glassmorphic multi-select action bar providing power-user mass operations:
  - **Batch ZIP Takeout**: Streams selected items + a structured `manifest.json` metadata file directly into a `.zip` archive.
  - **Batch Favorite**: Stars all selected photos in parallel.
  - **Batch Album Assignment**: Direct batch assignment to custom collections.
  - **Batch Delete**: Permanent S3 & PostgreSQL cleanup with confirmation safeguards.
- **Vault Storage & Health Analytics (`/storage`)**:
  - **Storage Breakdown Chart**: Multi-color interactive capacity bar segmenting RAW Negatives, HEIC, Standard JPEG/PNG, Videos, and Other documents.
  - **Camera Gear Breakdown**: Ranked chart of top camera models and lens systems detected in your library.
  - **SHA-256 Deduplication Inspector**: Scans file hashes and sizes to identify duplicate uploads and calculate potential storage savings.
- **EXIF & Privacy Guardrails**:
  - Automatically extracts aperture, shutter speed, ISO, focal length, lens model, and capture timestamp.
  - User-disclosed GPS coordinates with opt-in privacy stripping during upload.

---

## Tech Stack

### Backend & Infrastructure
- **Next.js 16 (App Router)** with Server Actions and Route Handlers
- **TypeScript** for strict type safety
- **PostgreSQL** with **Drizzle ORM** for high-performance schema migrations and relational queries
- **AWS S3** (`@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`) for private blob storage
- **NextAuth v5 (Auth.js)** with JWT session strategies
- **bcryptjs** for salted password hashing
- **Sharp** for high-performance SIMD thumbnail generation (320px cover crop & 1200px preview)
- **exifr** for client and server EXIF/GPS metadata parsing
- **heic-convert** for Apple HEIC to standard JPEG transcoding
- **JSZip** for on-the-fly streaming multi-file archive generation
- **p-queue** for concurrency-controlled background processing
- **Zod** for schema validation

### Frontend & UI
- **React 19** with Server & Client Components
- **Vanilla CSS Tokens & Modern Design System** with dark mode, glassmorphism, and ambient radial glow layers
- **Leaflet & CartoDB Dark Matter** for interactive world map visualization
- **Lucide React** for consistent, modern iconography
- **HTML5 Canvas API** for real-time client-side image adjustments and preset filtering

---

## System Architecture

Keepsake uses a direct-to-storage serverless architecture where private file bytes never transit through the web application server during uploads or downloads.

```mermaid
graph TD
    subgraph Client ["Client Layer (React 19 / Next.js)"]
        UI["Photo Timeline & Lightbox Studio"]
        Editor["In-Browser Canvas Editor"]
        Map["Map Explorer (Leaflet/CartoDB)"]
        Batch["Batch Action Dock & ZIP Client"]
        Uploader["Direct S3 Upload Worker"]
    end

    subgraph Server ["Application Server (Next.js App Router)"]
        PresignAPI["Presigned URL Generator"]
        PhotoAPI["Photo & Search API Routes"]
        GeoAPI["GeoJSON Cluster Endpoint"]
        MemoriesAPI["Memories Engine"]
        StorageAPI["Analytics & Dedup Engine"]
        Queue["Background Processing Queue"]
    end

    subgraph Storage ["Private Storage & Database"]
        S3[(AWS S3 Private Bucket)]
        DB[(PostgreSQL Database)]
        Drizzle["Drizzle ORM"]
    end

    UI --> PresignAPI
    PresignAPI --> Uploader
    Uploader -- Direct PUT Stream --> S3
    Uploader --> PhotoAPI
    PhotoAPI --> Queue
    Queue -- Fetch Original --> S3
    Queue -- Sharp Thumbnails --> S3
    Queue --> Drizzle
    Drizzle --> DB
    UI <--> PhotoAPI
    Map <--> GeoAPI
    UI <--> MemoriesAPI
    Batch <--> S3
    StorageAPI <--> DB
```

---

## Module Dependency Flow

The application follows a clean modular separation between media storage, processing queues, geolocation services, and UI consumption layers.

```mermaid
graph LR
    subgraph Core_Storage ["Storage & Media Pipeline"]
        S3Client[AWS S3 Client] --> Presigner[S3 Presigner]
        Presigner --> Queue[Processing Queue]
        Queue --> EXIF[EXIF Parser]
        Queue --> HEIC[HEIC Transcoder]
        Queue --> Sharp[Sharp Thumbnailer]
        Queue --> ReverseGeo[Reverse Geocoder]
    end

    subgraph Data_Layer ["Database & Business Logic"]
        ReverseGeo --> Schema[Drizzle Schema]
        Schema --> DB[(PostgreSQL)]
        DB --> Memories[Memories Engine]
        DB --> Dedup[Deduplication Scanner]
        DB --> Analytics[Storage Analytics]
    end

    subgraph Feature_UI ["Client Presentation Layer"]
        Memories --> Carousel[Memories Carousel]
        ReverseGeo --> MapView[Map Explorer]
        Drizzle --> Grid[Virtualized Timeline]
        Grid --> Lightbox[Lightbox & EXIF]
        Lightbox --> EditorUI[Canvas Photo Studio]
        Grid --> Dock[Batch Action Dock]
    end
```

---

## Project Structure

```
Personal Cloud Photo Vault/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx             # App shell with Sidebar and global upload provider
│   │   ├── library/page.tsx       # Chronological timeline grid & smart collections
│   │   ├── map/page.tsx           # Places & Interactive World Map Explorer
│   │   ├── storage/page.tsx       # Storage breakdown & deduplication dashboard
│   │   ├── albums/page.tsx        # Custom albums management & detail view
│   │   └── search/page.tsx        # Multi-criteria search engine
│   ├── (auth)/
│   │   ├── layout.tsx             # Split-screen brand storytelling layout
│   │   ├── login/page.tsx         # Sign in interface
│   │   └── register/page.tsx      # Vault account registration
│   ├── api/
│   │   ├── auth/                  # NextAuth & registration endpoints
│   │   ├── uploads/presign/       # AWS S3 PUT pre-signing route
│   │   ├── photos/                # Photo CRUD, pagination & smart filters
│   │   │   ├── [id]/favorite/     # Favorite toggle endpoint
│   │   │   ├── [id]/version/      # Non-destructive version snapshot route
│   │   │   ├── batch/download/    # Streaming multi-file ZIP generator
│   │   │   ├── duplicates/        # SHA-256 duplicate detection endpoint
│   │   │   └── geo/               # GeoJSON cluster endpoint
│   │   ├── memories/              # "On This Day" retrospective memory capsule route
│   │   ├── analytics/storage/     # Storage breakdown & camera metrics route
│   │   ├── albums/                # Album CRUD & photo relations
│   │   └── shares/                # Cryptographic token share link handlers
│   └── share/[token]/page.tsx     # Public read-only share view with pre-signed GET
├── components/
│   ├── auth/                      # AuthBrandPanel storytelling component
│   ├── layout/                    # Sidebar, Navbar, and EmptyState components
│   ├── library/                   # PhotoGrid, DateGroupHeader, and BatchActionDock
│   ├── lightbox/                  # Full-screen Lightbox, ExifPanel, and LightboxNav
│   ├── editor/                    # PhotoEditor studio modal & adjustment sliders
│   ├── map/                       # MapView CartoDB Leaflet component
│   ├── memories/                  # MemoriesCarousel story cards
│   ├── video/                     # VaultVideoPlayer and LivePhotoViewer
│   ├── albums/                    # AlbumCard, PhotoSelector, and AlbumCreateDialog
│   └── upload/                    # UploadZone, UploadQueue, and UploadContext
├── lib/
│   ├── auth/                      # NextAuth configuration & password hashing
│   ├── db/                        # Drizzle client, schema definitions & migrations
│   ├── s3/                        # AWS S3 client, pre-signers, and key generators
│   ├── processing/                # EXIF extraction, HEIC conversion, and Sharp queue
│   ├── editor/                    # Canvas adjustments, film presets, and crop math
│   ├── geo/                       # Offline reverse geocoding bounding box resolver
│   ├── memories/                  # Retrospective memory matching algorithm
│   ├── dedup/                     # SHA-256 file buffer hashing
│   └── video/                     # Video metadata & duration formatting
├── types/                         # TypeScript interfaces (photo, album, share, user)
├── __tests__/                     # Vitest automated unit & integration test suites
└── README.md
```

---

## API Documentation Overview

The backend exposes a structured RESTful API:

*   **Authentication**:
    *   `POST /api/auth/register` — Create new vault account.
*   **Media Ingestion & Processing**:
    *   `POST /api/uploads/presign` — Request pre-signed S3 PUT URLs with size & MIME validation.
    *   `POST /api/photos` — Confirm upload and enqueue asynchronous EXIF/thumbnail processing.
*   **Library & Smart Queries**:
    *   `GET /api/photos` — Fetch paginated chronological photos (`?cursor=...&limit=50`).
    *   `GET /api/photos?filter=favorites` — Filter starred photos.
    *   `GET /api/photos?filter=videos` — Filter video items.
    *   `GET /api/photos?filter=panoramas` — Filter ultra-wide aspect ratio photos.
    *   `GET /api/photos?filter=scans` — Filter documents & receipts.
*   **Mutations & Versions**:
    *   `PATCH /api/photos/:id/favorite` — Toggle photo favorite status.
    *   `DELETE /api/photos/:id` — Delete photo original, thumbnails, and database records.
*   **Geolocation & Maps**:
    *   `GET /api/photos/geo` — Return GeoJSON features of all geotagged photos with pre-signed thumbnails.
*   **Memories & Retrospectives**:
    *   `GET /api/memories` — Fetch "On This Day" retrospective capsules for past years.
*   **Batch Operations & Takeout**:
    *   `POST /api/photos/batch/download` — Stream selected photo IDs into a downloadable ZIP archive with `manifest.json`.
*   **Storage & Health Diagnostics**:
    *   `GET /api/analytics/storage` — Storage breakdown by format, resolution, and camera gear.
    *   `GET /api/photos/duplicates` — Detect identical files and calculate recoverable storage bytes.
*   **Albums**:
    *   `GET /api/albums` — List user albums with dynamic covers.
    *   `POST /api/albums` — Create custom album.
    *   `POST /api/albums/:id/photos` — Add/remove photos from album.
*   **Cryptographic Sharing**:
    *   `POST /api/shares` — Create revocable token share link with custom expiration.
    *   `DELETE /api/shares/:token` — Revoke active share link.
    *   `GET /api/shares/:token` — Authorize viewer and pre-sign 5-minute GET URLs.

---

## Performance & Security Benchmarks

### Security & Privacy
- **Zero Public S3 Access**: AWS S3 bucket has `Block all public access: true` enabled. All GET/PUT operations rely on time-limited cryptographic pre-signed URLs (15-min PUT, 5-min GET).
- **GPS Privacy Guardrails**: EXIF location data is extracted strictly on the server with a clear disclosure banner and an option to strip GPS coordinates before saving.
- **Client-Side S3 Streaming**: Photo binaries stream directly from browser to AWS S3, bypassing server memory and scaling seamlessly to multi-gigabyte files.

### Storage & Delivery Optimization
- **Progressive Dual-Tier Thumbnails**:
  - `sm` (320×320px WebP/JPEG cover crop): ~15–25 KB per item for 60fps timeline scrolling.
  - `md` (1200px max preview): ~120–200 KB per item for instant lightbox viewing.
  - **Bandwidth Savings**: Reduces timeline bandwidth consumption by **>96%** compared to loading full-resolution RAW or JPEG originals.
- **Offline Reverse Geocoding**: Sub-millisecond coordinate resolution with zero external network overhead or third-party tracking.

---

## Development & Deployment Roadmap

### Phase 1: Storage Foundation & Secure Ingestion (Completed)
- Direct-to-S3 pre-signed PUT ingestion pipeline.
- PostgreSQL database schema with Drizzle ORM.
- Secure NextAuth v5 session management.

### Phase 2: Metadata & Media Processing Queue (Completed)
- Background processing worker using `p-queue`.
- Lossless EXIF metadata extraction and camera gear detection.
- Apple HEIC/HEIF to JPEG transcoding.
- Multi-tier progressive thumbnail generation via Sharp.

### Phase 3: Timeline & Fullscreen Lightbox Experience (Completed)
- Chronological timeline grid with sticky date headers.
- Fullscreen Lightbox with EXIF sidebar and keyboard navigation.
- Real-time upload progress queue with retry actions.

### Phase 4: Custom Albums & Revocable Sharing (Completed)
- Custom album creation and photo curation modal.
- 128-bit cryptographic token share links with configurable TTL and instant revocation.

### Phase 5: Geolocation & Interactive World Map (Completed)
- Offline reverse geocoder caching City, Country, and location names.
- GeoJSON spatial clustering endpoint (`/api/photos/geo`).
- Interactive CartoDB Dark Matter map canvas (`/map`) with photo pins and Lightbox shortcuts.

### Phase 6: Memories, Favorites & Smart Collections (Completed)
- "On This Day" retrospective memories matching engine.
- Floating Memories Story Carousel on Library timeline header.
- 1-click favorite star mutations (`is_favorite`) and smart collection sidebar views (*Favorites*, *Videos*, *Panoramas*, *Scans*).

### Phase 7: Non-Destructive In-Browser Photo Studio (Completed)
- Real-time canvas adjustment engine (Exposure, Contrast, Saturation, Temperature, Vignette).
- 6 curated film presets with live preview.
- Non-destructive crop and 90° rotation tools.
- Version history tracking (`photo_versions`) and direct S3 save pipeline.

### Phase 8: Motion Video Suite & Live Photo Playback (Completed)
- Custom dark video player with progress scrubber and playback rate switcher.
- Video duration auto-extraction and timeline runtime badges.
- Timeline hover live preview clips.
- Apple Live Photo paired motion playback (`.heic` + `.mov`) with interactive `"LIVE"` badge.

### Phase 9: Batch Operations, ZIP Takeout & Storage Analytics (Completed)
- Floating multi-select Batch Action Dock.
- Streaming multi-file ZIP archive generator with `manifest.json` metadata takeout.
- SHA-256 deduplication scanner detecting duplicate files and storage savings.
- Vault Storage & Health Analytics dashboard (`/storage`) with format breakdowns and camera metrics.

---

## Quickstart & Installation

### 1. Prerequisites
- **Node.js 20+**
- **PostgreSQL 15+**
- **AWS S3 Bucket & IAM Credentials**

### 2. Environment Setup
Configure your `.env` file in the project root:

```env
# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-photo-vault-bucket

# PostgreSQL Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/photo_vault

# NextAuth v5 Authentication
AUTH_SECRET=your_generated_32_byte_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Background Worker Concurrency
PROCESSING_CONCURRENCY=2
```

### 3. S3 Bucket & CORS Configuration
Ensure your AWS S3 bucket has **Block all public access** enabled.

Add the following **CORS configuration** to your S3 bucket permissions:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourvaultdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Database Migration
Push the Drizzle database schema to your PostgreSQL database:

```bash
npm run db:push
```

### 5. Running Locally
```bash
# Start local development server
npm run dev

# Run automated Vitest test suite
npm run test:run

# Build production bundle
npm run build
```

---

## License
MIT License. Created for private, sovereign personal media archiving.
