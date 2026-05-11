import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        socketTimeoutMS: 10000,
      })
      .then((mongoose) => {
        console.log('✅ Connected to MongoDB');
        return mongoose;
      })
      .catch((error: any) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        
        if (error.message.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
          console.error('⚠️ DNS Resolution Failed - MongoDB host not found.');
          console.error('   Possible causes:');
          console.error('   1. MongoDB Atlas cluster was deleted or recreated');
          console.error('   2. Network connectivity/DNS issue');
          console.error('   3. Connection string is outdated');
          console.error('   ➡️ Verify your MongoDB Atlas cluster exists at https://cloud.mongodb.com/v2/');
          console.error('   ➡️ Copy the fresh connection string from MongoDB Atlas');
          console.error('   Connection string used:', MONGODB_URI);
        } else if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
          console.error('⚠️ MongoDB Atlas appears to be unreachable.');
          console.error('   Possible causes:');
          console.error('   1. Free tier cluster is PAUSED after 30 days of inactivity');
          console.error('   2. IP address not whitelisted in MongoDB Atlas');
          console.error('   3. Incorrect connection string');
          console.error('   4. MongoDB Atlas service is temporarily unavailable');
          console.error('   To resume a paused cluster: https://cloud.mongodb.com/v2/');
        }
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
