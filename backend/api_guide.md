API Guide & Postman Instructions
This guide details how to test the Full-Stack Mini Project backend using the provided Postman collection.

Setup
Import Collection: Import the 
backend/postman_collection.json
 file into Postman.
Environment Variables: The collection uses {{base_url}} which defaults to http://localhost:5000.
Authentication:
First, requests to Register User or Login User will automatically save the received token.
This token is then used in the Authorization header (Bearer {{token}}) for protected routes like creating products or updating profiles.
Auth Endpoints
1. Register User
Method: POST
URL: /api/auth/register
Body (JSON):
{
    "username": "yourname",
    "email": "email@example.com",
    "password": "password123"
}
2. Login User
Method: POST
URL: /api/auth/login
Body (JSON):
{
    "username": "yourname",
    "password": "password123"
}
Note: Returns a JWT token needed for other requests.
3. Get User Profile
Method: GET
URL: /api/auth/profile
Headers: Authorization: Bearer <token>
4. Update User Profile (With Image)
Method: PUT
URL: /api/auth/profile
Headers: Authorization: Bearer <token>
Body (form-data):
username: (Text) New username
profileImage: (File) Select an image file to upload.
Product Endpoints
1. Get All Products
Method: GET
URL: /api/products
2. Get Single Product
Method: GET
URL: /api/products/:id
Params: Replace :id with the actual Product ID (e.g., 64f1a2...).
3. Create Product (With Image)
Method: POST
URL: /api/products
Headers: Authorization: Bearer <token>
Body (form-data):
name
: (Text) Product Name
price: (Text) 100
stock: (Text) 10
description: (Text) Description
imageUrl: (File) Select an image file.
4. Update Product
Method: PUT
URL: /api/products/:id
Headers: Authorization: Bearer <token>
Params: Replace :id with the Product ID.
Body (form-data) or (JSON):
Can update fields like 
name
, price, or upload a new imageUrl file.
5. Delete Product
Method: DELETE
URL: /api/products/:id
Headers: Authorization: Bearer <token>
Params: Replace :id with the Product ID.