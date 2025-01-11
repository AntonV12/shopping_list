const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./server.js", // Точка входа в приложение
  target: "node", // Указывает Webpack, что сборка предназначена для Node.js
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js", // Название результирующего файла
  },
  externals: [nodeExternals()], // Исключает из сборки модули Node.js
  module: {
    rules: [
      {
        test: /\.js$/, // Обрабатывает файлы с расширением .js
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Используется для транспиляции современного JS
        },
      },
    ],
  },
};
