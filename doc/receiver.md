# Receiver API Spec

## Create Receiver

Endpoint : POST /api/penerima

Request Header :
- X-API-TOKEN : token

Request Body:
```json
{
  "nama": "Dinas Kesehatan",
  "email": "dinkes@lampung.go.id"
}
```

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nama": "Dinas Kesehatan",
    "email": "dinkes@lampung.go.id",
    "created_at": "2023-08-15T10:00:00Z"
  }
}
```
Response Body (Success):
```json
{
  "errors": "Input tidak valid",
}
```

## Update Receiver

Endpoint : PUT /api/penerima/{id}

Request Header :
- X-API-TOKEN : token

Request Body:

```json
{
  "nama": "Dinas Kesehatan Provinsi", // optional
  "email": "dinkes.prov@lampung.go.id" // optional
}
```
Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nama": "Dinas Kesehatan Provinsi",
    "email": "dinkes.prov@lampung.go.id",
    "updated_at": "2023-08-15T11:30:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Penerima tidak ditemukan"
}
```

## Delete Receiver

Endpoint : DELETE /api/penerima/{id}

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": "OK",
  "message": "Penerima berhasil dihapus"
}
```

Response Body (Failed):

```json
{
  "errors": "Tidak dapat menghapus penerima karena memiliki 5 surat terkait"
}
```

## Get All Receiver

Endpoint : GET /api/penerima

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": [
    {
      "id": 1,
      "nama": "Dinas Kesehatan",
      "email": "dinkes@lampung.go.id",
      "total_surat": 3,
      "created_at": "2023-08-10T08:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1
  }
}
```

## Get Receiver Details

Endpoint : GET /api/penerima/{id}

Request Header :
- X-API-TOKEN : token

Response Body (Success):

```json
{
  "data": {
    "id": 1,
    "nama": "Dinas Kesehatan",
    "email": "dinkes@lampung.go.id",
    "total_surat": 3,
    "surat_terakhir": "2023-08-14T09:00:00Z",
    "created_at": "2023-08-10T08:00:00Z",
    "updated_at": "2023-08-12T14:00:00Z"
  }
}
```

Response Body (Failed):

```json
{
  "errors": "Unauthorized",
}
```


