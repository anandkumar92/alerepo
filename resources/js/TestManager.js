/**
 * Manages all interaction with test data
 * @param args
 * @returns {TestManager}
 */
function TestManager(args)
 {
  // Args interface
  // --------------
  var app = args.link,
  
      // Questions node of the template's JSON
      _data = args.testData,
      
      testID = args.testName || 0,


  // Private vars
  // ------------
      console = app.console,
      
      // Determines score required for setting cmi.success_status to pass/fail
      successThreshold = 50;


  // Private methods
  // ---------------
  /**
   * Template class has this same method though it's public (could be confusing).
   * Also, there is no setter
   * _data's value is set when _data is created and set to args.test
   * ...which resolves to app.template.getData().questions
   * ...which resolves to the 'questions' node of the entire template's JSON
   * @return {Object} data
   */
  function getData()
   {
    return _data;
   }

  /**
   * Pulls questionBank from app (it's stored there for persistence)
   * Defaults to the current testID.
   * Can override and return all (for stringifying) via args
   * Each test template will call this via app.getTest().getQuestionBank()
   * @param {Object} args:type
   * @returns {Object} app.questionBank
   */
  function getQuestionBank(args)
   {
    // Args interface
    var thisTestID;
    
    // This type check is for legacy support for those
    // templates which use getQuestionBank
    if (!args) { 
      // Returns data for the current test
      return app.questionBank[app.getPageName()];
     } else if (typeof(args) === 'string' || typeof(args) === 'undefined') {
      thisTestID = args || testID;
      return app.questionBank[thisTestID];
     } else if (args.type === 'all') { // Returns the whole object
      return app.questionBank;
     } else {
      return;
     }
   }
  
  /**
   * Checks the CMI data model to see if any test data has been stored.
   * @returns {Boolean}
   */
  function interactionDataExists()
   {
    return (app.scorm.scormProcessGetValue('cmi.interactions._count') > 0) ? true : false;
   }

  /** 
   * _questionBank stores the latest question data. If the user comes to the assignment
   * after having already completed it, we can add a UI element somewhere to re-take the
   * test, which will only reset the _questionBank & the interaction data from previous
   * tests will remain in the DB. 
   * 
   * If they complete the test, then click to re-take it and:
   * A. don't continue past the first question before exiting:
   *    when they return, they should see the (results page || the first question page)?
   *    
   * B. exit after having submitted only a couple questions
   *    when they return, they should see the last most completed questions page
   * @param {Object} args
   */
  function populateQuestionBank(args)
   {
    var data = args.data,
        thisTestID = args.testID || testID,
        i, // Used in the loop below
        y; // Used in the loop below
    
    // Set up a data structure that quiz templates can use to model UI
    // and that recordInteraction can use to submit data.
    for (i in data) 
     { // ...for each question
      if (data.hasOwnProperty(i)) {
        app.questionBank[thisTestID][i] = app.questionBank[thisTestID][i] || {};
        for (y in data[i]) { 
          //....for each question item
          if (data[i].hasOwnProperty(y)) {
            app.questionBank[thisTestID][i][y] = data[i][y];
           }
         }
       }
     }
   }
  
  /**
   * Gets sent an ID and a value which are used to poll the questions object
   * for the other data required to make the record() call.
   * All test templates will call this.
   * It is a public wrapper for the SCORM API
   * @param {Object} args
   */
  function recordInteraction(args)
   {
    var attemptsTaken = args.attemptsTaken,
        id = args.id,
        description = args.description || '',
        template = args.template || app.template.getTemplateName(),
        thisTestID = args.testID || testID,
        that = this,
        value;
    
    // Check to see if the value is undefined.
    // Previous inline || operator would fail if the string was empty, thus recording the previous answer.
    if (args.value !== undefined)
     {
      value = value = args.value;
     }
    else
     {
      // This is used as a safety in case we are recording a custom value into the test data (i.e. not passing any learner_response)
      if (app.questionBank[thisTestID][id].learner_response !== undefined)
       {        
        value = app.questionBank[thisTestID][id].learner_response;
       }
      else
       {
        value = undefined;
       }
     }
    
    /** Prevents unnecessary data from being sent to the DB */
    function cleanQuestionBank()
     {
      var cleanQuestionBank = {},
          tempQuestionBank = $.extend(true, {}, that.getQuestionBank({
                                                                      type : 'all'
                                                                     }));
      
      
      $.each(tempQuestionBank, function (index, val)
                                {
                                 if (tempQuestionBank[index].length > 0) {
                                   $.each(val, function (index2, val2)
                                                {
                                                 delete tempQuestionBank[index][index2].answers;
                                                 delete tempQuestionBank[index][index2].correctAnswer;
                                                 delete tempQuestionBank[index][index2].description;
                                                 delete tempQuestionBank[index][index2].group;
                                                 delete tempQuestionBank[index][index2].type;
                                                });
                                  }
                                });
      
      cleanQuestionBank = tempQuestionBank;
      
      return cleanQuestionBank;
     }
    
    /** Stringifies app.questionBank and saves it to SCORM DB */
    function record()
     {
      var stringifiedQuestionBank;
      
      // Updating the learner response
      setQuestionBank({
                       attemptsTaken : attemptsTaken,
                       description : description,
                       id : id,
                       template : template,
                       testID : thisTestID,
                       value : value
                      });
      
      stringifiedQuestionBank = JSON.stringify(cleanQuestionBank());
      
      // Save question bank to CMI DB
//      app.scorm.scormProcessSetValue('cmi.interactions.0.id', 0);
//      app.scorm.scormProcessSetValue('cmi.interactions.0.type', 'long-fill-in');
//      app.scorm.scormProcessSetValue('cmi.interactions.0.learner_response', stringifiedQuestionBank);
      app.scorm.scormProcessSetValue('cmi.suspend_data', stringifiedQuestionBank);
     }
    
    record();
   }
  
  /**
   * Pushes the score and completion status to the CMI DB
   * All test templates will call this.
   * It is a public wrapper for the SCORM API
   * @param {Object} args
   */
  function recordTest(args)
   {
    // ...test is "turned on"
    if (app.template.getData().metadata[0].persistData !== 'false') {
      var score = 0;
      
      // If the test has auto grading then we will set the score of the cap stone test
      if (app.getPackageData().packageData[0].manuallyGradableContent === false)
       {
        score = args.score / 100;
       }
      
      // Report score
      app.scorm.scormProcessSetValue('cmi.score.scaled', score);
      app.scorm.scormProcessSetValue('cmi.completion_status', 'completed');
      
      if (score < (successThreshold / 100)) {
        app.scorm.scormProcessSetValue('cmi.success_status', 'failed');
       } else {
        app.scorm.scormProcessSetValue('cmi.success_status', 'passed');
       }
     }
   }
  
  /**
   * For updating test result for each attempt.
   *
   * args: {
   *    testId: 'map',
   *    score: 10,
   *    attempt: 1,
   *    persist: true/false
   * }
   */
  function recordAttemptResult(args) 
   {
      if(!args || !args.attempt) {
          return;
      }
      var thisTestId = args.testId || testID,
          questions = getQuestionBank(thisTestId),
          // Get the last element in the questions array to store score for each attempt.
          lastQuestion = questions[questions.length - 1];
      if(!lastQuestion.attempts) {
          lastQuestion.attempts = {};
      }
      // The last question element will have on property called 'attempts' i.e.
      // attempts: {
      //  "1": {
      //   score: 50,
      //   result: ["1", "2", "1", "2"] //value will be the learner_response.
      //  },
      //  "2": {
      //   score: 100,
      //   result: ["0", "1", "1", "1"]
      //  }
      // }
      //
      var buildResult = function(list, prop) 
                         {
                          var result = [];
                          if(prop && list.length) {
                           $(list).each(function(index, elem)
                                         {
                                          result.push(elem[prop]);
                                         });    
                          }
                          return result;
                         };
      var info = {
                  score: args.score,
                  result: buildResult(questions, 'learner_response')
                 };
      // store extra info if args.extraProp specified.
      if(args.extraProp)
       {
        info[args.extraProp] = buildResult(questions, args.extraProp);
       }

      lastQuestion.attempts[args.attempt + ''] = info;
      
      if(args.persist)
       {
        app.getTest().recordInteraction({id:0});
       }
   }
  /**
   * Called by template.loadAndRender()
   */
  function render()
   {
    var current_template,
        fullInteractionData = setUpTests(),
        i,
        interactionData,
        interactionsLength,
        jsonData,
        x;
    
    if (testDataExists()) { // ... in the template's JSON file
      // Initialize private vars
      jsonData = getData().data;
      
      // Add questions data to questionBank
      populateQuestionBank({
                            data : jsonData,
                            testID : testID
                           });
      
      // ...in the LMS DB (they're returning to a suspended or completed session)
      if (interactionDataExists() && fullInteractionData) { 
        // Populate questionBank
        
        // Parse JSON
        interactionData = {};
        
        // If there is interaction history data for this test, add it to the questionBank
        if ($.isEmptyObject(fullInteractionData[testID]) !== true) {
          interactionsLength = fullInteractionData[testID].length;
          
          for (x = 0; x < interactionsLength; x++) {
            // We only augment the existing _questionBank with any
            // responses the learner has already given
            if ($.isEmptyObject(interactionData[x])) {
              interactionData[x] = {};
             }
            
            interactionData[x].id = x;
            
            if (fullInteractionData[testID][x].learner_response) {
              interactionData[x].learner_response = fullInteractionData[testID][x].learner_response;
             }
           }
          
          // This will augment the _questionBank with previous answers
          populateQuestionBank({
                                data : interactionData,
                                testID : testID
                               });
         }
       }
      
      current_template = app.template.getData().metadata[0].template;
      app.hooks.getHooks({
                          link : app[current_template],
                          name : 'RenderTest'
                         });
     }
   }
  
  /**
   * 
   * @param args
   */
  function setQuestionBank(args)
   {
    var attemptsTaken = args.attemptsTaken || undefined, // NOTE: SEE COMMENTS IN vidNotesRemediation.js -> buildHTML()
        description = args.description,
        id = args.id,
        response = args.value,
        template = args.template,
        testID = args.testID;
    if(attemptsTaken)
     {
      app.questionBank[testID][id].attemptsTaken = attemptsTaken;    
     }
    app.questionBank[testID][id].description = description;
    app.questionBank[testID][id].learner_response = response;
    app.questionBank[testID][id].template = template;
   }
  
  /**
   * Moves data from CMI DB to questionBank 
   * Add default values for current test
   */
  function setUpTests()
   {
//    var fullInteractionData = $.parseJSON(app.scorm.scormProcessGetValue('cmi.interactions.0.learner_response'));
   var fullInteractionData;
   if(app.scorm.scormProcessGetValue('cmi.suspend_data') !== ''){
    fullInteractionData = $.parseJSON(app.scorm.scormProcessGetValue('cmi.suspend_data'));
   }
   else if(app.scorm.scormProcessGetValue('cmi.interactions.0.learner_response') !== ''){
    fullInteractionData = $.parseJSON(app.scorm.scormProcessGetValue('cmi.interactions.0.learner_response'));
   }
   else{
    console.log('There is a problem with test submission.');
   }
    
    // Inject the CMI DB data into the questionBank on first load
    if (fullInteractionData) {
      $.each(fullInteractionData, function (index, value)
        {
         if (!app.questionBank[index]) {
           app.questionBank[index] = value;
          }
        }); 
    }
    
    // Setup the current test's question bank
    if (!app.questionBank[testID]) {
      app.questionBank[testID] = [];
     }
    
    return fullInteractionData;
   }

  /**
   * 
   * @returns
   */
  function testDataExists()
   {
    return getData().data !== undefined && getData().data.length > 0 ? true : false;
   }

  function _toggleGating(pageName, isGated)
   {
      if (!pageName) 
       {
        pageName = app.getPagesObject().pages[app.getCurrentPage()].name;
       }
      app[isGated 
          ? 'setTestIncompleted'
          : 'setTestCompleted'](pageName);
      var nextBtn = $('a.ALE_next');
      if(nextBtn.length)
       {
        nextBtn.unbind('click');
        if(isGated) 
         {
          nextBtn.attr('disabled', true).addClass('disabled');
         }
        else
         {
          nextBtn.removeAttr('disabled')
                 .removeClass('disabled')
                 .bind('click', function() 
                                 {
                                  app.doNext();
                                  return false;
                                 });
         }   
       }
      else 
       {
        nextBtn = $('#nav_right_btn, #nav_next_link');
        if(nextBtn.length)
         {
          nextBtn.unbind('click');
          if(isGated) 
           {
            nextBtn.addClass('disabled');
           }
          else
           {
            nextBtn.removeClass('disabled')
                   .bind('click', function() 
                                   {
                                    app.doNext();
                                    return false;
                                   });
            }   
         }
       }
   }
  /**
   * Removes 'disabled' attribute from next button and other related styles
   * Sets app.testCompleted to true keeping the test unlocked for return visits
   * @method ungateThisTest
   * @return undefined
   */
  function ungateThisTest(pageName)
   {
      _toggleGating(pageName, false);
   }
  /**
   * Gate the test
   * @param pageName
   */
  function gateThisTest(pageName)
   {
      _toggleGating(pageName, true);
   }
  // Public interface
  // ----------------
  this.getQuestionBank = getQuestionBank;
  this.recordInteraction = recordInteraction;
  this.recordTest = recordTest;
  this.render = render;
  this.ungateThisTest = ungateThisTest;
  this.gateThisTest = gateThisTest;
  this.recordAttemptResult = recordAttemptResult;
  
 }