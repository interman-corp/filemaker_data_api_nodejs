const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const FileMakerDataAPIClient = require('../index.js');
describe('FileMakerDataAPIClient', () => {
    let api;
    let mock;
    const server = 'your_server';
    const database = 'your_database';
    const username = 'your_username';
    const password = 'your_password';
    const layout = 'your_layout';
    const api_token = 'c4d2e429122e9cdeda19bb23c55cd2a8f282c3cc50c60943a110'
    const script = 'your_script';
    const loginResponse = {
        "messages": [
            {
                "message": "OK",
                "code": "0"
            }
        ],
        "response": {
            "token": api_token
        },
        "HTTPMessage": "OK",
        "HTTPCode": 200
    };

    const logoutResponse = {
        "response": {},
        "messages": [{"code": "0", "message": "OK"}]
    };

    const productInfoResponse = {
        "response": {
            "productInfo": {
                "buildDate": "01/30/2020",
                "dateFormat": "MM/dd/yyyy",
                "timeStampFormat": "MM/dd/yyyy HH:mm:ss",
                "version": "19.0.1.30",
                "timeFormat": "HH:mm:ss",
                "name": "FileMaker Data API Engine"
            }
        },
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const databasesResponse = {
        "response": {
            "databases": [{
                "name": "Customers"
            }, {
                "name": "Sales"
            }]
        },
        "messages": [{
            "code": "0",
            "message": "OK"
        }]
    }
    const scriptsResponse = {
        "response": {
            "scripts": [
                {
                    "name": "GotoFirst",
                    "isFolder": false
                },
                {
                    "name": "A Folder",
                    "isFolder": true,
                    "folderScriptNames": [
                        {
                            "name": "script1",
                            "isFolder": false
                        },
                        {
                            "name": "-",
                            "isFolder": false
                        },
                        {
                            "name": "script2",
                            "isFolder": false
                        },
                        {
                            "name": "Another Folder",
                            "isFolder": true,
                            "folderScriptNames": [
                                {
                                    "name": "script3",
                                    "isFolder": false
                                }
                            ]
                        },
                        {
                            "name": "script4",
                            "isFolder": false
                        }
                    ]
                }
            ]
        },
        "messages": [
            {
                "message": "OK",
                "code": "0"
            }
        ]
    }
    const layoutsResponse = {
        "messages": [
        {
            "message": "OK",
            "code": "0"
        }
        ],
        "response": {
        "layouts": [
            {
                "name": "Customers"
            },
            {
                "name": "Details"
            },
            {
                "folderLayoutNames": [
                    {
                        "name": "Mark as sent"
                    },
                    {
                        "name": "Find Unsent"
                    }
                ],
                "isFolder": true,
                "name": "Package Management"
            }
        ]
        }
    }

    const layoutmetaResponse = {
        "response": {
            "fieldMetaData": [
                {
                    "name": "CustomerName",
                    "type": "normal",
                    "displayType": "editText",
                    "result": "text",
                    "valueList": "Text",
                    "global": false,
                    "autoEnter": false,
                    "fourDigitYear": false,
                    "maxRepeat": 1,
                    "maxCharacters": 0,
                    "notEmpty": false,
                    "numeric": false,
                    "timeOfDay": false,
                    "repetitionStart": 1,
                    "repetitionEnd": 1
                }
            ],
            "portalMetaData": {},
            "valueLists": [
                {
                    "name": "Region",
                    "type": "customList",
                    "values": [
                        {
                            "displayValue": "West",
                            "value": "West"
                        },
                        {
                            "displayValue": "East",
                            "value": "East"
                        }
                    ]
                }
            ]
        },
        "messages": [
            {
            "code": "0",
            "message": "OK"
            }
        ]
    }
    const createRecordData = {"fieldData":
        {
            "文字列フィールド": "値 1",
            "数字フィールド": 99.99,
            "繰り返しフィールド(1)" : "フィールド値"
        }
    }

    const createRecordResponse = {
        "response": {
            "recordId":"147",
            "modId":"0"
        },
        "messages": [
            {
                "code": "0",
                "message":"OK"
            }
        ]
    }

    const updateRecordData = {
        "fieldData":
        {
            "First Name": "Joe",
            "deleteRelated": "Orders.3"
        },
        "portalData":
        {
            "JobsTable": [
                {
                    "recordId": "70",
                    "modId": "4",
                    "JobsTable::Name": "Contractor"
                }
            ]
        }
    }

    const updateRecordResponse = {
        "response": {
            "modId": "3"
        },
        "messages": [
        {
            "code": "0",
            "message": "OK"
        }
        ]
    }

    const duplicateRecordResponse = {
        "response": {
            "recordId": "7",
            "modId": "0"
        },
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const deleteRecordResponse = {
        "response": {},
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const getRecordResponse = {
        "response": {
            "data": [
                {
                    "文字列フィールド": "値 1",
                    "数字フィールド": 99.99,
                    "繰り返しフィールド(1)": "フィールド値"
                }
            ]
        },
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const uploadObjectDataFieldName = 'file'

    const uploadObjectDataResponse = {
        "response": {},
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const findRecordQuery = {
        "query": [
            {
                "Group": "=Surgeon"
            },
            {
                "Work State": "NY",
                "omit": "true"
            }
        ],
        "sort": [
            {
                "fieldName": "Work State",
                "sortOrder": "ascend"
            },
            {
                "fieldName": "First Name",
                "sortOrder": "ascend"
            }
        ]
    }

    const findRecordResponse ={
        "response": {
            "data": [
                {
                    "文字列フィールド": "値 1",
                    "数字フィールド": 99.99,
                    "繰り返しフィールド(1)": "フィールド値"
                }
            ]
        },
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const setGlobalFieldData = {
        "globalFields": {
            "baseTable::gCompany": "FileMaker",
            "baseTable::gCode": "95054"
        }
    }

    const setGlobalFieldResponse = {
        "response": {},
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    const executeScriptResponse = {
        "response": {
            "scriptError": "0"
        },
        "messages": [
            {
                "code": "0",
                "message": "OK"
            }
        ]
    }

    beforeEach(async () => {
        api = new FileMakerDataAPIClient(server, database, username, password, layout);
        mock = new MockAdapter(axios);

        // Setup mock response for login
        const loginUrl = `${server}/fmi/data/vLatest/databases/${database}/sessions`;
        mock.onPost(loginUrl).reply(200, loginResponse, {
            'X-FM-Data-Access-Token': api_token
        });
        // Setup mock response for logout
        const logoutUrl = `${server}/fmi/data/vLatest/databases/${database}/sessions/${api_token}`;
        mock.onDelete(logoutUrl).reply(200, logoutResponse);
        // Setup mock response for product info
        mock.onGet(`${server}/fmi/data/vLatest/productInfo`).reply(200, productInfoResponse);
        // Setup mock response for databases
        mock.onGet(`${server}/fmi/data/vLatest/databases`).reply(200, databasesResponse);
        // Setup mock response for scripts
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/scripts`).reply(200, scriptsResponse);
        // Setup mock response for layouts
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/layouts`).reply(200, layoutsResponse);
        // Setup mock response for layout meta
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}`).reply(200, layoutmetaResponse);
        // Setup mock response for create record
        mock.onPost(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records`, createRecordData).reply(200, createRecordResponse);
        // Setup mock response for update record
        mock.onPatch(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records/1`, updateRecordData).reply(200, updateRecordResponse);
        // Setup mock response for duplicate record
        mock.onPost(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records/1`).reply(200, duplicateRecordResponse);
        // Setup mock response for delete record
        mock.onDelete(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records/1`).reply(200, deleteRecordResponse);
        // Setup mock response for get record
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records/1`).reply(200, getRecordResponse);
        // Setup mock response for get records
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records`).reply(200, getRecordResponse);
        // Setup mock response for upload object
        mock.onPost(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/records/1/containers/${uploadObjectDataFieldName}/1`).reply(200, uploadObjectDataResponse);
        // Setup mock response for find records
        mock.onPost(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/_find`).reply(200, findRecordResponse);
        // Setup mock response for set global fields
        mock.onPatch(`${server}/fmi/data/vLatest/databases/${database}/globals`).reply(200, setGlobalFieldResponse);
        // Setup mock response for execute script
        mock.onGet(`${server}/fmi/data/vLatest/databases/${database}/layouts/${layout}/script/${script}`).reply(200, executeScriptResponse);
    });

    test('login should work correctly', async () => {
        await api.login();
        expect(api.token).toBe(api_token);
    });

    test('logout should work correctly', async () => {
        await api.login();
        await api.logout();
        expect(api.token).toBeNull();
    });

    test('get product info should work correctly', async () => {
        await api.login();
        respose = await api.getProductInfo();
        await api.logout();
    });

    test('get databases should work correctly', async () => {
        await api.login();
        respose = await api.getDatabases();
        await api.logout();
    });

    test('get scripts should work correctly', async () => {
        await api.login();
        respose = await api.getScripts();
        await api.logout();
    });

    test('get layouts should work correctly', async () => {
        await api.login();
        respose = await api.getLayouts();
        await api.logout();
    });

    test('get layout meta should work correctly', async () => {
        await api.login();
        respose = await api.getLayoutMetadata();
        await api.logout();
    });

    test('create record should work correctly', async () => {
        await api.login();
        respose = await api.createRecord(createRecordData.fieldData);
        await api.logout();
    });

    test('update record should work correctly', async () => {
        await api.login();
        respose = await api.updateRecord(1, updateRecordData.fieldData, updateRecordData.portalData);
        await api.logout();
    });

    test('duplicate record should work correctly', async () => {
        await api.login();
        respose = await api.duplicateRecord(1);
        await api.logout();
    });

    test('delete record should work correctly', async () => {
        await api.login();
        respose = await api.deleteRecord(1);
        await api.logout();
    });

    test('get record should work correctly', async () => {
        await api.login();
        respose = await api.getRecord(1);
        await api.logout();
    });

    test('get records should work correctly', async () => {
        await api.login();
        respose = await api.getRecords();
        await api.logout();
    });

    test('upload object should work correctly', async () => {
        await api.login();
        const objectData = new Buffer.alloc(100)
        respose = await api.uploadObjectData(1, uploadObjectDataFieldName, 1, 'file.txt', objectData);
        await api.logout();
    });

    test('find records should work correctly', async () => {
        await api.login();
        respose = await api.findRecords(findRecordQuery);
        await api.logout();
    });

    test('set global fields should work correctly', async () => {
        await api.login();
        respose = await api.setGlobalFields(setGlobalFieldData);
        await api.logout();
    });

    test('execute script should work correctly', async () => {
        await api.login();
        respose = await api.executeScript(script);
        await api.logout();
    });

    afterEach(() => {
        mock.reset();
    });
});
