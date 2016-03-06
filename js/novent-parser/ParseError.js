var methode = ParseError.prototype;

function ParseError(msg, line) {
	this.msg = msg;
	this.line = line;
}

module.exports = ParseError;