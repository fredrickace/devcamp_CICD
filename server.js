const express = require('express');
const dotEnv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db');


//Load env vars
dotEnv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route Files

const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

const app = express();

//Body parser
app.use(express.json());

//DEv logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

//use the custom error handler only after basic routes...
app.use(errorHandler);

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