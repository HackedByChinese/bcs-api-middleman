var express = require('express');

var app = express();

require('./routes/apiRoutes')(app);

app.listen(8080, function() {
    console.log('Server listening on port 8080');
});

app.use(function(err, req, res, next) {
    if (!err) {
        next();
    }

    console.log(err);

    res
        .status(500)
        .json({
            error: 500,
            message: err.message
        });
});

