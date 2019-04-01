# express-auth-hmac

Express middleware to encode and decode user identity with tamper detection via HMAC.

```sh
$ node example.js
```

```sh
$ http :3333/login username=foobar
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 99
Content-Type: application/json; charset=utf-8
Date: Mon, 01 Apr 2019 20:22:47 GMT
ETag: W/"63-kXVzBG0RBzee64MOV5UDKiicvkM"
X-Powered-By: Express

{
    "token": "eyJ1c2VybmFtZSI6ImZvb2JhciJ9!0qzM5vxtA4uS97HMZyE+W1qAYVweIMpnoH+M9blzzCA=!1554150197905"
}
```

```sh
$ http :3333/whoami 'Authorization:bearer eyJ1c2VybmFtZSI6ImZvb2JhciJ9!0qzM5vxtA4uS97HMZyE+W1qAYVweIMpnoH+M9blzzCA=!1554150197905'
GET /whoami HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Authorization: bearer eyJ1c2VybmFtZSI6ImZvb2JhciJ9!0qzM5vxtA4uS97HMZyE+W1qAYVweIMpnoH+M9blzzCA=!1554150197905
Connection: keep-alive
Host: localhost:3333
User-Agent: HTTPie/1.0.2


HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 21
Content-Type: application/json; charset=utf-8
Date: Mon, 01 Apr 2019 20:22:56 GMT
ETag: W/"15-gQRh2GiuXjM3VBzWT97UgJMjtTA"
X-Powered-By: Express

{
    "username": "foobar"
}
```
