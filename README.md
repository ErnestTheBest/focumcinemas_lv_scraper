# ForumCinemas Movie Reporter 🎬

A Node.js application that scrapes ForumCinemas for currently playing movies and generates a beautiful HTML report with IMDb ratings.

## Features

- **Scrapes ForumCinemas** for currently playing movies
- **Fetches IMDb ratings** using the OMDb API
- **Generates beautiful HTML report** with sortable columns

## Prerequisites

- Node.js (v14 or higher)
- OMDb API key (free at [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx))

## Installation

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
   
   Or edit the `.env` file directly and replace the existing API key with your actual key.

## Usage

```bash
npm start
```

This will:
1. Scrape ForumCinemas for currently playing movies
2. Extract movie details and IMDb IDs
3. Fetch ratings and correct years from OMDb API
4. Generate a comprehensive HTML report

## Output Files

- **`data/now_playing.json`** - List of movie detail page URLs
- **`data/movies_enriched.json`** - Complete movie data with IMDb ratings and corrected years
- **`report.html`** - Beautiful, sortable HTML report

## Report Features

The generated HTML report includes:
- **Sortable columns** (click headers to sort)
- **Responsive design** (works on mobile and desktop)
- **Beautiful styling** with gradients and hover effects
- **Statistics** showing movie count and rating coverage
- **Direct links** to IMDb pages
- **Corrected release years** from OMDb API

## How It Works

1. **Scrapes ForumCinemas** now-playing page for movie links
2. **Visits each movie page** to extract details (title, year, genres, IMDb link)
3. **Fetches IMDb ratings and years** from OMDb API using the extracted IMDb IDs
4. **Corrects scraped years** with accurate data from OMDb API
5. **Generates HTML report** with all data in a sortable table

## Debugging Output

The script now provides detailed logging:
- `📅 Scraped release year: XXXX` - Shows what year was found from the website
- `📅 Updated release year to XXXX from OMDb API` - Shows when OMDb API corrects the year
- `⚠️ No release year found from scraping` - When no year could be extracted

## License

MIT License - feel free to modify and distribute!
