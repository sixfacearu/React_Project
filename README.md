This project was bootstrapped with react-native CLI (v2.0.1) and react-native (0.56.0).

node version: v10.1.0
npm version: v6.1.0

Below you'll find information about performing common tasks.

## Table of Contents

* [Available Scripts](#available-scripts)
  * [npm start](#npm-start)
  * [npm test](#npm-test)
  * [npm run ios](#npm-run-ios)
  * [npm run android](#npm-run-android)
* [React native navigation v2 wix](#react-native-navigation-v2-wix)
* [React localization support](#React-localization-support)
* [React error handling](#React-error-handling)
* [Common settings for VS code](#Common-settings-for-VS-code)



## Available Scripts

If Yarn was installed when the project was initialized, then dependencies will have been installed via Yarn, and you should probably use it to run these commands as well. Unlike dependency installation, command running syntax is identical for Yarn and NPM at the time of this writing. You would find these scripts in package.json file.

### `npm start`

Before running the app using the command, please make sure to install npm packages using `npm install` in the root of the project folder.

Runs your app in development mode.

Sometimes you may need to reset or clear the React Native packager's cache. To do so, you can pass the `--reset-cache` flag to the start script:

```
npm start --reset-cache
# or
yarn start --reset-cache
```

#### `npm test`

Runs the [jest](https://github.com/facebook/jest) test runner on your tests.

#### `npm run ios`

Like `npm start`, but also attempts to open your app in the iOS Simulator if you're on a Mac and have it installed.

#### `npm run android`

Like `npm start`, but also attempts to open your app on a connected Android device or emulator. Requires an installation of Android build tools (see [React Native docs](https://facebook.github.io/react-native/docs/getting-started.html) for detailed setup). We also recommend installing Genymotion as your Android emulator.

*Note: This command has been updated according to the [wix](https://wix.github.io/react-native-navigation/v2/#/) react native navigation.

###React native navigation v2 wix

This project uses the navigation feature provided by [wix](https://wix.github.io/react-native-navigation/v2/#/). Android and iOS settings are completed. Please refer the mentioned link to go over the installation instructions.

###React localization support

This project is configured with localization support. For more info you may refer this [library](https://www.npmjs.com/package/react-native-i18n).

###React error handling

Please note that if you are encountering an error related to index.android.bundle in which the assets are not being loaded on a real android device. Please follow the following steps:

-Create a assets folder under android/app/src/main/
-modify android script and replace it with "react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res". Run "npm run android".
-then modify the android script and replace it with "cd ./android && ./gradlew app:assembleDebug && ./gradlew installDebug". Run "npm run android".
-Make sure to run the metro builder.

###Common settings for VS code

Please take update of the .vscode file.
Install flow by typing the following to the terminal, "npm install -g flow-bin".