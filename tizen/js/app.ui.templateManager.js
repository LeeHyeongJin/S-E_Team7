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

/*global $, app, ModifierManager, console */

/**
 * TemplateManager class constructor.
 *
 * @public
 * @constructor
 */
function TemplateManager() {
    'use strict';

    this.init();
}

(function strict() {
    'use strict';

    TemplateManager.prototype = {

        /**
         * Template cache.
         *
         * @private
         * @type {object}
         */
        cache: {},

        /**
         * Initializes TemplateManager object.
         *
         * @public
         */
        init: function init() {
            this.modifiers = new ModifierManager().getAll();
        },

        /**
         * Returns template HTML (from cache).
         *
         * @public
         * @param {string} tplName
         * @param {string} tplParams
         * @returns {string}
         */
        get: function TemplateManager_get(tplName, tplParams) {
            if (this.cache[tplName] !== undefined) {
                return this.getCompleted(this.cache[tplName], tplParams);
            }
            return '';
        },

        /**
         * Loads templates to cache.
         *
         * @public
         * @param {string} tplNames
         * @param {function} onSuccess
         */
        loadToCache: function TemplateManager_loadToCache(tplNames, onSuccess) {
            var self = this,
                cachedTemplates = 0,
                tplName = null,
                tplPath = null;

            if ($.isArray(tplNames)) {
                /*jslint unparam: true */
                // for each template
                $.each(tplNames, function forEachTplName(index, fileName) {

                    // cache template HTML
                    if (self.cache[fileName] === undefined) {
                        tplName = [
                            fileName,
                            app.config.get('templateExtension')
                        ].join('');
                        tplPath = [
                            app.config.get('templateDir'),
                            tplName
                        ].join('/');

                        $.ajax({
                            url: tplPath,
                            cache: true,
                            dataType: 'html',
                            async: true,
                            success: function onAjaxSuccess(data) {
                                // increase counter
                                cachedTemplates += 1;

                                // save to cache
                                self.cache[fileName] = data;

                                // if all templates are cached launch callback
                                if (
                                    cachedTemplates >= tplNames.length &&
                                        typeof onSuccess === 'function'
                                ) {
                                    onSuccess();
                                }
                            },
                            error: function onAjaxError(jqXHR, textStatus,
                                errorThrown) {
                                console.error(
                                    'templateManagerError: ' +
                                        errorThrown
                                );
                            }
                        });
                    } else {
                        // template is already cached
                        cachedTemplates += 1;
                        // if all templates are cached launch callback
                        if (
                            cachedTemplates >= tplNames.length &&
                                typeof onSuccess === 'function'
                        ) {
                            onSuccess();
                        }
                    }
                });
            }
        },

        /**
         * Returns template completed by specified parameters.
         *
         * @private
         * @param {string} tplHtml
         * @param {string} tplParams
         * @returns {string}
         */
        getCompleted: function TemplateManager_getCompleted(
            tplHtml,
            tplParams
        ) {
            var tplParam = null;

            for (tplParam in tplParams) {
                if (tplParams.hasOwnProperty(tplParam)) {
                    tplHtml = this.passThruModifiers(
                        tplHtml,
                        tplParam,
                        tplParams[tplParam]
                    );
                }
            }

            return tplHtml;
        },

        /**
         * Returns template completed by specified parameters
         * including modifiers.
         *
         * @private
         * @param {string} tplHtml
         * @param {string} tplParam
         * @param {string} content
         * @returns {string}
         */
        passThruModifiers: function TemplateManager_passThruModifiers(tplHtml,
            tplParam, content) {

            var regModOn = new RegExp('%' + tplParam + '(\\|(.+?)){1,}%', 'g'),
                regModOff = new RegExp(['%', tplParam, '%'].join(''), 'g'),
                regModGet = new RegExp('%' + tplParam + '\\|(.+?)%'),
                regModPut = new RegExp('%' + tplParam + '\\|(.+?)%', 'g'),
                specRegExp = new RegExp('\\$', 'g'),
                modifiers = null,
                i = null;

            if (content && (typeof content === 'string')) {
                content = content.replace(specRegExp, '$$$$');
            }

            if (regModOn.test(tplHtml)) {
                modifiers = tplHtml.match(regModGet)[1].split('|');
                for (i in modifiers) {
                    if (modifiers.hasOwnProperty(i)) {
                        if (this.modifiers[modifiers[i]] instanceof Function) {
                            content = this.modifiers[modifiers[i]](content);
                        } else {
                            console.error('unknown modifier: ' + modifiers[i]);
                        }
                    }
                }
                tplHtml = tplHtml.replace(regModPut, content);
            }
            tplHtml = tplHtml.replace(regModOff, content);

            return tplHtml;
        }
    };

}());
