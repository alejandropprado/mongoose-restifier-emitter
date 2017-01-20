const EventEmitter = require('events')

class events extends EventEmitter {
  constructor(props){
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
    return (id) => {
      this.emit(`${modelName}:created`, req, id)
    }
  }

  emitUpdated(modelName, req) {
    return () => {
      this.emit(`${modelName}:updated`, req)
    }
  }

  emitDeleted(modelName, req) {
    return () => {
      this.emit(`${modelName}:deleted`, req)
    }
  }

}

module.exports = new events()