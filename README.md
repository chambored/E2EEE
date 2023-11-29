# Creative Project 4 Specification
## Overview
For your fourth Creative Project, you will create your own Node.js web service available for use with AJAX and fetch. Once again, as a Creative Project, you have freedom to have more ownership in your work, as long as you meet the requirements listed below.

## Ideas for CP4
Being that this is our last Creative Project, it is also your chance to wrap up your work in AD 320 with a final portfolio you can publish, showcasing your exploration of web programming technologies. As always, we encourage you to explore the new material covered in class, as well as related content linked to along the way. You may choose to do a new website for each CP, or build on the existing project from previous CP's.

As long as you meet the requirements outlined below, you have freedom in what kind of website you create.
* This CP is designed to give you an opportunity to practice writing both client (JS) and server-side (Node.js)
  code on your website. This is a great chance to think about how your project could showcase what
  you've learned so far in web programming for your own code portfolio after the quarter ends, so
  I encourage you to explore implementing different features of your web service!


## External Requirements
* Your project must include the following six files at a minimum:
  * `index.html` - main page of your website
  * `styles.css` - file to style your `.html` file
  * `index.js` - containing your client-side JavaScript code
  * **new:** a `app.js` web service your .js file fetches from with at least two different requests (any combination of GET/POST).
  * **new:** an `APIDOC.md` file to document your `app.js` web service.
  * **new:** your project's `package.json` file generated using `npm init` and including any dependencies you use (at minimum `express`). Remember that you should never directly edit this file, as `npm` will update it as needed.


**Important Note**: all static "view" files (HTML/CSS/Client-side JS/any images) must be inside a `public` folder as discussed in class. All other files (e.g. your Node.js/Express web service) should be at the root.

**I will not grade assignments with incorrect directory structure. Please confirm yours is correct with a me if you are unsure.**

* You will be writing both client-side JS and Node.js to incorporate in your website, where your `index.js`
  makes AJAX requests to **your** Node.js web service which responds with information.
* Client-Side JavaScript: Your website must somehow dynamically load information from the web API you've implemented and
present information from that response on the page. This requires that you must:
    * Respond to some event (any UI event) to determine when to fetch the data (using `fetch`), and
    * Dynamically integrate the data returned from your API into the page by manipulating the DOM elements of the page in some non-trivial way using `element.appendChild`, `element.removeChild`, or `element.replaceChild`.
  * Use the `statusCheck` function from lecture to throw an Error if the fetch response status is not `ok` before processing the data. This is a helper function we are requiring you to use (with JSDoc) in your AJAX programs, but the rest of your functions must be your own.
  * Handle any errors caused in the fetch request/response process by displaying a helpful message to the user on the page (i.e. without using `alert`, `console.log` or `console.error`). To do so, you should define a function (e.g. `handleError`) to implement the error-message-displaying and pass that function the `fetch` call chain's `catch` statement. You may use an equivalent AJAX solution in `index.js` with `async`/`await` and `try`/`catch` if you would like, though it's not required.

* **new:** Your Node.js web service should handle at least two **distinct, different** endpoints, one of which outputs nested JSON data (i.e. at least something with a user-defined attribute or index) and one which outputs plain text.
  * Your Node.js must handle at least one invalid request with a 400 error header and a descriptive message as demonstrated in lecture (although you are encouraged to handle more than one type of invalid request). You may include other error codes as well, but must support at least one 400 (invalid client request) error for full credit.
  * Your Node endpoints should do something that is not trivial. Examples of this could include updating the server state, storing information in a variable stored on the server side, customizing responses based on a parameter and/or reading/writing to a file. An endpoint that looks like the example below (**only** setting the type and sending a hardcoded response) will **not** meet the requirements for this cp.
```javascript
app.<type>(() => {
  res.type('<insert type>');
  res.send('<insert response>');
});
```
  * You may implement other types of Node.js responses for more practice.
  * Document your API in [`APIDOC.md`](APIDOC.md). A sample of what your documentation should look like is in [`APIDOC-sample.md`](APIDOC-sample.md). A `.md` file is written in Markdown, documentation on which is [here](https://docs.gitlab.com/ce/user/markdown.html).

## Internal Requirements
For full credit, your page must not only match the External Requirements listed above, but you must also demonstrate that you understand what it means to write code following a set of programming standards. Your code should maintain good code quality. Make sure to review the slides specific to JavaScript! Some guidelines that are particularly important to remember for this assignment are included below.

### HTML/CSS
* Continue to follow the standards for your HTML/CSS, including consistent whitespace/indentation, proper use of classes/ids, separation of languages, avoiding redundancy in CSS, etc.

### JS
* Continue to follow good code quality standards in JS. This includes good use of function decomposition, separation of JS from HTML/CSS, minimizing module-global variables, etc. A few reminders of Code Quality requirements for JS so far:
* Any `.js` code you write must declare `"use strict";` at the top
* All client-side JS must use the module-global pattern (remember that you should not use this module pattern in `app.js` though)
* Define program constants with `UPPER_CASED` naming conventions (using `const` instead of `let` in JS). Examples of common program constants include a  file path to your images if you are working with many images in your JS or an API base url as demonstrated in class).
* Decompose your JS by writing smaller, more generic functions that complete one task rather than a few larger "do-everything" functions. Limit your use of anonymous functions - meaningful behavior should be factored out with a named function.
* Localize your variables as much as possible. You should not use any global variables (outside the module pattern). Only use module-global variables whenever absolutely necessary. Do not store DOM element objects, such as those returned by the `document.getElementById` function, as module-global variables.
* Limit your use of anonymous functions - meaningful behavior should be factored out with a named function
* Do not make unnecessary requests to your API. That is, there should be no code in your JS that requests from an API and **never** does anything with the response.

**New CP4-Specific Requirements**:
* Your Node.js web service should specify the correct content type by setting the header using a consistent convention before outputting and response (this includes 400 errors). These headers should only be set when necessary and should not be overridden.
* Your Node.js code should not generate any HTML
* Similar to your client-side JS, decompose your Node.js/Express API by writing smaller, more generic functions that complete one task rather than a few larger "do-everything" functions - no function should be more than 30 lines of code, and your Node.js should have **at least** one helper function defined and used. Consider factoring out important behavior for your different GET/POST requests into functions.

### All
Requirements continuing from previous CP assignments:
* Your HTML, CSS, JavaScript, and Node.js should demonstrate consistent and readable source code aesthetics as demonstrated in class.
* Place a comment header in each file with your name, section, and a brief description of the file (examples have been given on previous assignments)

**New CP4-Specific Requirements** (in addition to following the Node.js section of the Code Quality Guide):
* Document your Node.js functions using the same JSDoc requirements as your client-side JS file (e.g. `@param` and `@return`).
* Briefly document any request-handling functions (e.g. `app.get`, `app.post`, etc.) with comments about the endpoint. If you use anonymous functions for your callback, these comments should be more descriptive. If you use named functions for your callback, you can rely more on the named function JSDoc.
* Include a  description of your Node.js web service and the parameters/responses that would be important for you/other developers to understand the program. Use your `APIDOC.md` for a more descriptive public documentation of your API (used by clients).

## Grading
Grading for Creative Projects is lighter with the chance to explore and learn without the overhead of having to match strict external requirements. My goal is to give you feedback, particularly on the internal requirements and documentation.

This CP will be out of 100 points.

## Academic Integrity
Creative Projects are unique in that students may look for outside resources for inspiration or assistance in accomplishing their goals. On occasion students may wish to use portions of sample code that has been obtained through Canvas resources or others. In order to avoid academic misconduct for a Creative Project in AD 320 you must include school appropriate content. If I find inappropriate content or plagiarism in CPs you will be ineligible for any points on the CP. Ask the instructor if you're unsure if your work is cited appropriately. Any external sources like images should be cited where used in the source code or (ideally) visible in a page footer.
