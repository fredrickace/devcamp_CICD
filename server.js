const express = require('express');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');


//Load env vars
dotEnv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route Files

const bootcamps = require('./routes/bootcamps');

const app = express();


//DEv logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
//    Close server $ exit process
    server.close(() => process.exit(1));
});