(function(comet) {
  
  {{#namespaces}}
    comet.{{namespace}} = {};
  {{/namespaces}}

  {{#routes}}
    comet.{{namespace}}.{{method}} = comet.${{type}}.bind(null, '{{{route}}}');
  {{/routes}}

}(window.comet));