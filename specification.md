# NetFlux Protocol 2

```
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
   "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this
   document are to be interpreted as described in [RFC2119].
```

## Notes
* WebChannel ID and user ID are big random strings made up by the software, you do not get to select them (they might in some implementations by cryptographic keys).
* All events must accept event handlers as per nodejs, e.g. object.on('eventName', function () { })
* The NetFlux connect() functions are not part of the API, they can have any amount of requirements or options that the implementor wishes. All NetFlux connect() functions MUST return a Promise<Network>.
* In the future we may wish to allow sending of Uint8Array instead of string to allow cryptography without base64 overhead.

Example NetFlux connect() functions:
```
WebSocketNetFlux.connect()

WebRTCNetFlux.connect(signalingServer: String, topology: <"STAR"|"FULLY_CONNECTED"|RTCWebChannelManager>)

HybredNetFlux.connect()

FakeNetFlux.connect()  -> Create a valid Network object but without any connection, for automated testing
```


## Network
Network is generic in that the same software can accept a FakeNetFlux Network for testing and then accept a WebSocketNetFlux Network
when being used in production and allows for changing to HybredNetFlux or other types of Network without changing any code.

### Network Properties

#### webChannels: Array<WebChannel>
The list of channels which we are currently a member of.

### Network Functions

#### Network.join(id: String optional, options: Object) -> returns Promise<WebChannel>
If you want to create a new channel, join with no id passed, if you pass an invalid string id, it MAY fail.
Options is an OPTIONAL parameter which is specific to the type of Netflux Network which is in use.

#### Network.sendto(peerId: string, content: string) -> returns Promise<nothing>
Promise resolves when it is believed that the message has been delivered.

#### Network.getLag() -> return Number
Get the estimated number of milliseconds to reach either "the server" or the majority of the connected swarm.
This is an *estimate*, in peer to peer scenarios we cannot be sure but it is important that the number grows if the user's internet connection is lost.

### Network Events:

#### message -> messageContent: string, messageSource: string
When you have received a direct "private" message sent to you from a node in the Network.
messageSource is a peer ID.

#### disconnect -> reason: string
When you have become disconnected from the Network.
In a peer to peer scenario this would mean that you have lost connection to all of your peers.


## WebChannel

### WebChannel properties

#### WebChannel.id: string
opaque string, maybe encryption key, used for `Network.join()`

#### WebChannel.members: Array<string>
List of the peer IDs of the members of the channel

### WebChannel functions

#### WebChannel.bcast(content: string) -> Promise<nothing>
Promise returns when it is believed that the message has been received (meaning if you disconnect your internet, it will not be lost).

#### WebChannel.leave(reason: string)

### WebChannel events

#### message -> messageContent: string, messageSource: string
Called when a person in the channel has called bcast() on that channel.

#### join -> peerId: string

#### leave -> peerId: string, reason: string
Called when a person leaves the channel or disconnects.
