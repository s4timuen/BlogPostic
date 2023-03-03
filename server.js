const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

////////// Error handling //////////
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught exception! Shutting down...');
    process.exit(1);
});
process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection! Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});

////////// Server and DB //////////
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(con => {
    console.log(`Successfully connected to ${con.connection.host}`);
});

const server = app.listen(process.env.PORT || 5001, () => {
    console.log(`App running in ${process.env.NODE_ENV} mode`);
    console.log(`App listening on port ${process.env.PORT}...`);
});
