const _ = require('lodash')
const events = require('./events')

/**
 * Helper functions to handle response
 */
const respondWithResult = (res, statusCode, getAttr) => entity => {
  res.status(statusCode).json(getAttr ? entity[getAttr] : entity)

  return entity
}

const respondWithoutResult = (res, statusCode) => () => {
  res.status(statusCode).end()

  return
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

const omitResponse = (omitAttr, req) => data => {
  if (!omitAttr) return data

  if (Array.isArray(data)) return data.map(x => _.omit(
    (!req.query.lean ? x.toObject() : x),
    omitAttr,
  ))

  return _.omit((!req.query.lean ? x.toObject() : x), omitAttr)
}

/**
 * Helper function for create
 */
const getIdsOrId = objOrArr => ({
  ids: Array.isArray(objOrArr)
    ? objOrArr.map(x => ({ _id: x._id }))
    : { _id: objOrArr._id },
  data: objOrArr,
})

exports.index = (Model, omitAttr) => (req, res, next) =>
  ((req.query.count)
    ? Model.count(req.query.count)
    : (req.query.aggregate)
      ? Model.aggregate(req.query.aggregate)
      : Model.find(req.query.q))
    .skip(req.query.skip || 0)
    .limit(req.query.limit || 0)
    .select(req.query.select || false)
    .populate(req.query.populate || '')
    .lean(!!req.query.lean)
    .sort(req.query.sort || {})
    .exec()
    .then(omitResponse(omitAttr, req))
    .then(respondWithResult(res, 200))
    .then(events.emitListed(Model.modelName, req))
    .catch(handleError(res, 500))

// Use _.zipWith to zip the client object with the ids
exports.create = Model => (req, res) =>
  Model.create(req.body)
    .then(getIdsOrId)
    .then(respondWithResult(res, 201, 'ids'))
    .then(events.emitCreated(Model.modelName, req))
    .catch(handleError(res))

// Gets a single entity from the DB
exports.show = (Model, omitAttr) => (req, res) =>
  Model.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(omitResponse(omitAttr))
    .then(respondWithResult(res, 200))
    .then(events.emitDetailed(Model.modelName, req))
    .catch(handleError(res))

// Updates an existing entity in the DB
exports.update = Model => (req, res) => {
  if (req.body._id) {
    delete req.body._id
  }

  return Model.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec()
    .then(handleEntityNotFound(res))

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

// Deletes entities from the DB
exports.destroyBatch = Model => (req, res) =>
  Model.deleteMany({ _id: { $in: req.body } }).exec()
    .then(respondWithoutResult(res, 204))
    .then(events.emitDeleted(Model.modelName, req))
    .catch(handleError(res))
