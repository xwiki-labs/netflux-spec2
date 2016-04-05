# Netflux Websocket Server protocol

## Messages format

Messages exchanged between the server and the users are represented by a stringified JavaScript Array. There are different types of messages :

* At startup :
    * **IDENT** : Identification with user ID sent by the server at startup
* Command messages :
    * **JOIN** : Message sent to the server when a client wants to join a channel
    * **LEAVE** : Message sent to the server when a client wants to leave a channel
    * **PING** : Messages sent to the server to check if the client is still connected
    * **MSG** : Message with content exchanged between two clients or broadcasted in a channel
* Reply messages :
    * **ACK** : Acknowledgement sent by the server when receiving a command to notify that it is being processed
    * **ERROR** : Message sent by the server to notify the client that his command is invalid

The messages sent to the server also have a sequence number, this number can be anything you want and it will be reflected back to you. All the messages sent by the server have have a sequence number equals to 0. If you send a message with sequence number equal to 0, your reply will have sequence number 0 but that is silly because then you cannot detect that it is not a notification.

## Client->Server message types:

Here is the structure of each message depending of its type :

### **JOIN**

Client > server : [Seq, "JOIN", Channel_name]

__Note__ : When a new client is joining a channel, he receives a JOIN message for each of the clients that are connected to that channel. When that client sees his own username, it means the list is over.

### **LEAVE**

Client > server : [Seq, "LEAVE", Channel_name]

### **PING**

Client > server : [0,"PING", Current_date]

### **MSG**

Client > server : [Seq, "MSG", Recipient, Content]

__Note__ : *Recipient* can be another client or a channel

## Server->Client response messages:

All Server->Client response messages begin with the sequence number which corresponds to the clients's request.

[Seq, <message_type>, ...]

### **ACK**

This message is a possible response to JOIN, LEAVE, MSG, and PING

Server > client : [Seq, "ACK", Ack_content]

__Note__ : *Ack_content* depends on the type of message. It can be an empty string (MSG), a channel name (JOIN, LEAVE) or a date (PING).

### **ERROR**

This message is a possible response to JOIN, LEAVE, MSG

Server > client : [Seq, "ERROR", Error_type, Recipient]

Possible error types :
* **ENOENT** : Invalid channel name (JOIN or LEAVE messages) or non-existing recipient (MSG messages)
* **EINVAL** : Missing channel name (LEAVE messages)
* **NOT_IN_CHAN** : Trying to leave a channel to which we are not connected (LEAVE messages)

## Server->Client event notification messages:

All server->client event notification messages begin with 0 and the source of the message. If the source is the server itself then the source string is empty. **TODO**: The source is not sent for messages originating from the server, fix

[0, <source>, <message_type>, ...]

### **IDENT**

Sent as soon as the client connects, the server issues the client a unique ID :

Server > client : [0, "", "IDENT", User_ID]

### **JOIN**

Notification of a user having joined a channel which you are in :

Server > channel (broadcast) : [0, Joining_user_ID, "JOIN", Channel_name]

### **LEAVE**

Notification of a user having left a channel which you are in :

Server > channel (broadcast) : [0, Leaving_user_ID, "LEAVE", Channel_name, Leaving_message]

### **MSG**

Messages sent by users in a channel are forwarded to the recipients by the server. Messages can also be sent by the server when a user asks for the history of the channel.

Server > Recipient (history / forward) : [0, Sender, "MSG", Recipient, Content]

__Note__ : *Recipient* can be another client or a channel. *Sender* can be a client ID or the ID of the History Keeper. The sender won't receive a copy of his message in the channel.

## History keeper

When a user joins a channel, you may want him to get all messages previsouly broadcasted to that channel. To do so, you can ask the history to a fake client (16 random hexadecimal characters) by sending to the server :

Client > server [Seq, "MSG", "History_Keeper_Name", "[\"GET_HISTORY\", Channel_name]"]

The server will reply by sending to that client all the messages in the right order, as if they had just been sent, and a "0" message when the history is fully sent :

Server > Client : [0, "History_Keeper_Name", "MSG", Client_ID, Stringified_Message ]
Server > Client (completed) : [0, "History_Keeper_Name", "MSG", Client_ID, 0 ]

## Example of exchanged messages

*A client is connecting to the websocket server, he is given the ID "ClientC" by the server*

* Server > client : [0,"","IDENT","ClientC"]

*"ClientC" tries to join the channel "Channel1" (existing or new channel). The server replies with the list of users connected to that channel (in the order of first connection) :*

* ClientC > server : [1,"JOIN","Channel1"]
* Server > ClientC : [1,"ACK"]
* Server > ClientC : [0,"af54e849ec64db86","JOIN","Channel1"] (*af54e849ec64db86* is the history keeper here)
* Server > ClientC : [0,"ClientA","JOIN","Channel1"]
* Server > ClientC : [0,"ClientB","JOIN","Channel1"]
* Server > ClientC : [0,"ClientC","JOIN","Channel1"]

*"ClientC" asks for the history of the channel. The server will send all the messages in the right order and will then send a "0" message to notify that the history is complete :*

* ClientC > server : [2,"MSG","af54e849ec64db86","[\"GET_HISTORY\",\"Channel1\"]"]
* Server > ClientC : [2,"ACK"]
* Server > ClientC : [0,"af54e849ec64db86","MSG","ClientC","[0,\"ClientA\",\"MSG\",\"Channel1\",\"Hello world!\"]" ]
* Server > ClientC : [0,"af54e849ec64db86","MSG","ClientC","[0,\"ClientB\",\"MSG\",\"Channel1\",\"Hello ClientA!\"]" ]
* Server > ClientC : [0,"af54e849ec64db86","MSG","ClientC",0]

*"ClientC" will now regurlarly send "PING" messages to check the connectivity. The server will reply with a "PONG" :*

* ClientC > server : [0,"PING",1459763610521]
* Server > ClientC : [0,"ACK",1459763610521]