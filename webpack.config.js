const path = require('path');

module.exports = {
    entry: {
        LiCAP: './src/LiCAP.ts',
        SlimTabV2: './src/SlimTabV2.ts',
        DataAdapter: './src/DataAdapter.ts',
    },
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
        library: '[name]',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};