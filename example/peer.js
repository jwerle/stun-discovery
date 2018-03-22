'use strict'

const WebRTCSwarm = require('webrtc-swarm')
const signalhub = require('signalhub')
const wrtc = require('wrtc')

const port = 19302
const chan = 'stun-discovery'
const hub = signalhub(chan, ['https://signalhub.mafintosh.com'])
const swarm = WebRTCSwarm(hub, {
  config: { iceServers: [{urls:`stun:localhost:${port}`}] },
  wrtc,
})

swarm.on('peer', (peer, id) => {
  const value = Math.random()
  //alert(id)
  console.log('peer: %s', id, peer, value);
  peer.send(`hello ${value}\n`)
  peer.on('data', (data) => {
    console.log('peer: (%s) message:', id, Buffer.from(data).toString('utf8'), value);
  })
})
