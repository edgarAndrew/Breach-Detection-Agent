# Webhook API Documentation  

## Endpoint: `/webhook/receive/{org_id}/{webhook_id}`

### Overview
The `/webhook/receive/{org_id}/{webhook_id}` endpoint allows third-party systems to send data into the platform.  
Received data undergoes the following stages:

1. API authentication and request validation  
2. Payload validation against the organization-defined schema  
3. Data normalization to a standard internal format  
4. Insertion into a queue for processing into the raw events database  

This endpoint is primarily used to collect data defined by the organization during onboarding or webhook setup.

---

### Endpoint Details
- **Method:** `POST`  
- **Path:** `/webhook/receive/{org_id}/{webhook_id}`  
- **Purpose:** Ingest external data for the *Covenant Breach Detection Agent*  

---

### Payload Requirements
The request payload **must** be a JSON object containing key-value pairs as defined by the organization.  

#### Rules:
- All required fields must be present  
- Field names must match the predefined schema  
- Field values must be of the expected data type  
- `time_stamp` field is mandatory and must follow ISO 8601 format  

#### Example Payload
```json
{
  "growth": 7.5,
  "grossmargin": 50.2,
  "operatingcashflow": 3.9,
  "netprofitmargin": 10,
  "ebita": 6.3,
  "cac": 400,
  "ltv": 3.45e4,
  "peratio": 20,
  "debtratio": 0.4,
  "time_stamp": "2026-01-03T17:29:02.376687+00:00"
}
```

---

### Processing Flow

#### 1. API Validation
- Validates API credentials and request structure.  
- Returns an error immediately if validation fails.

#### 2. Payload Validation
- Validates the payload against the organization-defined schema.  
- Checks for:
  - Missing required fields  
  - Unexpected fields  
  - Incorrect data types  
- Returns a descriptive error listing invalid fields if validation fails.

#### 3. Data Normalization
- Converts all numeric values to a consistent internal format (`float`).  
- Converts scientific notation to standard decimal (e.g., `1.4e-5 → 0.000014`).  
- Ensures all values are numeric and consistent.

#### 4. Data Ingestion
- Sends normalized data to the ingestion service via a queue.  
- Data is processed asynchronously and stored in the database.  
- Includes metadata such as timestamps and organization identifiers.

---

### Error Handling
- **Authentication Errors:** Invalid API credentials  
- **Validation Errors:** Missing fields, extra fields, or incorrect data types  
- **Normalization Errors:** Non-numeric values or unsupported types  

Example error response for invalid fields:
```json
{
  "detail": ["growth", "netprofitmargin"]
}
```