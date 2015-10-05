module.exports = function(comet) {
    comet.api = {};
    comet.api.rounds = comet.$get.bind(null, '/comet/api/rounds');
    comet.api.scores = comet.$post.bind(null, '/comet/api/scores');
};