[![Build Status](https://travis-ci.org/marceloglacial/snowfall-boilerplate.svg?branch=master)](https://travis-ci.org/marceloglacial/snowfall-boilerplate) 
![GitHub deployments](https://img.shields.io/github/deployments/marceloglacial/snowfall-boilerplate/github-pages) 
[![GitHub forks](https://img.shields.io/github/forks/marceloglacial/snowfall-boilerplate)](https://github.com/marceloglacial/snowfall-boilerplate/network)
[![GitHub stars](https://img.shields.io/github/stars/marceloglacial/snowfall-boilerplate)](https://github.com/marceloglacial/snowfall-boilerplate/stargazers) 
![GitHub repo size](https://img.shields.io/github/repo-size/marceloglacial/snowfall-boilerplate)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/marceloglacial/snowfall-boilerplate)


# Snowfall Boilerplate

End-to-end web project based on three stages:

1. <a href="#design">Design</a>
2. <a href="#front-end">Front-end</a>
3. <a href="#back-end">Back-end</a>

## Design

- <a href="https://www.sketchapp.com/">Sketch</a> and <a href="https://www.figma.com/">Figma</a> templates
- Desktop, tablet and phone artboards
- Default web icons, tiles and favicons
- WordPress screenshot artboard

## Front-end

- HTML5 starter template files
- <a href="https://github.com/thedaviddias/Front-End-Checklist">Front-end checklist</a>
- <a href="https://www.browsersync.io/">Browser Live Reloading</a>
- <a href="https://sass-lang.com/">SASS</a>
- <a href="https://eduardoboucas.github.io/include-media/">Include-media</a> 
- <a href="https://handlebarsjs.com/">HandlebarsJS</a>
- <a href='https://github.com/necolas/normalize.css/'>Normalize CSS</a>

## Back-end

- <a href="https://wordpress.org/">WordPress</a>
- <a href="https://docs.docker.com/compose/wordpress/">Docker Compose</a>
- <a href="https://www.browsersync.io/">Browser Live Reloading</a>

## CI/CD

- <a href="#deploy">FTP Deploy</a>
- <a href="https://travis-ci.org/github/marceloglacial/snowfall-boilerplate/">Travis CI</a>

## Installation

1. <a href="https://docs.docker.com/compose/install/">Install Docker Compose</a>
2. [Install npm](https://www.npmjs.com/get-npm)
3. [Install Gulp](https://gulpjs.com)
4. Run installation on terminal:

```terminal
    npm install
```

<strong>Note:</strong> Run npm audit if you got dependencies vulnerabilities

```terminal
    npm audit fix -force
```

# How to Use

### Front-end

- `npm run frontend` - Start developement
- `npm run frontend-build` - Build
- `frontend:start` - Starts Browser Live reloading and watch SASS files.
- `frontend:build` - Minify HTML/CSS/JS, Optimize images and copy do dist folder.
- `frontend:deploy` - Build and upload all `front-end/dist` files to FTP server.

### Back-end

- `npm run backend` - Start developement (make sure Docker is running)
- `backend:install` - Download WordPress latest version, unzip it and setup a server folder.
- `backend:start` - Starts Browser Live reloading and watch SASS files.
- `backend:deploy` - Build theme and upload all `back-end/src` files to FTP server (default).

## Deploy

#### FTP config

1. Fill FTP credentials and server info on `credentials-sample.json`
2. Rename `credentials-sample.json` to `credentials.json`

<strong>Note:</strong>
Due sensitive information, `credentials.json` WILL NOT BE on version control.

## References

- Front-end based on <a href="https://github.com/marceloglacial/snowflake-boilerplate">Snowflake Boilerplate</a>
- Back-end based on <a href="https://github.com/marceloglacial/iceberg-boilerplate">Iceberg boilerplate</a>
