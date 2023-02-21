const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/server.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    target: "node",
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
    externals: {
        bcrypt: "commonjs bcrypt",
        compression: "commonjs compression",
        cors: "commonjs cors",
        dotenv: "commonjs dotenv",
        express: "commonjs express",
        "http-errors": "commonjs http-errors",
        jsonwebtoken: "commonjs jsonwebtoken",
        mongoose: "commonjs mongoose",
        "mongoose-autopopulate": "commonjs mongoose-autopopulate",
        morgan: "commonjs morgan",
    },
};
