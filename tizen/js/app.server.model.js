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

/*global console */

/**
 * ServerModel class constructor.
 *
 * @public
 * @constructor
 * @param {Server} parent
 */
function ServerModel(parent) {
    'use strict';

    this.server = parent;
}

(function strict() {
    'use strict';
    ServerModel.prototype = {

        /**
         * Server object.
         *
         * @private
         * @type {Server}
         */
        server: null,

        /**
         * Registers server.
         *
         * @public
         * @param {BluetoothAdapter} adapter
         * @param {string} serviceUUID
         * @param {function} callback
         */
        registerServer: function ServerModel_registerServer(
            adapter,
            serviceUUID,
            callback
        ) {
            if (this.server.getNumberOfClients() === 0) {
                try {
                    adapter.registerRFCOMMServiceByUUID(
                        serviceUUID,
                        'Chat service',
                        callback,
                        function onregisterRFCOMMServiceError(error) {
                            console.error(error.message);
                        }
                    );
                } catch (error) {
                    console.error(error.message);
                }
            }
        },

        /**
         * Unregisters server.
         *
         * @public
         * @param {BluetoothServiceHandler} globalRecordHandler
         * @param {function} successCallback
         * @param {function} errorCallback
         * @param {function} showButtonsCallback
         */
        unregisterChatServer: function ServerModel_unregisterChatServer(
            globalRecordHandler,
            successCallback,
            errorCallback,
            showButtonsCallback
        ) {
            try {
                if (globalRecordHandler !== null) {
                    globalRecordHandler.unregister(
                        successCallback,
                        errorCallback
                    );
                } else {
                    showButtonsCallback();
                }
            } catch (error) {
                errorCallback();
            }
        },

        /**
         * Sends message to client.
         *
         * @public
         * @param {string} name
         * @param {BluetoothSocket} socket
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function ServerModel_sendMessage(
            name,
            socket,
            message,
            callback
        ) {
            var sendTextMsg = [],
                messageObj = {
                    name: encodeURIComponent(name),
                    text: encodeURIComponent(message),
                    ping: false,
                    bye: false
                },
                messageObjToString = JSON.stringify(messageObj),
                i = 0,
                len = messageObjToString.length;

            for (i = 0; i < len; i += 1) {
                sendTextMsg[i] = messageObjToString.charCodeAt(i);
            }
            try {
                if (socket !== null && socket.state === 'OPEN') {
                    socket.writeData(sendTextMsg);
                    callback(message);
                }
            } catch (error) {
                console.error('sendMessage: ' + error.message);
            }
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         *
         * @public
         * @param {string} name
         * @param {BluetoothSocket} socket
         */
        sendBye: function ServerModel_sendBye(name, socket) {
            var sendTextMsg = [],
                messageObj = {
                    name: encodeURIComponent(name),
                    text: '',
                    ping: false,
                    bye: true
                },
                messageObjToString = JSON.stringify(messageObj),
                i = 0,
                len = messageObjToString.length;

            for (i = 0; i < len; i += 1) {
                sendTextMsg[i] = messageObjToString.charCodeAt(i);
            }
            try {
                if (socket !== null && socket.state === 'OPEN') {
                    socket.writeData(sendTextMsg);
                }
            } catch (error) {
                console.error('sendBye: ' + error.message);
            }
        }

    };

}());
