const { join } = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackSourceMapSupport = require("webpack-source-map-support");

module.exports = {
    entry: {
        server: join(__dirname, 'packages/server/src/main.ts'),
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    devtool: 'nosources-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader',
                exclude: [
                    /node_modules/
                ],
                //exclude: join(__dirname, 'packages/server/configs/config.js')
            },
            {
                test: /\.node$/,
                use: 'native-ext-loader'
            }
            
        ],
    },
    mode: "production",
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: "./packages/server/tsconfig.json"
            })
        ]
    },
    plugins: [
        new WebpackSourceMapSupport(),
        // new webpack.ContextReplacementPlugin(
        //     /[\\\/]knex[\\\/]lib[\\\/]dialects/,
        //     function(context) {
        //         console.warn(context);
        //         context.regExp = /[\\\/](oracledb|postgres)[\\\/]index\.js*$/
        //     }
        // ),
        new webpack.IgnorePlugin(/hiredis/, /[\\\/]redis-parser[\\\/]/)
    ],
    output: {
        path: join(__dirname, 'dist'),
        filename: '[name].js'
    },
    
    externals: [
        {
            knex: 'commonjs knex',
            oracledb: "commonjs oracledb",
            config: {
                commonjs: ['../configs/config']
            }
        }
    ]
};
