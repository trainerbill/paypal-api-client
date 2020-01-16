const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'paypalApiClient.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'paypalApiClient',
        libraryTarget: 'umd'
    },
    /*
    externals: {
        braintree: 'braintree'
    }
    */
};
