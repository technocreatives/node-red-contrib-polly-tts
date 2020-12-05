module.exports = function(RED) {
    'use strict';

    var AWS = require('aws-sdk');
    var slug = require('slug');
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var MD5 = require('crypto-js').MD5;
    var util = require('util');
    var path = require('path');
    var pathExists = require('path-exists');
    var _ = require('lodash');

    AWS.config.update({
        region: 'us-east-1'
    });

    slug.charmap['.'] = '_stop_';
    slug.charmap['?'] = '_qm_';
    slug.charmap['!'] = '_em_';
    slug.charmap[','] = '_pause_';
    slug.charmap[':'] = '_colon_';
    slug.charmap[';'] = '_semicolon_';
    slug.charmap['<'] = '_less_';
    slug.charmap['>'] = '_greater_';

    function setupDirectory(aPath) {
        try {
            return fs.statSync(aPath).isDirectory();
        } catch (e) {

            // Path does not exist
            if (e.code === 'ENOENT') {
                // Try and create it
                try {
                    mkdirp.sync(aPath);
                    RED.log.info('Created directory path: ' + aPath);
                    return true;
                } catch (e) {
                    RED.log.error('Failed to create path: ' + aPath);
                }
            } 
            // Otherwise failure
            return false;
        }
    }

    var voices = {
        '0': {
            Gender: 'Female',
            Id: 'Joanna',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joanna',
            Engine: 'standard'
        },
        '1': {
            Gender: 'Female',
            Id: 'Mizuki',
            LanguageCode: 'ja-JP',
            LanguageName: 'Japanese',
            Name: 'Mizuki',
            Engine: 'standard'
        },
        '2': {
            Gender: 'Female',
            Id: 'Filiz',
            LanguageCode: 'tr-TR',
            LanguageName: 'Turkish',
            Name: 'Filiz',
            Engine: 'standard'
        },
        '3': {
            Gender: 'Female',
            Id: 'Astrid',
            LanguageCode: 'sv-SE',
            LanguageName: 'Swedish',
            Name: 'Astrid',
            Engine: 'standard'
        },
        '4': {
            Gender: 'Male',
            Id: 'Maxim',
            LanguageCode: 'ru-RU',
            LanguageName: 'Russian',
            Name: 'Maxim',
            Engine: 'standard'
        },
        '5': {
            Gender: 'Female',
            Id: 'Tatyana',
            LanguageCode: 'ru-RU',
            LanguageName: 'Russian',
            Name: 'Tatyana',
            Engine: 'standard'
        },
        '6': {
            Gender: 'Female',
            Id: 'Carmen',
            LanguageCode: 'ro-RO',
            LanguageName: 'Romanian',
            Name: 'Carmen',
            Engine: 'standard'
        },
        '7': {
            Gender: 'Female',
            Id: 'Ines',
            LanguageCode: 'pt-PT',
            LanguageName: 'Portuguese',
            Name: 'Inês',
            Engine: 'standard'
        },
        '8': {
            Gender: 'Male',
            Id: 'Cristiano',
            LanguageCode: 'pt-PT',
            LanguageName: 'Portuguese',
            Name: 'Cristiano',
            Engine: 'standard'
        },
        '9': {
            Gender: 'Female',
            Id: 'Vitoria',
            LanguageCode: 'pt-BR',
            LanguageName: 'Brazilian Portuguese',
            Name: 'Vitória',
            Engine: 'standard'
        },
        '10': {
            Gender: 'Male',
            Id: 'Ricardo',
            LanguageCode: 'pt-BR',
            LanguageName: 'Brazilian Portuguese',
            Name: 'Ricardo',
            Engine: 'standard'
        },
        '11': {
            Gender: 'Female',
            Id: 'Maja',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Maja',
            Engine: 'standard'
        },
        '12': {
            Gender: 'Male',
            Id: 'Jan',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Jan',
            Engine: 'standard'
        },
        '13': {
            Gender: 'Female',
            Id: 'Ewa',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Ewa',
            Engine: 'standard'
        },
        '14': {
            Gender: 'Male',
            Id: 'Ruben',
            LanguageCode: 'nl-NL',
            LanguageName: 'Dutch',
            Name: 'Ruben',
            Engine: 'standard'
        },
        '15': {
            Gender: 'Female',
            Id: 'Lotte',
            LanguageCode: 'nl-NL',
            LanguageName: 'Dutch',
            Name: 'Lotte',
            Engine: 'standard'
        },
        '16': {
            Gender: 'Female',
            Id: 'Liv',
            LanguageCode: 'nb-NO',
            LanguageName: 'Norwegian',
            Name: 'Liv',
            Engine: 'standard'
        },
        '17': {
            Gender: 'Male',
            Id: 'Giorgio',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Giorgio',
            Engine: 'standard'
        },
        '18': {
            Gender: 'Female',
            Id: 'Carla',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Carla',
            Engine: 'standard'
        },
        '19': {
            Gender: 'Male',
            Id: 'Karl',
            LanguageCode: 'is-IS',
            LanguageName: 'Icelandic',
            Name: 'Karl',
            Engine: 'standard'
        },
        '20': {
            Gender: 'Female',
            Id: 'Dora',
            LanguageCode: 'is-IS',
            LanguageName: 'Icelandic',
            Name: 'Dóra',
            Engine: 'standard'
        },
        '21': {
            Gender: 'Male',
            Id: 'Mathieu',
            LanguageCode: 'fr-FR',
            LanguageName: 'French',
            Name: 'Mathieu',
            Engine: 'standard'
        },
        '22': {
            Gender: 'Female',
            Id: 'Celine',
            LanguageCode: 'fr-FR',
            LanguageName: 'French',
            Name: 'Céline',
            Engine: 'standard'
        },
        '23': {
            Gender: 'Female',
            Id: 'Chantal',
            LanguageCode: 'fr-CA',
            LanguageName: 'Canadian French',
            Name: 'Chantal',
            Engine: 'standard'
        },
        '24': {
            Gender: 'Female',
            Id: 'Penelope',
            LanguageCode: 'es-US',
            LanguageName: 'US Spanish',
            Name: 'Penélope',
            Engine: 'standard'
        },
        '25': {
            Gender: 'Male',
            Id: 'Miguel',
            LanguageCode: 'es-US',
            LanguageName: 'US Spanish',
            Name: 'Miguel',
            Engine: 'standard'
        },
        '26': {
            Gender: 'Male',
            Id: 'Enrique',
            LanguageCode: 'es-ES',
            LanguageName: 'Castilian Spanish',
            Name: 'Enrique',
            Engine: 'standard'
        },
        '27': {
            Gender: 'Female',
            Id: 'Conchita',
            LanguageCode: 'es-ES',
            LanguageName: 'Castilian Spanish',
            Name: 'Conchita',
            Engine: 'standard'
        },
        '28': {
            Gender: 'Male',
            Id: 'Geraint',
            LanguageCode: 'en-GB-WLS',
            LanguageName: 'Welsh English',
            Name: 'Geraint',
            Engine: 'standard'
        },
        '29': {
            Gender: 'Female',
            Id: 'Salli',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Salli',
            Engine: 'standard'
        },
        '30': {
            Gender: 'Female',
            Id: 'Kimberly',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kimberly',
            Engine: 'standard'
        },
        '31': {
            Gender: 'Female',
            Id: 'Kendra',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kendra',
            Engine: 'standard'
        },
        '32': {
            Gender: 'Male',
            Id: 'Justin',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Justin',
            Engine: 'standard'
        },
        '33': {
            Gender: 'Male',
            Id: 'Joey',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joey',
            Engine: 'standard'
        },
        '34': {
            Gender: 'Female',
            Id: 'Ivy',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Ivy',
            Engine: 'standard'
        },
        '35': {
            Gender: 'Female',
            Id: 'Raveena',
            LanguageCode: 'en-IN',
            LanguageName: 'Indian English',
            Name: 'Raveena',
            Engine: 'standard'
        },
        '36': {
            Gender: 'Female',
            Id: 'Emma',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Emma',
            Engine: 'standard'
        },
        '37': {
            Gender: 'Male',
            Id: 'Brian',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Brian',
            Engine: 'standard'
        },
        '38': {
            Gender: 'Female',
            Id: 'Amy',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Amy',
            Engine: 'standard'
        },
        '39': {
            Gender: 'Male',
            Id: 'Russell',
            LanguageCode: 'en-AU',
            LanguageName: 'Australian English',
            Name: 'Russell',
            Engine: 'standard'
        },
        '40': {
            Gender: 'Female',
            Id: 'Nicole',
            LanguageCode: 'en-AU',
            LanguageName: 'Australian English',
            Name: 'Nicole',
            Engine: 'standard'
        },
        '41': {
            Gender: 'Female',
            Id: 'Marlene',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Marlene',
            Engine: 'standard'
        },
        '42': {
            Gender: 'Male',
            Id: 'Hans',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Hans',
            Engine: 'standard'
        },
        '43': {
            Gender: 'Female',
            Id: 'Naja',
            LanguageCode: 'da-DK',
            LanguageName: 'Danish',
            Name: 'Naja',
            Engine: 'standard'
        },
        '44': {
            Gender: 'Male',
            Id: 'Mads',
            LanguageCode: 'da-DK',
            LanguageName: 'Danish',
            Name: 'Mads',
            Engine: 'standard'
        },
        '45': {
            Gender: 'Female',
            Id: 'Gwyneth',
            LanguageCode: 'cy-GB',
            LanguageName: 'Welsh',
            Name: 'Gwyneth',
            Engine: 'standard'
        },
        '46': {
            Gender: 'Male',
            Id: 'Jacek',
            LanguageCode: 'pl-PL',
            LanguageName: 'Polish',
            Name: 'Jacek',
            Engine: 'standard'
        },
        '47': {
            Gender: 'Male',
            Id: 'Matthew',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Matthew',
            Engine: 'standard'
        },
        '48': {
            Gender: 'Male',
            Id: 'Matthew',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Matthew (neural)',
            Engine: 'neural'
		},
        '49': {
            Gender: 'Female',
            Id: 'Amy',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Amy (neural)',
            Engine: 'neural'
		},
        '50': {
            Gender: 'Female',
            Id: 'Emma',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Emma (neural)',
            Engine: 'neural'
		},
        '51': {
            Gender: 'Male',
            Id: 'Brian',
            LanguageCode: 'en-GB',
            LanguageName: 'British English',
            Name: 'Brian (neural)',
            Engine: 'neural'
		},
        '52': {
            Gender: 'Female',
            Id: 'Ivy',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Ivy (neural)',
            Engine: 'neural'
		},
        '53': {
            Gender: 'Female',
            Id: 'Joanna',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joanna (neural)',
            Engine: 'neural'
		},
        '54': {
            Gender: 'Female',
            Id: 'Kendra',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kendra (neural)',
            Engine: 'neural'
		},
        '55': {
            Gender: 'Female',
            Id: 'Kimberly',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kimberly (neural)',
            Engine: 'neural'
		},
        '56': {
            Gender: 'Female',
            Id: 'Salli',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Salli (neural)',
            Engine: 'neural'
		},
        '57': {
            Gender: 'Male',
            Id: 'Joey',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Joey (neural)',
            Engine: 'neural'
		},
        '58': {
            Gender: 'Male',
            Id: 'Justin',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Justin (neural)',
            Engine: 'neural'
		},
        '59': {
            Gender: 'Male',
            Id: 'Kevin',
            LanguageCode: 'en-US',
            LanguageName: 'US English',
            Name: 'Kevin (neural)',
            Engine: 'neural'
		},
        '60': {
            Gender: 'Female',
            Id: 'Camila',
            LanguageCode: 'pt-BR',
            LanguageName: 'Brazilian Portuguese',
            Name: 'Camila (neural)',
            Engine: 'neural'
		},
        '61': {
            Gender: 'Female',
            Id: 'Lupe',
            LanguageCode: 'es-US',
            LanguageName: 'US Spanish',
            Name: 'Lupe (neural)',
            Engine: 'neural'
		},
        '62': {
            Gender: 'Female',
            Id: 'Vicki',
            LanguageCode: 'de-DE',
            LanguageName: 'German',
            Name: 'Vicki',
            Engine: 'standard'
		},
        '63': {
            Gender: 'Female',
            Id: 'Aditi',
            LanguageCode: 'hi-IN',
            LanguageName: 'Hindi',
            Name: 'Aditi',
            Engine: 'standard'
		},
        '64': {
            Gender: 'Female',
            Id: 'Aditi',
            LanguageCode: 'en-IN',
            LanguageName: 'English',
            Name: 'Aditi',
            Engine: 'standard'
		},
        '65': {
            Gender: 'Female',
            Id: 'Bianca',
            LanguageCode: 'it-IT',
            LanguageName: 'Italian',
            Name: 'Bianca',
            Engine: 'standard'
		},
        '66': {
            Gender: 'Female',
            Id: 'Lucia',
            LanguageCode: 'es-ES',
            LanguageName: 'Spanish',
            Name: 'Lucia',
            Engine: 'standard'
		},
        '67': {
            Gender: 'Female',
            Id: 'Mia',
            LanguageCode: 'es-MX',
            LanguageName: 'Spanish Mexican',
            Name: 'Mia',
            Engine: 'standard'
		},
        '68': {
            Gender: 'Female',
            Id: 'Seoyeon',
            LanguageCode: 'ko-KR',
            LanguageName: 'Korean',
            Name: 'Seoyeon',
            Engine: 'standard'
		},
        '69': {
            Gender: 'Male',
            Id: 'Takumi',
            LanguageCode: 'ja-JP',
            LanguageName: 'Japanese',
            Name: 'Takumi',
            Engine: 'standard'
		},
        '70': {
            Gender: 'Female',
            Id: 'Zeina',
            LanguageCode: 'arb',
            LanguageName: 'Arabic',
            Name: 'Zeina',
            Engine: 'standard'
		},
        '71': {
            Gender: 'Female',
            Id: 'Zhiyu',
            LanguageCode: 'cmn-CN',
            LanguageName: 'Chinese, Mandarin',
            Name: 'Zhiyu',
            Engine: 'standard'
		}
    };

    function PollyConfigNode(config) {
        RED.nodes.createNode(this, config);

        RED.log.log('ConfigNode:' + config);

        if (this.credentials) {
            this.accessKey = this.credentials.accessKey;
            this.secretKey = this.credentials.secretKey;
        }

        var params = {
            accessKeyId: this.accessKey,
            secretAccessKey: this.secretKey,
            apiVersion: '2016-06-10'
        };
        RED.log.info('Polly: ' + this.polly);
        this.polly = new AWS.Polly(params);
        RED.log.info('Polly: ' + this.polly);
    }

    RED.nodes.registerType('polly-config', PollyConfigNode, {
        credentials: {
            accessKey: {
                type: 'text'
            },
            secretKey: {
                type: 'password'
            }
        }
    });

    function PollyNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.dir = config.dir;

        // Set the voice
        var defaultVoice = voices[config.voice].Id;

        // Set ssml
        this.ssml = config.ssml;

        this.config = RED.nodes.getNode(config.config);
        if (!this.config) {
            RED.log.error('Missing polly config');
            return;
        }

        this.on('input', function(msg) {
            if(!_.isString(msg.payload)){
                notifyError(node, msg, 'msg.payload must be of type String');
                return;
            }

            msg._polly = {
                cached: true,
                roundtrip: 0
            };
            var voice = defaultVoice

            if(Object.values(voices).map(obj => {return obj.Id}).includes(msg.voice)) {
                voice = msg.voice
            }

            var engine = voices[config.voice].Engine

            var polly = node.config.polly;
            var outputFormat = 'mp3';

            var filename = getFilename(msg.payload, voice, engine, node.ssml, outputFormat);

            var cacheDir = _.get(msg, 'options.dir') || node.dir;

            if (!setupDirectory(cacheDir)) {
                notifyError(node, msg, 'Unable to set up cache directory: ' + cacheDir);
                return;
            }

            // Store it
            msg.file = path.join(cacheDir, filename);

            // Check if cached
            pathExists(msg.file)
                .then(cached => {
                    if (cached) {
                        // Cached
                        return node.send([msg, null]);
                    } 

                    // Not cached
                    node.status({
                        fill: 'yellow',
                        shape: 'dot',
                        text: 'requesting'
                    });

                    msg._polly.cached = false;
                    var started = Date.now();

                    var params = {
                        OutputFormat: outputFormat,
                        Text: msg.payload,
                        TextType: node.ssml ? 'ssml' : 'text',
                        VoiceId: voice,
                        Engine: engine
                    };

                    synthesizeSpeech([polly, params])
                        .then(data => {
                            return [msg.file, data.AudioStream];
                        })
                        .then(cacheSpeech)
                        .then(function() {
                            // Success
                            msg._polly.roundtrip = Date.now() - started;
                            node.status({});
                            node.send([msg, null]);
                        }).catch(error => {
                            notifyError(node, msg, error);
                        });
                });
        });
    }

    function synthesizeSpeech([polly, params]){
        return new Promise((resolve, reject) => {
            polly.synthesizeSpeech(params, function(err, data) {
                if (err !== null) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    function cacheSpeech([path, data]){
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, function(err) {
                if (err !== null) return reject(err);
                resolve();
            });
        });
    }

    function getFilename(text, voice, engine, isSSML, extension) {
        // Slug the text.
        var basename = slug(text);

        var ssml_text = isSSML ? '_ssml' : '';

        // Filename format: "text_voice-engine.mp3"
        var filename = util.format('%s_%s-%s%s.%s', basename, voice, engine, ssml_text, extension);

        // If filename is too long, cut it and add hash
        if (filename.length > 250) {
            var hash = MD5(basename);

            // Filename format: "text_hash_voice-engine.mp3"
            var ending = util.format('_%s_%s-%s%s.%s', hash, voice, engine, ssml_text, extension);
            var beginning = basename.slice(0, 250 - ending.length);

            filename = beginning + ending;
        }

        return filename;
    }

    RED.nodes.registerType('polly', PollyNode);

    function notifyError(node, msg, err) {
        var errorMessage = _.isString(err) ? err : err.message;
        // Output error to console
        RED.log.error(errorMessage);
        // Mark node as errounous
        node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Error: ' + errorMessage
        });

        // Set error in message
        msg.error = errorMessage;
        
        // Send message
        node.send([null, msg]);
    }
};
