const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function createShortUrl(url, validity = 30, shortcode = null) {
    try {
        const response = await fetch(`${BASE_URL}/shorturls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                validity,
                shortcode
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create short URL');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating short URL:', error.message);
        throw error;
    }
}

async function getStatistics(shortcode) {
    try {
        const response = await fetch(`${BASE_URL}/shorturls/${shortcode}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get statistics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting statistics:', error.message);
        throw error;
    }
}

async function testUrlShortener() {
    console.log('🚀 Testing URL Shortener API\n');

    try {
        // Test 1: Create short URL with auto-generated shortcode
        console.log('1. Creating short URL with auto-generated shortcode...');
        const result1 = await createShortUrl(
            'https://very-very-very-long-and-descriptive-subdomain-that-goes-on-and-on.somedomain.com/additional/directory/levels/for/more/length/really-long-sub-domain/a-really-long-page',
            30
        );
        console.log('✅ Created:', result1.shortLink);
        console.log('⏰ Expires:', result1.expiry);
        console.log('');

        // Test 2: Create short URL with custom shortcode
        console.log('2. Creating short URL with custom shortcode...');
        const result2 = await createShortUrl(
            'https://www.google.com',
            60,
            'google123'
        );
        console.log('✅ Created:', result2.shortLink);
        console.log('⏰ Expires:', result2.expiry);
        console.log('');

        // Test 3: Get statistics
        console.log('3. Getting statistics for custom shortcode...');
        const stats = await getStatistics('google123');
        console.log('📊 Statistics:');
        console.log(`   - Total clicks: ${stats.totalClicks}`);
        console.log(`   - Original URL: ${stats.originalUrl}`);
        console.log(`   - Created: ${stats.createdAt}`);
        console.log(`   - Expires: ${stats.expiryTime}`);
        console.log('');

        // Test 4: Simulate some clicks by accessing the short URL
        console.log('4. Simulating clicks...');
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(`${BASE_URL}/google123`, {
                    redirect: 'manual' // Don't follow redirects
                });
                console.log(`   Click ${i + 1}: ${response.status} ${response.statusText}`);
            } catch (error) {
                console.log(`   Click ${i + 1}: Error - ${error.message}`);
            }
        }
        console.log('');

        // Test 5: Get updated statistics
        console.log('5. Getting updated statistics...');
        const updatedStats = await getStatistics('google123');
        console.log(`📊 Updated clicks: ${updatedStats.totalClicks}`);
        console.log('');

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testUrlShortener();
}

module.exports = {
    createShortUrl,
    getStatistics
}; 