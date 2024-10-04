const config = require('../../webpack.shared')(__dirname);
module.exports = {
	...config,
	output: {
		...config.output,
		library: '@fjdr/react-diagrams-geometry'
	}
};
