# DocPad Configuration File
# http://docpad.org/docs/config

# Define the DocPad Configuration
docpadConfig = {
    # ...
    templateData:
        site:
            title: "My site"
            description: "My site description"
            keywords: "My sie keywords"

        getPreparedTitle: -> if @document.title then "#{@document.title} | #{@site.title}" else @site.title
        getPreparedDescription: -> if @document.description then "#{@document.description} | #{@site.description}" else @site.description
        getPreparedKeywords: -> if @document.keywords then "#{@document.keywords} | #{@site.keywords}" else @site.keywords

    collections:
        pages: ->
            @getCollection("html").findAllLive({isPage:true}, [{filename: 1}]).on "add", (model) ->
                model.setMetaDefaults({layout: "default"})
}

# Export the DocPad Configuration
module.exports = docpadConfig
