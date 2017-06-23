'use strict'

class MyQueue {
  constructor () {
    this._promises = []
    this._callbacks = []
    this._isClosed = false

    this._closePromise = new Promise((resolve, reject) => {
      this._closeCb = resolve
    })
  }

  _addPromise () {
    this._promises.push(new Promise((resolve, reject) => {
      this._callbacks.push({resolve, reject})
    }))
  }

  push (obj) {
    if (this._isClosed) {
      throw new Error('Cannot push to closed Queue')
    }
    if (this._callbacks.length === 0) {
      this._addPromise()
    }

    const callbackPair = this._callbacks.shift()
    callbackPair.resolve(obj)
  }

  shiftOne () {
    if (this._isClosed && this._promises.length === 0) {
      return Promise.reject('Queue is empty and closed')
    }
    if (this._promises.length === 0) {
      this._addPromise()
    }
    return this._promises.shift()
  }
  shift (n) {
    if (n == null) {
      return shiftOne()
    }
    const items = []
    for (let i = 0; i < n; ++i) {
      items.push(this.shiftOne())
    }
    return Promise.all(items)
  }
  shiftAll () {
    return this.shift(this._promises.length)
  }

  close () {
    if (this._isClosed) {
      throw new Error('Queue is already closed')
    }
    this._isClosed = true
    this._closeCb()

    for (const callbackPair of this._callbacks) {
      callbackPair.reject(new Error('Queue is empty and closed'))
    }
    this._callbacks.length = 0
  }
  isClosed () {
    return this._isClosed
  }
  untilClosed () {
    return this._closePromise
  }
}

module.exports = MyQueue
