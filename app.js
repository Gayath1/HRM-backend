require("dotenv").config();

const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const cors = require('cors');

const serverDetails = require('./utils/serverDetails');

const app = express();

app.use(cors());
app.use(serverDetails);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// let models = require('./models');
// models.sequelize.sync().then(function() {
//   console.log('DB synced!');

//   app.use('/api/v1', require('./routes'));

//   const port = parseInt(process.env.PORT, 10) || 5000;
//   app.listen(port, async () => {
//     console.log(`Server is listening on port ${port}`);
//   });
// }).catch(function(err) {
//   console.log(err, 'Something went wrong syncing DB');
// });

app.use('/api/v1', require('./routes'));

const port = parseInt(process.env.PORT, 10) || 5000;
app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);
});