# Unified User API Specification

## User Roles
- `admin`: Full system access (manage all users/letters)
- `user`: Institutional receivers (only access assigned letters)

---

## Authentication

### Register User (Admin Only)
**Endpoint**: `POST /api/users`  
**Headers**:  
- `X-API-TOKEN`: `<token>`

**Request**:
```json
{
  "email_instansi": "kominfo@bandarlampung.go.id",
  "password": "securepassword",
  "nama_instansi": "Dinas Kominfo",
  "role": "admin" 
}
```

**Success Response (201)**:

```json
{
  "data": {
    "id": 1,
    "email_instansi": "kominfo@bandarlampung.go.id",
    "nama_instansi": "Dinas Kominfo",
    "role": "admin",
    "created_at": "2023-08-20T08:00:00Z"
  }
}
```

**Error Responses**:

**400 Bad Request**:

```json
{ "errors": "Email already registered" }
```

**403 Forbidden (non-admin in production):**

```json
{ "errors": "Insufficient permissions" }
```

### Login
**Endpoint**: `POST /api/users/login`

**Request**:

```json
{
  "email_instansi": "kominfo@bandarlampung.go.id",
  "password": "securepassword"
}
```

**Success Response (200)**:

```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email_instansi": "kominfo@bandarlampung.go.id",
      "nama_instansi": "Dinas Kominfo",
      "role": "admin"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized:**

```json
{ "errors": "Invalid credentials" }
```

## User Management

### Get Current User

**Endpoint**: `GET /api/users/current`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Success Response (200)**:

```json
{
  "data": {
    "id": 1,
    "email_instansi": "kominfo@bandarlampung.go.id",
    "nama_instansi": "Dinas Kominfo",
    "role": "admin",
    "created_at": "2023-08-20T08:00:00Z"
  }
}
```

### Update User
**Endpoint**: `PATCH /api/users/current`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Request**:

```json
{
  "nama_instansi": "Updated Name",
  "password": "newpassword" // Optional
}
```

**Success Response (200)**:

```json
{
  "data": {
    "email_instansi": "kominfo@bandarlampung.go.id",
    "nama_instansi": "Updated Name"
  }
}
```

### Admin: List All Users
**Endpoint**: `GET /api/users`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Success Response (200)**:

```json
{
  "data": [
    {
      "id": 1,
      "email_instansi": "kominfo@bandarlampung.go.id",
      "nama_instansi": "Dinas Kominfo",
      "role": "admin",
      "total_surat": 5,
      "created_at": "2023-08-20T08:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1
  }
}
```

### Admin: Get User by Id

**Endpoint**: `GET /api/users/{id}`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Success Response (200)**:

```json
{
  "data": {
    "id": 1,
    "email_instansi": "kominfo@bandarlampung.go.id",
    "nama_instansi": "Dinas Kominfo",
    "role": "admin",
    "created_at": "2023-08-20T08:00:00Z",
    "total_surat": 2
  }
}
```

### Admin: Update User by Id
**Endpoint**: `PATCH /api/users/{id}`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Request**:

```json
{
  "nama_instansi": "Updated Name",
  "password": "newpassword" // Optional
}
```

**Success Response (200)**:

```json
{
  "data": {
    "email_instansi": "kominfo@bandarlampung.go.id",
    "nama_instansi": "Updated Name"
  }
}
```


### Admin: Delete User

**Endpoint**: `DELETE /api/users/{id}`

**Headers**:

- `X-API-TOKEN`: `<token>`

**Success Response (200)**:

```json
{
  "data": "OK"
}
```

**Error Response (400)**:

```json
{
  "errors": "Cannot delete user: 3 letters are assigned"
}
```