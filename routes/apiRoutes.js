var request = require('request');

module.exports = function(app) {
    var workoutManager = request.defaults({
        baseUrl: 'https://wger.de/api/v2/',
        json: true
    });
    var exerciseEndpoint = '/exercise';

    function getWorkoutManager(endpoint, qs) {
        qs = {
            language: 2,
            limit: 5,
            ...qs
        };

        return new Promise(function (resolve, reject) {
            workoutManager.get(endpoint,
                {
                    qs: qs
                },
                function (error, response, body) {
                    if (error) {
                        return reject(error)
                    }

                    resolve(body);
                });
        });
    }

    function combineWorkoutManager(req, res, next, endpoint, queries) {
        var promises = queries.map(function(query) {
            return getWorkoutManager(endpoint, query);
        });        

        Promise.all(promises)
            .then(function(results) {
                var combined = results.reduce(function(accumulator, result) {
                    return accumulator.concat(result.results);
                }, []);

                res.json(combined);
            })
            .catch(next);
    }

    app.get('/api/exercises', function(req, res, next) {
        if(req.query.group === 'bicep') {
            combineWorkoutManager(req, res, next, exerciseEndpoint, [
                { muscles: 1 },
                { muscles: 11 }
            ]);
        } else if (req.query.group === 'legs') {
            combineWorkoutManager(req, res, next, exerciseEndpoint, [
                { muscles: 8 },
                { muscles: 10 },
                { muscles: 11 },
                { muscles: 12 },
            ]);
        }
        else {
            res.status(400).json({
                error: 400,
                message: 'You need to specify a valid muscle group by providing a \'group\' query string.'
            });
        }
    });
};