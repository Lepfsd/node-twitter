const async = require('async');
const Tweet = require('../models/tweet');
const User = require('../models/user');

module.exports = function(io) {
    io.on('connection', function(socket){
        console.log('connected!');
        var user = socket.request.user;
        console.log(user.name);

        socket.on('tweet', (data) => {
            async.paralle([
                function(callback){
                    io.emit('incomingTweets', { data, user });
                },
                function(callback){
                    async.waterfall([
                        function(callback){
                            var tweet = new Tweet();
                            tweet.content = data.content;
                            tweet.owner = data.user._id;
                            tweet.save(function(err){
                                callback(err, tweet);
                            });
                        },
                        function(tweet, callback){
                            User.update(
                                {
                                    _id: user._id
                                },
                                {
                                    push: { tweets: { tweet: tweet._id }}
                                },
                                function(err, count){
                                    callback(err, count)
                                }
                            );
                        }
                    ]);
                }
            ]);

        });
    });
}
