# ForumCinemas Movie Reporter 🎬

A Node.js application that scrapes ForumCinemas for currently playing movies and generates a beautiful HTML report with IMDb ratings.

## Features

- **Scrapes ForumCinemas** for currently playing movies
- **Fetches IMDb ratings** using the OMDb API (no 403 errors!)
- **Generates beautiful HTML report** with sortable columns
- **Development mode** for testing with saved HTML files
- **Production mode** for live data fetching
- **Rate limiting** to be respectful to APIs

## Prerequisites

- Node.js (v14 or higher)
- OMDb API key (free at [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx))

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OMDb API key:**
   ```bash
   echo "OMDB_API_KEY=your_api_key_here" > .env
   ```
   
   Or edit the `.env` file directly and replace `93a14844` with your actual API key.

## Usage

```bash
npm start
```

This fetches live data from ForumCinemas and OMDb API to generate the current movie report.

## Output Files

- **`data/now_playing.json`** - List of movie detail page URLs
- **`data/movies_enriched.json`** - Complete movie data with IMDb ratings
- **`report.html`** - Beautiful, sortable HTML report

## Report Features

The generated HTML report includes:
- **Sortable columns** (click headers to sort)
- **Responsive design** (works on mobile and desktop)
- **Beautiful styling** with gradients and hover effects
- **Statistics** showing movie count and rating coverage
- **Direct links** to IMDb pages

## How It Works

1. **Scrapes ForumCinemas** now-playing page for movie links
2. **Visits each movie page** to extract details (title, year, genres, IMDb link)
3. **Fetches IMDb ratings** from OMDb API using the extracted IMDb IDs
4. **Generates HTML report** with all data in a sortable table

## Troubleshooting

### "No movies found" error
The scraper might need selector adjustments based on ForumCinemas' HTML structure. Check the console output for debugging info.

### OMDb API errors
- Verify your API key is correct in `.env`
- Check if you've exceeded the free tier limit (1000 requests/day)
- Ensure the IMDb ID format is correct (starts with "tt")

### Rate limiting
The app includes a 200ms delay between OMDb API calls to be respectful. This is configurable in the code.

## Customization

- **Styling**: Edit the CSS in `src/scraper.js` (generateReport function)
- **Selectors**: Modify the HTML parsing logic in the scraper functions
- **Rate limiting**: Adjust the delay in `src/index.js`

## License

MIT License - feel free to modify and distribute!
