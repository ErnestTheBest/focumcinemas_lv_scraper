const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes the now playing page to get list of movie links
 */
async function scrapeNowPlaying() {
    console.log('  🌐 Fetching live from ForumCinemas...');
    const response = await axios.get('https://www.forumcinemas.lv/eng/movies/now-playing');
    const html = response.data;
    await fs.writeFile('the_roses.html', html); // open this in your browser
    
    const $ = cheerio.load(html);
    const movieLinks = [];
    
    // Look for movie links - based on the actual HTML structure
    $('a[href*="/title/"]').each((i, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href');
        
        // Filter out non-movie links and ensure we have valid data
        if (title && link && 
            title.length > 0 && title.length < 1000 && 
            !title.includes('Buy tickets') && 
            !title.includes('Trailer') &&
            link.includes('/eng/event/') &&
            link.includes('/title/')) {
            
            // Make sure link is absolute
            const fullUrl = link.startsWith('http') ? link : `https://www.forumcinemas.lv${link}`;
            movieLinks.push({ title, url: fullUrl });
        }
    });
    
    // Remove duplicates based on URL
    const uniqueLinks = [];
    const seenUrls = new Set();
    
    movieLinks.forEach(link => {
        if (!seenUrls.has(link.url)) {
            seenUrls.add(link.url);
            uniqueLinks.push(link);
        }
    });
    
    return uniqueLinks;
}

/**
 * Scrapes individual movie page for details
 */
async function scrapeMovieDetails(movieUrl, forumcinemasUrl) {
    console.log(`  🌐 Fetching live from: ${movieUrl}`);
    const response = await axios.get(movieUrl);
    const html = response.data;
    
    const $ = cheerio.load(html);
    
    // Extract movie information
    const title = $('h1.list-item-desc-title').first().text().trim();
    
    // Try to find release year from various possible locations
    let releaseYear = null;
    
    // First try to find it in the event info section
    const releaseDateText = $('p:contains("Release Date:") span:last-child').text().trim();
    if (releaseDateText) {
        const yearMatch = releaseDateText.match(/(\d{4})/);
        if (yearMatch) {
            releaseYear = parseInt(yearMatch[1]);
        }
    }
    
    // If no release date found, try to find it in the title or description
    if (!releaseYear) {
        // Look for year in parentheses in the title (common format: "Movie Title (2023)")
        const titleYearMatch = title.match(/\((\d{4})\)/);
        if (titleYearMatch) {
            releaseYear = parseInt(titleYearMatch[1]);
        }
    }
    
    // If still no year found, try to find it in specific content areas
    if (!releaseYear) {
        // Look for year in movie description or details sections
        const yearSelectors = [
            '.movie-details',
            '.event-description',
            '.movie-info',
            'p:contains("Year:")',
            'p:contains("Released:")',
            'span:contains("Year:")',
            'span:contains("Released:")'
        ];
        
        for (const selector of yearSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                const text = element.text();
                const yearMatch = text.match(/(\d{4})/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[1]);
                    // Validate that it's a reasonable movie year (not current year unless it's a new movie)
                    if (year >= 1900 && year <= new Date().getFullYear() + 1) {
                        releaseYear = year;
                        break;
                    }
                }
            }
        }
    }
    
    // Last resort: only use generic HTML search if we're very selective
    if (!releaseYear) {
        // Look for year in specific content areas, not the entire HTML
        const contentAreas = [
            '.event-top-desc-cont',
            '.movie-description',
            '.event-description',
            'p',
            'span'
        ];
        
        for (const selector of contentAreas) {
            const elements = $(selector);
            for (let i = 0; i < elements.length; i++) {
                const text = $(elements[i]).text().trim();
                // Only look for years in reasonable contexts
                if (text.length < 200 && (text.includes('Year') || text.includes('Release') || text.includes('('))) {
                    const yearMatch = text.match(/(\d{4})/);
                    if (yearMatch) {
                        const year = parseInt(yearMatch[1]);
                        // Validate that it's a reasonable movie year
                        if (year >= 1900 && year <= new Date().getFullYear() + 1) {
                            releaseYear = year;
                            break;
                        }
                    }
                }
            }
            if (releaseYear) break;
        }
    }
    
    // Extract genres from the event-top-desc-cont section
    const genres = [];
    const genreText = $('.event-top-desc-cont span').filter(function() {
        const text = $(this).text().trim();
        return text && text.includes(',') && text.length < 100;
    }).first().text().trim();
    
    if (genreText) {
        // Split by comma and clean up
        const genreList = genreText.split(',').map(g => g.trim());
        genres.push(...genreList);
    }
    
    // If no genres found with the above method, try alternative selectors
    if (genres.length === 0) {
        $('span, div').each((i, element) => {
            const text = $(element).text().trim();
            if (text && text.length < 20 && /^(Action|Comedy|Drama|Thriller|Horror|Romance|Sci-Fi|Fantasy|Adventure|Crime|Mystery|Animation|Documentary|Family|War|Western|Musical|Biography|History|Sport)$/i.test(text)) {
                if (!genres.includes(text)) {
                    genres.push(text);
                }
            }
        });
    }
    
    // Extract IMDb ID from link
    let imdbId = null;
    $('a[href*="imdb.com/title/"]').each((i, element) => {
        const href = $(element).attr('href');
        const match = href.match(/imdb\.com\/title\/(tt\d+)/);
        if (match) {
            imdbId = match[1];
            return false; // break the loop
        }
    });
    
    // Debug logging for year extraction
    if (releaseYear) {
        console.log(`    📅 Scraped release year: ${releaseYear}`);
    } else {
        console.log(`    ⚠️  No release year found from scraping`);
    }
    
    return {
        title: title || 'Unknown Title',
        releaseYear: releaseYear || 'Unknown',
        genres: genres.length > 0 ? genres.join(', ') : 'Unknown',
        imdbId,
        imdbUrl: imdbId ? `https://www.imdb.com/title/${imdbId}/` : null,
        forumcinemasUrl: forumcinemasUrl || movieUrl
    };
}

/**
 * Fetches IMDb rating and release year from OMDb API
 */
async function fetchImdbRating(imdbId, apiKey) {
    try {
        const url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`;
        const response = await axios.get(url);
        
        if (response.data.Response === 'True') {
            const rating = response.data.imdbRating;
            const year = response.data.Year;
            
            return {
                rating: rating && rating !== 'N/A' ? parseFloat(rating) : null,
                year: year && year !== 'N/A' ? parseInt(year) : null
            };
        } else {
            console.log(`    ⚠️  OMDb API error: ${response.data.Error}`);
            return { rating: null, year: null };
        }
    } catch (error) {
        console.log(`    ❌ Error fetching rating: ${error.message}`);
        return { rating: null, year: null };
    }
}

/**
 * Generates the final HTML report
 */
async function generateReport(movies) {
    // Helper function to escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ForumCinemas Now Playing - Movie Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats {
            background: #f8f9fa;
            padding: 20px 30px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        
        .stat {
            text-align: center;
            margin: 10px;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .table-container {
            padding: 30px;
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        th:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
        
        th.sortable::after {
            content: '↕';
            position: absolute;
            right: 15px;
            opacity: 0.5;
        }
        
        th.sort-asc::after {
            content: '↑';
            opacity: 1;
        }
        
        th.sort-desc::after {
            content: '↓';
            opacity: 1;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #f1f3f4;
            transition: background-color 0.2s ease;
        }
        
        tr:hover td {
            background-color: #f8f9fa;
        }
        
        .title {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .year {
            color: #6c757d;
            font-weight: 500;
        }
        
        .rating {
            font-weight: bold;
            color: #28a745;
        }
        
        .rating.na {
            color: #6c757d;
            font-style: italic;
        }
        
        .genres {
            color: #495057;
            font-size: 0.9rem;
        }
        
        .imdb-link {
            color: #f39c12;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        
        .imdb-link:hover {
            color: #e67e22;
            text-decoration: underline;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .stats {
                flex-direction: column;
            }
            
            .table-container {
                padding: 15px;
            }
            
            th, td {
                padding: 10px;
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 <a href="https://www.forumcinemas.lv/eng/movies/now-playing" target="_blank" rel="noopener" style="color: white; text-decoration: none;">ForumCinemas</a> Now Playing</h1>
            <p>Current movie lineup with IMDb ratings</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${movies.length}</div>
                <div class="stat-label">Movies</div>
            </div>
            <div class="stat">
                <div class="stat-number">${movies.filter(m => m.imdbRating).length}</div>
                <div class="stat-label">With Ratings</div>
            </div>
            <div class="stat">
                <div class="stat-number">${new Date().toLocaleDateString()}</div>
                <div class="stat-label">Last Updated</div>
            </div>
        </div>
        
        <div class="table-container">
            <table id="moviesTable">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="title">Title</th>
                        <th class="sortable" data-sort="year">Year</th>
                        <th class="sortable" data-sort="rating">IMDb Rating</th>
                        <th>IMDb Link</th>
                        <th class="sortable" data-sort="genres">Genres</th>
                    </tr>
                </thead>
                <tbody>
                    ${movies.map(movie => `
                        <tr>
                            <td class="title">
                                <a href="${movie.forumcinemasUrl}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">
                                    ${escapeHtml(movie.title)}
                                </a>
                            </td>
                            <td class="year">${movie.releaseYear}</td>
                            <td class="rating ${!movie.imdbRating ? 'na' : ''}">
                                ${movie.imdbRating ? movie.imdbRating + '/10' : 'N/A'}
                            </td>
                            <td>
                                <a href="${movie.imdbUrl}" class="imdb-link" target="_blank" rel="noopener">
                                    View on IMDb
                                </a>
                            </td>
                            <td class="genres">${escapeHtml(movie.genres)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Data from <a href="https://www.forumcinemas.lv" target="_blank">ForumCinemas</a> and <a href="http://www.omdbapi.com/" target="_blank">OMDb API</a></p>
        </div>
    </div>

    <script>
        // Sorting functionality
        document.addEventListener('DOMContentLoaded', function() {
            const table = document.getElementById('moviesTable');
            const headers = table.querySelectorAll('th.sortable');
            
            headers.forEach(header => {
                header.addEventListener('click', function() {
                    const column = this.dataset.sort;
                    const isAsc = !this.classList.contains('sort-asc');
                    
                    // Clear all sort classes
                    headers.forEach(h => {
                        h.classList.remove('sort-asc', 'sort-desc');
                    });
                    
                    // Add current sort class
                    this.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
                    
                    // Sort the table
                    sortTable(column, isAsc);
                });
            });
            
            function sortTable(column, ascending) {
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                rows.sort((a, b) => {
                    let aVal = getCellValue(a, column);
                    let bVal = getCellValue(b, column);
                    
                    // Handle numeric values
                    if (column === 'rating' || column === 'year') {
                        aVal = parseFloat(aVal) || 0;
                        bVal = parseFloat(bVal) || 0;
                    }
                    
                    // Handle string values
                    if (typeof aVal === 'string') {
                        aVal = aVal.toLowerCase();
                        bVal = bVal.toLowerCase();
                    }
                    
                    if (aVal < bVal) return ascending ? -1 : 1;
                    if (aVal > bVal) return ascending ? 1 : -1;
                    return 0;
                });
                
                // Reorder rows
                rows.forEach(row => tbody.appendChild(row));
            }
            
            function getCellValue(row, column) {
                const cellIndex = getColumnIndex(column);
                const cell = row.cells[cellIndex];
                
                if (column === 'rating') {
                    return cell.textContent.replace('/10', '').trim();
                }
                
                return cell.textContent.trim();
            }
            
            function getColumnIndex(column) {
                const headers = Array.from(table.querySelectorAll('th'));
                return headers.findIndex(th => th.dataset.sort === column);
            }
        });
        
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;

    await fs.writeFile('report.html', html);
}

module.exports = {
    scrapeNowPlaying,
    scrapeMovieDetails,
    fetchImdbRating,
    generateReport
};
