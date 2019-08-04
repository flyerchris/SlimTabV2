const path = require('path');

module.exports = {
    entry: './src/SlimTabV2.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'SlimTabV2.js',
        path: path.resolve(__dirname, 'dist')
    }
};