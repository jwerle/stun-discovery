'use strict'

const { createMessage } = require('stun')
const { version } = require('./package')
const debug = require('debug')('stun-discovery:message')
const stun = require('stun')

const {
  STUN_BINDING_RESPONSE,

  STUN_ATTR_XOR_MAPPED_ADDRESS,
  STUN_ATTR_SOFTWARE,
  STUN_ATTR_REALM,
} = stun.constants

const isBrowser = true == process.browser || 'object' == typeof window

const DEFAULT_REALM = 'stun-discovery'

const DEFAULT_USER_AGENT = (
  `${isBrowser ? navigator.userAgent : `node/${process.version}`} ` +
  `stun-discovery/${version}`
)

class DiscoveryMessage {
  constructor({realm, userAgent, peer}) {
    const response = createMessage(STUN_BINDING_RESPONSE)
    const { address, port } = peer

    this.userAgent = userAgent || DEFAULT_USER_AGENT
    this.response = response
    this.realm = realm || DEFAULT_REALM
    this.peer = peer

    debug("DiscoveryMessage(): realm=%s peer=%s userAgent=%s",
      realm, peer, userAgent)

    response.addAttribute(STUN_ATTR_XOR_MAPPED_ADDRESS, address, port)
    response.addAttribute(STUN_ATTR_SOFTWARE, userAgent)
    response.addAttribute(STUN_ATTR_REALM, realm)
  }
}

module.exports = {
  DiscoveryMessage
}
