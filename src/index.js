require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { scrapeNowPlaying, scrapeMovieDetails, fetchImdbRating, generateReport } = require('./scraper');

const OMDB_API_KEY = process.env.OMDB_API_KEY;

async function main() {
    try {
        console.log('🚀 Starting ForumCinemas Movie Reporter');
        
        if (!OMDB_API_KEY) {
            throw new Error('OMDB_API_KEY not found in environment variables');
        }

        // Step 1: Get list of movies currently playing
        console.log('📽️  Fetching now playing movies...');
        const movieLinks = await scrapeNowPlaying();
        console.log(`Found ${movieLinks.length} movies playing`);
        
        // Save intermediate data
        await fs.writeFile('data/now_playing.json', JSON.stringify(movieLinks, null, 2));
        
        // Step 2: Scrape details for each movie
        console.log('🔍 Scraping movie details...');
        const movies = [];
        
        for (let i = 0; i < movieLinks.length; i++) {
            const link = movieLinks[i];
            console.log(`Processing ${i + 1}/${movieLinks.length}: ${link.title}`);
            
            try {
                const movieDetails = await scrapeMovieDetails(link.url);
                
                if (movieDetails.imdbId) {
                    // Fetch IMDb rating
                    console.log(`  📊 Fetching IMDb rating for ${movieDetails.imdbId}...`);
                    const rating = await fetchImdbRating(movieDetails.imdbId, OMDB_API_KEY);
                    movieDetails.imdbRating = rating;
                    
                    // Rate limiting
                    if (i < movieLinks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                } else {
                    console.log(`  ⚠️  No IMDb link found, skipping`);
                    continue;
                }
                
                movies.push(movieDetails);
            } catch (error) {
                console.error(`  ❌ Error processing ${link.title}:`, error.message);
            }
        }
        
        // Save intermediate data
        await fs.writeFile('data/movies_enriched.json', JSON.stringify(movies, null, 2));
        
        // Step 3: Generate the report
        console.log('📄 Generating HTML report...');
        await generateReport(movies);
        
        console.log(`✅ Report generated successfully! Found ${movies.length} movies with IMDb data`);
        console.log('📁 Check report.html for the final report');
        
    } catch (error) {
        console.error('❌ Error in main process:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };
