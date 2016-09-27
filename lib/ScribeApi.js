'use strict'
require('');

class ScribeApi {
      constructor (bits) {
        var key = super(new Uint32Array(Math.ceil(Size / 32)))
        bits = typeof bits === 'undefined' ? 0 : bits
        if (bits === 0) {
          key.fill(0)
        } else if (bits === 1) {
          // Fill in every bit
          for (var i = 0; i < Bits.length; i++) {
            if (Bits[i]) {
              var j = Math.floor(i / 32)
              key[j] = key[j] | 0x1 << i % 32
            }
          }
        } else if (Array.isArray(bits)) {
          bits.forEach(function (n) {
            if (Number.isInteger(BitNum[n])) {
              var b = BitNum[n]
              var i = Math.floor(b / 32)
              var j = b % 32
              key[i] = key[i] | 0x1 << j
            }
          })
        } else if (bits.constructor.name === 'Key') {
          for (var i = 0; i < key.length; i++) {
            key[i] = bits[i]
          }
        } else if (typeof bits === 'object') {
          Object.keys(bits).forEach(function (n) {
            if (Number.isInteger(BitNum[n])) {
              var b = BitNum[n]
              var i = Math.floor(b / 32)
              var j = b % 32
              if (bits[n]) {
                key[i] = key[i] | 0x1 << j
              } else {
                key[i] = key[i] & (0xFFFFFFFF ^ (0x1 << j))
              }
            }
          })
        }
        return key
      }
      bits () {
        var key = this
        var bits = {}
        for (var i = 0; i < key.length; i++) {
          for (var k = 0; k < 32; k++) {
            if (key[i] & 0x1 << k) {
              if (Bits[i * 32 + k]) {
                bits[Bits[i * 32 + k]] = 1
              }
            }
          }

      }
        return bits
      }
      isZero () {
        var key = this
        for (var i = 0; i != key.length; i++) {
          if (key[i] !== 0) return false
        }
        return true
      }
      // This checks equality of buffers
      isEqual (bv2) {
        var key = this
        if (key.length != bv2.length) return false
        var dv2 = new UInt32Array(bv2)
        for (var i = 0; i < this.length; i++) {
          if (key[i] != dv2[i]) return false
        }
        return true
      }
// This checks the distance from one key to another
      distance (bv2) {
          var key = this
	  var distance=0
        if (key.length != bv2.length) return key.length
        var dv2 = new UInt32Array(bv2)
        for (var i = 0; i < key.length; i++) {
          if (key[i] != dv2[i]) distance++
        }
        return distance
      }

	}
