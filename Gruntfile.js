var fs = require('fs');

module.exports = function(grunt) {
  'use strict';

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    env: {
      PORT: process.env.PORT || 3000,
      ENV: process.env.ENV || 'dev'
    },
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'public/javascripts/*.js', 'routes/*.js', 'services/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: './bin/www',
        options: {
          nodeArgs: ['--debug'],
          ignore: ["public/**/*"],
          env: {
            PORT: '<%= env.PORT %>',
            ENV: '<%= env.ENV %>'
          },
          // omit this property if you aren't serving HTML files and 
          // don't want to open a browser tab on start
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              // Delay before server listens on port
              setTimeout(function() {
                require('open')('http://localhost:' + grunt.config.get('env.PORT'));
              }, 1000);
            });

            // refreshes browser when server reboots
            nodemon.on('restart', function () {
              // Delay before server listens on port
              setTimeout(function() {
                console.log('restarted server');
                fs.writeFileSync('logs/.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    },
    watch: {
      // files: ['<%= jshint.files %>', 'public/**/*'],
      // tasks: ['jshint', 'qunit'],
      server: {
        files: ['logs/.rebooted'],
        options: {
          livereload: true,
          spawn: false
        }
      },
      public: {
        files: ['public/**/*'],
        tasks: ['comet_build', 'webpack'],
        options: {
          livereload: true,
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('webpack', 'webpack[ing]', function() {
    var done = this.async();
    var child = require('child_process').spawn('webpack');
    child.stdout.on('data', function(data) {
      console.log(data.toString()); 
    });
    child.on('close', function(err, stdout) {
      fs.writeFileSync('logs/.rebooted', 'rebooted');
      done();
    });
  });

  grunt.registerTask('comet_build', 'building comet assets', function() {
    var comet = require('./comet/build');

    comet.build();
  });

  grunt.registerTask('build', ['comet_build', 'webpack']);

  grunt.registerTask('process', ['jshint', /*'qunit',*/ 'concat', 'uglify']);

  grunt.registerTask('default', ['build', 'concurrent:dev']);

};