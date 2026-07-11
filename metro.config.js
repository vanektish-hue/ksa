const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;
const srcDir = path.resolve(projectRoot, 'src');

config.resolver.extraNodeModules = new Proxy(
  {
    '@': srcDir,
  },
  {
    get: (target, name) => {
      if (target.hasOwnProperty(name)) {
        return target[name];
      }
      return path.join(projectRoot, 'node_modules', name);
    },
  },
);

config.watchFolders = [srcDir];

module.exports = config;
