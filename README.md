# Mediasoup Streaming App

Node v18+

## SSL

1. Go to `./ssl` folder
```
cd ssl/
```

2. Generate self-signed X.509 certificate (to use the app over https)
```
openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
```

3. Create symbolic link for media-server's docker container
```
ln cert.pem ../media-server/ssl
ln key.pem ../media-server/ssl
```

## Frontend

1. Go to `./frontend` folder
```
cd ../frontend/
```

2. Install frontend dependencies
```
npm i
```

3. Create .env file (* don't forget to change `0.0.0.0` to your own IP address)
```
cp .env.example .env
```

4. Run the server
```
npm run dev -- --host
```

## Media Server

1. Go to `./media-server` folder

```
cd ../media-server/
```

2. Create .env file (* don't forget to change `0.0.0.0` to your own IP address)
```
cp .env.example .env
```

3. Docker (check out `./media-server/Makefile`)
```
make build
make up
```

