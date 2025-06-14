# User API Spec

## Register User

Endpoint : POST /api/users

Request Body :

```json
{
  "username" : "kominfobalam",
  "password" : "rahasia",
  "name" : "Kominfo Bandar Lampung"
}
```

Response Body (Success) :

```json
{
  "data" : {
    "username" : "kominfobalam",
    "name" : "Kominfo Bandar Lampung"
  }
}
```

Response Body (Failed) :

```json
{
  "errors" : "Input tidak valid"
}
```

## Login User

Endpoint : POST /api/users/login

Request Body :

```json
{
  "username" : "kominfobalam",
  "password" : "rahasia"
}
```

Response Body (Success) :

```json
{
  "data" : {
    "username" : "kominfobalam",
    "name" : "Kominfo Bandar Lampung",
    "token" : "uuid"
  }
}
```

Response Body (Failed) :

```json
{
  "errors" : "Username atau password salah"
}
```

## Get User

Endpoint : GET /api/users/current

Request Header :
- X-API-TOKEN : token

Response Body (Success) :

```json
{
  "data" : {
    "username" : "kominfobalam",
    "name" : "Kominfo Bandar Lampung"
  }
}
```

Response Body (Failed) :

```json
{
  "errors" : "Unauthorized, ..."
}
```

## Update User

Endpoint : PATCH /api/users/current

Request Header :
- X-API-TOKEN : token

Request Body :

```json
{
  "password" : "rahasia", // tidak wajib
  "name" : "Kominfo" // tidak wajib
}
```

Response Body (Success) :

```json
{
  "data" : {
    "username" : "kominfo",
    "name" : "Kominfo"
  }
}
```

Response Body (Failed) :

```json
{
  "errors" : "Unauthorized, ..."
}
```

## Logout User

Endpoint : DELETE /api/users/current

Request Header :
- X-API-TOKEN : token

Response Body (Success) :

```json
{
  "data" : "OK"
}
```

Response Body (Failed) :

```json
{
  "errors" : "Unauthorized, ..."
}
```