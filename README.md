# Customizing antd without craco or ejecting
(or: how to use Less CSS with create-react-app (but really, stick to cra defaults))

> **Note**: Using create-react-app@5? Have a look at the
> [updated guide](https://github.com/tommie-lie/cra-antd-customization/tree/cra%405)

There are many guides showing how to customize antd in a create-react-app
out there, but so far I have not found any that go without using craco,
react-app-rewired or similar solutions to mess with cra's default config.

This guide will show you how to customize antd without adding any dependencies
besides less-loader while completely staying in the bounds that create-react-app
provides.

## Table of Contents
* [tl;dr](#tldr)
* [Intro](#intro)
  * [The Good](#the-good)
  * [The Bad](#the-bad)
  * [The Ugly](#the-ugly)
* [Background: Of Webpack Loaders](#background-of-webpack-loaders)
* [(There Must be)a Better Way](#there-must-be-a-better-way)
  * [Using Less in create-react-app](#using-less-in-create-react-app)
  * [Overriding antd Theme Configuration](#overriding-antd-theme-configuration)
  * [Improvements on the Bundle Structure](#improvements-on-the-bundle-structure)


## tl;dr
1. Install `less-loader`
   ```shell
   npm install --save less-loader less
   ```
2. Replace your antd.css import with the following line:
   ```javascript
   import "./antd-overrides.less.css!=!less-loader?{'lessOptions':{'javascriptEnabled':true}}!./antd-overrides.less";
   ```
3. Create a file called `antd-overrides.less` with the following content:
   ```less
   @import "~antd/lib/style/themes/default.less";
   @import "~antd/dist/antd.less";
   
   // set Less variables here like this:
   @primary-color: #61a70e;
   @border-radius-base: 10px;
   ```

## Intro

While antd provides a sound design system to start off, there comes a time
when you may want to change the visual design, maybe just to switch colors.

If you use create-react-app (cra for short) to build your React app, you
are faced with the question whether to use one of the many guides and
solutions to meddle with cra intenrals, or completely eject from cra just
to change antd's color scheme.

There is a third option and this guide will show how to customize antd
when using cra
* without flaky packages that break on every other major version of cra
* no bogus post-processing that breaks my hot-reloading
* full compatibility with the rest of cra

### The Good
The "convention over configuration" aproach of
[create-react-app](https://create-react-app.dev) saves a lot
of time. It helps developers to get started very fast without spending much
time on their toolchain and for most use-cases, batteries are included.
But using third party libraries that do not follow the convention may
become quite frustrating.

### The Bad
A popular and very comprehensive UI component framework is
[antd](https://ant.design). It consists of many well-designed components to
use in more complex React-based software and also allows for quite some
[customizations](https://ant.design/docs/react/customize-theme)
to its visual design.

However, it is using Less CSS for styling and customization is done by
modifying Less variables, either in an imported `.less` file or by setting
them in the Less pre-processor.

Either way, we have to interpret Less in order to customize antd.

### The Ugly
While cra readily supports Sass/SCSS right out of the box, there is no way
to use Less in cra. While there is an
[unmerged pull request](https://github.com/facebook/create-react-app/pull/10494),
it may well be several months before we see Less support in cra.

Because of this,
[many](https://ant.design/docs/react/use-with-create-react-app#Customize-Theme)
[different](https://blog.bitsrc.io/510a3344ef5d)
[ways](https://medium.com/@aksteps/782c53cbc03b)
have evolved to use Less in cra, each with their own drawbacks.

All those solutions have one thing in common:

> Stuff can break <br/>
> - [Dan Abramov](https://twitter.com/dan_abramov/status/1045809734069170176)



## Background: Of Webpack Loaders
In cra, webpack is used to convert all your source files to a working
application. Besides bundling together all the JavaScript files it also
processes them for minification, browser-compatibility and other stuff.
Those transformations are done by webpack using loaders which are hooked
into `import` statements. They are the reason why you can do the following
and get your CSS classnames as globally unique identifiers:
```javascript
import styles from "./somefile.css";
```

As all imports go through a chain of loaders, many approaches
get Less working with cra by modifying the internal webpack configuration
of cra to process `.less` files with the `less-loader`.
As this configuration is not intended by cra to be changed, all
existing solutions based on craco or similar tools use some sort of
configuration merging by hooking into cra internals. They bring their
own plugin ecosystem that may interfere with normal cra operations
and may even break with a minor cra update.

In webpack, we can get around using a custom configuration file
by using a special [inline syntax](https://webpack.js.org/concepts/loaders/#inline)
to configure loaders.
This syntax is not very useful as a replacement for the configuration file
in the general case, hence it is not recommended, but it is still officially
supported and very useful now that we want to use a loader without
touching the configuration.
 

## (There Must be) a Better Way
Let's start with a plain cra app and add some antd:
```sh
$ npm init react-app@4 cra-antd-customization
$ npm install --save antd
```
The straightforward way to include antd's styles into your app is to use
the already precompiled stylesheet that antd distributes:
```javascript
import "antd/dist/antd.css";
```
With this line at the top of your `App.js` or `index.js` you can use any antd
component without further ado and it will look like this:
![An antd web app with a text input and a button with antd's default style](antd-default.png)

### Using Less in create-react-app

But this is a plain `.css` file. No processing necessary, but no design
customization possible. We first need something that can understand
Less, and since we want to make use of all the webpack glory, we will
use `less-loader`:
```sh
$ npm install --save less-loader less
```
The
[antd less configuration site](https://ant.design/docs/react/customize-theme#Customize-in-webpack)
tells us how to use this loader:
* we need to chain it through `style-loader`, `css-loader` and finally
`less-loader`
* and we have to activate the `javascriptEnabled` option


To chain loaders in webpack's inline syntax, we just add `!` between every
loader and configure the loader using `?`.
The complete syntax to include the antd less stylesheet is:
```javascript
// eslint-disable-next-line import/no-webpack-loader-syntax
import "!style-loader!css-loader!less-loader?{'lessOptions':{'javascriptEnabled':true}}!antd/dist/antd.less";
```
The first line disables a ESlint rule which is enabled by default by
cra because it makes the code webpack-specific and less portable.
As this whole webpack loader stuff and cra itself is webpack-specific
as well, we can disable it for this single line.


### Overriding antd Theme Configuration

The chaining of loaders is quite straightforward, but the syntax for loader
parameters is awkward, to say the least. Using the JavaScript object notation
for `modifyVars` will soon be unmaintainable if you want to modify more than
just one or two variables.

Instead of configuring all overrides in the loader configuration, we can
also just import our own `.less` file and set the variables there.

So we create our own `override-antd.less` file like this:
```less
@import "~antd/lib/style/themes/default.less";
@import "~antd/dist/antd.less";

@primary-color: #61a70e;
@border-radius-base: 10px;
```
and then change the import (only the filename at the end changed):
```javascript
// eslint-disable-next-line import/no-webpack-loader-syntax
import "!style-loader!css-loader!less-loader?{'lessOptions':{'javascriptEnabled':true}}!./override-antd.less";
```
This way we have a single file where we can override all the Less variables
we want and can make antd look like this:

![The same antd application with default color changed to green and increased corner radius](antd-restyled.png)

I'd still recommend using SCSS if you want to introduce your own styles
because this is the way cra promotes.

### Improvements on the Bundle Structure
The above mechanism has one drawback:
By default, using `style-loader` in webpack causes all the styles to be
included in the bundled JavaScript file. So, instead of having a separate
CSS file in your `build/` directory as you would expect from cra, we get
one big JS file instead. The following listing shows the relevant build
files from this repository before using the less-loader. antd's CSS file
appears as a separate file in the static subdirectory.
<pre>
build
├── [1019]  asset-manifest.json
├── [3.0K]  index.html
├── [ 492]  manifest.json
└── [  25]  static
    ├── [  70]  css
    │   └── <mark>[543K]  main.4cb5f48e.chunk.css</mark>
    └── [4.0K]  js
        ├── [358K]  2.3415caa3.chunk.js
        ├── [1.4K]  2.3415caa3.chunk.js.LICENSE.txt
        ├── [4.2K]  3.cbd52c13.chunk.js
        ├── [ 953]  main.fe5d4602.chunk.js
        └── [2.3K]  runtime-main.62b93a79.js
</pre>
After applying the less-loader approach from this README, all the CSS
stuff is inlined into the JavaScript code. This not only increases
the file size but may also come as a surprise when debugging the
application in a browser.
<pre>
build
├── [ 833]  asset-manifest.json
├── [2.9K]  index.html
├── [ 492]  manifest.json
└── [  15]  static
    └── [4.0K]  js
        ├── [362K]  2.ae0c83ac.chunk.js
        ├── [1.4K]  2.ae0c83ac.chunk.js.LICENSE.txt
        ├── [4.2K]  3.31070b71.chunk.js
        ├── <mark>[1.9M]  main.fa4fc290.chunk.js</mark>
        └── [2.3K]  runtime-main.99b430ea.js
</pre>

Normally, cra minifies all imported CSS and extracts it again into separate
CSS files in the `static/` directory. However, as we have told webpack
how to import our Less files, cra's config does not apply here.

Luckily, there is another handy webpack import syntax, the
[inline matchResource](https://webpack.js.org/api/loaders/#inline-matchresource)
syntax. It tells webpack to import something **as if** it had a different
name.

Combining this with the inline configuration of loaders, we can tell webpack
to import our Less file and then handle it **as if** it was a regular CSS file:
```javascript
import "./antd-overrides.less.css!=!less-loader?{'lessOptions':{'javascriptEnabled':true}}!./antd-overrides.less";
```
We can omit all the other loaders here because less-loader's result already
is a proper CSS file. If we tell webpack to handle it as such, all the
css-loader and style-loader configuration from cra apply, and the "virtual" file
`antd-overrides.less.css` is handled by cra's defaults.
