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

/*jslint plusplus: true, sloppy: true, todo: true, vars: true,
 browser: true, devel: true */
/*global app, ClientModel */

/**
 * Client class constructor.
 *
 * @public
 * @constructor
 * @param {BluetoothAdapter} adapter
 * @param {string} serviceUUID
 */
function Client(adapter, serviceUUID) {
    'use strict';

    this.adapter = adapter;
    this.serviceUUID = "00001101-0000-1000-8000-00805F9B34FB";
    this.init();
}

function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}

(function strict() {
    'use strict';

    Client.prototype = {

        /**
         * ClientModel object.
         *
         * @private
         * @type {ClientModel}
         */
        model: null,

        /**
         * Default local Bluetooth adapter.
         *
         * @public
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
         * Flag that indicates whether the device discovery process
         * is in progress.
         *
         * @private
         * @type {boolean}
         */
        discovering: false,

        /**
         * Remote Bluetooth device.
         *
         * @public
         * @type {BluetoothDevice}
         */
        chatServerDevice: null,

        /**
         * Initializes Client object and returns it.
         *
         * @public
         * @returns {Client}
         */
        init: function Client_init() {
            this.model = new ClientModel(this);
            return this;
        },

        /**
         * Sets discovering flag.
         *
         * @public
         * @param {boolean} discoveringInProgress
         */
        setDiscovering: function Client_setDiscovering(discoveringInProgress) {
            this.discovering = discoveringInProgress;
            app.ui.setDiscoveringProgress(discoveringInProgress);
        },

        /**
         * Returns discovering flag.
         *
         * @public
         * @returns {boolean}
         */
        getDiscovering: function Client_getDiscovering() {
            return this.discovering;
        },

        /**
         * Starts server searching.
         *
         * @public
         */
        searchServer: function Client_searchServer() {
            this.model.searchServer();
        },

        /**
         * Adds device to device list.
         *
         * @public
         * @param {BluetoothDevice} device
         */
        addDeviceToList: function Client_addDeviceToList(device) {
            app.ui.addDeviceToList(device);
        },

        /**
         * Stops server searching.
         *
         * @public
         * @param {string} address
         */
        stopServerSearching: function Client_stopServerSearching(address) {
            if (address !== undefined) {
                this.model.stopServerSearching(
                    this.startBonding.bind(
                        this,
                        address,
                        this.connectToService.bind(this)
                    )
                );
            } else {
                this.model.stopServerSearching();
            }
        },

        /**
         * Creates bonding.
         *
         * @private
         * @param {string} address
         * @param {function} callback
         */
        startBonding: function Client_startBonding(address, callback) {
            this.model.startBonding(address, callback);
        },

        /**
         * Connects to a specified service identified by UUID on this device.
         *
         * @private
         * @param {BluetoothDevice} device
         */
        connectToService: function Client_connectToService(device) {
            this.model.connectToService(
                device,
                this.serviceUUID,
                this.connectToServiceSuccess.bind(this, device),
                this.connectToServiceError.bind(this)
            );
        },

        /**
         * Performs action on connect to service success.
         *
         * @private
         * @param {BluetoothDevice} device
         * @param {BluetoothSocket} socket
         */
        connectToServiceSuccess:
            function Client_connectToServiceSuccess(device, socket) {
                this.globalSocket = socket;
                
                socket.onmessage = function onSocketMessage() {
                	
                    var data = null,
                        recvmsg = '',
                        i = 0,
                        len = 0,
                        messageObj = null;

                    data = socket.readData();
                    len = data.length;
                    
                    for (i = 0; i < len; i += 1) {
                    	
                        recvmsg += String.fromCharCode(data[i]);
                        
                    }
                    if(recvmsg[0] == '@'){

                        
                        if(recvmsg[1] == '1'){
                        	console.log("st111111111");//                        	
                        	var theUrl3="http://52.78.205.229/make-stat.php?pwr=1";
                        	var xmlHttp = new XMLHttpRequest();
                        	xmlHttp.onreadystatechange = function() { 
                                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                                    callback(xmlHttp.responseText);
                            }
                        	xmlHttp.open("GET", theUrl3,true);
                        	xmlHttp.send(null);
                        	
                        } else if(recvmsg[1] == '0'){
                        	console.log("st22222222");                        	
                        	var theUrl3="http://52.78.205.229/make-stat.php?pwr=0";
                        	var xmlHttp = new XMLHttpRequest();
                        	xmlHttp.onreadystatechange = function() { 
                                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                                    callback(xmlHttp.responseText);
                            }
                        	xmlHttp.open("GET", theUrl3,true);
                        	xmlHttp.send(null);
                        }
                    }
                        
                    	
//                    	$('#chat-header-name').html(app.getCurrentName());
//                    }
//                    messageObj = JSON.parse(recvmsg);
//                    else{
//                    	delay(5);
//                    sleep(1000);
                    app.ui.displayReceivedMessage(
                    		recvmsg
//                        messageObj.name,
//                        messageObj.text,
//                        messageObj.ping,
//                        messageObj.bye
                    );
                    
                };
                socket.onerror = function onSocketError() {
                    console.error('Client onerror');
                    socket.close();
                };
                socket.onclose = function onSocketClose() {
                    this.globalSocket = null;
                    app.setConnection(false);
                    app.serverDisconnected();
                };
                app.setConnection(true);
                app.ui.showChatPage(device.name);
                this.sendPing();
            },

        /**
         * Performs action on connect to service error.
         *
         * @private
         * @param {WebAPIError} error
         */
        connectToServiceError: function Client_connectToServiceError(error) {
            console.error('Client_connectToServiceError: ' + error.message);
        },

        /**
         * Sends to server special handshake message, which contain client name.
         *
         * @private
         */
        sendPing: function Client_sendPing() {
            this.model.sendPing(this.adapter.name, this.globalSocket);
        },

        /**
         * Sends message to server.
         *
         * @public
         * @param {string} message
         * @param {function} callback
         */
        sendMessage: function Client_sendMessage(message, callback) {
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
        sendBye: function Client_sendBye() {
            this.model.sendBye(this.adapter.name, this.globalSocket);
        },

        /**
         * Destroys the bond with a remote device.
         * Method initiates the process of removing the specified address
         * from the list of bonded devices.
         *
         * @public
         */
        destroyBonding: function Client_destroyBonding() {
            this.model.destroyBonding(
                this.chatServerDevice,
                app.restartBluetooth.bind(app),
                app.ui.showStartButtons
            );
        }

    };
    /////


}());
