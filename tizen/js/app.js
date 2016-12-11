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

/*global tizen, app, Config, Helpers, Model, Ui, Server, Client, window,
tau, console*/

/**
 * App class instance.
 *
 * @public
 * @type {App}
 */
var App = null;

(function strict() {
    'use strict';

    /**
     * Application constructor.
     * Creates a new application object.
     *
     * @public
     * @constructor
     */
    App = function App() {
        return;
    };

    App.prototype = {

        /**
         * List of required modules.
         *
         * @public
         * @type {string[]}
         */
        requires: ['js/app.config.js',
            'js/app.helpers.js',
            'js/app.model.js',
            'js/app.ui.js',
            'js/app.ui.templateManager.js',
            'js/app.ui.templateManager.modifiers.js',
            'js/app.ui.events.js',
            'js/app.client.js',
            'js/app.client.model.js',
            'js/app.server.js',
            'js/app.server.model.js'
        ],

        /**
         * Model object.
         *
         * @private
         * @type {Model}
         */
        model: null,

        /**
         * Ui object.
         *
         * @public
         * @type {Ui}
         */
        ui: null,

        /**
         * Config object.
         *
         * @public
         * @type {Config}
         */
        config: null,

        /**
         * Helpers object.
         *
         * @public
         * @type {Helpers}
         */
        helpers: null,

        /**
         * Client object.
         *
         * @public
         * @type {Client}
         */
        client: null,

        /**
         * Server object.
         *
         * @public
         * @type {Server}
         */
        server: null,

        /**
         * The client name or the server name which was set
         * during application start.
         *
         * @public
         * @type {string}
         */
        currentName: '',

        /**
         * Indicates whether special popup should be displayed on second device
         * in case of sudden application termination on first device.
         *
         * @private
         * @type {boolean}
         */
        doNotSendBye: false,

        /**
         * Indicates whether connection between two devices is established.
         *
         * @private
         * @type {boolean}
         */
        connection: false,

        /**
         * Initializes application.
         *
         * @public
         */
        init: function App_init() {
            this.config = new Config();
            this.helpers = new Helpers();
            this.model = new Model();
            this.ui = new Ui(this.initModel.bind(this));
        },

        /**
         * Initializes Model object.
         *
         * @private
         */
        initModel: function App_initModel() {
            this.model.init(this.checkPowerState.bind(this));
        },

        /**
         * Closes application.
         *
         * @private
         */
        exit: function App_exit() {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (error) {
                console.error(error);
            }
        },

        /**
         * Checks whether connection between two devices is established.
         *
         * @public
         * @returns {boolean}
         */
        isConnection: function App_isConnection() {
            return this.connection;
        },

        /**
         * Sets flag which indicates whether connection between two devices
         * is established.
         *
         * @public
         * @param {boolean} bool
         */
        setConnection: function App_setConnection(bool) {
            this.connection = bool;
        },

        /**
         * Returns flag which indicates whether special popup
         * should be displayed on second device in case of
         * sudden application termination on first device.
         *
         * @public
         * @returns {boolean}
         */
        getDoNotSendBye: function App_getDoNotSendBye() {
            return this.doNotSendBye;
        },

        /**
         * Sets flag which indicates whether special popup
         * should be displayed on second device in case of
         * sudden application termination on first device.
         *
         * @public
         * @param {boolean} doNotSendBye
         */
        setDoNotSendBye: function App_setDoNotSendBye(doNotSendBye) {
            this.doNotSendBye = doNotSendBye;
        },

        /**
         * Returns the client name or the server name
         * which was set during application start.
         *
         * @public
         * @returns {string}
         */
        getCurrentName: function App_getCurrentName() {
            return this.ui.escape(this.currentName);
        },

        /**
         * Returns application mode.
         *
         * @public
         * @returns {string}
         */
        getApplicationMode: function App_getApplicationMode() {
            var mode = 'start';

            if (this.client !== null) {
                mode = 'client';
            } else if (this.server !== null) {
                mode = 'server';
            }
            return mode;
        },

        /**
         * Resets application mode.
         *
         * @public
         */
        resetApplicationMode: function App_resetApplicationMode() {
            this.client = null;
            this.server = null;
        },

        /**
         * Checks Bluetooth device power state.
         * Depending on the state, shows proper buttons
         * on application start page.
         *
         * Calls 'setContentStartAttributes' app.ui.js function, which takes
         * 'checkPowerState' app.model.js function as parameter.
         *
         * @private
         */
        checkPowerState: function App_checkPowerState() {
            this.ui.setContentStartAttributes(
                this.model.checkPowerState.bind(
                    this.model,
                    this.ui.showPowerOnButton,
                    this.ui.showStartButtons
                )
            );
        },

        /**
         * Turns on the power of the Bluetooth device.
         *
         * Calls 'powerOn' app.model.js function, which takes
         * 'showStartButtons' app.ui.js function as parameter.
         *
         * @public
         */
        powerOn: function App_powerOn() {
            this.model.powerOn(this.ui.showStartButtons);
        },

        /**
         * Turns off the power of the Bluetooth device.
         *
         * Calls 'powerOff' app.model.js function,
         * which takes 'exit' app.js function as parameter.
         *
         * @public
         */
        powerOff: function App_powerOff() {
            this.model.powerOff(this.exit);
        },

        /**
         * Restarts Bluetooth device.
         *
         * Calls 'restartBluetooth' app.model.js function,
         * which takes 'powerOn' app.js function as parameter.
         *
         * @public
         */
        restartBluetooth: function App_restartBluetooth() {
            this.model.restartBluetooth(this.powerOn.bind(this));
        },

        /**
         * Initiates new server object
         * and calls 'showKeyboardPage' app.js function.
         *
         * @public
         */
        startServer: function App_startServer() {
            this.server = new Server(
                this.model.adapter,
                this.model.serviceUUID
            );
            this.showKeyboardPage();
        },

        /**
         * Initiates new client object
         * and calls 'showKeyboardPage' app.js function.
         *
         * @public
         */
        startClient: function App_startClient() {
            this.client = new Client(
                this.model.adapter,
                this.model.serviceUUID
            );
            this.showKeyboardPage();
        },

        /**
         * Shows popup message on client device
         * informing about lost connection to server device.
         *
         * Calls 'popup' app.ui.js function.
         *
         * @public
         */
        serverDisconnected: function App_serverDisconnected() {
            app.ui.popup('Lost connection to Server.',
                function onSeverDisconnectedPopupClose() {
                    window.history.back();
                }
            );
        },

        /**
         * Shows popup message on server device
         * informing about lost connection with client device.
         *
         * Calls 'popup' app.ui.js function.
         *
         * @public
         */
        clientDisconnected: function App_clientDisconnected() {
            app.ui.popup('Lost connection with Client.',
                function onClientDisconnectedPopupClose() {
                    app.ui.setHeaderType('server');
                }
            );
        },

        /**
         * Shows keyboard page.
         *
         * Calls 'showKeyboardPage' app.ui.js function.
         *
         * @private
         */
        showKeyboardPage: function App_showKeyboardPage() {
            this.ui.showKeyboardPage();
        },

        /**
         * Sets the client name or the server name given as a parameter.
         *
         * @public
         * @param {string} value
         */
        setUserName: function App_setUserName(value) {
            this.currentName = value;
        },

        /**
         * Sets Bluetooth device name.
         *
         * The name is identical to the client name or the server name
         * which was set during application start.
         *
         * @public
         */
        setAdapterName: function App_setAdapterName() {
            var changeName = false,
                mode = this.getApplicationMode();

            if (this.model.adapter.name !== this.currentName) {
                changeName = true;
            }
            if (mode === 'server') {
                this.model.setAdapterName(
                    changeName,
                    this.server.registerServer.bind(this.server)
                );
            } else if (mode === 'client') {
                this.model.setAdapterName(
                    changeName,
                    this.client.searchServer.bind(this.client)
                );
            }
        },

        /**
         * Checks and returns Bluetooth device visibility state.
         *
         * @public
         * @returns {boolean}
         */
        isBluetoothVisible: function App_isBluetoothVisible() {
            return this.model.adapter.visible;
        },

        /**
         * Removes all of the Bluetooth devices from list
         * displayed on choose page.
         *
         * Calls 'clearListOfServers' app.ui.js function.
         *
         * @public
         */
        clearListOfServers: function App_clearListOfServers() {
            this.ui.clearListOfServers();
        },

        /**
         * Adds new text fragment given as message parameter
         * to current chat conversation displayed on chat page.
         *
         * @private
         * @param {string} message
         */
        displaySentMessage: function App_displaySentMessage(message) {
            this.ui.displaySentMessage(message);
        },

        /**
         * Sends new message given as message parameter
         * (server to client or client to server).
         *
         * @public
         * @param {string} message
         */
        sendMessage: function App_sendMessage(message) {
            var mode = this.getApplicationMode();

            if (mode === 'server') {
                this.server.sendMessage(
                    message,
                    this.displaySentMessage.bind(this)
                );
            } else if (mode === 'client') {
                this.client.sendMessage(
                    message,
                    this.displaySentMessage.bind(this)
                );
            }
        },

        /**
         * Sends special message to second device in case of
         * sudden application termination on first device.
         *
         * @public
         */
        sendBye: function App_sendBye() {
            var mode = this.getApplicationMode();

            if (mode === 'server') {
                this.server.sendBye();
            } else if (mode === 'client') {
                this.client.sendBye();
            }
        },

        /**
         * Shows popup message on client or server device
         * informing about lost connection
         * due to power off of the Bluetooth device.
         *
         * Calls 'popup' app.ui.js function.
         *
         * @public
         */
        connectionLost: function App_connectionLost() {
            this.connection = false;
            this.ui.popup(
                'To continue please turn on Bluetooth.',
                function onConnectionLostPopupClose() {
                    this.checkPowerState();
                    tau.changePage('#start');
                }.bind(this)
            );
        }

    };

}());
