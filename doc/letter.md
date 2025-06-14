# Letter API Spec

## Add Letter

Endpoint : POST /api/surat

Request Header :

- X-API-TOKEN : token

Request Body (multipart/form-data) :

```json
{
  "pengirim": "Kemendagri",
  "tujuan": "Dinas Kesehatan Bandar Lampung",
  "nomor_surat": "001/2023",
  "tanggal_masuk": "14-06-2025",
  "tanggal_surat": "10-06-2025",
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
    "nomor_registrasi": 1,
    "tujuan": "Dinas Kesehatan Bandar Lampung",
    "nomor_surat": "001/2023",
    "tanggal_masuk": "14-06-2025",
    "tanggal_surat": "10-06-2025",
    "perihal": "Permohonan Data",
    "penerima_id": 1,
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
      "nomor_registrasi": 1,
      "tujuan": "Dinas Kesehatan Bandar Lampung",
      "nomor_surat": "001/2023",
      "tanggal_masuk": "14-06-2025",
      "tanggal_surat": "10-06-2025",
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

Endpoint : GET /api/surat/{nomor_registrasi}

Request Header :

- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nomor_registrasi": 1,
    "tujuan": "Dinas Kesehatan Bandar Lampung",
    "nomor_surat": "001/2023",
    "tanggal_masuk": "14-06-2025",
    "tanggal_surat": "10-06-2025",
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

Endpoint : PATCH /api/surat/{nomor_registrasi}/status

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
    "nomor_registrasi": 1,
    "status": "diterima",
    "updated_at": "2023-08-10T11:00:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Status tidak valid"
}
```

## Update Letter (Full/Partial Update)

Endpoint : PUT /api/surat/{nomor_registrasi}  

Request Header :  
- X-API-TOKEN : token  
- Content-Type: multipart/form-data  

Request Body:
```json
{
  "pengirim": "Kemendagri RI", // Updated sender
  "tujuan": "Dinas Kesehatan Kota Bandar Lampung", // Updated recipient
  "nomor_surat": "001-A/2023", // Updated letter number
  "tanggal_masuk": "15-06-2025", // Updated received date
  "tanggal_surat": "11-06-2025", // Updated letter date
  "perihal": "Permohonan Data Sekunder", // Updated subject
  "penerima_id": 2, // Updated recipient ID
  "file": "(new binary file)" // Optional file replacement
}
```

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nomor_registrasi": 1,
    "pengirim": "Kemendagri RI",
    "tujuan": "Dinas Kesehatan Kota Bandar Lampung",
    "nomor_surat": "001-A/2023",
    "tanggal_masuk": "15-06-2025",
    "tanggal_surat": "11-06-2025",
    "perihal": "Permohonan Data Sekunder",
    "file_url": "http://localhost:3000/uploads/surat-1-v2.pdf",
    "status": "pending",
    "updated_at": "2023-08-11T09:30:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Format masukkan tidak valid"
}
```

## Letter Download

Endpoint : GET /api/surat/{nomor_registrasi}/file

Request Header :

- X-API-TOKEN : token

Response:

- File binary with Content-Type: application/pdf

Headers:

- Content-Disposition: attachment; filename="surat-1.pdf"

Response Body (Failed):

```json
{
  "errors": "File tidak ditemukan"
}
```

## Delete Letter

Endpoint : DELETE /api/surat/{nomor_registrasi}

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
