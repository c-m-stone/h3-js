const express = require('express');
const cors = require('cors');
const h3 = require('h3-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'H3 API Server is running',
        endpoints: {
            'GET /h3': 'Generate H3 hex from lat, lon, and resolution',
            'POST /h3': 'Generate H3 hex from JSON body'
        }
    });
});

// GET endpoint for H3 generation
app.get('/h3', (req, res) => {
    try {
        const { lat, lon, resolution } = req.query;

        // Validate required parameters
        if (!lat || !lon || !resolution) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['lat', 'lon', 'resolution'],
                example: '/h3?lat=37.7749&lon=-122.4194&resolution=9'
            });
        }

        // Parse and validate numeric values
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const res_level = parseInt(resolution);

        if (isNaN(latitude) || isNaN(longitude) || isNaN(res_level)) {
            return res.status(400).json({
                error: 'Invalid parameter types',
                message: 'lat and lon must be numbers, resolution must be an integer'
            });
        }

        // Validate ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                error: 'Invalid latitude',
                message: 'Latitude must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Invalid longitude',
                message: 'Longitude must be between -180 and 180'
            });
        }

        if (res_level < 0 || res_level > 15) {
            return res.status(400).json({
                error: 'Invalid resolution',
                message: 'Resolution must be between 0 and 15'
            });
        }

        // Generate H3 index
        const h3Index = h3.latLngToCell(latitude, longitude, res_level);

        // Get additional information about the hex
        const hexCenter = h3.cellToLatLng(h3Index);
        const hexBoundary = h3.cellToBoundary(h3Index);
        const isPentagon = h3.isPentagon(h3Index);

        res.json({
            input: {
                latitude,
                longitude,
                resolution: res_level
            },
            h3Index,
            hexCenter: {
                lat: hexCenter[0],
                lng: hexCenter[1]
            },
            boundary: hexBoundary.map(coord => ({
                lat: coord[0],
                lng: coord[1]
            })),
            isPentagon,
            metadata: {
                baseCellNumber: h3.getBaseCellNumber(h3Index),
                isResClassIII: h3.isResClassIII(h3Index)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST endpoint for H3 generation
app.post('/h3', (req, res) => {
    try {
        const { lat, lon, resolution } = req.body;

        // Validate required parameters
        if (lat === undefined || lon === undefined || resolution === undefined) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['lat', 'lon', 'resolution'],
                example: {
                    lat: 37.7749,
                    lon: -122.4194,
                    resolution: 9
                }
            });
        }

        // Parse and validate numeric values
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const res_level = parseInt(resolution);

        if (isNaN(latitude) || isNaN(longitude) || isNaN(res_level)) {
            return res.status(400).json({
                error: 'Invalid parameter types',
                message: 'lat and lon must be numbers, resolution must be an integer'
            });
        }

        // Validate ranges
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                error: 'Invalid latitude',
                message: 'Latitude must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Invalid longitude',
                message: 'Longitude must be between -180 and 180'
            });
        }

        if (res_level < 0 || res_level > 15) {
            return res.status(400).json({
                error: 'Invalid resolution',
                message: 'Resolution must be between 0 and 15'
            });
        }

        // Generate H3 index
        const h3Index = h3.latLngToCell(latitude, longitude, res_level);

        // Get additional information about the hex
        const hexCenter = h3.cellToLatLng(h3Index);
        const hexBoundary = h3.cellToBoundary(h3Index);
        const isPentagon = h3.isPentagon(h3Index);

        res.json({
            input: {
                latitude,
                longitude,
                resolution: res_level
            },
            h3Index,
            hexCenter: {
                lat: hexCenter[0],
                lng: hexCenter[1]
            },
            boundary: hexBoundary.map(coord => ({
                lat: coord[0],
                lng: coord[1]
            })),
            isPentagon,
            metadata: {
                baseCellNumber: h3.getBaseCellNumber(h3Index),
                isResClassIII: h3.isResClassIII(h3Index)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Additional endpoint to get neighbors of an H3 hex
app.get('/h3/:h3Index/neighbors', (req, res) => {
    try {
        const { h3Index } = req.params;
        const { k = 1 } = req.query;

        if (!h3.isValidCell(h3Index)) {
            return res.status(400).json({
                error: 'Invalid H3 index',
                message: 'The provided H3 index is not valid'
            });
        }

        const kRing = parseInt(k);
        if (isNaN(kRing) || kRing < 0 || kRing > 10) {
            return res.status(400).json({
                error: 'Invalid k value',
                message: 'k must be an integer between 0 and 10'
            });
        }

        const neighbors = h3.gridDisk(h3Index, kRing);

        res.json({
            center: h3Index,
            k: kRing,
            neighbors,
            count: neighbors.length
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
});

app.listen(PORT, () => {
    console.log(`H3 API Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} for API documentation`);
});