function Scorm(app)
 {
  // Private methods
  // ---------------
  var _API = null, // Ref to API object
      /*
       * This should be piggy-backed on the recursive findAPI() 
       * function since it should exist at that same window level, 
       * for not we'll just hardcode it because we control the 
       * environment.
       */
      _initialized = false,
      _parent = '', // Stores the parent window object
      _scormFalse = 'false',
      _scormNoError = '0',
      _scormTrue = 'true',
      _terminateCalled = false,
      maxTries = 500,
      nFindAPITries = 0,
      that = this;

  // The <del>GetAPI()</del> findAPI() function begins the process of searching for the LMS
  // provided API Instance.  The function takes in a parameter that
  // represents the current window.  The function is built to search in a
  // specific order and stop when the LMS provided API Instance is found.
  // The function begins by searching the current window�s parent, if the
  // current window has a parent.  If the API Instance is not found, the
  // function then checks to see if there are any opener windows.  If
  // the window has an opener, the function begins to look for the
  // API Instance in the opener window.
  function findAPI(win) // this is the same as the GetAPI() function from the ADL site
   {
    if ((win.parent !== null) && (win.parent !== win))
     {
      setAPI(scanForAPI(win.parent));
     }
    
    if (typeof getAPI() === null && typeof win.opener !== null)
     {
      setAPI(scanForAPI(win.opener));
     }
   }

  function getAPI()
   {
    return _API;
   }

  function getLearnerName()
   {
    var name = getAPI().LearnerName || 'name, student';
    
    name === 'Without Tracking, Preview'
     ? name = 'student'
     : null;
    
    name = name.split(', ', 100);
    
    return [name[1], ' ', name[0]].join('');
   }

  function getInitialized()
   {
    return _initialized;
   }

  function getParent()
   {
    return _parent;
   }

  function getScormFalse()
   { 
    return _scormFalse;
   }

  function getScormNoError()
   {
    return _scormNoError;
   }

  function getScormTrue()
   {
    return _scormTrue;
   }

  function getTerminateCalled()
   {
    return _terminateCalled;
   }

  // The ScanForAPI() function searches for an object named API_1484_11
  // in the window that is passed into the function.  If the object is
  // found a reference to the object is returned to the calling function.
  // If the instance is found the SCO now has a handle to the LMS
  // provided API Instance.  The function searches a maximum number
  // of parents of the current window.  If no object is found the
  // function returns a null reference.  This function also reassigns a
  // value to the win parameter passed in, based on the number of
  // parents.  At the end of the function call, the win variable will be
  // set to the upper most parent in the chain of parents.
  function scanForAPI(win)
   {
    while ((win.API_1484_11 === null) && (win.parent !== null) && (win.parent !== win))
     {
      nFindAPITries++;
      if (nFindAPITries > maxTries)
       {
        return null;
       }
      win = win.parent;
     }
    
    setParent(win);
    return win.API_1484_11;
   }

  function scormProcessInitialize()
   {
    var result;
    
    findAPI(window);
    
    if (typeof getAPI() === 'undefined' || getAPI() === null)
     {
      return null;
     }
    
    result = getAPI().Initialize("");
    
    if (result === getScormFalse())
     {
      var errorNumber = getAPI().GetLastError(),
          errorString = getAPI().GetErrorString(errorNumber),
          diagnostic = getAPI().GetDiagnostic(errorNumber),
          errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
      alert("Error - Could not initialize communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
      return;
     }
    
    setInitialized(true);
   }

  function scormProcessTerminate()
   {
    var result;
    
    // Don't terminate if we haven't initialized or if we've already terminated
    if (getInitialized() === false || getTerminateCalled() === true)
     {
      return;
     }
    
    result = getAPI().Terminate("");
    
    setTerminateCalled(true);
    
    if (result === getScormFalse())
     {
      var errorNumber = getAPI().GetLastError(),
          errorString = getAPI().GetErrorString(errorNumber),
          diagnostic = getAPI().GetDiagnostic(errorNumber),
          errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
      alert("Error - Could not terminate communication with the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
      return;
     }
   }

  function scormProcessGetValue(element, checkError)
   {
    var result;
    
    if (getInitialized() === false || getTerminateCalled() === true)
     {
      return;
     }
     
    result = getAPI().GetValue(element);
    
    if (checkError === true && result === "")
     {
      var errorNumber = getAPI().GetLastError();
     
      if (errorNumber !== getScormNoError())
       {
        var errorString = getAPI().GetErrorString(errorNumber),
            diagnostic = getAPI().GetDiagnostic(errorNumber),
            errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
        //alert("Error - Could not retrieve a value from the LMS.\n\n" + errorDescription);
        return "";
       }
     }
     
	   return result;
    
   }
  
  function scormProcessSetValue(element, value)
   {
    var result;
    
    if (getInitialized() === false || getTerminateCalled() === true)
     {
      return;
     }
      
    result = getAPI().SetValue(element, value);
    
    if (result === getScormFalse())
     {
      var errorNumber = getAPI().GetLastError(),
          errorString = getAPI().GetErrorString(errorNumber),
          diagnostic = getAPI().GetDiagnostic(errorNumber),
          errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
      alert("Error - Could not store a value in the LMS.\n\nYour results may not be recorded.\n\n" + errorDescription);
      return;
     }
   }
  
  function scormProcessCommit()
   {
    var result;
    
    result = getAPI().Commit("");
    
    if (result === getScormFalse())
     {
      var errorNumber = getAPI().GetLastError(),
          errorString = getAPI().GetErrorString(errorNumber),
          diagnostic = getAPI().GetDiagnostic(errorNumber),
          errorDescription = "Number: " + errorNumber + "\nDescription: " + errorString + "\nDiagnostic: " + diagnostic;
      alert("Error - Could not invoke Commit.\n\nYour results may not be recorded.\n\n" + errorDescription);
      return;
     }
   }

  function setAPI(value)
   {
    _API = value;
   }

  function setInitialized(value)
   {
    _initialized = value;
   }

  function setParent(value)
   {
    _parent = value;
   }

  function setScormFalse(value)
   {
    _scormFalse = value;
   }

  function setScormTrue(value)
   {
    _scormTrue = value;
   }

  function setTerminateCalled(value)
   {
    _terminateCalled = value;
   }

  this.API = getAPI;
  this.learnerName = getLearnerName;
  this.parent = getParent;
  this.scormProcessCommit = scormProcessCommit;
  this.scormProcessInitialize = scormProcessInitialize;
  this.scormProcessGetValue = scormProcessGetValue;
  this.scormProcessSetValue = scormProcessSetValue;
  this.scormProcessTerminate = scormProcessTerminate;
 }