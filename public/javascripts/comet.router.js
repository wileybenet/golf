module.exports = function(comet) {
    comet.api = {};
    comet.api.courses = comet.$get.bind(null, '/comet/api/courses');
    comet.api.rounds = comet.$get.bind(null, '/comet/api/rounds');
    comet.api.saveRound = comet.$post.bind(null, '/comet/api/save_round');
    comet.api.scores = comet.$post.bind(null, '/comet/api/scores');
    comet.api.shots = comet.$post.bind(null, '/comet/api/shots');
    comet.api.holes = comet.$post.bind(null, '/comet/api/holes');
    comet.api.saveShots = comet.$post.bind(null, '/comet/api/save_shots');
};