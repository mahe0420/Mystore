# 🚀 Complete MongoDB Compass Setup Guide for Luxe Store

## 📋 Prerequisites
- Node.js (v16 or higher)
- MongoDB Compass installed on your computer
- Git (optional)

## 🔧 Step-by-Step Setup Instructions

### Step 1: Install MongoDB Community Server
1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select your operating system
   - Download and install MongoDB Community Server

2. **Start MongoDB Service**
   - **Windows**: MongoDB should start automatically after installation
   - **Mac**: Run `brew services start mongodb/brew/mongodb-community`
   - **Linux**: Run `sudo systemctl start mongod`

### Step 2: Setup MongoDB Compass
1. **Open MongoDB Compass**
2. **Connect to Local MongoDB**
   - Connection String: `mongodb://localhost:27017`
   - Click "Connect"
3. **Create Database**
   - Click "Create Database"
   - Database Name: `luxe-store`
   - Collection Name: `users`
   - Click "Create Database"

### Step 3: Project Setup
1. **Create Environment File**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. **Edit .env file with your settings:**
   ```env
   # MongoDB Connection (Local)
   MONGODB_URI=mongodb://localhost:27017/luxe-store
   
   # JWT Secret (Change this to a secure random string)
   JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-secure-123456789
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL
   CLIENT_URL=http://localhost:5173
   ```

### Step 4: Install Dependencies & Start Application
```bash
# Install all dependencies
npm install

# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

### Step 5: Verify Setup
1. **Check MongoDB Connection**
   - Open MongoDB Compass
   - You should see the `luxe-store` database
   - Collections will be created automatically when you use the app

2. **Test the Application**
   - Go to http://localhost:5173
   - Try logging in with default credentials:
     - **Admin**: admin@luxe.com / admin123
     - **User**: user@luxe.com / user123

3. **Check API Health**
   - Visit: http://localhost:3001/api/health
   - Should show: `{"status":"OK","database":"Connected"}`

## 🎯 Default User Accounts

The system automatically creates these accounts:

### Admin Account
- **Email**: admin@luxe.com
- **Password**: admin123
- **Role**: Administrator
- **Access**: Full admin panel, product management, user management

### Demo User Account
- **Email**: user@luxe.com
- **Password**: user123
- **Role**: Regular User
- **Access**: Shopping, cart, profile management

## 📊 MongoDB Collections Structure

Your MongoDB Compass will show these collections:

### 1. **users** Collection
```javascript
{
  "_id": ObjectId,
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed_password",
  "role": "user" | "admin",
  "isActive": true,
  "createdAt": Date,
  "updatedAt": Date
}
```

### 2. **products** Collection
```javascript
{
  "_id": ObjectId,
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "men's clothing",
  "image": "image_url",
  "sizes": ["S", "M", "L"],
  "colors": ["Black", "White"],
  "stock": 50,
  "status": "active",
  "isCustom": true,
  "createdBy": ObjectId,
  "createdAt": Date,
  "updatedAt": Date
}
```

### 3. **orders** Collection
```javascript
{
  "_id": ObjectId,
  "user": ObjectId,
  "items": [{
    "product": ObjectId,
    "quantity": 2,
    "price": 99.99,
    "size": "M",
    "color": "Black"
  }],
  "totalAmount": 199.98,
  "status": "pending",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "United States"
  },
  "paymentMethod": "credit_card",
  "paymentStatus": "pending",
  "orderNumber": "LUX-1234567890-ABC12",
  "createdAt": Date,
  "updatedAt": Date
}
```

## 🛠️ Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/profile` - Update user profile

## 🔍 Troubleshooting

### MongoDB Connection Issues
1. **Check if MongoDB is running**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services list | grep mongodb
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Verify Connection String**
   - Make sure `MONGODB_URI=mongodb://localhost:27017/luxe-store` in .env

3. **Check MongoDB Compass**
   - Can you connect to `mongodb://localhost:27017`?
   - Is the `luxe-store` database visible?

### Application Issues
1. **Port Conflicts**
   - Frontend: Change port in `vite.config.ts`
   - Backend: Change `PORT` in `.env`

2. **Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables**
   - Make sure `.env` file exists in root directory
   - Check all required variables are set

## 🎉 Success Indicators

✅ **MongoDB Compass shows `luxe-store` database**
✅ **Frontend loads at http://localhost:5173**
✅ **API health check returns "Connected" status**
✅ **Can login with default admin/user accounts**
✅ **Admin can create/edit products**
✅ **Products are stored permanently in MongoDB**
✅ **Orders are created and stored in database**

## 📞 Need Help?

If you encounter any issues:
1. Check the console logs in your browser
2. Check the terminal where you ran `npm run dev`
3. Verify MongoDB is running in MongoDB Compass
4. Ensure all environment variables are correctly set

Your Luxe Store is now running with **permanent MongoDB storage**! 🎊