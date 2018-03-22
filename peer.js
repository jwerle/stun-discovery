'use strict'

const { DiscoveryMessage } = require('./message')
const randombytes = require('randombytes')
const debug = require('debug')('stun-discovery:peer')
const util = require('util')

const PEER_ID_BYTE_COUNT = 4

class Peer {
  static id() { return randombytes(PEER_ID_BYTE_COUNT).slice(0, 7) }

  constructor(opts) {
    if (!opts || 'object' != typeof opts) {
      opts = {}
    }

    // set default options
    Object.assign(opts, { allowHalfOpen: false }, opts)

    this.server = opts.server || null
    this.userAgent = opts.userAgent || null

    this.id = Peer.id()
    this.port = opts.port || null
    this.realm = opts.realm || null
    this.family = opts.family || null
    this.address = opts.address || null
  }

  debug() {
    const pre = `[${this.id}]`
    return debug.apply(debug, concat(pre, arguments))
  }

  toJSON() {
    return {
      id: this.id,
      port: this.port,
      realm: this.realm,
      family: this.family,
      address: this.address,
    }
  }

  valueOf() {
    return this.toJSON()
  }

  inspect() {
    return this.toJSON()
  }

  [util.inspect.custom]() {
    return this.inspect()
  }

  bind(cb) {
    const msg = new DiscoveryMessage({
      peer: this,
      realm: this.realm,
      userAgent: this.userAgent
    })

    if (this.server && this.server.stun) {
      this.server.stun.send(msg.response, this.port, this.address, cb)
    } else {
      if ('function' == typeof cb) {
        cb(null)
      }
    }
  }
}

function concat() {
  return Array.prototype.concat.apply([], slice(arguments))
}

function slice() {
  return Array.prototype.slice.apply(arguments)
}

module.exports = {
  Peer
}
