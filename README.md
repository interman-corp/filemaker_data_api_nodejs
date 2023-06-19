# FileMaker Data API Client

FileMaker Data API Client is a JavaScript wrapper module for the FileMaker Data API.

Please refer to the [Claris Data API and FileMaker Data API Guide](https://help.claris.com/data-api-guide/content/index.html) for more information.

## Installation

To install this module, run the following command in your project directory:

```bash
npm install filemaker-data-api-client
```

## Usage

Here is an example of how to use the FileMaker Data API Client:

```javascript
const FileMakerDataAPIClient = require('filemaker-data-api-client');

async function main() {
  // Create a new client
  const client = new FileMakerDataAPIClient({
    server: 'myserver.com',
    database: 'mydatabase',
    user: 'myuser',
    password: 'mypassword',
    layout: 'mylayout',
  });

  // Log in to the FileMaker server
  await client.login();

  // Retrieve a record by its ID
  const record = await client.getRecord('12345');

  // Update an existing record
  await client.updateRecord('12345', { field1: 'updated value' });

  // Create a new record
  const newRecord = await client.createRecord({ field1: 'value1', field2: 'value2' });

  // Delete a record
  await client.deleteRecord('12345');

  // Log out from the FileMaker server
  await client.logout();
}

main().catch((error) => {
  console.error('An error occurred:', error);
});


```

- `getLayoutURL()`: Returns the URL of the current layout.
- `changeLayout(layoutName)`: Changes the current layout to the specified layout name.
- `login()`: Logs in to the FileMaker server.
- `logout()`: Logs out from the FileMaker server.
- `getProductInfo()`: Retrieves information about the FileMaker server.
- `getDatabases()`: Retrieves the list of databases available on the FileMaker server.
- `getScripts()`: Retrieves the list of scripts available in the current database.
- `getLayouts()`: Retrieves the list of layouts available in the current database.
- `getLayoutMetadata(layoutName)`: Retrieves the metadata of the specified layout.
- `createScriptParams(scriptName, paramValues)`: Creates the parameter object for executing a script.
- `createRecord(data)`: Creates a new record with the provided data.
- `updateRecord(recordId, data)`: Updates an existing record with the provided data.
- `duplicateRecord(recordId)`: Duplicates an existing record.
- `deleteRecord(recordId)`: Deletes a record by its ID.
- `getRecord(recordId)`: Retrieves a record by its ID.
- `getRecords(startingRecord, numberOfRecords)`: Retrieves multiple records starting from a specific record up to a specified number of records.
- `uploadObjectData(recordId, fieldName, repetition, fileName, fileDataOrStream)`: Uploads object data to a record.
- `findRecords(query)`: Searches for records based on the provided query.
- `setGlobalFields(data)`: Sets the values of global fields with the provided data.
- `executeScript(scriptName, scriptParam)`: Executes a script on the server.

## Testing

To run the tests for the FileMaker Data API Client, you can use a testing framework such as Jest. Follow the steps below to set up and run the tests:

```bash
npm test
```

## Contributing

Contributions to this project are welcome. Please open an issue or submit a pull request with your ideas or bug fixes.

## License

This project is licensed under the MIT
