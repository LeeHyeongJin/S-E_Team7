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

/*jslint plusplus: true, sloppy: true, todo: true, vars: true, browser: true,
 devel: true */

/**
 * Helpers class constructor.
 *
 * @public
 * @constructor
 */
function Helpers() {
    'use strict';

    return;
}

(function strict() {
    'use strict';

    Helpers.prototype = {

        /**
         * Checks whether the length of the given string is greater than 0.
         * Returns true if length is greater than 0, false otherwise.
         *
         * @public
         * @param {string} value
         * @returns {boolean}
         */
        checkStringLength: function Helpers_checkStringLength(value) {
            return value.length > 0;
        }

    };

}());
