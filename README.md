# bp-core

This repo includes the core transaction services for the core of the BulkPay application, including the following:

* Main - the central web app and service
* Logs - the logging and event monitor service
* Search - the search service, based on ElasticSearch
* Notifications - the notifications service

## Scripts
Use the following scripts in the `scripts` folder to setup the and manage the services:

### Run a mongo docker container
```sh
$ scripts/runmongo.sh
```

### Build docker images for all the services
```
$ scripts/buildall.sh
```

### Add a meteor package to all the services
```
$ scripts/addpackage.sh <package_name>
```

### Clone repos for all tradedepot:* packages locally
```
$ scripts/clonepackages.sh
```

### Run a service
```
$ scripts/runserv.sh <service_name> <port>
```

***

The dev workspaces and scaffolding for the different microservices within td-central are generated with [iron-cli](https://github.com/iron-meteor/iron-cli), a command line scaffolding tool for Meteor applications. It automatically creates project structure, files and boilerplate code.

Steps for installing and using [iron-cli](https://github.com/iron-meteor/iron-cli) are as below:

## Installation
Install the iron command line tool globally so you can use it from any project directory.

```sh
$ npm install -g iron-meteor
```

## Usage
Use the `help` command to get a list of the top level commands.

```
$ iron help
```

Use the `g` command to see a list of generators.

```
$ iron g
```

## Directory Structure
The application will have the following directory structure:

```sh
my-app/
 .iron/
   config.json
 bin/
 build/
 config/
   development/
     env.sh
     settings.json
 app/
   client/
     collections/
     lib/
     stylesheets/
     templates/
     head.html
   lib/
     collections/
     controllers/
     methods.js
     routes.js
   packages/
   private/
   public/
   server/
     collections/
     controllers/
     lib/
     methods.js
     publish.js
     bootstrap.js
```

## Generators
```sh
$ iron g:scaffold todos
$ iron g:template todos/todo_item
$ iron g:controller webhooks/stripe --where "server"
$ iron g:route todos/show_todo
$ iron g:collection todos
$ iron g:publish todos
$ iron g:stylesheet main
```

## Commands

### Create the meteor application
```sh
$ iron create my-app
```

The following parameters can be specified:
```
--css=css|scss|less
--js=js|coffee|next.js
--html=html|jade
--skip-template-css=true|false
--skip-template-js=true|false
--skip-template-html=true|false
--skip-iron-router
--skip-route-controller
--skip-route-template
```
The above `create` step is not required since the repo already exists. Just clone to proceed.

### Run Your Application
```sh
$ iron run
```

This will automatically load your config/development/env.sh and config/development/settings.json files.

### Run the Application with a Different Environment
```sh
$ iron run --env=staging
```

This will use the config files in `config/staging` instead.

### Debug Your Application on the Server Side
```sh
$ iron debug
```

### Build Your Application
```sh
$ iron build
```

## Deployment

### Deploy with Docker
[Docker](http://www.docker.com) is an open platform for building, shipping and running distributed applications. Details for 
generating DockerFiles and deploying with Docker will be updated here shortly.


## Meteor Commands
Meteor commands will automatically be proxied to the meteor command line tool.


## License
MIT
