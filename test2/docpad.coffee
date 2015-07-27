fsUtil = require('fs')
pathUtil = require('path')
moment = require('moment')
strUtil = require('underscore.string')
nosql = require('nosql')
dbFile = __dirname + '/database/nosql/db.nosql'
dbBinary = __dirname + '/database/nosql/binary'
db = nosql.load(dbFile, dbBinary)
POSTS = []
SOURCES = []

siteUrl = if process.env.NODE_ENV is 'production' then "http://domain.org" else "http://localhost:9778"

getSources = () ->
    return SOURCES if SOURCES && SOURCES.length>0
    map = (doc) ->
        return doc if doc.table == 'sites'
    cb = (err, selected) ->
        SOURCES = selected
        return selected if !err
    db.all(map, cb)

getPosts = () ->
    return POSTS if POSTS && POSTS.length>0
    map = (doc) ->
        return doc if doc.table == 'posts'
    cb = (err, selected) ->
        POSTS = selected
        return selected if !err
    db.all(map, cb)

getSources()
getPosts()
# Humanize
humanize = (text) ->
    text ?= ''
    return strUtil.humanize text.replace(/^[\-0-9]+/,'').replace(/\..+/,'')

generateUrlPost = (text) ->
    text ?= ''
    return strUtil.slugify text

# The DocPad Configuration File
# It is simply a CoffeeScript Object which is parsed by CSON
docpadConfig =

    # =================================
    # Template Data
    # These are variables that will be accessible via our templates
    # To access one of these within our templates, refer to the FAQ: https://github.com/bevry/docpad/wiki/FAQ

    templateData:

        # Specify some site properties
        site:
            # The production url of our website
            # If not set, will default to the calculated site URL (e.g. http://localhost:9778)
            url: siteUrl

            strUtil: strUtil
            moment: moment

            # The default title of our website
            title: "Your Website"

            # The website description (for SEO)
            description: """
                When your website appears in search results in say Google, the text here will be shown underneath your website's title.
                """

            # The website keywords (for SEO) separated by commas
            keywords: """
                place, your, website, keywoards, here, keep, them, related, to, the, content, of, your, website
                """

            # The website's styles
            styles: [ "/vendor/css/bootstrap.min.css",
                      "/vendor/css/bootstrap-theme.min.css",
                      "/css/theme.css",
                      "/css/custom_onthesnow.css"
            ]

            # The website's scripts
            scripts: [
                """
                    <!-- -->
                """
                # Vendor
                "/vendor/js/bootstrap-without-jquery.js"

                # Scripts
                "/js/lib.js"
                "/js/common.js"
                "/js/app.js"
            ]


        # -----------------------------
        # Helper Functions

        # Get the prepared site/document title
        # Often we would like to specify particular formatting to our page's title
        # we can apply that formatting here
        getPreparedTitle: ->
            # if we have a title, we should use it suffixed by the site's title
            if @document.pageTitle isnt false and @document.title
                "#{@document.pageTitle or @document.title} | #{@site.title}"
            # if we don't have a title, then we should just use the site's title
            else if @document.pageTitle is false or @document.title? is false
                @site.title

        # Get the prepared site/document description
        getPreparedDescription: ->
            # if we have a document description, then we should use that, otherwise use the site's description
            @document.description or @site.description

        # Get the prepared site/document keywords
        getPreparedKeywords: ->
            # Merge the document keywords with the site keywords
            @site.keywords.concat(@document.keywords or []).join(', ')

        getSources: getSources
        getPosts: getPosts


    # =================================
    # Collections

    # Here we define our custom collections
    # What we do is we use findAllLive to find a subset of documents from the parent collection
    # creating a live collection out of it
    # A live collection is a collection that constantly stays up to date
    # You can learn more about live collections and querying via
    # http://bevry.me/queryengine/guide


    collections:

        # Create a collection called posts
        # That contains all the documents that will be going to the out path posts
        #posts: ->
         #   @getCollection('documents').findAllLive({relativeOutDirPath: 'posts'})
        pages: ->
            @getCollection("html").findAllLive({isPage:true}, [{filename: 1}]).on "add", (model) ->
                model.setMetaDefaults({layout: "default"})

    # =================================
    # Environments

    # DocPad's default environment is the production environment
    # The development environment, actually extends from the production environment

    # The following overrides our production url in our development environment with false
    # This allows DocPad's to use it's own calculated site URL instead, due to the falsey value
    # This allows <%- @site.url %> in our template data to work correctly, regardless what environment we are in



    environments:
        development:
            templateData:
                site:
                    url: false


    # =================================
    # Plugins
    plugins:
        menu:
            menuOptions:
               optimize: true
               skipEmpty: true
               skipFiles: ///\.js|\.scss|\.css/// #regexp are delimited by three forward slashes in coffeescript
        nosql:
            collections: [
              nosqlFile: dbFile,
              nosqlBinary: dbBinary,

              query: (doc) ->
                  return doc.table == 'posts' && doc.link.indexOf('onthesnow')>-1
              docpadCollectionName: 'posts'
              sort: created: 1 # newest first
              injectDocumentHelper: (document) ->
                  document.setMeta(
                      isArticle: true
                  )
                  relativeDirPath = "posts"
                  extension = ".html"
                  u =  "#{relativeDirPath}/#{generateUrlPost(document.attributes.header)}#{extension}"
                  document.attributes.relativePath = u

              meta:
                layout: "content"
            ]

    # =================================
    # DocPad Events

    # Here we can define handlers for events that DocPad fires
    # You can find a full listing of events on the DocPad Wiki

    events:

        # Server Extend
        # Used to add our own custom routes to the server before the docpad routes are added
        serverExtend: (opts) ->
            # Extract the server from the options
            {server} = opts
            docpad = @docpad

            # As we are now running in an event,
            # ensure we are using the latest copy of the docpad configuraiton
            # and fetch our urls from it
            latestConfig = docpad.getConfig()
            oldUrls = latestConfig.templateData.site.oldUrls or []
            newUrl = latestConfig.templateData.site.url

            # Redirect any requests accessing one of our sites oldUrls to the new site url
            server.use (req,res,next) ->
                if req.headers.host in oldUrls
                    res.redirect(newUrl+req.url, 301)
                else
                    next()


# Export our DocPad Configuration
module.exports = docpadConfig
