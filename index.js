const LOG_LEVELS = {
    CRITICAL: 50,
    ERROR: 40,
    WARNING: 30,
    INFO: 20,
    DEBUG: 10,
    NOTSET: 0
};

let currentLogLevel = LOG_LEVELS.WARNING;  // Set your log level

const logger = {
    debug: (...args) => {
        if (currentLogLevel <= LOG_LEVELS.DEBUG) console.debug(...args);
    },
    info: (...args) => {
        if (currentLogLevel <= LOG_LEVELS.INFO) console.info(...args);
    },
    warning: (...args) => {
        if (currentLogLevel <= LOG_LEVELS.WARNING) console.warn(...args);
    },
    error: (...args) => {
        if (currentLogLevel <= LOG_LEVELS.ERROR) console.error(...args);
    },
    critical: (...args) => {
        if (currentLogLevel <= LOG_LEVELS.CRITICAL) console.error(...args);
    }
}


const axios = require('axios');
const { assert } = require('console');
const FormData = require('form-data');
const fs = require('fs');

/**
 * FileMakerDataAPI Client is a class for interacting with a FileMaker database via REST APIs.
 */
class FileMakerDataAPIClient {
    /**
     * @param {string} server - The FileMaker server URL.
     * @param {string} database - The name of the FileMaker database.
     * @param {string} username - The username to authenticate with.
     * @param {string} password - The password to authenticate with.
     * @param {string} layout - The layout in the FileMaker database to interact with.
     */
    constructor(server, database, username, password, layout) {
        this.server = server;
        this.database = database;
        this.username = username;
        this.password = password;
        this.layout = layout;
        this.baseURL = `${this.server}/fmi/data/vLatest/databases/${this.database}`;
    }

    /**
     * Changes the layout in the FileMaker database that this instance interacts with.
     * @param {string} newLayout - The new layout to interact with.
     */
    changeLayout(newLayout) {
        this.layout = newLayout;
    }

    /**
     * Authenticates with the FileMaker server and sets up the bearer token for future requests.
     */
    async login() {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: this.username,
                password: this.password
            }
        };

        try {
            const response = await axios.post(`${this.baseURL}/sessions`, {}, config);
            this.token = response.data.response.token;
            this.defaultConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                }
            };
            logger.debug('Login successful.');
            return true;
        } catch (error) {
            logger.error('Login failed.');
            return false;
        }
    }
    /**
     * Logs out from the FileMaker server. Invalidates the currently stored token.
     * @throws {Error} If there is no active session to logout from.
     */
    async logout() {
        if (!this.token) {
            logger.error('No session to logout from.');
            return;
        }

        try {
            await axios.delete(`${this.baseURL}/sessions/${this.token}`, this.defaultConfig);
            this.token = null;  // Reset the token after logout
            logger.debug('Logged out successfully.');
        } catch (error) {
            logger.error('Logout failed.');
            logger.debug(error);
        }
    }

    /**
     * Retrieves the product information from the FileMaker server.
     * @returns {object} The product information.
     * @throws {Error} If not logged in.
     */
    async getProductInfo() {
        if (!this.token) {
            logger.error('You must be logged in to get product info.');
            return;
        }

        try {
            const response = await axios.get(`${this.server}/fmi/data/vLatest/productInfo`, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.error('Failed to get product info.');
            logger.debug(error);
        }
    }

    /**
     * Retrieves the list of databases available on the FileMaker server.
     * @returns {object} The list of databases.
     * @throws {Error} If retrieval of databases fails.
     */
    async getDatabases() {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: this.username,
                    password: this.password
                }
            };
            const response = await axios.get(`${this.server}/fmi/data/vLatest/databases`, config);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get databases.');
        }
    }

    /**
     * Retrieves the list of scripts available in the current layout.
     * @returns {object} The list of scripts.
     * @throws {Error} If not logged in or if retrieval of scripts fails.
     */
    async getScripts() {
        if (!this.token) {
            throw new Error('You must be logged in to get scripts.');
        }

        try {
            const response = await axios.get(`${this.baseURL}/scripts`, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get scripts.');
        }
    }


    /**
     * Retrieves the list of layouts available in the current database.
     * @returns {object} The list of layouts.
     * @throws {Error} If not logged in or if retrieval of layouts fails.
     */
    async getLayouts() {
        if (!this.token) {
            throw new ('You must be logged in to get layouts.');
        }

        try {
            const response = await axios.get(`${this.baseURL}/layouts`, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get layouts.');
        }
    }
    /**
     * Retrieves the metadata for the current layout.
     * @returns {object} The metadata for the current layout.
     * @throws {Error} If not logged in or if retrieval of layout metadata fails.
     */
    async getLayoutMetadata() {
        if (!this.token) {
            throw new Error('You must be logged in to get layout metadata.');
        }

        try {
            const response = await axios.get(`${this.baseURL}/layouts/${this.layout}`, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to get layout metadata.');
        }
    }

    /**
     * Creates a script parameter object.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} A script parameters object.
     */
    createScriptParams(scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        let params = {};
        if(scriptPrerequest) {
            params['script.prerequest'] = scriptPrerequest;
        }
        if(scriptPrerequestParam) {
            params['script.prerequest.param'] = scriptPrerequestParam;
        }
        if(scriptPresort) {
            params['script.presort'] = scriptPresort;
        }
        if(scriptPresortParam) {
            params['script.presort.param'] = scriptPresortParam;
        }
        if(script) {
            params['script'] = script;
        }
        if(scriptParam) {
            params['script.param'] = scriptParam;
        }
        return params;
    }

    /**
     * Creates a new record with the provided field data.
     * @param {object} fieldData - The data for the new record's fields.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record creation fails.
     */
    async createRecord(fieldData, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to create a record.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before creating a record.');
        }

        // Initialize request body with field data
        let requestBody = {'fieldData': fieldData};
        // Add script parameters to the request body
        const scriptParams = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);
        requestBody = {...requestBody, ...scriptParams};

        try {
            const response = await axios.post(`${this.baseURL}/layouts/${this.layout}/records`, requestBody, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create a record.', error);
        }
    }

    /**
     * Edits an existing record with the provided field data.
     * @param {string} recordId - The ID of the record to be edited.
     * @param {object} fieldData - The data for the record's fields.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record edition fails.
     */
    async updateRecord(recordId, fieldData, portalData, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to edit a record.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before editing a record.');
        }

        // Initialize request body with field data
        let requestBody = {'fieldData': fieldData};
        if(portalData) {
            requestBody['portalData'] = portalData;
        }
        // Add script parameters to the request body
        const scriptParams = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);
        requestBody = {...requestBody, ...scriptParams};

        try {
            const response = await axios.patch(`${this.baseURL}/layouts/${this.layout}/records/${recordId}`, requestBody, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to edit the record.');
        }
    }
    /**
     * Duplicates a record.
     * @param {string} recordId - The ID of the record to be duplicated.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record duplication fails.
     */
    async duplicateRecord(recordId, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to duplicate a record.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before duplicating a record.');
        }

        // Initialize request body with field data
        let requestBody = {};
        // Add script parameters to the request body
        const scriptParams = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);
        requestBody = {...requestBody, ...scriptParams};

        try {
            const response = await axios.post(`${this.baseURL}/layouts/${this.layout}/records/${recordId}`, requestBody, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to duplicate the record.');
        }
    }

    /**
     * Deletes a record.
     * @param {string} recordId - The ID of the record to be deleted.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record deletion fails.
     */
    async deleteRecord(recordId, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to delete a record.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before deleting a record.');
        }

        // Add script parameters to the request config
        let config = this.defaultConfig;
        config.params = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);

        try {
            const response = await axios.delete(`${this.baseURL}/layouts/${this.layout}/records/${recordId}`, config);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to delete the record.');
        }
    }
    /**
     * Retrieves a record.
     * @param {string} recordId - The ID of the record to retrieve.
     * @param {object} portalParams - The portal parameters.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record retrieval fails.
     */
    async getRecord(recordId, portalParams = null, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to get a record.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before getting a record.');
        }

        let url = `${this.baseURL}/layouts/${this.layout}/records/${recordId}`;

        // ポータルパラメータが指定されている場合、それをURLに追加する
        if (portalParams) {
            // portalパラメータが配列である場合は、JSON文字列に変換
            if (Array.isArray(portalParams)) {
                portalParams= JSON.stringify(portalParams.portal);
            }
            url += '?' + new URLSearchParams(portalParams).toString();
            logger.debug(url);
        }

        // Add script parameters to the URL
        const scriptParams = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);
        if(Object.keys(scriptParams).length > 0) {
            url += '?' + new URLSearchParams(scriptParams).toString();
        }
        logger.debug(url);

        try {
            const response = await axios.get(url, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to get the record.');
        }
    }
    /**
     * Retrieves multiple records.
     * @param {number} startingRecord - The number of the first record to retrieve.
     * @param {number} numberOfRecords - The number of records to retrieve.
     * @param {object} sortParams - The parameters for sorting the records.
     * @param {object} portalParams - The portal parameters.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record retrieval fails.
     */
    async getRecords(startingRecord = null, numberOfRecords = null, sortParams = null, portalParams = null, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to get records.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before getting records.');
        }

        let url = `${this.baseURL}/layouts/${this.layout}/records`;

        let params = {};

        if (startingRecord !== null && startingRecord !== undefined) {
            params._offset = startingRecord;
        }
        if (numberOfRecords !== null && numberOfRecords !== undefined) {
            params._limit = numberOfRecords;
        }

        if (sortParams) {
            params._sort = JSON.stringify(sortParams);
        }

        if (portalParams) {
            params = {...params, ...portalParams};
            if (portalParams.portal) {
                params.portal = JSON.stringify(portalParams.portal);
            }
        }

        // Add script parameters to the params
        const scriptParams = this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam);
        params = {...params, ...scriptParams};
        logger.debug(params);
        if(Object.keys(params).length > 0){
            url += '?' + new URLSearchParams(params).toString();
        }

        try {
            logger.debug(url);
            const response = await axios.get(url, this.defaultConfig);
            logger.debug(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to get the records.');
        }
    }

    /**
     * Uploads object data to a record.
     * @param {string} recordId - The ID of the record to upload the object data to.
     * @param {string} fieldName - The name of the field to upload the data to.
     * @param {number} repetition - The repetition number for the field.
     * @param {string} fileName - The name of the file to upload.
     * @param {Buffer|stream.Readable} fileDataOrStream - The data or stream of the file to upload.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if the upload fails.
     */
    async uploadObjectData(recordId, fieldName, repetition, fileName, fileDataOrStream) {
        if (!this.token) {
            throw new Error('You must be logged in to upload object data.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before uploading object data.');
        }

        let url = `${this.baseURL}/layouts/${this.layout}/records/${recordId}/containers/${fieldName}/${repetition}`;

        let formData = new FormData();
        formData.append('upload', fileDataOrStream, {
            filename: fileName,
            contentType: 'application/octet-stream',  // MIMEタイプを適切なものに変更してください
        });

        let config = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                ...formData.getHeaders()
            }
        };

        try {
            const response = await axios.post(url, formData, config);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to upload the object data.');
        }
    }

    /**
     * finds records query, sort, and script parameters.
     * @param {object} query - The query object.
     * @param {object} sort - The sort object.
     * @param {string} scriptPrerequest - The name of the script to be performed before the request is processed.
     * @param {string} scriptPrerequestParam - The parameter to be passed to the pre-request script.
     * @param {string} scriptPresort - The name of the script to be performed before sorting the records.
     * @param {string} scriptPresortParam - The parameter to be passed to the presort script.
     * @param {string} script - The name of the script to be performed after the records have been sorted and formatted.
     * @param {string} scriptParam - The parameter to be passed to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if record retrieval fails.
     */
    async findRecords(query, sort=null, scriptPrerequest=null, scriptPrerequestParam=null, scriptPresort=null, scriptPresortParam=null, script=null, scriptParam=null) {
        if (!this.token) {
            throw new Error('You must be logged in to find records.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before finding records.');
        }

        let requestBody = {'query': query};
        if (sort) {
            requestBody.sort = sort;
        }

        // Add script parameters to the request body
        requestBody = {...requestBody, ...this.createScriptParams(scriptPrerequest, scriptPrerequestParam, scriptPresort, scriptPresortParam, script, scriptParam)};

        const url = `${this.baseURL}/layouts/${this.layout}/_find`;

        try {
            const response = await axios.post(url, requestBody, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to find the records.');
        }
    }

    /**
     * Sets the value of a global field.
     * @param {string} tableName - The name of the table containing the global field.
     * @param {string} fieldName - The name of the global field.
     * @param {string} value - The value to set the global field to.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in or if setting the global field value fails.
     */
    async setGlobalFields(tableName, fieldName, value) {
        if (!this.token) {
            throw new Error('You must be logged in to set a global field value.');
        }

        const url = `${this.baseURL}/globals`;

        // Global field name is in the format of "table::field"
        let globalFieldName = `${tableName}::${fieldName}`;

        let data = {
            globalFields: {
                [globalFieldName]: value
            }
        };

        try {
            const response = await axios.patch(url, data, this.defaultConfig);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to set the global field value.');
        }
    }

    /**
     * Executes a FileMaker script.
     * @param {string} scriptName - The name of the script to execute.
     * @param {string} scriptParam - The parameter to pass to the script.
     * @returns {object} The response from the FileMaker server.
     * @throws {Error} If not logged in, no layout is set, or if script execution fails.
     */
    async executeScript(scriptName, scriptParam = null) {
        if (!this.token) {
            throw new Error('You must be logged in to execute a script.');
        }
        if (!this.layout) {
            throw new Error('You must set a layout name before executing a script.');
        }
        let config = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            params: scriptParam ? {
                'script.param': scriptParam
            } : {}
        };
        config['script.param'] = scriptParam
        const url = `${this.baseURL}/layouts/${this.layout}/script/${scriptName}`;
        try {
            const response = await axios.get(url, config);
            logger.debug(response.data);
            return response.data;
        } catch (error) {
            logger.debug(error);
            throw new Error('Failed to execute the script.');
        }
    }
}

module.exports = FileMakerDataAPIClient;
