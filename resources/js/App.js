function App(baseURL)
 {
  // Args interface
  // --------------
  baseURL = baseURL || '';

  // Private vars
  // ------------
  var _bookmark,
      _cache = {},
      _completionStatus = 'unknown',
      
      // INT describing _pagesObject array index
      _currentPage = 0,
      
      _data = {},
      _diagnostic = false,
      _externalConfig,
      _hasAssessment,
      _lastKnownPage = 0, // Default required for navigation links
      _lightboxId = 1,
      _packageData = {},
      _packageName = 'package',
      
      // Stores the name values from pages.json in an array
      _pageArray = [],
      
      // Returns the name value from pages.json for the current page (e.g., SP_SC01a_06_map)
      _pageName = 'template',
      
      // Stores entire JSON object from pages.json. Retrieved from getPages()
      _pagesObject,
      
      _progressMeasure = 0, // Default required for navigations links
      _reachedEnd,
      _startTimeStamp = new Date(),
      
      // Stores the current instance of TestManager
      _test,
      
      _testCompleted = [],
      _timestamp,
      _urlVars,
      _processedUnload, // Used in doUnload
      that = this,
      console = new Console(),
      flashVersion = getFlashVersion().split(',').shift(),
      hooks = new Hooks(),
      lightbox = new Lightbox({
                               global : this
                              }),
                              
      // This stores questionBank data for the loaded template
      localData = {},
      
      glossary,
      nimbb,
      scorm,
      template,
      toolkit = new Toolkit({
                             link : this
                            });
  
  function beforeUnload()
   {
    $(window).bind('beforeunload', function ()
                                    {
                                     console.debug('beforeUnloading');
                                    });
   }

  function buildPage()
   {
    // Hide the distortion of unloading a template
    $('#main_container, div.lightbox').hide();
    
    setPageName(getPageArray()[getCurrentPage()]);
    startButton(getPageName());
    checkForAndRunTests();
   }

  function checkBookmark(callback)
   {
    setBookmark(scorm.scormProcessGetValue('cmi.location', false));
    
    if (getBookmark() === null || isNaN(parseInt(getBookmark(), 10))) {
      setCurrentPage(0);
     }
    else {
      if (confirm("Would you like to resume from where you previously left off?")) {
        setCurrentPage(parseInt(getBookmark(), 10));
       }
      else {
        setCurrentPage(0);
        scorm.scormProcessSetValue('cmi.suspend_data', '');
        if(scorm.scormProcessGetValue('cmi.interactions.0.learner_response') !== ''){
         scorm.scormProcessSetValue('cmi.interactions.0.learner_response', '');
        }
       }
     }
     
    callback();
   }

  function checkForAndRunTests()
   {
    var unitTests = getPackageData().packageData[0].unitTests;
    
    if (unitTests || window.parent.window.location.search !== (null || '')) {
      var get = (window.parent.window.location.search) ? window.parent.window.location.search.toString().split("?",2)[1].split("=",2) : null;
      if (unitTests || get[0] === "test") {
        $('body').unbind('runUnitTests')
                 .bind('runUnitTests', function (that)
                                          {
                                           var baseURL = ALE_Load.resourcePath || this.baseURL || './';
                                           // If the test HTML has already been loaded, don't load it again
                                           if ($('#unit_test_content').length < 1) {
                                             $('head').append('<link rel="stylesheet" href="' + baseURL + 'resources/js/lib/qunit/css/qunit.css" type="text/css" media="screen" />');
                                             
                                             // Insert unit test HTML
                                             var unitTestHTML = ['<div id="unit_test_content">', '<h1 id="qunit-header">ALE Unit Tests</h1>', '<h2 id="qunit-banner"></h2>', '<h2 id="qunit-userAgent"></h2>', '<ol id="qunit-tests"></ol>', '<div id="qunit-fixture"></div>', '</div> <!-- unit_test_content -->'].join('');
                                             $('body').append(unitTestHTML);
                                            }
                                            
                                           $('#unit_test_content').show();
                                            
                                           $.getScript(baseURL + "resources/js/tests/" + getPackageData().packageData[0].unitTests + "_global_test.js");
                                           
                                           var thisTemplate = template.getData().metadata[0].template.toString();
                                           var thisScript = baseURL + "resources/js/tests/" + thisTemplate + "_test.js";
                                           
                                           $.getScript(thisScript);
                                          });
       }
      else if (get[0] === "diagnostic") {
        setDiagnostic(true);
       }
     }
   }

  /*
   * SCORM requires time to be formatted in a specific way
   */
  function convertMilliSecondsIntoSCORM2004Time(intTotalMilliseconds)
   {
    var ScormTime = "",
        HundredthsOfASecond, //decrementing counter - work at the hundreths of a second level because that is all the precision that is required
        Seconds, // 100 hundreths of a seconds
        Minutes, // 60 seconds
        Hours,  // 60 minutes
        Days,  // 24 hours
        Months,  // assumed to be an "average" month (figures a leap year every 4 years) = ((365*4) + 1) / 48 days - 30.4375 days per month
        Years,  // assumed to be 12 "average" months
        HUNDREDTHS_PER_SECOND = 100,
        HUNDREDTHS_PER_MINUTE = HUNDREDTHS_PER_SECOND * 60,
        HUNDREDTHS_PER_HOUR   = HUNDREDTHS_PER_MINUTE * 60,
        HUNDREDTHS_PER_DAY    = HUNDREDTHS_PER_HOUR * 24,
        HUNDREDTHS_PER_MONTH  = HUNDREDTHS_PER_DAY * (((365 * 4) + 1) / 48),
        HUNDREDTHS_PER_YEAR   = HUNDREDTHS_PER_MONTH * 12;
    
    HundredthsOfASecond = Math.floor(intTotalMilliseconds / 10);
    
    Years = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_YEAR);
    HundredthsOfASecond -= (Years * HUNDREDTHS_PER_YEAR);
    
    Months = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MONTH);
    HundredthsOfASecond -= (Months * HUNDREDTHS_PER_MONTH);
    
    Days = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_DAY);
    HundredthsOfASecond -= (Days * HUNDREDTHS_PER_DAY);
    
    Hours = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_HOUR);
    HundredthsOfASecond -= (Hours * HUNDREDTHS_PER_HOUR);
    
    Minutes = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_MINUTE);
    HundredthsOfASecond -= (Minutes * HUNDREDTHS_PER_MINUTE);
    
    Seconds = Math.floor(HundredthsOfASecond / HUNDREDTHS_PER_SECOND);
    HundredthsOfASecond -= (Seconds * HUNDREDTHS_PER_SECOND);
    
    if (Years > 0) {
      ScormTime += Years + "Y";
     }
     
    if (Months > 0) {
      ScormTime += Months + "M";
     }
     
    if (Days > 0) {
      ScormTime += Days + "D";
     }
     
    // Check to see if we have any time before adding the "T"
    if ((HundredthsOfASecond + Seconds + Minutes + Hours) > 0 ) {
      ScormTime += "T";
      
      if (Hours > 0) {
        ScormTime += Hours + "H";
       }
       
      if (Minutes > 0) {
        ScormTime += Minutes + "M";
       }
       
      if ((HundredthsOfASecond + Seconds) > 0) {
        ScormTime += Seconds;
        
        if (HundredthsOfASecond > 0) {
          ScormTime += "." + HundredthsOfASecond;
         }
         
        ScormTime += "S";
       }
       
     }
     
    if (ScormTime === "") {
      ScormTime = "0S";
     }
     
    ScormTime = "P" + ScormTime;
    
    return ScormTime;
   }

  function doNext()
   {
    // Cache DOM for toolkit use
//    if (template.getTemplateName() !== 'interview' && template.getTemplateName() !== 'video')
//     {
//      setCache({
//                cssSkin : template.getData().metadata[0].cssSkin,
//                cache : getPageName(),
//                html : $('div#main_container').clone(false),
//                json : template.getData(),
//                template : template.getTemplateName()
//               });
//     }
    
    // Remove what was set by toolkit
//    delete this.toolkitInit;
    
    
    if (getCurrentPage() < (getPageArray().length -1)) {
      setCurrentPage(getCurrentPage() + 1);
     }
    goToPage();
   }

  function doPrevious()
   {
    if (getCurrentPage() > 0) {
      setCurrentPage(getCurrentPage() - 1);
     }
    
    goToPage();
   }

  function doUnload()
   {
    if (_processedUnload === true) {
      return;
     }
    
    _processedUnload = true;
    
    // Record the session time
    var endTimeStamp = new Date();
    var totalMilliseconds = (endTimeStamp.getTime() - _startTimeStamp.getTime());
    var scormTime = convertMilliSecondsIntoSCORM2004Time(totalMilliseconds);
    
    scorm.scormProcessSetValue("cmi.session_time", scormTime);
    
    if(getCurrentPage() === (getPageArray().length - 2)){
     scorm.scormProcessSetValue('cmi.completion_status', 'completed');
    }
    else{
     scorm.scormProcessSetValue('cmi.completion_status', 'incomplete');
    }

    if (scorm.scormProcessGetValue('cmi.success_status') !== ('passed' || 'failed')) {
      scorm.scormProcessSetValue("cmi.success_status", "unknown");
     }
    
    // Always default to saving the runtime data in this example
    scorm.scormProcessSetValue("cmi.exit", "suspend");
    scorm.scormProcessTerminate();
    
	 //C15    
    if (getExternalConfig().lmsName === 'C15') {
    	  if (window.parent.returnToC15) {
      		return window.parent.returnToC15();
    	  }
		}
    // There's probably a different & better way to do this
    window.parent.parent.parent.location.href = getExternalConfig().saveAndExitUrl;
   }

  function getBookmark()
   {
    return _bookmark;
   }
  
  function getCache()
   {
    return _cache;
   }

  function getCompletionStatus()
   {
    return _completionStatus;
   }
  
  function getCurrentPage()
   {
    return _currentPage;
   }

  function getDiagnostic()
   {
    return _diagnostic;
   }

  function getEnvironmentVariable()
   {
    if (getExternalConfig().lmsName === 'Connect') {
      return getExternalConfig().env;
     }
    else {
      return '';
     } 
   }
    
  function getExternalConfig()
   {
    if (_externalConfig === undefined) {
      setExternalConfig(scorm.parent().ExternalConfig);
     }
     
    return _externalConfig;
   }

  function getFlashVersion()
   {
    // ie
    try {
      try {
        // avoid fp6 minor version lookup issues
        // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
        var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
        try { axo.AllowScriptAccess = 'always'; }
        catch(e) { return '6,0,0'; }
      } catch(e) {}
      return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
    // other browsers
    } catch(e) {
      try {
        if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
          return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
        }
      } catch(e) {}
    }
    return '0,0,0';
   }

  function getHasAssessment()
   {
    return _hasAssessment;
   }

  function getLastKnownPage()
   {
    return _lastKnownPage;
   }

  function getLightboxId()
   {
    _lightboxId++;
    return _lightboxId;
   }

  function getPackageData()
   {
    return _packageData;
   }

  function getPackageName()
   {
    return _packageName;
   }

  function getPageArray()
   {
    return _pageArray;
   }

  function getPageName()
   {
    return _pageName;
   }

  function getPages(callback)
   {
   if(getPackage() === undefined){
    $.ajax({
            dataType : 'json',
            url : 'resources/data/pages.json',
            async : false,
            cache : false,
            success : function (data)
                       {
                        setPagesObject(data);
                        setPageArray();
                        callback() || function () {};
                       },
            error : function (XMLHttpRequest, textStatus, errorThrown)
                     {
                      //console.info('ERROR => XMLHttpRequest:');
                      //console.debug(XMLHttpRequest);
                      //console.info('ERROR => textStatus:');
                      //console.debug(textStatus);
                      //console.info('ERROR => errorThrown:');
                      //console.debug(errorThrown);
                      return false;
                     }
          });
   }
   else{
    $.ajax({
     dataType : 'json',
     url : '/s3scorm/ale/content/data/'+ getPackage() +'_pages.json',
     async : false,
     cache : false,
     success : function (data)
                {
                 setPagesObject(data);
                 setPageArray();
                 callback() || function () {};
                },
     error : function (XMLHttpRequest, textStatus, errorThrown)
              {
               //console.info('ERROR => XMLHttpRequest:');
               //console.debug(XMLHttpRequest);
               //console.info('ERROR => textStatus:');
               //console.debug(textStatus);
               //console.info('ERROR => errorThrown:');
               //console.debug(errorThrown);
               return false;
              }
   });
   }
   }

  function getPagesObject()
   {
    return _pagesObject;
   }

  function getProgressMeasure()
   {
    return _progressMeasure;
   }

  function getReachedEnd()
   {
    return _reachedEnd;
   }

  function getTest()
   {
    return _test;
   }

  function getTestCompleted(pageName)
   {
    return _testCompleted[pageName];
   }
  
  function getTimeStamp()
   {
    return _timeStamp;
   }

  function getUrlVars()
   {
    if (_urlVars === undefined) {
      setUrlVars(scorm.parent().document.URL);
     }
     
    return _urlVars;
   }

  function goToPage()
   {
    try
    {      
     flowplayer('*').each(function()
       {
        if (this.isLoaded() === true)
         {
          this.stop();
          this.close();
          this.unload();
         }
       });
    }
   catch(e)
    {
 //    alert(e)
    }
    var _currentPage = getCurrentPage();
    
    // Call templateUnloaded Hook
    
    if (that.thisTemplate && that.thisTemplate.templateUnloaded)
     {
      hooks.getHooks({
       name : 'TemplateUnloaded',
       link : that[template.getData().metadata[0].template]
      });
     }
    
    
    // Save the current location as the bookmark
    scorm.scormProcessSetValue('cmi.location', _currentPage);
    
    setLastKnownPage(getProgressMeasure());
    
    // Determine if the current page comes after the previously lastKnownPage
    if (_currentPage > getLastKnownPage()) {
      setProgressMeasure(getCurrentPage());
     }
    
    // Set the lastKnownPage to the new value (if changed)
    setLastKnownPage(getProgressMeasure());
    
    // In this example, if there is an assessment, the SCO isn't completed until it is submitted
    // NOTE: having only one page will trigger this
    if (_currentPage === (getPageArray().length -1)) {
      setReachedEnd(true);
      
      // For simplicity's sake, mark the course as passed when it is completed
      // and doesn't have a test. This will make our sequencing based on global
      // objectives simpler.
      if (getHasAssessment() === false) {
        scorm.scormProcessSetValue('cmi.completion_status', 'completed');
        scorm.scormProcessSetValue('cmi.success_status', 'passed');
       }
      
      scorm.scormProcessCommit();
     }
    
    // Navigate the frame to the content
    templateLoaded();
   }

  function init()
   {
    glossary = that.glossary;
    nimbb = that.nimbb;
    scorm = that.scorm;
    template = that.template;
    
    onLoad();
    beforeUnload();
    onUnload();
   }

  function instructorIsViewing()
   {
    return (getUrlVars().registration !== null && getExternalConfig().roleName === 'I' && getPackageData().packageData[0].manuallyGradableContent === true);
   }

  function isIframe()
   {
    if (window.location !== window.parent.location) {
      return 'true';
     }
    else {
      return 'false';
     }
   }

  function loadPackageData(url)
   {
   if(getPackage() === undefined){
    $.ajax({
            dataType : 'json',
            url : 'resources/data/' + url + '.json',
            async : false,
            cache : false,
            success : function (data)
                       {
                        setPackageData(data);
                       },
            error : function (XMLHttpRequest, textStatus, errorThrown)
                     {
                      //console.info('ERROR => XMLHttpRequest:');
                      //console.debug(XMLHttpRequest);
                      //console.info('ERROR => textStatus:');
                      //console.debug(textStatus);
                      //console.info('ERROR => errorThrown:');
                      //console.debug(errorThrown);
                      return false;
                     }
           });
   }
   else {
    $.ajax({
     dataType : 'json',
     url : '/s3scorm/ale/content/data/' + getPackage() + '_' + url + '.json',
     async : false,
     cache : false,
     success : function (data)
                {
                 setPackageData(data);
                },
     error : function (XMLHttpRequest, textStatus, errorThrown)
              {
               //console.info('ERROR => XMLHttpRequest:');
               //console.debug(XMLHttpRequest);
               //console.info('ERROR => textStatus:');
               //console.debug(textStatus);
               //console.info('ERROR => errorThrown:');
               //console.debug(errorThrown);
               return false;
              }
    });
   }
   }
  
  function loadResource(namespace, obj)
   {
    this[namespace] = obj;
    // Return this(instance of App.js) gives ability to do object method chaining.
    return this;
   }
  
  function onLoad()
   {
    loadPackageData(getPackageName());
    getPages(onLoadFinish);
   }

  function onLoadFinish()
   {
    setTimeStamp(new Date());
    scorm.scormProcessInitialize();
    setCompletionStatus(scorm.scormProcessGetValue('cmi.completion_status', true));
    
    if (getCompletionStatus() === 'unknown') {
      scorm.scormProcessSetValue('cmi.completion_status', 'incomplete');
     }
 
    // If viewer is instructor and there is manually graded material, send them to the results page
    if (instructorIsViewing()) {
      redirectInstructor();
     }
    else {
      // ...otherwise proceed as usual 
      checkBookmark(goToPage);
     }
   }

  function onUnload()
   {
    $(window).bind('onunload', function ()
                                {
//                                 console.debug('onUnloading');
                                 doUnload();
                                });
   }

  function redirectInstructor()
   {
    setCurrentPage(getPageArray().length - 2);
    goToPage();
   }

  function parseExternalConfig(args)
   {
    var newString = args.split('!'),
        tempObject = {}; // Used to store the new object
    var x;
    for (x in newString) {
      tempObject[newString[x].split('|')[0]] = newString[x].split('|')[1];
     }
    
    return tempObject;
   }

  function parseUrlVars(args)
   {
    var newString = args.split('?'),
        tempObject = [];
    
    if (newString.length > 1) {
      newString = newString[1].split('&');
      var x;
      for (x in newString) {
        tempObject[newString[x].split('=')[0]] = newString[x].split('=')[1];
       }
     }
     
    return tempObject;    
   }

  function setBookmark(value)
   {
    _bookmark = value;
   }

  function setCompletionStatus(value)
   {
    _completionStatus = value;
   }
  
  function setCache(args)
   {
//    if (args.void === true)
//     {
//      delete _cache[args.cache];
//      
//      return;
//     }
    
    _cache[args.cache] = {
                          cssSkin : args.cssSkin,
                          html : args.html,
                          json : args.json,
                          template : args.template
                         };
   }
  
  function setCurrentPage(value)
   {
    _currentPage = value;
   }

  function setDiagnostic(value)
   {
    _diagnostic = value;
   }
   
  function setExternalConfig(args)
   {
    newArgs = parseExternalConfig(args);
    
    _externalConfig = $.extend({
                                saveAndExitUrl : 'http://www.defaulturl.com',
                                env : 'http://connect.mcgraw-hill.com'
                               }, newArgs);
   }

  function setHasAssessment(value)
   {
    _hasAssessment = value;
   }

  function setLastKnownPage(value)
   {
    _lastKnownPage = value;
   }

  function setPackageData(value)
   {
    _packageData = value;
   }

  function setPageName(value)
   {
    _pageName = value || '';
   }

  function setPageArray(data)
   {
    $.each(getPagesObject().pages, function (index, value)
                                    {
                                     _pageArray.push(value.name);
                                    });
   }

  function setPagesObject(data)
   {
    _pagesObject = data;
   }

  function setProgressMeasure(value)
   {
    _progressMeasure = value;
   }

  function setReachedEnd(value)
   {
    _reachedEnd = value;
   }

  function setTest(value)
   {
    _test = value;
   }
  
  function setTestCompleted(pageName)
   {
    _testCompleted[pageName] = true;
   }
  
  function setTestIncompleted(pageName) 
   {
    _testCompleted[pageName] = false;
   }

  function setTimeStamp(value)
   {
    _timeStamp = value;
   }

  /**
   * Called by each test template which needs access to persisted data (having this method in App removes redundancies)
   * @param {object} templates an array of template names to which data the current template needs access to
   * @returns {object} localData
   */
  function setUpLocalData(templates)
   {
    templates = templates || {};
    
    localData.thisPage = getTest().getQuestionBank();
    
    if (getPagesObject().pages[getCurrentPage()].persistFrom) {
      localData.persistData = getPagesObject().pages[getCurrentPage()].persistFrom;
     } else {
      localData.persistData = {};
     }
    
    $.each(templates, function (index, value)
                       {
                        if (value && localData.persistData[0]) {
                         localData.persistData[value] = getTest().getQuestionBank(localData.persistData[0][value]);
                        } else {
                         localData.persistData[value] = {};
                        }
                       });
    return localData;
   }
  
  function setUrlVars(args)
   {
    newArgs = parseUrlVars(args);
    
    _urlVars = $.extend({
                         registration : null // Used to determine if an instructor is previewing or manually grading
                        }, newArgs);
   }

  function startButton(pageName)
   {
    template.init(pageName);
   }

  /**
   * called by App.goToPage() & App.template.notifyALEOfLoadComplete()
   * 
   * Ensures ALE.buildPage() only gets called when the contentFrame 
   * has loaded completely and TEMPLATE is available.
   */
  function templateLoaded()
   {
    if (this.template === 'undefined') {
      /**
       * Don't build because TEMPLATE isn't ready
       * NOTE: This will allow TEMPLATE.notifyALEOfLoadComplete() to call
       * ALE.buildPage() because SINCE TEMPLATE will be calling this, it
       * will not be undefined.
       */
     }
    else {
      buildPage();
     }
   }
  
  function getPackage(){
   var search = document.location.search;
   return search.split('?package=')[1];
  }
  
  // Public interface
  // ----------------
  this.baseURL = baseURL;
  this.buildPage = buildPage;
  this.console = console;
  this.doNext = doNext;
  this.doPrevious = doPrevious;
  this.doUnload = doUnload;
  this.externalConfig = getExternalConfig;
  this.flashVersion = flashVersion;
  this.getCache = getCache;
  this.getCurrentPage = getCurrentPage;
  this.getEnvironmentVariable = getEnvironmentVariable;
  this.getFlashVersion = getFlashVersion;
  this.getLastKnownPage = getLastKnownPage;
  this.getPackageData = getPackageData;
  this.getPageArray = getPageArray;
  this.getPageName = getPageName;
  this.getPagesObject = getPagesObject;
  this.getTest = getTest;
  this.getTestCompleted = getTestCompleted;
  this.goToPage = goToPage;
  this.hooks = hooks;
  this.init = init;
  this.instructorIsViewing = instructorIsViewing;
  this.isIframe = isIframe;
  this.lightbox = lightbox;
  this.loadResource = loadResource;
  this.localData = localData;
  this.nimbb = nimbb;
  
  // Multi-dimensional array which maps to CMI
  this.questionBank = {};
  
  this.setCache = setCache;
  this.setCurrentPage = setCurrentPage;
  this.setTest = setTest;
  this.setUpLocalData = setUpLocalData;
  this.toolkit = toolkit;
  this.setTestCompleted = setTestCompleted;
  this.setTestIncompleted = setTestIncompleted;
  this.getPackage = getPackage;
 }

var ale = new App(ALE_Load.resourcePath);

// loadResouce function will return ale instance itself, so we can chain all the function call to one line.
ale.loadResource('scorm', new Scorm(ale))
   .loadResource('glossary', new Glossary(ale))
   .loadResource('nimbb', new Nimbb(ale))
   .loadResource('template', new Template(ale))
   .init();