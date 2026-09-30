require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db')

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Vehicle Repair Shop API is running');
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    port: Number(PORT),
  });
});

app.post('/api/echo', (req, res) => {
  res.status(200).json({ received: req.body });
});



async function start(){
  try{
    await connectDB();
    app.listen(PORT, ()=>{
      console.log(`Server listening on port ${PORT}`);
    })
  }catch(error){
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}
start();