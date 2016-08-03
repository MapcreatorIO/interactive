var fs = require('fs');

var requiredFiles = [
	'm4n.js',
	'm4n.min.js',
	'style.css',
	'index.php',
	'readme.txt',
	'iframe/index.php'
];

exports.testIfAllFilesExist = function(test) {

	test.expect(requiredFiles.length);

	requiredFiles.forEach(function(file) {
		test.ok(fs.existsSync("dist/" + file), file + " exists");
	});

	test.done();

};