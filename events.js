const EventEmitter = require('events')

class events extends EventEmitter {
  constructor(props) {
    super(props)
  }

  emitListed(modelName, req) {
    return (collection) => {
      this.emit(`${modelName}:listed`, req, collection)
    }
  }

  emitDetailed(modelName, req) {
    return (entity) => {
      this.emit(`${modelName}:detailed`, req, entity)
    }
  }

  emitCreated(modelName, req) {
    return ({ ids, data }) => {
      this.emit(`${modelName}:created`, req, { ids, data })
      return Promise.resolve(ids)
    }
  }

  emitUpdated(modelName, req) {
    return () => {
      this.emit(`${modelName}:updated`, req)
    }
  }

  emitDeleted(modelName, req) {
    return entity => {
      this.emit(`${modelName}:deleted`, req, entity)
    }
  }

  emitBatchDeleted(modelName, req) {
    return entity => {
      this.emit(`${modelName}:batchDeleted`, req, entity)
    }
  }

}

module.exports = new events()