## Basic Authentication 
A repository to show the Basic Auths Functionality

### To run 
1. Clone the repository
2. Install the required packages using `npm install`
3. Start the server using `npm run server` and `npm run dev` in separate terminals

### How does it work
1. Make a POST request to the server with on the /register endpoint with the following data:
```json
{
    "username": "your_username",
    "password": "your_password"
}
```
2. The server will generate a token and return it to the client.
3. The client can then use this token to make authenticated requests to the server.
4. To authenticate a request, the client should send the token in the Authorization header with the value `Bearer <token>`.
5. The server will verify the token and allow the request if it is valid.
