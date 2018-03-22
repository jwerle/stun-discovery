'use strict'

const { DiscoveryMessage } = require('./message')
const { createServer } = require('stun')
const { createSocket } = require('dgram')
const { EventEmitter } = require('events')
const { Peer } = require('./peer')
const debug = require('debug')('stun-discovery')
const stun = require('stun')

const {
  STUN_ATTR_XOR_MAPPED_ADDRESS,
  STUN_BINDING_RESPONSE,
  STUN_ATTR_SOFTWARE,
  STUN_ATTR_REALM,
} = stun.constants

const isBrowser = true == process.browser || 'object' == typeof window

class DiscoveryServer extends EventEmitter {
  constructor(opts) {
    void super().setMaxListeners(Infinity)
    if (!opts || 'object' != typeof opts) {
      opts = {}
    }

    Object.assign(opts, { }, opts)

    this.onerror = this.onerror.bind(this)
    this.onrequest = this.onrequest.bind(this)
    this.onresponse = this.onresponse.bind(this)

    this.userAgent = opts.userAgent || null
    this.realm = opts.realm || null

    if (false == isBrowser) {
      this.socket = createSocket('udp4')
      this.stun = createServer(this.socket)
      this.stun.on('error', this.onerror)
      this.stun.on('bindingRequest', this.onrequest)
      this.stun.on('bindingResponse', this.onresponse)
      this.socket.on('error', this.onerror)
    }
  }

  onrequest(req, conn) {
    const { realm, userAgent } = this
    const peer = new Peer({
      realm,
      server: this,
      port: conn.port,
      family: conn.family,
      address: conn.address,
    })

    this.emit('request', req)
    this.emit('connection', conn)
    this.emit('peer', peer, req, conn)

    peer.bind((err, res) => {
      if (err) {
        debug('peer: bind: error:', err, res)
        this.emit('error', err)
      }
    })
  }

  onresponse(res) {
    this.emit('response', ers)
  }

  onerror(err) {
    debug('DiscoveryServer: error:', err)
    this.emit('error', err)
  }

  listen(port, cb) {
    return this.bind(port, cb).once('bind', () => this.emit('unlisten'))
  }

  unlisten(cb) {
    return this.unbind(cb).once('unbind', () => this.emit('unlisten'))
  }

  close(cb) {
    return this.unbind(cb)
  }

  bind(port, cb) {
    if ('function' == typeof port) {
      cb = port
      port = 0
    }

    this.socket.bind(port, () => {
      if ('function' == typeof cb) { cb() }
      this.emit('bind')
    })

    return this
  }

  unbind(cb) {
    process.nextTick(() => this.stun.close())
    this.stun.once('close', () => this.socket.close(() => {
      this.socket = null
      this.stun = null
      if ('function' == typeof cb) { cb() }
      this.emit('unbind')
      this.emit('close')
    }))
    return this
  }
}

function createDiscoveryServer(opts) {
  return new DiscoveryServer(opts)
}

function createDiscoveryMessage(opts) {
  return new DiscoveryMessage(opts)
}

module.exports = Object.assign(createDiscoveryServer, {
  createDiscoveryMessage,
  createDiscoveryServer,
  DiscoveryMessage,
  DiscoveryServer,
  Peer,
})
