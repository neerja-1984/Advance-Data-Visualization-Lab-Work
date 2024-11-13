const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(cors());

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});