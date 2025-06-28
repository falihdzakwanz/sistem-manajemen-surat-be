# Dashboard API Specification

## Authentication
All endpoints require authentication via API token in header:
- **X-API-TOKEN**: <your_token>

---

## Admin Dashboard Statistics

**Endpoint**: `GET /dashboard/admin`

**Description**: Get dashboard statistics for admin users (includes total letters and users)

**Permissions**: 
- Only users with `admin` role can access

**Response**:
```json
{
  "data": {
    "totalSurat": 42,
    "totalUsers": 15,
    "recentLetters": [
      {
        "id": 1,
        "nomor_surat": "001/2023",
        "perihal": "Permohonan Data",
        "tanggal_surat": "2023-08-10T00:00:00.000Z",
        "status": "pending",
        "nama_instansi": "Dinas Kesehatan"
      }
    ]
  }
}
```

**Error Responses**:

- 401 Unauthorized: Invalid or missing token

- 403 Forbidden: User doesn't have admin privileges

## User Dashboard Statistics
**Endpoint**: `GET /dashboard/user`

**Description**: Get dashboard statistics for regular users (only includes their own letters)

**Permissions**: All authenticated users can access

**Response**:

```json
{
  "data": {
    "totalSurat": 5,
    "recentLetters": [
      {
        "id": 1,
        "nomor_surat": "001/2023",
        "perihal": "Permohonan Data",
        "tanggal_surat": "2023-08-10T00:00:00.000Z",
        "status": "pending",
        "nama_instansi": "Dinas Kesehatan"
      }
    ]
  }
}
```

**Error Responses**:

- 401 Unauthorized: Invalid or missing token