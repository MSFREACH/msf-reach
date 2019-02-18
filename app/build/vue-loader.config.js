var utils = require('./utils')
var config = require('./config')
var isProduction = process.env.NODE_ENV === 'production'
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');
const { VuetifyProgressiveModule } = require('vuetify-loader');

module.exports = {
  // loaders: utils.cssLoaders({
  //   sourceMap: isProduction
  //     ? config.build.productionSourceMap
  //     : config.dev.cssSourceMap,
  //   extract: isProduction
  // }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
},
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            args[0].chunksSortMode = 'none'
            return args
        }),
        config.plugin('vuetify-loader')
      .use(VuetifyLoaderPlugin);
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.modules = [VuetifyProgressiveModule];
        return options;
    })
        // config.module.rule('vue')
        //     .use('vue-loader')
        //     .loader('vue-loader')
        //     .tap(options => Object.assign(options, {
        //        transformAssetUrls: {
        //           'v-img': ['src', 'lazy-src'],
        //           'v-card': 'src',
        //           'v-card-media': 'src',
        //           'v-responsive': 'src',
        //           'v-carousel-item': 'src',
        //           //...
        //        }
        //    }))
    }
}
