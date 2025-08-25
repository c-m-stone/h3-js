# H3 API Server

A simple REST API server that generates H3 hexagon indices using the h3-js library.

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
node server.js
```

The server will run on port 3000 by default (or the PORT environment variable).

## API Endpoints

### GET /

Returns API documentation and available endpoints.

### GET /h3

Generate an H3 hex from latitude, longitude, and resolution using query parameters.

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)
- `resolution` (required): H3 resolution level (0 to 15)

**Example:**
```
GET /h3?lat=37.7749&lon=-122.4194&resolution=9
```

**Response:**
```json
{
  "input": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "resolution": 9
  },
  "h3Index": "8928308280fffff",
  "hexCenter": {
    "lat": 37.77493584772029,
    "lng": -122.41938644651138
  },
  "boundary": [
    {"lat": 37.77805318, "lng": -122.41613896},
    {"lat": 37.77715130, "lng": -122.41254478},
    {"lat": 37.77181851, "lng": -122.41263392},
    {"lat": 37.77181851, "lng": -122.42263392},
    {"lat": 37.77715130, "lng": -122.42622810},
    {"lat": 37.77805318, "lng": -122.41973380}
  ],
  "isPentagon": false,
  "metadata": {
    "baseCellNumber": 20,
    "isResClassIII": true
  }
}
```

### POST /h3

Generate an H3 hex from latitude, longitude, and resolution using JSON body.

**Body:**
```json
{
  "lat": 37.7749,
  "lon": -122.4194,
  "resolution": 9
}
```

**Response:** Same as GET /h3

### GET /h3/:h3Index/neighbors

Get the neighbors of an H3 hex within k distance.

**Parameters:**
- `h3Index` (path): Valid H3 index
- `k` (query, optional): Distance (default: 1, max: 10)

**Example:**
```
GET /h3/8928308280fffff/neighbors?k=1
```

**Response:**
```json
{
  "center": "8928308280fffff",
  "k": 1,
  "neighbors": [
    "8928308280fffff",
    "8928308280bffff",
    "89283082807ffff",
    "89283082877ffff",
    "89283082803ffff",
    "89283082873ffff",
    "8928308283bffff"
  ],
  "count": 7
}
```

## H3 Resolution Levels

- **0-2**: Country/continent level
- **3-5**: State/province level  
- **6-8**: City level
- **9-11**: Neighborhood level
- **12-15**: Building/block level

Higher resolution numbers create smaller hexagons with more precision.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (invalid endpoint)
- `500`: Internal Server Error

## Examples

### Using curl

```bash
# GET request
curl "http://localhost:3000/h3?lat=37.7749&lon=-122.4194&resolution=9"

# POST request
curl -X POST http://localhost:3000/h3 \
  -H "Content-Type: application/json" \
  -d '{"lat": 37.7749, "lon": -122.4194, "resolution": 9}'

# Get neighbors
curl "http://localhost:3000/h3/8928308280fffff/neighbors?k=2"
```

### Using JavaScript fetch

```javascript
// GET request
const response = await fetch('/h3?lat=37.7749&lon=-122.4194&resolution=9');
const data = await response.json();

// POST request
const response = await fetch('/h3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    lat: 37.7749,
    lon: -122.4194,
    resolution: 9
  })
});
const data = await response.json();
```