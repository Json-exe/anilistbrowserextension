const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "production",
    entry: {
        anilistextensions: path.resolve(__dirname, "..", "src", "anilistextensions.ts"),
        popup: path.resolve(__dirname, "..", "src", "popup.ts"),
        content_series: path.resolve(__dirname, "..", "src", "content-series.ts"),
        authworker: path.resolve(__dirname, "..", "src", "authworker.ts")
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            }
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
    ],
};