var mysql = require('mysql');
var utils = require('../services/utils');
var db;
var _ = require('lodash');
var record = {};
var connectionCalled = false;
var schema;
var tableSchemas;

record.connect = function() {
  record.db = mysql.createConnection({
    host     : process.env.DB_HOST ||'localhost',
    port     : process.env.DB_PORT ||'8889',
    user     : process.env.DB_USER ||'root',
    password : process.env.DB_PASSWORD ||'root',
    database : schema = (process.env.DB_SCHEMA || 'golf')
  });

  record.db.connect(function(err){
    if(err) throw err;
    console.log('mysql connected');

    record.mapSchemas();
  });

  connectionCalled = true;
};

setTimeout(function() {
  if (!connectionCalled) {
    record.connect();
  }
}, 0);

record.mapSchemas = function() {
  record.db.query("SELECT * FROM information_schema.columns WHERE table_schema = '" + schema + "' ORDER BY table_name, ordinal_position", function(err, data) {
    tableSchemas = _.chain(data)
      .map(function(row) {
        return {
          table: row.TABLE_NAME,
          columnName: row.COLUMN_NAME
        };
      })
      .groupBy('table')
      .value();
  });
};

record.getSchema = function(tableName) {
  return _(tableSchemas[tableName]).pluck('columnName');
};

record.query = function(q, params, callbackFn) {
  var query = record.db.format(q, params);
  console.log(query);
  record.db.query(q, params, function(err, data) {
    if (err)
      err.query = query;
    callbackFn(err, data);
  });
};

record.staticMethods = {
  all: function() {},
  select: function(fields) {
    var selects;
    if (typeof fields === 'object') {
      selects = fields;
    } else {
      selects = fields.split(/,/g);
    }

    this.queryParams.select = this.queryParams.select.concat(selects.map(function(el) {
      return el.trim();
    }));
  },
  find: function(id) {
    this.$singleResult = true;
    this.where({ id: id }).limit(1);
  },
  joins: function(condition) {

  },
  where: function(condition) {
    for (var key in condition) {
      this.queryParams.where[key] = condition[key];
    }
  },
  limit: function(size) {
    this.queryParams.limit = +size;
  },
  then: function(cbFn) {
    var _this = this;
    var q = '';
    var params = [];
    if (_.size(this.queryParams.select)) {
      params.push(this.queryParams.select);
      q += 'SELECT ??';
    } else {
      q += 'SELECT *';
    }
    if (this.tableName) {
      params.push(this.tableName);
      q += ' FROM ??';
    }
    if (_.size(this.queryParams.where)) {
      params.push(this.queryParams.where);
      q += ' WHERE ?';
    }
    if (this.queryParams.limit) {
      params.push(this.queryParams.limit);
      q += ' LIMIT ?';
    }

    q += ';';

    record.query(q, params, function(err, data) {
      if (err)
        console.log('Error with sql syntax: ' + err.query);

      if (cbFn)
        cbFn(_this._instantiateResponse.call(_this, data));
    });
  },
  _instantiateResponse: function(data) {
    var _this = this;
    var models = data.map(function(el) {
      return new _this._constructor(el, true);
    });

    return (this.$singleResult) ? (models[0] || {}) : (models || []);
  }
};

record.instanceMethods = {
  _public: function(fields) {
    return _.pick(this, function(value, key) {
      if (fields) {
        return !!~fields.indexOf(key);
      } else {
        return !{$: true, _: true}[key.substr(0, 1)];
      }
    });
  },
  _get: function(fields) {
    var values = [];
    for (var key in this) {
      if (!!~fields.indexOf(key))
        values.push(this[key]);
    }
    return values;
  },
  update: function(properties, callback) {
    var _this = this;
    var whiteList = this.$schema || record.getSchema(this.$tableName);
    var whiteListedProperties = _.pick(properties, whiteList);

    for (var key in whiteListedProperties) {
      this[key] = whiteListedProperties[key];
    }

    if (_.size(whiteListedProperties)) {
      record.query("UPDATE " + this.$tableName + " SET ? WHERE id = ?", [whiteListedProperties, this.id], function(data) {
        callback(_this._public());
      });
    } else {
      callback(_this._public());
    }

    return this;
  },
  save: function(callback) {
    var _this = this;
    var columns = _.chain(this._public())
      .pick(function(value) { return {String: true, Number: true, Date: true}[value && value.constructor.name]; })
      .keys()
      .value();

    if (_.size(this._public())) {
      record.query("INSERT INTO " + this.$tableName + " (??) VALUES (?)", [columns, this._get(columns)], function(err, data) {
        _this.id = data.insertId;
        callback(_this._public());
      });
    } else {
      callback(_this._public());
    }
    return this;
  },
  delete: function(callback) {
    callback();
    return this;
  }
};

// api
record.createModel = function(options) {
  var staticMethod, instanceMethod;
  var Model = options.constructor;
  var staticMethods = _.extend({}, record.staticMethods, options.staticMethods || {});
  var instanceMethods = _.extend({}, record.instanceMethods, options.instanceMethods || {});
  var tableName = options.tableName || (utils.toSnake(Model.name) + 's');
  var QueryConstructor = eval("(" +
    "function " + Model.name + "(row, skip) {" +
      "for (var key in row) {" +
        "this[key] = row[key];" +
      "}" +
      "this.$tableName = tableName;" +
      "this.$schema = options.schema;" +
      "!skip && Model.call(this);" +
    "})");
  QueryConstructor.tableName = tableName;

  function initChain() {
    return _.extend({}, QueryConstructor, {
      _constructor: QueryConstructor,
      $init: true,
      $singleResult: false,
      queryParams: {
        where: {},
        select: [],
        joins: [],
        group: [],
        limit: null
      }
    });
  }

  function startChain(fn) {
    return function() {
      var self;
      if (this.$init) {
        self = this;
      } else {
        self = initChain();
      }
      var nextSelf = _.extend({}, self);
      var ret = fn.apply(nextSelf, arguments);
      return ret || nextSelf;
    };
  }

  for (staticMethod in staticMethods) {
    QueryConstructor[staticMethod] = startChain(staticMethods[staticMethod]);
  }

  for (instanceMethod in instanceMethods) {
    QueryConstructor.prototype[instanceMethod] = instanceMethods[instanceMethod];
  }

  return QueryConstructor;
};

module.exports = record;