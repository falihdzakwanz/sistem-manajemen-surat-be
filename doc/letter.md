# Letter API Spec

## Add Letter

Endpoint : POST /api/surat

Request Header :
- X-API-TOKEN : token

Request Body (multipart/form-data) :
```json
{
  "nomor_surat": "001/2023",
  "perihal": "Permohonan Data",
  "penerima_id": 1,
  "file": "(binary PDF or Docx file)"
}
```

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nomor_registrasi": "1/REG/2023",
    "nomor_surat": "001/2023",
    "perihal": "Permohonan Data",
    "file_url": "http://localhost:3000/uploads/surat-1.pdf",
    "status": "pending",
    "created_at": "2023-08-10T10:00:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Tipe file tidak valid (hanya PDF dan docx yang diperbolehkan)"
}
```

## Get Letters
Endpoint : GET /api/surat

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": [
    {
      "id": 1,
      "nomor_registrasi": "1/REG/2023",
      "nomor_surat": "001/2023",
      "perihal": "Permohonan Data",
      "file_url": "http://localhost:3000/uploads/surat-1.pdf",
      "status": "pending",
      "penerima": {
        "nama": "Dinas Pendidikan"
      },
      "created_at": "2023-08-10T10:00:00Z"
    }
  ]
}
```

## Get Letter Details
Endpoint : GET /api/surat/{id}

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nomor_registrasi": "1/REG/2023",
    "nomor_surat": "001/2023",
    "perihal": "Permohonan Data",
    "file_url": "http://localhost:3000/uploads/surat-1.pdf",
    "status": "pending",
    "penerima": {
      "id": 1,
      "nama": "Dinas Pendidikan",
      "email": "dikbud@lampung.go.id"
    },
    "created_at": "2023-08-10T10:00:00Z",
    "updated_at": "2023-08-10T10:00:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Surat not found"
}
```

## Update Letter Status
Endpoint : PATCH /api/surat/{id}/status

Request Header :
- X-API-TOKEN : token

Request Body:

```json
{
  "status": "diterima" // enum: ["pending", "diterima", "ditolak"]
}
```

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "status": "diterima",
    "updated_at": "2023-08-10T11:00:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Invalid status value"
}
```

## Letter Download
Endpoint : GET /api/surat/{id}/file

Request Header :
- X-API-TOKEN : token

Response:
- File binary with Content-Type: application/pdf

Headers:
- Content-Disposition: attachment; filename="surat-1.pdf"

Response Body (Failed):

```json
{
  "errors": "File not found"
}
```

## Delete Letter
Endpoint : DELETE /api/surat/{id}

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": "OK"
}
```

Response Body (Failed):

```json
{
  "errors": "Unauthorized"
}
```