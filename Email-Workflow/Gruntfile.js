module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: {
          dist: 'dist/',
          prod: 'prod/',
          target: grunt.option('target') ? grunt.option('target') : 'dev'
        },

        // Takes your scss files and compiles them to css
        sass: {
          dist: {
            options: {
              style: 'expanded'
            },
            files: {
              'src/css/main.css': 'src/css/scss/main.scss'
            }
          }
        },

        // Assembles your email content with html layout
        assemble: {
          options: {
            layoutdir: 'src/layouts',
            flatten: true,
            css: ['http://fonts.googleapis.com/css?family=Raleway:300|Open+Sans:400italic,300,400']
          },
          pages: {
            src: ['src/emails/*.hbs'],
            dest: '<%= config.dist %>'
          }
        },

        // Inlines your css
        premailer: {
          simple: {
            options: {
              removeComments: false,
              preserveStyles: false,
              verbose: true
            },
            files: [{
                expand: true,
                src: ['<%= config.dist %>*.html'],
                dest: ''
            }]
          }
        },

        // Watches for changes to css or email templates then runs grunt tasks
        watch: {
          files: ['src/css/scss/*','src/emails/*','src/layouts/*','Gruntfile.js'],
          tasks: ['default'],
          options: {
            livereload: true
          }
        },

        // Use Mailgun option if you want to email the design to your inbox or to something like Litmus
        mailgun: {
          mailer: {
            options: {
              key: '#######', // Enter your Mailgun API key here
              sender: 'email@email.com', // Change this
              recipient: 'recipient@recipient.com', // Change this
              subject: grunt.option('subject')
            },
            src: grunt.option('template') ? [grunt.option('template')] : ['dist/branded.html']
          }
        },

        // // Use Rackspace Cloud Files if you're using images in your email
        // cloudfiles: {
        //   prod: {
        //     'user': 'Rackspace Cloud Username', // Change this
        //     'key': 'Rackspace Cloud API Key', // Change this
        //     'region': 'ORD', // Might need to change this
        //     'upload': [{
        //       'container': 'Files Container Name', // Change this
        //       'src': 'src/img/*',
        //       'dest': '/',
        //       'stripcomponents': 0
        //     }]
        //   }
        // },

        // // CDN will replace local paths with your Cloud CDN path
        // cdn: {
        //   options: {
        //     cdn: 'Rackspace Cloud CDN URI', // Change this
        //     flatten: true,
        //     supportedTypes: 'html'
        //   },
        //   dist: {
        //     src: ['./dist/*.html']
        //   }
        // },

        // String Replace -- to replace image src with CDN or Prod urls
        "string-replace": {
          dist: {
            files: {
              '<%= config.dist %>': '<%= config.dist %>*'
            },
            options: {
              replacements: [{
                pattern: /~imgUrl~/g,
                replacement: 'images.qa.match.corp'
              }]
            }
          },
          prod: {
            files: [{
              expand: true,
              cwd: '<%= config.dist %>',
              src: '**/*',
              dest: '<%= config.prod %>'
            }],
            options: {
              replacements: [{
                pattern: /string to replace/g,
                replacement: 'images.match.com'
              }]
            }
          }
        }

    });

    // Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('assemble');
    // Use all grunt dev dependencies
    require('load-grunt-tasks')(grunt);

    // Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['sass','assemble','premailer','string-replace','getEnv']);
    // grunt.registerTask('default', ['sass','assemble','string-replace','getEnv']); // no premailer

    // Use grunt send if you want to actually send the email to your inbox
    grunt.registerTask('send', ['mailgun','getEnv']);

    // Upload images to our CDN on Rackspace Cloud Files
    // grunt.registerTask('cdnify', ['default','cloudfiles','cdn']);

    grunt.registerTask('getEnv',function(){
      grunt.option('target',grunt.option('target') || 'dev')
      grunt.log.writeln(["Output path: "+grunt.option('target')]);
      grunt.log.writeln(["Subject Line: "+grunt.option('subject')]);
    });

};
