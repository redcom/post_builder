# Prepare
NoSql = require("nosql")
{TaskGroup} = require('taskgroup')
_ = require('lodash')

# Export
module.exports = (BasePlugin) ->
  # Define
  class NoSqlPlugin extends BasePlugin
    # Name
    name: 'nosql'

    # Config
    config:
      collectionDefaults:
        nosqlFile: process.env.NOSQL_FILE
        nosqlBinary: process.env.NOSQL_BINARY
        relativeDirPath: null # defaults to collectionName
        extension: ".html"
        injectDocumentHelper: null
        collectionName: "nosql"
        sort: null
        meta: {}
        query: {}
        docpadCollectionName: null # defaults to collectionName
      collections: []

    # DocPad v6.24.0+ Compatible
    # Configuration
    setConfig: ->
      # Prepare
      super
      config = @getConfig()
      # Adjust
      config.collections = config.collections.map (collection) ->
        return _.defaults(collection, config.collectionDefaults)
      # Chain
      @

    getBasePath: (collectionConfig) ->
      "#{collectionConfig.relativeDirPath or collectionConfig.collectionName}/"


    # Fetch our documents from nosql
    # next(err, mongoDocs)
    fetchNosqlCollection: (collectionConfig, next) ->

      NoSql = NoSql.load collectionConfig.nosqlFile, collectionConfig.nosqlBinary
      NoSql.on "load", () ->
        console.info("NoSql loaded  ", collectionConfig.nosqlFile)

      NoSql.on "error", (err, source) ->
        console.info("Fail to laod nosql file  #", collectionConfig.nosqlFile)
        return next err if err


      fnMap = (doc) ->
        return doc if collectionConfig.query(doc)

      fnCallback = (err, docs) ->
          next err, docs

      NoSql.all fnMap, fnCallback

      # Chain
      @

    # convert JSON doc from nosql json to DocPad-style document/file model
    # "body" of docpad doc is a JSON string of the nosql doc, meta includes all data in nosql doc
    nosqlDocToDocpadDoc: (collectionConfig, doc, next) ->
      # Prepare
      docpad = @docpad

      documentAttributes =
        data: JSON.stringify(doc, null, '\t')
        meta: _.defaults(
          {},
          title: doc.header
          docTitle: doc.header
          collectionConfig.meta,

          nosqlCollection: collectionConfig.collectionName
          # todo check for ctime/mtime/date/etc. fields and upgrade them to Date objects (?)
          relativePath: "#{@getBasePath(collectionConfig)}#{doc.header}#{collectionConfig.extension}"
          original: doc, # this gives the original document without DocPad overwriting certain fields

          doc # this puts all of the document attributes into the metadata, but some will be overwritten
        )

      # Fetch docpad doc (if it already exists in docpad db, otherwise null)

      document = docpad.createDocument(documentAttributes)

      # Inject document helper
      collectionConfig.injectDocumentHelper?.call(@, document)

      # Load the document
      document.action 'load', (err) ->
        # Check
        return next(err, document)  if err

        # Add it to the database (with b/c compat)
        docpad.addModel?(document) or docpad.getDatabase().add(document)

        # Complete
        next(null, document)

      # Return the document
      return document

    addNosqlCollectionToDb: (collectionConfig, next) ->
      docpad = @docpad
      plugin = @
      plugin.fetchNosqlCollection collectionConfig, (err, docs) ->
        return next(err) if err

        docpad.log('debug', "Retrieved #{docs.length} nosql in collection #{collectionConfig.collectionName}, converting to DocPad docs...")

        docTasks  = new TaskGroup({concurrency:0}).done (err) ->
          return next(err) if err
          docpad.log('debug', "Converted #{docs.length} nosql documents into DocPad docs...")
          next()

        docs.forEach (doc) ->
          docTasks.addTask (complete) ->
            docpad.log('debug', "Inserting #{doc.header} into DocPad database...")
            plugin.nosqlDocToDocpadDoc collectionConfig, doc, (err) ->
              return complete(err) if err
              docpad.log('debug', 'inserted')
              complete()

        docTasks.run()

    # =============================
    # Events

    # Populate Collections
    # Import MongoDB Data into the Database
    populateCollections: (opts, next) ->
      # Prepare
      plugin = @
      docpad = @docpad
      config = @getConfig()

      # Log
      docpad.log('info', "Importing nosql collection(s)...")

      # concurrency:0 means run all tasks simultaneously
      collectionTasks = new TaskGroup({concurrency:0}).done (err) ->
        return next(err) if err

        # Log
        docpad.log('info', "Imported all nosql docs...")

        # Complete
        return next()

      config.collections.forEach (collectionConfig) ->
        collectionTasks.addTask (complete) ->
          plugin.addNosqlCollectionToDb collectionConfig, (err) ->
            complete(err) if err

            docs = docpad.getFiles {nosqlCollection: collectionConfig.collectionName}, collectionConfig.sort

            # Set the collection
            docpad.setCollection(collectionConfig.docpadCollectionName or collectionConfig.collectionName, docs)

            docpad.log('info', "Created DocPad collection \"#{collectionConfig.collectionName}\" with #{docs.length} documents from MongoDB")
            complete()
      collectionTasks.run()

      # Chain
      @
