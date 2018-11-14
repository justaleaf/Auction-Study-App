module.exports = {
    entry: {
        auct_setts: './public/javascripts/auct_setts.js',
        members: './public/javascripts/members.js',
        picture: './public/javascripts/picture.js'
    },
    output: {
        filename: "[name].min.js",
        path: __dirname + "/dist/javascripts/"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style-loader!css-loader'
            }
        ]
    },
    mode: 'development',
    watch: false
};