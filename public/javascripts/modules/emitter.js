var eventListeners = {};
var id = 0;

function unBinder(name, _id) {
  return function() {
    for (var i = eventListeners[name].length - 1; i >= 0; i--) {
      if (_id === eventListeners[name][i]._id) {
        eventListeners[name].splice(i, 1);
      }
    }
  };
}

module.exports = {
  on: function(evtName, cbFn) {
    cbFn._id = id++;
    eventListeners[evtName] = eventListeners[evtName] || [];
    eventListeners[evtName].push(cbFn);
    return unBinder(evtName, cbFn._id);
  },
  emit: function(evtName, data) {
    if (!eventListeners[evtName])
      return console.warn('no listeners for event "%s"', evtName);
    eventListeners[evtName].forEach(function(fn) {
      fn(data);
    });
  }
};