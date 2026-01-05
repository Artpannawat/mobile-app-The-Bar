const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Adjust path if .env is elsewhere. Assuming it's in backend root or parent.
dotenv.config();

const User = require('./models/User');

// Connect to DB
const connectDB = async () => {
    try {
        // Hardcode URI if dotenv issues, or use process.env.MONGO_URI
        // Creating a fallback logic based on common local setups if env is missing
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/react-native-app');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await connectDB();

    try {
        // Check if admin exists
        const userExists = await User.findOne({ username: 'admin' });

        if (userExists) {
            console.log('Admin user already exists.');
            // Optional: Update role if needed
            if (userExists.role !== 'admin') {
                userExists.role = 'admin';
                await userExists.save();
                console.log('Existing user "admin" promoted to admin role.');
            }
            process.exit();
        }

        // Create Admin
        const user = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createAdmin();
