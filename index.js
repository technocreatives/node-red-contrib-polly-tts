console.log("start");

var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'}) ;

var polly = new AWS.Polly({apiVersion: '2016-06-10'});

var params = {
    OutputFormat: "mp3", 
    SampleRate: "8000", 
    Text: "This is a test string", 
    TextType: "text", 
    VoiceId: "Joanna"
};

polly.describeVoices({}, function(err, data){
    console.log(err)
    console.log(data)

})
polly.synthesizeSpeech(params, function(err, data){
    if(err){
        console.log(err, err.stack);
    } else {
        fs.writeFile("./test.mp3", data.AudioStream, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
        console.log(data);
    }
});
