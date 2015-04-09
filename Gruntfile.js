module.exports = function (grunt){

	//////////////////////////////////////// Adding JSON objects be used later on

	var adcfg = grunt.file.readJSON('adconfig.json');
	var awscfg = grunt.file.readJSON('awsInfo.json');
	var ftpcfg = grunt.file.readJSON('ftpInfo.json');

	grunt.initConfig({

	pkg: grunt.file.readJSON('package.json'),


	/////////////////////////////////////////// Checking of Syntax


	jshint: {
      files: ['content/js/main.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },

    /////////////////////////////////////////// Asset Management

    copy: {
	  	js: {
		  	expand: true, 
		  	cwd: 'content/', 
		  	src: ['js/*.js'], 
		  	dest: 'final/'
	  	},
	  	fonts:{
		  	expand: true,
		  	cwd: 'content/',
		  	src: [
		      'fonts/**/*.woff2',
		      'fonts/**/*.woff',
		      'fonts/**/*.eot',
		      'fonts/**/*.ttf',
		      'fonts/**/*.svg'
	    	],
	    	dest: 'final/'
	  	},
	   	images: {
		  	expand: true, 
		  	cwd: 'content/', 
		  	src: [
		      'images/**/*.jpg',
		      'images/**/*.png',
		      'images/**/*.gif'
	   		],
		  	dest: 'final/'
	  	},
	   	html: {
		  	expand: true, 
		  	cwd: 'content/', 
		  	src: ['index.html'], 
		  	dest: 'final/'
	  	}
	},

	/////////////////////////////////////////// Concatination

	concat:{
		dist:{
			src:[
				'lib/core/*.js'
			],
			dest:'final/js/core.js'	
		},
		extra:{
			src:[
				'lib/extra/*.js'
			],
			dest:'final/js/extra.js'	
		}
	},	

	/////////////////////////////////////////// Minification

	uglify: {
	    my_target: {
	      files: [{
	          expand: true,
	          cwd: 'final/js',
	          src: '*.js',
	          dest: 'final/js'
	      }]
	    }
  	},

	imagemin: {
	    dynamic: {
	        files: [{
	          expand: true,
	          cwd: 'final/images/',
	          src: ['**/*.{png,jpg,gif}'],
	          dest: 'final/images/'
	        }]
	    }
	},

	htmlmin: {
	    dist: {
	      options: {
	        	removeComments: true,
	        	collapseWhitespace: true
	      },
	      files: {
	        'final/index.html': 'final/index.html'
	      }
	    }
  	},

    compass: {
      // Initial cleaning run for compass to make sure it starts from scratch.
      clean: {
        options: {
          clean: true,
        }
      },
      // Compass compile for production environments.
      dist: {
        options: {
					cssDir : 'final/',
					sassDir : 'content/sass',
					outputStyle: 'expanded'
	    	}
      },
      qa: {
        options: {
        	cssDir : 'final/',
					sassDir : 'content/sass',
          outputStyle: 'compressed'
        }
      }
    },

    /////////////////////////////////////////// Templating and Re-linking

    'string-replace': {
		dist: {
		    files: {
	      		'final/index.html': 'final/index.html',
		    },
		    options: {
				/////////////////////////////  Replacing patterns with values from adcfg.json - Dimensions, Job number etc
	      		replacements: [{
		        	pattern: /\[\[\s*adcfg\.(.*?)\s*\]\]/ig,
		        	replacement: function (match, p1) {
		          		return adcfg[p1] || '';
		        	}
		      	}]
		    }
		},
	    publish: {
	        files: {
        		'final/index.html': 'final/index.html'
	        },
	        options: {
	        	replacements: [{
	        		pattern : /js\//g,
	        		replacement: 'http://'+ awscfg.bucket + '/' + awscfg.upPath +'/lib/'
	        	},{
	        		pattern : /images\//g,
	        		replacement: 'http://'+ awscfg.bucket + '/' + awscfg.upPath + '/' + adcfg.job +'/images/'
	        	},{
	        		pattern : /fonts\//g,
	        		replacement: 'http://'+ awscfg.bucket + '/' + awscfg.upPath + '/' + adcfg.job +'/fonts/'
	        	}]
	        }
	    },

		sass: {
		    files: {
		      'content/sass/styles.scss': 'content/templates/styles.scss'
		    },
		    options: {
		      replacements: [{
		        pattern: /\[\[\s*adcfg\.(.*?)\s*\]\]/ig,
		        replacement: function (match, p1) {
		          return adcfg[p1] || '';
		        }
		      }]
		    }
		},
    },

    /////////////////////////////////////////// Inlining

 	inline: {
	    dist: {
	      src: 'final/index.html',
	      dest: 'final/index.html'
	    },
	    qa: {
	    	options: {
	    		uglify: true
	    	},
	    	src: 'final/index.html',
	      dest: 'final/index.html'
	    }
  	},

 	clean: {
  		js: ["final/js/*.js", "!final/js/*.min.js"],
	  	qa: ["final/"],
	  	qa_end: ["final/js/main.js"],
	},

	/////////////////////////////////////////// Watch

	watch: {
	    dist: {
	      	files: ['content/**/*.*', 'adconfig.json'],
	      	tasks: 'development',
	      	options: {
          	spawn: false,
	      	},
	    } 
	},

  	/////////////////////////////////////////// Hashing

	hashres: {
	  	options: {
		    encoding: 'utf8',
		    fileNameFormat: '${hash}.${name}.cache.${ext}',
		    renameFiles: true
	  	},

		prod: {
	    	options: {
		    },
		    src: [
		      // WARNING: These files will be renamed!
		      'final/js/*.js', 'final/images/*.{png,jpg,gif}', 'final/fonts/*.{eot,svg,ttf,woff,woff2}'],
				dest: 'final/index.html',
	  	}
	},

	/////////////////////////////////////////// Uploading

	ftp_push: {
	    your_target: {
	      options: {
	      	username: ftpcfg.username,
	        password: ftpcfg.password,
	        host: ftpcfg.host,
	        dest: ftpcfg.dest,
	        port: 21,
	        debug: false,
	      },
	      files: [
	        {
	          expand: true,
  	        dest: adcfg.job + "/" + adcfg.type,
  	        cwd: "final/",
	          src: [
	            "**/*"
	          ]
	        }
	      ]
	    }
  	},

	s3: {
	    options: {
	      key: awscfg.key,
	      secret: awscfg.secret,
	      bucket: awscfg.bucket,
	      region: 'eu-west-1',
	      debug: true
	    },
	    dev: {
			sync: [
			  	{
		          	// only upload this document if it does not exist already 
		          	src: 'final/js/*.js',
		          	dest: awscfg.upPath + '/lib/'
	        	},{
		      		src: 'final/images/*.{png,jpg,gif}',
		        	dest: awscfg.upPath +'/'+ adcfg.job +'/images/'
		      	},{
		      		src: 'final/fonts/*.{eot,svg,ttf,woff,woff2}',
		        	dest: awscfg.upPath +'/'+ adcfg.job +'/fonts/'
	      		}
      		]
      	}
  	}

});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-s3');
	grunt.loadNpmTasks('grunt-inline');
	grunt.loadNpmTasks('grunt-hashres');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-ftp-push');

	/////////////////////////////////////////// Default builds the ad from local tamplates and updates attributes from JSON files
	grunt.registerTask('default', [
		'jshint',
		'string-replace:sass',
		'compass:dist',
		'concat',
		'copy',
		'inline:dist',
		'string-replace:dist',
		'watch',
	]);

	/////////////////////////////////////////// Watch runs the developemt task when it registers a change

	grunt.registerTask('development',[
		'jshint',
		'compass:dist',
		'copy',
		'inline:dist',
	]);

	/////////////////////////////////////////// Resume task for when work is passed between developers - Running grunt will build from templates overwirting work

	grunt.registerTask('resume', [
		'development',
		'watch',
	])

	/////////////////////////////////////////// qa task makes the ad as close to production ready as possible for one final check

	grunt.registerTask('qa', [
		'clean:qa',
		'jshint',
		'compass:qa',
		'concat',
		'copy',
		'uglify',
		'inline:qa',
		'string-replace:dist',
		'imagemin',
		'clean:qa_end',
		'hashres',
		'htmlmin',
		]);

	/////////////////////////////////////////// Publishing and Publish Staging tasks relink assets to the new remote path and/or uploads the assets

	grunt.registerTask('publish', [
		'jshint',
		'string-replace:publish',
		's3',
	]);	
	grunt.registerTask('publish-staging', [
		'jshint',
		'ftp_push',
		'publish-staging-done',
	]);	
	grunt.registerTask('publish-staging-done', function() {
		grunt.log.subhead('Publish Staging');
    	grunt.log.ok('Preview has been built sucessfully and can been viewed here: http://di.dennis.co.uk/html-ad-preview?job=' + adcfg.job + "&format=" + adcfg.type);
  });
};
