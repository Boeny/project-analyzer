const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Development',
            template: './templates/index.html'
        }),
    ],
    devtool: 'inline-source-map',
    devServer: {
        //open: true, // open default browser
        onBeforeSetupMiddleware: (app) => {
            // app.app.get("/", function(req, res){
            //     res.json({})
            // });
        }
    }
};
