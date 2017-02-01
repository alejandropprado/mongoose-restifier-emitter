const _ = require('lodash')
const events = require('./events')

/**
 * Helper functions to handle response
 */
const respondWithResult = (res, statusCode) => entity => {
  statusCode = statusCode || 200
  if (entity) {
    res.status(statusCode).json(entity)
    return entity
  }

  return null
}

const respondWithoutResult = (res, statusCode) => () => {
  statusCode = statusCode || 204
  res.status(statusCode).end()

  return
}

const saveUpdates = updates => entity => {
  const updated = _.merge(entity, updates)
  return updated.save()
    .then((updated) => updated)
}

const removeEntity = res => entity => entity
    ? entity
      .remove()
      .then(() => res.status(204).end())
    : null

const handleEntityNotFound = (res) => entity => {
    if (!entity) {
      res.status(404).end()
      return null
    }
    return entity
  }

const handleError = (res, statusCode) => err => {
  statusCode = statusCode || 500
  return res.status(statusCode).send(err)
}

/**
 * Parse the query params safely
 */
const parseQueryParams = exports.parseQueryParams = (p) => {
  let returnValue
  try {
    returnValue = {}
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        returnValue[key] = JSON.parse(p[key]);
      }
    }
  }catch(e) {
    return 'invalid query params'
  }

  return returnValue
}

/**
 * Helper function for create
 */
const getIdsOrId = (objOrArr) =>
  (Array.isArray(objOrArr)) ? objOrArr.map(x => ({_id: x._id})) : {_id: objOrArr._id}

exports.index = Model => (req, res) => {
  const result = parseQueryParams(req.query)
  if (typeof result === 'string') return res.status(400).json(result)

  return ((result.count)
    ? Model.count(result.count)
    : (result.aggregate)
      ? Model.aggregate(result.aggregate)
      : Model.find(result.q))
    .limit(result.limit || 0)
    .select(result.select || false)
    .populate(result.populate || '')
    .exec()
    .then(respondWithResult(res, 200))
    .then(events.emitListed(Model.modelName, req))
    .catch(handleError(res, 500))
}

// Use _.zipWith to zip the client object with the ids
exports.create = Model => (req, res) =>
  Model.create(req.body)
    .then(getIdsOrId)
    .then(respondWithResult(res, 201))
    .then(events.emitCreated(Model.modelName, req))
    .catch(handleError(res))

// Gets a single entity from the DB
exports.show = Model => (req, res) =>
  Model.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res, 200))
    .then(events.emitDetailed(Model.modelName, req))
    .catch(handleError(res))

// Updates an existing entity in the DB
exports.update = Model => (req, res) => {
  if (req.body._id) {
    delete req.body._id
  }
  return Model.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithoutResult(res, 204))
    .then(events.emitUpdated(Model.modelName, req))
    .catch(handleError(res))
}

// Deletes an entity from the DB
exports.destroy = Model => (req, res) =>
  Model.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .then(events.emitDeleted(Model.modelName, req))
    .catch(handleError(res))