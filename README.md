# ForumCinemas Movie Reporter 🎬

A Dockerized Node.js app that scrapes ForumCinemas for currently playing movies and generates a beautiful HTML report with IMDb rating, year, and genres fetched directly from IMDb using Playwright.

## 📋 Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Usage](#usage)
- [What the Application Does](#what-the-application-does)
- [Output Files](#output-files)
- [Report Features](#report-features)
- [Debugging Output](#debugging-output)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Scrapes ForumCinemas** for currently playing movies
- **Fetches IMDb rating, year, and genres** via Playwright directly from IMDb
- **Generates beautiful HTML report** with sortable columns
- **Clickable movie titles** linking to ForumCinemas pages
- **Docker support** for easy, reproducible runs

## Prerequisites

- **Docker Desktop** (or any Docker runtime)

## Quick Start (Docker)

If you have Docker installed, this is the simplest way to run the application:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd forumcinemas_films
   ```

2. **Run with Docker:**
   ```bash
   docker-compose up --build
   ```

That's it! The application will:
- Install all dependencies automatically
- Scrape ForumCinemas for current movies
- Fetch IMDb rating, year, and genres using Playwright
- Generate a beautiful HTML report
- Exit when complete

**Benefits of Docker approach:**
- ✅ **No local Node.js installation required**
- ✅ **No dependency conflicts**
- ✅ **Works on any machine with Docker**
- ✅ **Consistent environment with Playwright browsers preinstalled**

<!-- Local installation instructions removed: Docker-only workflow -->

## Usage

```bash
# Run once and exit
docker-compose up --build

# Run in background
docker-compose up -d

# Stop when done
docker-compose down
```

## What the Application Does

1. **Scrapes ForumCinemas** now-playing page for movie links
2. **Extracts movie details** (title, tentative year, genres, IMDb link)
3. **Fetches IMDb rating, year, and genres** using Playwright
4. **Generates HTML report** with all data in a sortable table

## Output Files

- **`data/now_playing.json`** - List of movie detail page URLs
- **`data/movies_enriched.json`** - Complete movie data with IMDb details (rating, year, genres)
- **`index.html`** - Beautiful, sortable HTML report with clickable movie titles (ready for GitHub Pages)

## Report Features

The generated HTML report includes:
- **Sortable columns** (click headers to sort)
- **Responsive design** (works on mobile and desktop)
- **Beautiful styling** with gradients and hover effects
- **Statistics** showing movie count and rating coverage
- **Clickable movie titles** linking to ForumCinemas pages
- **Direct links** to IMDb pages

## Debugging Output

The script provides detailed logging:
- `📅 Scraped release year: XXXX` - Year inferred from ForumCinemas page
- `📅 Updated release year to XXXX from IMDb` - Year corrected using IMDb
- `🎭 Fetching IMDb details for ttXXXXXXX...` - Playwright fetching on IMDb
- `⚠️ No release year found from scraping` - When no year could be extracted

## Troubleshooting

### Docker Issues
- **Make sure Docker Desktop is running**
- **Run with the provided Playwright image** (`mcr.microsoft.com/playwright:v1.55.0-jammy`)
- **Rebuild after updates**: `docker-compose up --build`

### Playwright Version Mismatch
- If you see a message asking to update the Docker image (e.g., Playwright updated locally), align versions:
  - Update `docker-compose.yml` image tag to the required version
  - Re-run `docker-compose up --build`
- Optional: if encountering headless shell issues, set legacy headless mode:
  ```yaml
  environment:
    - PW_USE_LEGACY_HEADLESS=1
  ```

### General Issues
- **Check the console output** for detailed error messages
- **Ensure network access** (needs ForumCinemas + IMDb)
- **Ensure write permissions** in the project directory

## License

MIT License - feel free to modify and distribute!
