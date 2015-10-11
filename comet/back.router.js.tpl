var express = require('express');
var router = express.Router();
{{#namespaces}}
var api = require('../routes/{{namespace}}');
{{/namespaces}}

{{#routes}}
router.{{type}}('{{{route}}}', function(req, res) {
  {{namespace}}.{{fnName}}({{#body}}req.body, {{/body}}function(data) { res.json(data); });
});
{{/routes}}

module.exports = router;