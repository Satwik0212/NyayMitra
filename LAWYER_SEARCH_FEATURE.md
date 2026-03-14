# Lawyer Search Discovery Feature (OpenStreetMap Integration)

## Overview
The NyayMitra platform now includes a free lawyer discovery feature that supplements platform-registered lawyers with external data from OpenStreetMap (OSM) via the Overpass API.

## How it Works
1.  **Frontend Request**: The React frontend calls `GET /api/v1/lawyers?city={city}&specialization={specialty}`.
2.  **Firestore Query**: The backend first queries the Firestore database for verified lawyers registered on the platform matching the criteria.
3.  **OSM Discovery**: If a city is provided, the backend sends a query to the Overpass API to find offices tagged as `lawyer` within that city.
4.  **Normalization**: External data from OSM is normalized to match the `LawyerProfile` schema used by the frontend, ensuring compatibility with existing UI components like `LawyerCard.jsx`.
5.  **Merging**: Platform lawyers are shown first, followed by up to 20 external lawyers from OSM.
6.  **Caching**: OSM results are cached in-memory for 5 minutes to improve performance and avoid Overpass API rate limits.

## Modified Files
- `backend/app/models/lawyer_schemas.py`: Updated `LawyerProfile` to allow string emails (since OSM data may not always provide valid email formats).
- `backend/app/services/lawyer_service.py`: Implemented `fetch_osm_lawyers` and updated `get_all_lawyers` to merge results.

## Configuration & Requirements
- **Timeout**: The Overpass API request has a 10-second timeout.
- **Fail-safe**: If the Overpass API is unavailable or times out, the system falls back to Firestore results and/or mock data.

## How to Test Locally
1.  Ensure the backend server is running.
2.  Use a tool like Postman or `curl` to make a request:
    ```bash
    curl "http://localhost:8000/api/v1/lawyers?city=Delhi"
    ```
3.  Verify that the response contains:
    - Platform lawyers (if any exist in Firestore).
    - Lawyers with IDs starting with `osm_` (discovered via OpenStreetMap).
4.  Check the `about` field of OSM lawyers for additional contact information extracted from tags.

## Technical Details (Overpass Query)
The following query is used to discover lawyers:
```overpass
[out:json][timeout:25];
area["name"="{city}"]->.searchArea;
(
  node["office"="lawyer"](area.searchArea);
  way["office"="lawyer"](area.searchArea);
  relation["office"="lawyer"](area.searchArea);
);
out tags center;
```
