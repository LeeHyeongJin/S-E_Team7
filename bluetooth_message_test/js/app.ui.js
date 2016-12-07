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

/*global $, app, UiEvents, TemplateManager, document, window, setTimeout, tau*/

/**
 * Ui class constructor.
 *
 * @public
 * @constructor
 * @param {function} callback
 */
function Ui(callback) {
    'use strict';

    this.init(callback);
}

(function strict() {
    'use strict';
    Ui.prototype = {

        /**
         * Template manager object.
         *
         * @private
         * @type {TemplateManager}
         */
        templateManager: null,

        /**
         * Object for Ui events.
         *
         * @private
         * @type {UiEvents}
         */
        uiEvents: null,

        /**
         * Timeout for chat scroll.
         *
         * @public
         * @type {number}
         */
        scrolltimeout: null,

        /**
         * Initializes Ui object.
         *
         * @public
         * @param {function} callback
         */
        init: function Ui_init(callback) {
            this.templateManager = new TemplateManager();
            this.uiEvents = new UiEvents(this);

            $(document).ready(this.domInit.bind(this, callback));
        },

        /**
         * Performs additional initialization operations,
         * which are dependent on whether the DOM is ready.
         *
         * @private
         * @param {function} callback
         */
        domInit: function Ui_domInit(callback) {
            var templates = [
                'keyboard_page',
                'chat_page',
                'choose_page',
                'server_row',
                'left_bubble',
                'right_bubble',
                'bye_popup',
                'message_popup'
            ];

            this.templateManager.loadToCache(
                templates,
                this.initPages.bind(this, callback)
            );
        },

        /**
         * Initializes application pages stored in templates.
         *
         * @private
         * @param {function} callback
         */
        initPages: function Ui_initPages(callback) {
            var pages = [],
                body = $('body');

            body.append(this.templateManager.get('bye_popup'))
                .append(this.templateManager.get('message_popup'))
                .trigger('create');

            pages.push(this.templateManager.get('keyboard_page'));
            pages.push(this.templateManager.get('chat_page'));
            pages.push(this.templateManager.get('choose_page'));
            body.append(pages.join(''));

            this.uiEvents.init();
            callback();
        },

        /**
         * Calculates CSS parameters for content of the start page.
         *
         * @public
         * @param {function} callback
         */
        setContentStartAttributes: function Ui_setContentStartAttributes(
            callback
        ) {
            var contentStart = $('#start-content'),
                contentStartHeight = null;

            if (contentStart.height() > $(window).height()) {
                contentStartHeight =
                    $(window).height() -
                    $('#start-header').height() -
                    parseInt(contentStart.css('padding-top'), 10) -
                    parseInt(contentStart.css('padding-bottom'), 10);
            } else {
                contentStartHeight = contentStart.height();
            }
            setTimeout(function startPageAttributesSetTimeout() {
                contentStart
                    .css('height', contentStartHeight  + 'px')
                    .css('min-height', 'auto')
                    .css('width', contentStart.width() + 'px');
                $('#start').css('min-height', 'auto');
                callback();
            }, 0);
        },

        /**
         * Shows chat page.
         *
         * @public
         * @param {string} serverName
         */
        showChatPage: function Ui_showChatPage(serverName) {
            if (serverName !== undefined) {
                serverName = this.escape(serverName);
                $('#chat').data('serverName', serverName);
            }
            tau.changePage('#chat');
        },

        /**
         * Shows keyboard page.
         *
         * @public
         */
        showKeyboardPage: function Ui_showKeyboardPage() {
            tau.changePage('#keyboard');
        },

        /**
         * Removes all content from chat content list.
         *
         * @public
         */
        clearChatDialog: function Ui_clearChatDialog() {
            $('#chat-content .ui-listview').empty();
        },

        /**
         * Shows power on button.
         *
         * @public
         */
        showPowerOnButton: function Ui_showPowerOnButton() {
            $('#start-monit').hide();
            $('#serverButton').hide();
            $('#clientButton').hide();
            $('#turnOnButton').show();
        },

        /**
         * Shows start buttons.
         *
         * @public
         */
        showStartButtons: function Ui_showStartButtons() {
            $('#start-monit').hide();
            $('#turnOnButton').hide();
            $('#serverButton').show();
            $('#clientButton').show();
        },

        /**
         * Hides start buttons.
         *
         * @public
         */
        hideStartButtons: function Ui_hideStartButtons() {
            $('#serverButton').hide();
            $('#clientButton').hide();
            $('#turnOnButton').hide();
            $('#start-monit').show();
        },

        /**
         * Adds new device to devices list on choose page.
         *
         * @public
         * @param {BluetoothDevice} device
         */
        addDeviceToList: function Ui_addDeviceToList(device) {
            var ul = $('#choose-content ul.ui-listview');

            ul.append(this.templateManager.get('server_row', {
                'deviceAddress': device.address,
                'deviceName': device.name
            }));
            ul.listview('refresh');
        },

        /**
         * Removes all devices from devices list on choose page.
         *
         * @public
         */
        clearListOfServers: function Ui_clearListOfServers() {
            $('#choose-content ul.ui-listview').empty();
        },

        /**
         * Shows bye popup.
         *
         * @private
         * @param {string} name
         */
        showByePopup: function Ui_showByePopup(name) {
            var mode = app.getApplicationMode(),
                message = $('#byeMessage');

            if (mode === 'server') {
                message.html(
                    'Client name "' +
                        this.escape(name) +
                        '" is unavailable.\n' +
                        'Your Bluetooth device will be automatically restarted.'
                );
            } else if (mode === 'client') {
                message.html(
                    'Server name "' +
                        this.escape(name) +
                        '" is unavailable.\n' +
                        'Your Bluetooth device will be automatically restarted.'
                );
            }
            $('#byePopup').popup('open', {'positionTo': 'window'});
        },

        /**
         * Hides bye popup.
         *
         * @public
         */
        hideByePopup: function Ui_hideByePopup() {
            $('#byePopup').popup('close');
        },

        /**
         * Shows popup message with text given by message parameter.
         *
         * @public
         * @param {string} message
         * @param {function} [onClose]
         */
        showMessagePopup: function Ui_showMessagePopup(message, onClose) {
            var messagePopup = $('#messagePopup');

            messagePopup.find('.ui-popup-text').text(message);
            messagePopup.popup('open', {'positionTo': 'window'});
            if (typeof onClose === 'function') {
                messagePopup.on('popupafterclose', onClose);
            }
        },

        /**
         * Hides popup message.
         *
         * @public
         */
        hideMessagePopup: function Ui_hideMessagePopup() {
            $('#messagePopup').popup('close');
        },

        /**
         * Performs action when new message has been received.
         *
         * @param {string} name
         * @param {string} text
         * @param {boolean} ping
         * @param {boolean} bye
         */
        displayReceivedMessage: function Ui_displayReceivedMessage(
        		rcvmsg
//            name,
//            text,
//            ping,
//            bye
        ) {
            var ul = $('#chat-content > .ui-scrollview-view > ul');

//            name = decodeURIComponent(name);
            name = decodeURIComponent(rcvmsg);
            name = this.escape(name);
//            if (bye) {
//                this.showByePopup(name);
//            } else if (ping) {
//                app.setConnection(true);
//                this.setHeaderType('server - connected with ' + name);
//                this.checkSendButtonState();
//            } else {
                ul.append(this.templateManager.get('left_bubble', {
                    text: decodeURIComponent(rcvmsg)
                }));
                ul.listview('refresh');
//            }
        },

        /**
         * Updates header text on chat page.
         *
         * @public
         * @param {string} value
         */
        setHeaderType: function Ui_setHeaderType(value) {
            $('#chat-header-type').html(value);
        },

        /**
         * Enables send button.
         *
         * @private
         */
        enableSendButton: function Ui_enableSendButton() {
            $('#ui-mySend')
                .css({'pointer-events': 'auto'})
                .removeClass('ui-disabled');
        },

        /**
         * Disables send button.
         *
         * @public
         */
        disableSendButton: function Ui_disableSendButton() {
            $('#ui-mySend')
                .css({'pointer-events': 'none'})
                .addClass('ui-disabled');
        },

        /**
         * Updates send button state.
         *
         * @public
         */
        checkSendButtonState: function Ui_checkSendButtonState() {
            if (
                app.helpers.checkStringLength($('#text').val().trim()) &&
                    app.isConnection()
            ) {
                this.enableSendButton();
            } else {
                this.disableSendButton();
            }
        },

        /**
         * Scrolls to bottom scrollview of element given as parameter.
         *
         * @public
         * @param {jQueryElement} element
         */
        scrollToBottom: function Ui_scrollToBottom(element) {
            var bottom =
                element.children().first().outerHeight(true) - element.height();

            element.scrollview('scrollTo', 0, -Math.max(0, bottom), 0);
        },

        /**
         * Performs action when new message has been sent.
         *
         * @public
         * @param {string} message
         */
        displaySentMessage: function Ui_displaySentMessage(message) {
            var listElement = this.templateManager.get('right_bubble', {
                    text: decodeURIComponent(message)
                }),
                content = $('#chat-content'),
                ul = content.find('ul'),
                self = this;

            ul.append(listElement);
            ul.listview('refresh');
            this.checkSendButtonState();
            this.scrolltimeout = setTimeout(
                function displaySentMessageScrollBottomTimeout() {
                    self.scrolltimeout = null;
                    self.scrollToBottom(content);
                },
                700
            );
        },

        /**
         * Shows/hides discovering progress.
         *
         * @public
         * @param {boolean} visible
         */
        setDiscoveringProgress: function Ui_setDiscoveringProgress(visible) {
            $('#discovering').toggle(visible);
        },

        /**
         * Shows popup.
         *
         * @public
         * @param {string} text
         * @param {function} callback
         * @param {object} buttons
         */
        popup: function Ui_popup(text, callback, buttons) {
            var i = null,
                popup = $('#popup');

            if (!popup.hasClass('ui-popup')) {
                popup.popup();
            }

            if (!buttons) {
                buttons = {
                    'OK': function onOkButtonClick() {
                        $('#popup').popup('close');
                    }
                };
            }

            $('.ui-popup-button-bg', popup).empty();

            /*jslint regexp: true*/
            popup[0].className =
                popup[0].className.replace(/\bcenter_basic.*?\b/g, '');
            /*jslint regexp: false*/
            popup.addClass(
                'center_basic_' + Object.keys(buttons).length + 'btn'
            );

            for (i in buttons) {
                if (buttons.hasOwnProperty(i)) {
                    if (buttons[i]) {
                        $('<a/>')
                            .text(i)
                            .attr({
                                'data-role': 'button',
                                'data-inline': 'true'
                            })
                            .bind('click', buttons[i])
                            .appendTo($('.ui-popup-button-bg', popup));
                    }
                }
            }
            $('.ui-popup-text p', popup).text(text);

            if (callback instanceof Function) {
                popup.one('popupafterclose', callback);
            }
            popup.trigger('create');
            tau.changePage('#popup_page', {transition: 'none'});
            popup.popup('open', {positionTo: 'window'});
        },

        /**
         * Returns string where all special characters are converted
         * to HTML entities.
         *
         * @public
         * @param {string} str
         * @returns {string}
         */
        escape: function Ui_escape(str) {
            return $('<span>').text(str).html();
        }
    };

}());
