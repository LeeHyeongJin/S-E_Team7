/*
 * Copyright (c) 2012 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global app, ServerModel, console*/

/**
 * Client class constructor.
 *
 * @public
 * @constructor
 * @param {BluetoothAdapter} adapter
 * @param {string} serviceUUID
 */
function Server(adapter, serviceUUID) {
    'use strict';

    this.adapter = adapter;
    this.serviceUUID = "00001101-0000-1000-8000-00805F9B34FB";
    this.init();
}

(function strict() {
    'use strict';

    Server.prototype = {
        /**
         * ServerModel object.
         *
         * @type {ServerModel}
         */
        model: null,

        /**
         * Default local Bluetooth adapter.
         *
         * @private
         * @type {BluetoothAdapter}
         */
        adapter: null,

        /**
         * Universal unique identifier of the Bluetooth service.
         *
         * @private
         * @type {string}
         */
        serviceUUID: null,

        /**
         * Bluetooth socket object.
         *
         * @private
         * @type {BluetoothSocket}
         */
        globalSocket: null,

        /**
         * Bluetooth service object.
         *
         * @private
         * @type {BluetoothServiceHandler}
         */
        globalRecordHandler: null,

        /**
         * Number of clients connected to the server.
         *
         * @public
         * @type {number}
         */
        numberOfClients: 0,

        /**
         * Initializes Server object.
         *
         * @public
         * @returns {Server}
         */
        init: function Server_init() {
            this.model = new ServerModel(this);
            return this;
        },

        /**
         * Returns number of connected clients.
         *
         * @public
         * @returns {number}
         */
        getNumberOfClients: function Server_getNumberOfClients() {
            return this.numberOfClients;
        },

        /**
         * Registers server.
         *
         * @public
         */
        registerServer: function Server_registerServer() {
            this.model.registerServer(
                this.adapter,
                this.serviceUUID,
                this.registerServerSuccess.bind(this)
            );
        },

        /**
         * Performs action on server's registration success.
         *
         * @private
         * @param {BluetoothServiceHandler} recordHandler
         */
        registerServerSuccess: function Server_registerServerSuccess(
            recordHandler
        ) {
            this.globalRecordHandler = recordHandler;
            recordHandler.onconnect = function onServerSocketConnect(socket) {
                this.numberOfClients += 1;
                this.globalSocket = socket;
                socket.onmessage = function onServerSocketMessage() {
                    var data = socket.readData(),
                        recvmsg = '',
                        i = 0,
                        len = data.length,
                        messageObj = null;

                    for (i = 0; i < len; i += 1) {
                        recvmsg += String.fromCharCode(data[i]);
                    }
                    messageObj = JSON.parse(recvmsg);
                    app.ui.displayReceivedMessage(
                        messageObj.name,
                        messageObj.text,
                        messageObj.ping,
                        messageObj.bye
                    );
                };
                socket.onerror = function onServerSocketError() {
                    console.error('Server onerror');
                    socket.close();
                };
                socket.onclose = function onServerSocketClose() {
                    this.globalSocket = null;
                    app.setConnection(false);
                    app.clientDisconnected();
                };
                app.setConnection(true);
            }.bind(this);
            app.ui.showChatPage();
        },

        /**
         * Unregisters server.
         *
         * @public
         */
        unregisterChatServer: function Server_unregisterChatServer() {
            this.model.unregisterChatServer(
                this.globalRecordHandler,
                this.unregisterChatServerSuccess.bind(this),
                this.unregisterChatServerError.bind(this),
                app.ui.showStartButtons
            );
        },

        /**
         * Performs action on server's unregistration success.
         *
         * @private
         */
        unregisterChatServerSuccess:
            function Server_unregisterChatServerSuccess() {
                this.globalRecordHandler = null;
                this.numberOfClients = 0;
                app.restartBluetooth();
            },

        /**
         * Performs action on server's unregistration error.
         *
         * @private
         */
        unregisterChatServerError: function Server_unregisterChatServerError() {
            console.error('Server_unregisterChatServerError');
            this.numberOfClients = 0;
            app.restartBluetooth();
        },

        /**
         * Sends message to client.
         *
         * @public
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function Server_sendMessage(message, callback) {
            this.model.sendMessage(
                this.adapter.name,
                this.globalSocket,
                message,
                callback
            );
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         *
         * @public
         */
        sendBye: function Server_sendBye() {
            this.model.sendBye(
                this.adapter.name,
                this.globalSocket
            );
        }

    };

}());
