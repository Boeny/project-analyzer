const fs = require('fs');
const {scanDir, readFile, parseFile, deleteFiles} = require('./src/parser');
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
            app.app.get("/scanDir", function(req, res){
                res.json({files: scanDir(req.query.path)})
            });

            app.app.get("/readFile", function(req, res){
                res.json({content: readFile(req.query.path)})
            });
            app.app.get("/parseFile", function(req, res){
                res.json(parseFile(req.query.path, req.query.dir))
            });
            app.app.get("/deleteFiles", function(req, res){
                res.json(deleteFiles(req.query.dir, JSON.parse(req.query.files)))
            });

            // app.post("/post/some-data", bodyParser.json(), function(req, res){
            //     console.log(req.body);
            //     res.send("POST res sent from webpack dev server")
            // });
        }
    }
};
