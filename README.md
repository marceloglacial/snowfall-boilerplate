# Snowfall Boilerplate
[![Build Status](https://travis-ci.org/marceloglacial/snowfall-boilerplate.svg?branch=master)](https://travis-ci.org/marceloglacial/snowfall-boilerplate)

End-to-end web project based on three stages:
1. Design 
2. Front-end
3. Back-end

## Features

### Design

 - <a href="https://www.sketchapp.com/">Sketch</a> and <a href="https://www.figma.com/">Figma</a> templates
 - Desktop, tablet and phone artboards
 - Default web icons, tiles and favicons 
 - WordPress screenshot artboards

### Front-end
- HTML5 starter template files
- <a href="https://github.com/thedaviddias/Front-End-Checklist">Front-end checklist</a> ready
- <a href="https://sass-lang.com/">SASS</a> ready
- <a href="https://sass-guidelin.es/#architecture">SASS Architecture</a> ready
- <a href="https://pugjs.com/">PugJS</a> templates ready
- <a href="https://www.browsersync.io/">Browser Live Reloading</a>

### Back-end
- <a href="https://docs.docker.com/compose/wordpress/">WordPress Docker Compose</a> ready
- <a href="https://www.browsersync.io/">Browser Live Reloading</a>

### Automation
- HTML minify on build (optional)
- JS minify on build
- Optmized Images on build
- <a href="https://www.browsersync.io/">BrowserSync Live Reloading</a>

### CI/CD
- <a href="#deploy">FTP Deploy</a> integrated
- <a href="#deploy">Travis CI</a> ready


## Installation

1. <a href="https://docs.docker.com/compose/install/">Install Docker Compose</a>
2. [Install npm](https://www.npmjs.com/get-npm)
3. [Install Gulp](https://gulpjs.com)
4. Run installation on terminal: 

```terminal
    npm install 
```

# How to Use

## Front-end

- `npm run frontend` - Start developement

### Gulp tasks
- `frontend:start` - Start Browser Live reloading and watch SASS files.
- `frontend:build` - Minify HTML/CSS/JS, Optimize images and copy do dist folder.
- `frontend:deploy` - Build and upload all `front-end/dist` files to FTP server.

## Back-end

- `npm run backend` - Start developement

### Gulp tasks
- `backend:install` - Download WordPress latest version, unzip it and setup a server folder.
- `backend:start` -  Start Browser Live reloading and watch SASS files.
- `backend:deploy` -  Build theme and upload all `back-end/src` files to FTP server.

## Deploy

#### FTP config

1. Fill FTP credentials and server info on `credentials-sample.json` 
2. Rename `credentials-sample.json` to `credentials.json`

<strong>NOTE:</strong>
Due sensitive information, `credentials.json` WILL NOT BE on version control.

#### Travis CD
1. Connect your GitHub repository to <a href="https://travis-ci.org/">Travis</a>
2. Configure your deploy on `.travis.yml` file

<strong>Front-End deploy</strong>

```yml
script:
- gulp frontend:build

after_script:
- gulp frontend:deploy
```

<strong>Back-End deploy</strong>

```yml 
script:
- gulp backend:build

after_script:
- gulp backend:deploy
```


# References
- Front-end based on <a href="https://github.com/marceloglacial/snowflake-boilerplate">Snowflake Boilerplate</a> 
- Back-end based on <a href="https://github.com/marceloglacial/iceberg-boilerplate">Iceberg boilerplate</a>
- SASS Structure based on <a href="https://github.com/HugoGiraudel/sass-boilerplate">7-1 SASS Boilerplate</a> 
- Grid system based on <a href="https://milligram.io/">Milligram SCSS</a> (<a href="https://www.npmjs.com/package/milligram-scss">SCSS version</a>)

