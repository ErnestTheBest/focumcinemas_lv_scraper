# ForumCinemas Movie Reporter 🎬

A Node.js application that scrapes ForumCinemas for currently playing movies and generates a beautiful HTML report with IMDb ratings.

## 📋 Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker - Easiest)](#quick-start-docker---easiest)
- [Traditional Installation (Local)](#traditional-installation-local)
- [Usage](#usage)
- [What the Application Does](#what-the-application-does)
- [Output Files](#output-files)
- [Report Features](#report-features)
- [Debugging Output](#debugging-output)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Features

- **Scrapes ForumCinemas** for currently playing movies
- **Fetches IMDb ratings** using the OMDb API
- **Generates beautiful HTML report** with sortable columns
- **Clickable movie titles** linking to ForumCinemas pages
- **Smart year detection** with fallback to OMDb API data
- **Docker support** for easy deployment

## Prerequisites

- **Option 1 (Docker - Recommended):** Docker Desktop
- **Option 2 (Local):** Node.js (v14 or higher)
- **Both options:** OMDb API key (free at [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx))

## Quick Start (Docker - Easiest)

If you have Docker installed, this is the simplest way to run the application:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd forumcinemas_films
   ```

2. **Set up your OMDb API key:**
   ```bash
   echo "OMDB_API_KEY=your_api_key_here" > .env
   ```

3. **Run with Docker:**
   ```bash
   docker-compose up --build
   ```

That's it! The application will:
- Install all dependencies automatically
- Scrape ForumCinemas for current movies
- Fetch IMDb ratings and correct years
- Generate a beautiful HTML report
- Exit when complete

**Benefits of Docker approach:**
- ✅ **No Node.js installation required**
- ✅ **No dependency conflicts**
- ✅ **Works on any machine with Docker**
- ✅ **Consistent environment**

## Traditional Installation (Local)

If you prefer to run locally or don't have Docker:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd forumcinemas_films
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your OMDb API key:**
   ```bash
   echo "OMDB_API_KEY=your_api_key_here" > .env
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

## Usage

### Docker (Recommended)
```bash
# Run once and exit
docker-compose up --build

# Run in background
docker-compose up -d

# Stop when done
docker-compose down
```

### Local
```bash
npm start
```

## What the Application Does

1. **Scrapes ForumCinemas** now-playing page for movie links
2. **Extracts movie details** (title, year, genres, IMDb link)
3. **Fetches IMDb ratings and years** from OMDb API
4. **Corrects scraped years** with accurate data from OMDb API
5. **Generates HTML report** with all data in a sortable table

## Output Files

- **`data/now_playing.json`** - List of movie detail page URLs
- **`data/movies_enriched.json` - Complete movie data with IMDb ratings and corrected years
- **`report.html`** - Beautiful, sortable HTML report with clickable movie titles

## Report Features

The generated HTML report includes:
- **Sortable columns** (click headers to sort)
- **Responsive design** (works on mobile and desktop)
- **Beautiful styling** with gradients and hover effects
- **Statistics** showing movie count and rating coverage
- **Clickable movie titles** linking to ForumCinemas pages
- **Direct links** to IMDb pages
- **Corrected release years** from OMDb API

## Debugging Output

The script provides detailed logging:
- `📅 Scraped release year: XXXX` - Shows what year was found from the website
- `📅 Updated release year to XXXX from OMDb API` - Shows when OMDb API corrects the year
- `⚠️ No release year found from scraping` - When no year could be extracted

## Troubleshooting

### Docker Issues
- **Make sure Docker Desktop is running**
- **Check that port 3000 is available**
- **Verify your `.env` file exists with the API key**

### API Issues
- **Verify your OMDb API key** is correct in `.env`
- **Check internet connection** (needs ForumCinemas + OMDb API access)
- **Rate limiting** - Free OMDb tier allows 1000 requests/day

### General Issues
- **Check the console output** for detailed error messages
- **Verify the `.env` file** is in the project root
- **Ensure you have write permissions** for the project directory

## License

MIT License - feel free to modify and distribute!
