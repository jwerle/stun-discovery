'use strict'

const WebRTCSwarm = require('webrtc-swarm')

const discovery = require('../')

const port = 19302
const node = discovery()

node.bind(port, () => {
  const { port } = node.socket.address()
  console.log('Listening on port %d', port)
})

node.on('peer', (peer) => {
  console.log('peer: (%s) %s:%s', peer.id.toString('hex'), peer.address, peer.port);
})
