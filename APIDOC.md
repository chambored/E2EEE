# E2EEE API Documentation
The E2EEE API provides endpoints for retrieving encrypted documents and saving encrypted documents.

## Save Encrypted Document
- Request Format: JSON Object with name and content fields
- Request Type: POST
- Returned Data Format: Plain Text
- Description: This endpoint allows users to save an encrypted document. It requires a JSON object containing a unique name identifier for the document and the content which is the encrypted data.

### Example Request:

```json
{
"name": "Document1",
"content": "EncryptedDataHere"
}
```
### Example Response:
```text
Document saved successfully
```
### Error Handling:

- If name or content is missing: Returns 400 with message 'Missing name or content'
- If the document with the same name already exists: Returns 409 with message 'Document already exists'

## Load Encrypted Document
- Request Format: Path Variable name in URL
- Request Type: GET
- Returned Data Format: JSON
- Description: This endpoint is used to load an encrypted document. It requires the document's name as a path variable in the URL. It returns the encrypted content of the document in JSON format.

### Example Request: 
```http request
GET /load/Document1
```
### Example Response:

```json
{
"content": "EncryptedDataHere"
}
```
### Error Handling:
- If the document with the specified name does not exist: Returns 404 with message 'Document not found'
