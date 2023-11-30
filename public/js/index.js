/**
 * Name: Nick Trimmer
 * Date: 11/26/2023
 *
 * Description: Client-side JavaScript for the Encrypted Editor.
 */
"use strict";

(function() {

    /**
     * Add a function that will be called when the window is loaded.
     */
    window.addEventListener("load", init);

    /**
     * Initialize the page by attaching event listeners to the buttons.
     */
    function init() {
        const encryptButton = id('encrypt-button');
        const decryptButton = id('decrypt-button');
        const saveButton = id('save-button');
        const loadButton = id('load-button');
        const dismissAlertButton = id('dismiss-alert');
        const textarea = id('document-content');
        const passkeyInput = id('passkey');
        const nameInput = id('document-name');
        let isEncrypted = false; // Global flag to track encryption state

        // Event listeners for buttons
        encryptButton.addEventListener('click', function() {
            const passkey = passkeyInput.value;
            if (!passkey) {
                showAlert('Please enter a passkey before encryption.');
                return;
            }
            if (isEncrypted) {
                showAlert('This document is already encrypted.');
                return;
            }
            if (!textarea.value) {
                showAlert('The document content cannot be empty.');
                return;
            }
            if (!nameInput.value) {
                showAlert('Please enter a name for the document.');
                return;
            }
            encrypt(textarea.value, passkey).then(encryptedText => {
                textarea.value = encryptedText;
                textarea.readOnly = true;
                isEncrypted = true;
                switchIcons('lock');
            }).catch(error => {
                console.error('Error during encryption:', error);
            });
            updateInfoText('encrypt');
        });

        decryptButton.addEventListener('click', function() {
            if (!isEncrypted) {
                showAlert('This document is not encrypted.');
                return;
            }
            const passkey = passkeyInput.value;
            const encryptedText = textarea.value;
            if (typeof encryptedText === 'string') {
                decrypt(encryptedText, passkey).then(decryptedText => {
                    textarea.value = decryptedText;
                    textarea.readOnly = false;
                    isEncrypted = false;
                    switchIcons('unlock');
                }).catch(error => {
                    console.error('Error during decryption:', error);
                    showAlert('Error during decryption. Please check the passkey.');
                });
            } else {
                console.error('Encrypted text is not a string:', encryptedText);
            }
            updateInfoText('decrypt');
        });

        saveButton.addEventListener('click', async function() {
            const name = id('document-name').value;
            const content = textarea.value; // This should already be encrypted content
            const passkey = passkeyInput.value;

            // Validate inputs
            if (!name) {
                showAlert('Please enter a name for the document.');
                return;
            }
            if (!passkey) {
                showAlert('Please enter a passkey.');
                return;
            }
            if (!content) {
                showAlert('The document content cannot be empty.');
                return;
            }
            if (!isEncrypted) {
                showAlert('Please encrypt the document before saving.');
                return;
            }

            fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, content: content })
            })
                .then(response => {
                    if (response.status === 409) {
                        showAlert('Document already exists.');
                        throw new Error('Document already exists.');
                    }
                    if (!response.ok) {
                        showAlert('Error saving document.');
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(result => {
                    showAlert('Document saved successfully.');
                    nameInput.value = '';
                    textarea.value = '';
                    passkeyInput.value = '';
                    isEncrypted = false; // Reset encryption flag
                    textarea.readOnly = false; // Make textarea editable again
                    updateInfoText('save');
                    switchIcons('unlock');
                })
                .catch(error => {
                    console.error('Error saving document:', error);
                });
        });

        loadButton.addEventListener('click', function() {
            const documentName = prompt('Please enter the name of the document to load:');
            if (!documentName) {
                showAlert('Document name is required to load a document.');
                return;
            }

            const passkey = prompt('Please enter the passkey:');
            if (!passkey) {
                showAlert('A passkey is required to decrypt the document.');
                return;
            }

            // Proceed to fetch the document from the server
            fetch(`/load/${encodeURIComponent(documentName)}`)
                .then(response => {
                    if (!response.ok) {
                        showAlert('Error loading document.');
                        throw new Error('Document not found.');
                    }
                    return response.json();
                })
                .then(data => {
                    const encryptedContent = data.content;
                    decrypt(encryptedContent, passkey).then(decryptedText => {
                        textarea.value = decryptedText;
                        textarea.readOnly = false; // Allow editing after decryption
                        nameInput.value = documentName;
                        isEncrypted = false; // Reset encryption flag
                        switchIcons('unlock');
                    }).catch(error => {
                        showAlert('Error during decryption. Please check the passkey.');
                    });
                })
                .catch(error => {
                    showAlert(error.message);
                });

            updateInfoText('load');
        });

        dismissAlertButton.addEventListener('click', hideAlert);
    }

    /**
     * Derives a key from the given passkey and uses it to encrypt the given text.
     * @param passkey - The passkey to use for encryption.
     * @returns {Promise<CryptoKey>} - The derived key.
     */
    function deriveKey(passkey) {
        const enc = new TextEncoder();
        return window.crypto.subtle.importKey(
            "raw",
            enc.encode(passkey),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        ).then(baseKey => {
            return window.crypto.subtle.deriveKey(
                {
                    "name": "PBKDF2",
                    "salt": enc.encode("some-fixed-salt"), // Use a fixed salt
                    "iterations": 100000,
                    "hash": "SHA-256"
                },
                baseKey,
                { "name": "AES-GCM", "length": 256},
                false,
                ["encrypt", "decrypt"]
            );
        });
    }

    /**
     * Encrypts the given text using the given key.
     * @param text - The text to encrypt.
     * @param passkey - The passkey to use for encryption.
     * @returns {Promise<string>} - The encrypted text.
     */
    function encrypt(text, passkey) {
        return deriveKey(passkey).then(key => {
            return encryptData(text, key).then(({ iv, encrypted }) => {
                // Convert the iv and encrypted data to a string format suitable for storage
                const ivStr = arrayBufferToBase64(iv);
                const encryptedStr = arrayBufferToBase64(encrypted);
                return JSON.stringify({ iv: ivStr, data: encryptedStr });
            });
        });
    }

    /**
     * Decrypts the given text using the given passkey.
     * @param encryptedText - The encrypted text to decrypt.
     * @param passkey - The passkey to use for decryption.
     * @returns {Promise<string>} - The decrypted text.
     */
    function decrypt(encryptedText, passkey) {
        return deriveKey(passkey).then(key => {
            let { iv, data } = JSON.parse(encryptedText);
            iv = base64ToArrayBuffer(iv);
            data = base64ToArrayBuffer(data);

            return decryptData(data, key, iv).then(decryptedText => {
                return decryptedText;
            }).catch(error => {
                console.error("Decryption error:", error);
                throw error; // Re-throw the error to be caught by the caller
            });
        }).catch(error => {
            console.error("Error in key derivation or decryption process:", error);
            throw error; // Re-throw the error to be caught by the caller
        });
    }

    /**
     * Encrypts the given data using the given key.
     * @param data - The data to encrypt.
     * @param key - The key to use for encryption.
     * @returns {Promise<{encrypted: *, iv: Uint8Array}>} - The encrypted data and iv.
     */
    function encryptData(data, key) {
        const enc = new TextEncoder();
        let encoded = enc.encode(data);

        // The iv (initialization vector) should be unique for every encryption but does not need to be secret
        // It can be stored alongside the encrypted data
        let iv = window.crypto.getRandomValues(new Uint8Array(12));

        return window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encoded
        ).then(encrypted => {
            return { iv, encrypted };
        });
    }

    /**
     * Decrypts the given data using the given key.
     * @param encryptedData - The data to decrypt.
     * @param key - The key to use for decryption.
     * @param iv - The initialization vector to use for decryption.
     * @returns {Promise<string>} - The decrypted data.
     */
    function decryptData(encryptedData, key, iv) {
        return window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        ).then(decrypted => {
            const dec = new TextDecoder();
            return dec.decode(decrypted);
        });
    }

    /**
     * Converts the given ArrayBuffer to a Base64 string.
     * @param buffer - The ArrayBuffer to convert.
     * @returns {string} - The Base64 string.
     */
    function arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Converts the given Base64 string to an ArrayBuffer.
     * @param base64 - The Base64 string to convert.
     * @returns {ArrayBufferLike} - The ArrayBuffer.
     */
    function base64ToArrayBuffer(base64) {
        let binary_string = window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Sends the given document to the server for storage.
     * @param name - The name of the document.
     * @param encryptedContent - The encrypted content of the document.
     */
    function sendDocumentToServer(name, encryptedContent) {
        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, content: encryptedContent })
        })
            .then(response => {
                if (response.status === 409) {
                    showAlert('Document already exists.');
                    throw new Error('Document already exists.');
                }
                if (!response.ok) {
                    showAlert('Error saving document.');
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(result => {
                showAlert('Document saved successfully.');
            })
            .catch(error => {
                console.error('Error saving document:', error);
            });
    }

    /**
     * Updates the info text based on the given action.
     * @param action - The action to update the info text for.
     */
    function updateInfoText(action) {
        const infoText = id('educational-text');
        switch (action) {
            case 'encrypt':
                infoText.textContent = "Encryption Process: The document's text has been encrypted using your passkey. " +
                    "This means that the original text has been transformed into a secure format " +
                    "that can only be understood (decrypted) by someone with the correct passkey.";
                break;
            case 'decrypt':
                infoText.textContent = "Decryption Process: The encrypted text has now been decrypted back into its original form. " +
                    "This was done using the passkey you provided, which matches the one used for encryption. " +
                    "Without the correct passkey, the decryption process would fail.";
                break;
            case 'save':
                infoText.textContent = "Save Process: Your encrypted document has been saved. " +
                    "Only the encrypted version of your document is stored, ensuring that " +
                    "your sensitive information remains secure. Remember, without the passkey, " +
                    "the document cannot be decrypted back to its original form.";
                break;
            case 'load':
                infoText.textContent = "Load Process: An encrypted document has been loaded from the server. " +
                    "To read or edit it, you'll need to decrypt it using the correct passkey. " +
                    "The server only stores the encrypted form of the document for security reasons. " +
                    "Once loaded, the server deletes its copy of the document. Leaving you with the only copy of the document.";
                break;
            default:
                infoText.textContent = "Welcome to the Encrypted Document Editor. Here you can write text, " +
                    "encrypt it, and save it securely. You can also load and decrypt previously saved documents.";
        }
    }

    /**
     * Displays an alert with the given message.
     * @param message - The message to display in the alert.
     */
    function showAlert(message) {
        const alertArea = id('alert-area');
        alertArea.textContent = message; // Set the new message
        alertArea.style.display = 'block'; // Make sure the alert is visible

        // Add the dismiss button if it's not already there
        if (!id('dismiss-alert')) {
            const dismissBtn = gen('button');
            dismissBtn.textContent = 'Dismiss';
            dismissBtn.id = 'dismiss-alert';
            dismissBtn.className = 'btn btn-primary';
            dismissBtn.onclick = hideAlert;
            alertArea.appendChild(dismissBtn);
        }

        // Automatically hide the alert after 5 seconds
        setTimeout(hideAlert, 5000); // 5000 milliseconds = 5 seconds
    }

    /**
     * Hides the alert.
     */
    function hideAlert() {
        const alertArea = id('alert-area');
        alertArea.style.display = 'none';
    }

    /**
     * Switches between the lock and unlock icons based on the given action.
     * @param action - The action to switch icons for.
     */
    function switchIcons(action) {
        const lockIcon = id('lock');
        const unlockIcon = id('unlock');
        switch (action) {
            case 'lock':
                lockIcon.style.display = 'inline';
                unlockIcon.style.display = 'none';
                break;
            case 'unlock':
                lockIcon.style.display = 'none';
                unlockIcon.style.display = 'inline';
                break;
            default:
                lockIcon.style.display = 'none';
                unlockIcon.style.display = 'none';
        }
    }

    /** ------------------------------ Helper Functions  ------------------------------ */

    /**
     * Returns the element that has the ID attribute with the specified value.
     * @param {string} idName - element ID
     * @returns {object} DOM object associated with id.
     */
    function id(idName) {
        return document.getElementById(idName);
    }

    /**
     * Returns the first element that matches the given CSS selector.
     * @param {string} selector - CSS query selector.
     * @returns {object} The first DOM object matching the query.
     */
    function qs(selector) {
        return document.querySelector(selector);
    }

    /**
     * Returns the array of elements that match the given CSS selector.
     * @param {string} selector - CSS query selector
     * @returns {NodeListOf<Element>} array of DOM objects matching the query.
     */
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * Returns a new element with the given tag name.
     * @param {string} tagName - HTML tag name for new DOM element.
     * @returns {object} New DOM object for given HTML tag.
     */
    function gen(tagName) {
        return document.createElement(tagName);
    }
})();