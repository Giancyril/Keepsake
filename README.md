# Personal Cloud Photo Vault 📸🔒

A private, self-hosted, cloud-native alternative to iCloud Photos & Google Photos built with **Next.js (App Router)**, **AWS S3**, and **PostgreSQL**.

---

## Features

- **Direct-to-S3 Uploads**: Files stream directly from your browser to your private S3 bucket via pre-signed PUT URLs. Zero server bandwidth or memory bottlenecks.
- **Batch Multi-File Processing**: Granular per-file XHR upload progress indicators, graceful failure handling, and retry actions.
- **Automated Metadata & Thumbnail Pipeline**:
  - Extracts EXIF metadata (taken date, camera make/model, dimensions).
  - Preserves GPS coordinates privately with a clear user disclosure banner and optional upload stripping.
  - Converts Apple HEIC photos to standard JPEGs for web rendering while preserving the original HEIC file.
  - Sharp generates multi-tier progressive JPEGs (`sm` 320px cover crop for grid, `md` 1200px for lightbox).
- **Chronological Timeline Grid**:
  - Sticky date group headers (Today, Yesterday, Full Dates).
  - Shimmer skeleton placeholders and blur-up loading.
  - Interactive full-screen Lightbox with EXIF side panel and keyboard navigation (`←`, `→`, `Esc`, `I`).
- **Albums Management**:
  - Create, rename, and delete custom albums.
  - Multi-select photo selector modal to curate photos into albums.
  - Automatic dynamic cover photo generation.
- **Multi-Criteria Search**:
  - Instant debounced search on filenames and camera models.
  - Filters for date ranges (Today, This Month, This Year) and GPS-tagged photos.
- **Revocable & Expiring Share Links**:
  - Cryptographically secure 128-bit random tokens (`/share/[token]`).
  - Configurable expiration (1, 7, 30 days, or permanent).
  - Instant owner revocation (`DELETE /api/shares/:token`).
  - S3 objects remain 100% private; pre-signed GET URLs with 5-minute TTL are generated on the fly after authorization.
- **Photo-Forward Dark UI**: Sleek, distraction-free neutral aesthetic where photos are the hero.

---

## Architecture Flow

```
Browser (Client)
  │
  ├─► 1. Request pre-signed PUT URL ──► POST /api/uploads/presign (Next.js)
  │                                           │ Validates Auth & File Limits
  │                                           ▼
  │◄── 2. Receives S3 PUT URL ──────── AWS SDK S3 Request Presigner
  │
  ├─► 3. Uploads file byte stream ───► AWS S3 Bucket (Private)
  │       (XHR per-file progress)
  │
  ├─► 4. Confirms completion ────────► POST /api/photos (Next.js)
  │                                           │ Enqueues Async Job
  │                                           ▼
  │                                     Background Worker
  │                                      ├─ Fetch original from S3
  │                                      ├─ Extract EXIF / GPS (exifr)
  │                                      ├─ Convert HEIC if needed
  │                                      ├─ Generate Thumbnails (sharp)
  │                                      ├─ Upload Thumbs to S3
  │                                      └─ Store metadata in PostgreSQL
  │
  └─► 5. Views timeline grid ────────► GET /api/photos
                                         └─ Pre-signs 5-min GET URLs
```

---

## Quickstart & Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL database
- AWS S3 Bucket & IAM credentials

### 2. Environment Configuration

Configure your `.env` file with your credentials:

```env
# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=my-photo-vault

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/photo_vault

# NextAuth.js
AUTH_SECRET=your_32_byte_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. S3 Bucket & CORS Configuration

Ensure your S3 bucket has **Block all public access** enabled.

Add the following **CORS configuration** to your S3 bucket (under Permissions → Cross-origin resource sharing):

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

### 4. Database Schema Setup

Apply the SQL migration in `lib/db/migrations/0001_initial_schema.sql` to your PostgreSQL database, or use Drizzle:

```bash
npm run db:push
```

### 5. Running the Application

```bash
# Start development server
npm run dev

# Run automated test suite
npm run test:run

# Build for production
npm run build
```

---

## AWS Cost Considerations

For personal vault usage:
- **S3 Standard Storage**: ~$0.023 / GB / month. A 100 GB vault is approximately **$2.30 / month**.
- **Data Transfer**: First 100 GB / month outbound to the internet is free from AWS.
- **Request Costs**: `PUT` ($0.005 / 1k) and `GET` ($0.0004 / 1k) requests are negligible at personal scale.
- **Thumbnails**: Thumbnails represent ~5–8% storage overhead vs originals.

---

## License

MIT License.
