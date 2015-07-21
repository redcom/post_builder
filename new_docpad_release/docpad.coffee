# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration
fsUtil = require('fs')
pathUtil = require('path')
CSON = require('cson')
moment = require('moment')
strUtil = require('underscore.string')
extendr = require('extendr')
semver = require('semver')

textData = CSON.parseCSONFile('./templateData/site.cson')
navigationData = CSON.parseCSONFile('./templateData/navigation.cson')
websiteVersion = require('./package.json').version
siteUrl = if process.env.NODE_ENV is 'production' then "/" else "http://localhost:9778"
# =================================
# Helpers

# Titles
getName = (a,b) ->
    if b is null
        return textData[b] ? humanize(b)
    else
        return textData[a][b] ? humanize(b)
getCategoryName = (category) ->
    getName('categoryNames',category)
getLinkName = (link) ->
    getName('linkNames',link)
getLabelName = (label) ->
    getName('labelNames',label)

# Humanize
humanize = (text) ->
    text ?= ''
    return strUtil.humanize text.replace(/^[\-0-9]+/,'').replace(/\..+/,'')


docpadConfig = {
    templateData:
        # -----------------------------
        # Misc

        strUtil: strUtil
        moment: moment
        text: textData
        navigation: navigationData

        site:
            url: siteUrl
            title: "My site"
            description: """
                    This is description
            """
            keywords: """
                bevry, bevryme, balupton, benjamin lupton, docpad, node, node.js, javascript, coffeescript, query engine, queryengine, backbone.js, cson
                """

            # Services
            services:
                facebookLikeButton:
                    applicationId: ''
                twitterTweetButton: 'docpad'
                twitterFollowButton: 'docpad'
                disqus: 'docpad'

                googleAnalytics: ''

            styles: [ "/vendor/css/bootstrap.min.css",
                      "/vendor/css/bootstrap-theme.min.css",
                      "/css/theme.css",
                      "/css/custom_onthesnow.css"
            ].map (url) -> "#{url}?websiteVersion=${websiteVersion}"

                # Script
            scripts: [
                    # Vendor
                    "/vendor/js/bootstrap-without-jquery.js"

                    # Scripts
                    "/js/lib.js"
                    "/js/common.js"
                    "/js/app.js"
            ].map (url) -> "#{url}?websiteVersion=#{websiteVersion}"

        getName: getName
        getCategoryName: getCategoryName
        getLinkName: getLinkName
        getLabelName: getLabelName

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

    collections:
        pages: ->
            @getCollection("html").findAllLive({isPage:true}, [{filename: 1}]).on "add", (model) ->
                model.setMetaDefaults({layout: "default"})
}

# Export the DocPad Configuration
module.exports = docpadConfig
