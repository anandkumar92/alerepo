/**
 * DragAndDrop template class
 * @constructor
 * @param {Object} args
 */
function DragAndDrop(app)
 {
  // Private vars
  // ------------
      // A product of buildAnswerBank(), looks like an iteration index
  var answersLength,
	// to check that template is rendered or not 
	  templateRendered = false;
      // Stores the number of attempts that the user has taken
      attempts = 0,
  
      // Stores an array of answers to be passed to resetForm upon clicking "try again"
      tryAgainAnswers = [];
  
  var dropNum = app.template.getData().metadata[0].dropNumber || 1;
  
  // Private methods
  // ---------------
  /**
   * Adds an integer value to the array
   */
  function addTryAgainAnswers(value)
   {
    tryAgainAnswers.push(value);
   }
  
  /**
   * Returns app.template.getData().content[0].answerList
   * @return object
   */
  function answerList()
   {
    var answerList = app.template.getData().content[0].answerList;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      answerList = app.toolkit.getData().content[0].answerList;
     }
    
    return answerList;
   }
  
  /**
   * Check answers given against correct answers listed in the JSON.
   * A successful condition calls saveTest() at the bottom.
   * @return
   */
  function assessAnswers()
   {
    // Get answer elements
    var answers = $('div#questions_container li.droppable'),
    
        // Stores length for use later in the loop
        answersLength = answers.length,
        
        // Will store an array which we will pass to saveTest()
        saveTestArray = [];
    
    if (app.template.getData().metadata[0].displayFeedback === false)
     {
      $.each(answers, function (index, value)
        {
         if ($('div#questions_container li.droppable:eq(' + index + ') a.draggable').length > 0)
          {
           var answerGivenID = parseInt($('div#questions_container li.droppable:eq(' + index + ') a.draggable').attr('id').split('_')[1], 10),
               dropGroupID = parseInt($('div#questions_container li.droppable:eq(' + index + ') a.draggable').attr('id').split('_')[2], 10),
               correctAnswerID = parseInt($(this).attr('id').split('_')[1], 10),
               correctAnswers = app.template.getData().questions[correctAnswerID].correctAnswer,
               asnswerGiven,
               
               // Will store the correctAnswer string for sending to the feedback lightbox
               correctAnswer = '',
               correctness = true,
               description,
               that = this;
           
           if(dropGroupID !== undefined && !isNaN(dropGroupID)){
            app.getTest().getQuestionBank()[index]._group = parseInt($('div#questions_container a#question_' + answerGivenID + '_' + dropGroupID).parent('li').parent('ul').parent('div.group').attr('id').split('_')[1], 10) + 1;
            answerGiven = dropGroupID;
           }
           else{
            app.getTest().getQuestionBank()[index]._group = parseInt($('div#questions_container a#question_' + answerGivenID).parent('li').parent('ul').parent('div.group').attr('id').split('_')[1], 10) + 1;
            answerGiven = answerGivenID;
           }
           
           
     //    Push answer given to saveTest array
           saveTestArray.push({
                               index : index,
                               learner_response : answerGiven
                              });
           
           addTryAgainAnswers(index);
           updateCompletedQuestionsCount();
           checkEnableSubmitButton();
           
           // set current attempts
           saveTestArray[saveTestArray.length - 1].description = attempts;
           
           saveTest(saveTestArray);
          }
        });
     }
    else
     {
      
     
    
    // Check against JSON
    $.each(answers, function (index, value)
                     {

                      
                      if ($('a[id]', 'div#questions_container li.droppable:eq(' + index + ')').attr('id') && app.template.getData().metadata[0].displayFeedback !== false)
                       {
                        var answerGivenID = parseInt($('div#questions_container li.droppable:eq(' + index + ') a.draggable').attr('id').split('_')[1], 10),
                            correctAnswerID = parseInt($(this).attr('id').split('_')[1], 10),
                            correctAnswers = app.template.getData().questions[correctAnswerID].correctAnswer,
                            
                            // Will store the correctAnswer string for sending to the feedback lightbox
                            correctAnswer = '',
                            correctness = false,
                            description,
                            that = this;
                        
                        /*
                         * store group information to each question element as property '_group'
                         * This is used for the results page (conclusionRecap)
                         */
                        app.getTest().getQuestionBank()[answerGivenID]._group = parseInt($('div#questions_container li#questions_' + answerGivenID).parent('ul').parent('div.group').attr('id').split('_')[1], 10) + 1;
                        
                        // Accounts for multiple correct answers per question
                        $.each(correctAnswers, function (index2, value2)
                                                {
                                                 var correctAnswer = parseInt(correctAnswers[index2], 10);
                                                 
                                                 if (answerGivenID === (correctAnswer - 1))
                                                  {
                                                   correctAnswer = app.template.getData().questions[correctAnswerID].correctAnswer[(correctAnswer - 1)];
                                                   correctness = true;
                                                  }
                                                });
                       }
                      else if (app.getTest().getQuestionBank()[index].learner_response !== undefined && app.template.getData().metadata[0].displayFeedback !== false)
                       { 
                        //add already correct items to....array?
                        var answerGivenID = parseInt(app.getTest().getQuestionBank()[index].learner_response) - 1,
                            correctAnswers = app.template.getData().questions[index].correctAnswer
                            correctAnswerID = index,
                            correctness = false;
                        
                        /*
                         * store group information to each question element as property '_group'
                         * This is used for the results page (conclusionRecap)
                         */
                        app.getTest().getQuestionBank()[answerGivenID]._group = parseInt($('div#questions_container li#questions_' + answerGivenID).parent('ul').parent('div.group').attr('id').split('_')[1], 10) + 1;
                        
                        $.each(correctAnswers, function (index2, value2)
                                                {
                                                 var correctAnswer = parseInt(correctAnswers[index2], 10);
                                                 
                                                 if (answerGivenID === (correctAnswer - 1))
                                                  {
                                                   correctAnswer = app.template.getData().questions[correctAnswerID].correctAnswer[(correctAnswer - 1)];
                                                   correctness = true;
                                                  }
                                                });
                       }
                      else if ($('div#questions_container li.droppable:eq(' + index + ')').has('a') === false && app.template.getData().metadata[0].displayFeedback !== false)
                       {
                        var correctAnswer = 0,
                            correctness = true;
                       }
                      //Display correct/incorrect, Move incorrect options to answers area
                      if (correctness) {
                        // Add CSS class to show green border for correct
                        $('a', 'div#questions_container li.droppable:eq(' + index + ')').addClass('correct');
                        
                        //Disable drag and dropability 
                        $('a', 'div#questions_container li.droppable:eq(' + index + ')').draggable('destroy');
                        $('a', 'div#questions_container li.droppable:eq(' + index + ')').droppable('destroy');
                        
                        // Generate feedback lightbox link
                        // NOTE: We're using the same element for correctAnswer & yourAnswer because there is an issue with getting
                        // the .html() value from the <span> element in that it doesn't return the HTML encoded value, it returns the actual
                        // value so comparing it to the value in the JSON would cause an error in the lightbox logic
                        
                        // Check if displayFeedback is enabled                        
                        if (app.template.getData().metadata[0].displayFeedback !== false)
                         {
                          // Generate feedback lightbox link
                          showFeedback({
                                        correctAnswer : $('span', 'div#questions_container li.droppable:eq(' + index + ')').html(),
                                        correctness : 'correct',
                                        feedback : app.template.getData().questions[correctAnswerID].answers[answerGivenID].feedback,
                                        target : $('div#questions_container li.droppable:eq(' + index + ')'),
                                        yourAnswer : $('span', 'div#questions_container li.droppable:eq(' + index + ')').html()
                                       });
                         }
                       } else {
                        // Add CSS class to show red border for incorrect
                        $('a:not(.contextual_glossary)', 'div#questions_container li.droppable:eq(' + index + ')').addClass('incorrect');
                        
                        // Check if displayFeedback is enabled
                        if (app.template.getData().metadata[0].displayFeedback !== false)
                         {
                          // Generate feedback lightbox link
                          showFeedback({
                                        correctAnswer : correctAnswer,
                                        correctness : 'incorrect',
                                        feedback : app.template.getData().questions[correctAnswerID].answers[answerGivenID].feedback,
                                        target : $('div#questions_container li.droppable:eq(' + index + ')'),
                                        yourAnswer : $('span', 'div#questions_container li.droppable:eq(' + index + ')').html()
                                       });
                         }
                        
                        
                       }
                      
                      // Push answer given to saveTest array
                      saveTestArray.push({
                                          index : index,
                                          learner_response : answerGivenID
                                         });
                      
                      addTryAgainAnswers(index);
                      updateCompletedQuestionsCount();
                      checkEnableSubmitButton();
                      
                      // set current attempts
                      saveTestArray[saveTestArray.length - 1].description = attempts;
                      
                      saveTest(saveTestArray);
                      return;
                     });
     }
    
    
    app.getTest().recordAttemptResult({
                                       testId: app.getPageName(),
                                       attempt: attempts,
                                       score: getScore(),
                                       persist: true,
                                       extraProp: '_group'
                                      });
   }
  
  /**
   * Applies .draggable() and .droppable() to respective elements.
   */
  function bindDragAndDrop()
   {
    // Remove active class remnants (not sure why the plugin doesn't do this)
    $('li.droppable').removeClass('active');
    var groupNumber;
    // Make the answers elements draggable (but exclude answers marked as correct!)
    $('a.draggable:not(.correct)').draggable('destroy');
    $('a.draggable:not(.correct)').draggable({
                                              revert : 'invalid',
                                              revertDuration : 100,
                                              drag : function (e, ui)
                                                      {
                                                       // zIndex setting required for IE 7 z-index bug
                                                       // drop() resets them to zero
                                                       $(this).parent().css({
                                                                             zIndex : 8
                                                                            });
                                                       $(this).parent().parent().css({
                                                                                      zIndex : 8
                                                                                     });
                                                       // Check where it's being dragged to                              
                                                       if ($(this).parent().parent().parent().hasClass('group'))
                                                        {
                                                         $('#group_wrapper_container').css({
                                                                                            zIndex : 8
                                                                                           });
                                                        }
                                                       groupNumber = $(this).attr('id').split('_')[2];
                                                       if(groupNumber !== undefined){
                                                        $('#answers_content li.droppable:not(:eq(' + groupNumber + '))').droppable('destroy');
                                                       }
                                                      }
                                             });
    
    // Make the question areas droppable
    $('li.droppable').droppable('destroy');
    $('li.droppable:not(:has(a)), li.droppable.hasSpace').droppable({
                                              activeClass : 'active',
                                              hoverClass : 'hover',
                                              drop : function(e, ui)
                                                      {
                                                       
                                                       // Reset all li.droppable to zero
                                                       // See drag() function above
                                                       $('li.droppable').css({
                                                                              zIndex : 0
                                                                             });
                                                                             
                                                       $('div#main_content_container ul').css({
                                                                                               zIndex : 0
                                                                                              });
                                                                                              
                                                       $('#group_wrapper_container').css({
                                                                                          zIndex : 0
                                                                                         });
                                                       
                                                       // SetTimeout is used to fix a problem in IE
                                                       // IE tries to clone the element after it is removed
                                                       // http://dev.jqueryui.com/ticket/4550
                                                       setTimeout(function()
                                                                   {
                                                                    $(ui.draggable)
                                                                                   .appendTo(e.target)
                                                                                   .css({
                                                                                         left : '0px',
                                                                                         top : '0px'
                                                                                        })
                                                                                   .removeClass('ui-draggable-dragging');
                                                                                   /*.end()
                                                                                   
                                                                                   .remove();*/
                                                                    updateCompletedQuestionsCount();
                                                                    checkEnableSubmitButton();
                                                                    bindDragAndDrop(); 
                                                                    $('a#reset').removeClass('disabled');
                                                                    $('a#reset').unbind()
                                                                                .bind('click', function (e)
                                                                                                {
                                                                                                 resetForm();
                                                                                                 e.stopPropagation();
                                                                                                 return false;
                                                                                                });
                                                                   }, 1);
                                                       
                                                      }
                                             });
   }
  
  /**
   * Appends HTML fragment to DOM with UL of answerList data 
   * @param {Object} args
   */
  function buildAnswerBank(args)
   {
        // Create fragment
    var answersFragment = document.createDocumentFragment(),
    
        // Create <ul> container and append to fragment
        answersUL = document.createElement('ul'),
        
        newAnswersLength,
        niftyFix,
        spanElement,
        tempLIHolder,
        tempLIHolderA,
        x;
    answersFragment.appendChild(answersUL);
    
    // Check if being fed the correct/incorrect answers
    // if its just a potential list of answers build them
    // within the bank
    if (args.answerList) {
      newAnswersLength = args.answerList.length;
      
      for (x = 0; x < newAnswersLength; x++) {
        // Add LI elements to UL
        tempLIHolder = document.createElement('li');
        tempLIHolder.className = 'droppable';
       
        // Create <a> element and append to tempLIHolder <li>
        var dropNumber = dropNum;
        var i = 0;
        if(dropNumber > 1){
         for(dropNumber;dropNumber>0;dropNumber--){
          tempLIHolderA = document.createElement('a');
          tempLIHolderA.id = 'question_' + (x + i) + '_' + x;
          tempLIHolderA.className = 'draggable dropNumber_' + x;
          tempLIHolder.appendChild(tempLIHolderA);
          spanElement = document.createElement('span');
          spanElement.innerHTML = args.answerList[x];
          tempLIHolderA.appendChild(spanElement);
          i++;
         }
        }
        else{
         tempLIHolderA = document.createElement('a');
         tempLIHolderA.id = 'question_' + x;
         tempLIHolderA.className = 'draggable';
         tempLIHolder.appendChild(tempLIHolderA);
         spanElement = document.createElement('span');
         spanElement.innerHTML = args.answerList[x];
         tempLIHolderA.appendChild(spanElement);
        }
        
        // Create <span> and append to tempLIHolder <a>
        // This is for table-cell based vertical text centering
       
        
        answersUL.appendChild(tempLIHolder);
        
        // Update answers count
        answersLength = newAnswersLength;
       }
     } else {
      var correctAnswersLength = args.correctAnswers.length,
          incorrectAnswersLength = args.incorrectAnswers.length;
      
      // Build and append incorrect answers
      for (x = 0; x < incorrectAnswersLength; x++) {
        // Add LI elements to UL
        tempLIHolder = document.createElement('li');
        tempLIHolder.className = 'droppable';
         
        niftyFix = document.createElement('div');
        niftyFix.className = 'niftyFix';

        // Check for ghost, if one exists do not create a link
        if (args.incorrectAnswers[x].answer)
         {
          tempLIHolderA = document.createElement('a');
          tempLIHolderA.id = 'question_' + args.incorrectAnswers[x].index;
          tempLIHolderA.className = 'draggable';
          tempLIHolderA.innerHTML = args.incorrectAnswers[x].answer;
          niftyFix.appendChild(tempLIHolderA);
         }
        
        tempLIHolder.appendChild(niftyFix);
        answersUL.appendChild(tempLIHolder);
       }
      
      // Build and append correct answers
      for (x = 0; x < correctAnswersLength; x++)
       {
        tempLIHolderA = document.createElement('a');
        niftyFix = document.createElement('div');
        niftyFix.className = 'niftyFix';
        
//        tempLIHolderA.id = 'question_' + (args.correctAnswers[x].index + 1);
        tempLIHolderA.className = 'draggable';
        tempLIHolderA.innerHTML = '<span>' + args.correctAnswers[x].answer + '</span>';
        //niftyFix.appendChild(tempLIHolderA);
        //$(tempLIHolderA).wrap('<div class="niftyFix"></div>')
        //Instead of appending to the fragment
        //append to questions drop area li (using index)
        
        // Insert blank div for creating Nifty outlines
        $('div#questions_container li.droppable:eq(' + args.correctAnswers[x].index + ')').html(tempLIHolderA);
        
        $('div#questions_container li.droppable:eq(' + args.correctAnswers[x].index + ') a').addClass('correct');
        $('div#questions_container li.droppable:eq(' + args.correctAnswers[x].index + ') a').draggable('destroy');
       }
      
      // Update answers count, use incorrectAnswersLength because it includes the ghost entries
      answersLength = incorrectAnswersLength;
     }

    // Finally, append fragment to DOM
    document.getElementById('answers_content').appendChild(answersFragment);
   }

  /**
   * Ensures the container element is available for the two button
   * @return
   */
  function buildButtons()
   {
    // Add button container 
    var buttonContainer = document.createElement('div');
    buttonContainer.id = 'button_content';
    $('div#questions_container').append(buttonContainer);
    
    // Add buttons
    buildResetButton();
    buildSubmitButton();
    
   }
   
    function adjustButtons()
   {
	setTimeout(function(){ // Wait till the sheet is completely rendered
		$('#nav_next_link, #nav_right_btn').removeClass('disabled');
		$('input#submit').hide();
		
   },100);
           
   }
  
  /**
   * Builds HTML for question area including groups
   * Requires groupList, and questions params
   * @param {Object} args
   */
  function buildQuestions(groupList, questions)
   {
    // Find number of groups
    var groupArray = buildQuestionsPlaceholder(groupList, questions);
                                               
    // We will append this fragment to the DOM at the end of the build loop
    var groupArrayFragment = document.createDocumentFragment();
        
    // Create groupWrapper <div> and append to fragment
    // This element will have Nifty corners
    var groupWrapper = document.createElement('div');
    groupWrapper.id = 'group_wrapper_container';
    groupArrayFragment.appendChild(groupWrapper);
    
    // Store this for the loop
    groupArrayLength = groupArray.length;
     
    // Loop through groups
    var x;
    for (x = 0; x < groupArrayLength; x++) {
      var groupArray2Length = (groupArray[x]) 
                               ? groupArray[x].length 
                               : 0;
      
      // Create group <div> and append to fragment
      var groupDiv = document.createElement('div');
      groupDiv.id = 'group_' + x;
      groupDiv.className = 'group';
      groupWrapper.appendChild(groupDiv);
      
      // Zebra stripe the clearing class
      if (x % 2 === 0) {
        groupDiv.className = 'group clear';
       }
      
      // Create group header <h2> and append it to group <div> 
      var groupDivHeader = document.createElement('h2');
      groupDivHeader.innerHTML = groupArray[x][0].name;
      groupDiv.appendChild(groupDivHeader);
      
      // Create drop area <ul> and append to group <div>
      var dropAreaUL = document.createElement('ul');
      groupDiv.appendChild(dropAreaUL);
      
      // Loop through group data
      var y;
      for (y = 0; y < groupArray2Length; y++) {
        // Create questions <li> and append to drop area <ul>
        var questionsPlaceholder = document.createElement('li');
        questionsPlaceholder.className = 'droppable';
        questionsPlaceholder.id = 'questions_' + groupArray[x][y].id;
        dropAreaUL.appendChild(questionsPlaceholder);
        
        // Create NiftyFix <div> (for rounded corners / outline) and append to questions <li>
        var niftyFixElement = document.createElement('div');
        niftyFixElement.className = 'niftyFix';
        niftyFixElement.innerHTML = 'drag item here';
        $(questionsPlaceholder).html('drag item here');
       }
     }
     
    // Add in a clearing <div> for Nifty
    var clearingDiv = document.createElement('div');
    clearingDiv.className = "clear clearingDiv";
    groupWrapper.appendChild(clearingDiv);
    
    // Finally, append fragment to the DOM 
    document.getElementById('questions_container').appendChild(groupArrayFragment);
//    $('#lightbox_toolkit_lb #questions_container').append(groupArrayFragment);
   }

  /**
   * Loops through questions and creates a new object sorted by group.
   * @param groupList, questions 
   * @return multi-dimensional array
   */
  function buildQuestionsPlaceholder(groupList, questions)
   {
    var questionsLength = questions.length,
        questionsPlaceholder = [];

    // Loop through the entire question set and push
    var x;
    for (x = 0; x < questionsLength; x++) {
      // If a group hasn't already been created for the one which is
      // listed in this question's group property, create it
      if (!questionsPlaceholder[(questions[x].group || questions[x]._group) - 1]) {
        questionsPlaceholder[(questions[x].group || questions[x]._group) - 1] = [];
       }

      // Add the question's id and group value to the array
      questionsPlaceholder[parseInt((questions[x].group || questions[x]._group), 10) - 1].push({
                                                                       id : x,
                                                                       name : groupList[parseInt((questions[x].group || questions[x]._group), 10) - 1]
                                                                      });
     }
    
    return questionsPlaceholder;
   }

  function buildSubmitButton()
   {
    // Create element
    var submitButton = document.createElement('input');
    submitButton.id = 'submit';
    submitButton.className = 'disableds';
    submitButton.setAttribute('disabled', '');
    submitButton.setAttribute('type', 'button');
    
    // Insert element
    $('div#button_content').append(submitButton);
    
    // Bind submit event to it
    $(submitButton).bind('click', function (e)
                                   {
                                    submitForm();
                                    e.stopPropagation();
                                   });
   }

  function buildResetButton()
   {
    // Create element
    var resetButton = document.createElement('a');
    resetButton.href = '';
    resetButton.id = 'reset';
    resetButton.className = 'disabled'
    // Insert element
    $('div#button_content').append(resetButton);
    
    // Bind submit event to it
    $(resetButton).bind('click', function (e)
                                  {
                                   resetForm();
                                   e.stopPropagation();
                                   return false;
                                  });
   }

  function checkEnableSubmitButton()
   {
    // Check if all questions have been answered
    if (updateCompletedQuestionsCount() === 0) {
      $('input#submit').removeAttr('disabled');
      $('input#submit').removeClass('disableds');
      return 1;
     } else {
      // Resetting this value every time prevents you from having to 
      // reset it on remidation or reset
      $('input#submit').attr('disabled', 'true');
      $('input#submit').addClass('disableds');
      return 0;
     }
   }

  function getScore()
   {
    return Math.round($('a.feedback.correct').length * 100 / $('a.feedback').length);
   }
  
  /**
   * Returns app.template.getData().content[0].groupList
   * @return object
   */
  function groupList()
   {
    return app.template.getData().content[0].groupList;
   }

  /**
   * Removes feedback elements
   * @return
   */
  function hideFeedback()
   {
    // Remove icons
    $('a.feedback').remove();
    
    // Remove lightboxes
    $('div.lightbox').remove();
   }
  
  /**
   * Calls:
   * buildAnswerBank();
   * buildQuestions();
   */
  function init()
   {
    app.hooks.clearHooks();
    app.hooks.setHook({
                       name : 'RenderTest',
                       functionName : function ()
                                       {
                                        app.thisTemplate.render();
                                       }
                      });
   }

  function manageFooterButtons()
   {
    // Hide submit & ghost reset buttons
    $('input#submit').hide();
    $('a#reset').unbind('click')
                .bind('click', function()
                                {
                                 return false;
                                });
    
    $('a#reset').addClass('disabled');
    
    // Show 'try again' or 'continue' based on attempts & score
    if (attempts >= 3 || (updateCompletedQuestionsCount() === 0 && $('div#questions_container a.incorrect').length === 0)) {
      // If there are no errors, ensure the elements have the 'correct' CSS class
      if (tryAgainAnswers.length === 0) {
        $('a.draggable').addClass('correct');
       }
     
      // Show 'continue' button (create it first if it doesn't already exist)
      if ($('input#continue').length > 0) {
        $('a#reset').hide();
        $('input#continue').show();
        $('#nav_next_link, #nav_right_btn').removeClass('disabled');
       } else {
        // Create continue button
        var continueButton = document.createElement('input');
        continueButton.type = 'button';
        continueButton.id = 'continue';
        $('div#button_content').append(continueButton);
        $('#nav_next_link, #nav_right_btn').removeClass('disabled');
        // Bind event to it
        $('input#continue').bind('click', function ()
                                           {
                                            // Release this page's gated setting
                                            app.testCompleted = 'true';
                                            
                                            // Record test
                                            app.getTest().recordTest({
                                                                      score : getScore() // indicates completion
                                                                     });
                                            
                                            // Continue to the next page
                                            app.doNext();
                                            return false;
                                           });
       }
     } else {
      // Show 'try again' button (create it first if it doesn't already exist)
      if ($('input#tryAgain').length > 0) {
        $('input#tryAgain').show();
       } else {
        // Create 'try again' button
        var tryAgainButton = document.createElement('input');
        tryAgainButton.type = 'button';
        tryAgainButton.id = 'tryAgain';
        $('div#button_content').append(tryAgainButton);
        
        // Bind event to it
        $('input#tryAgain').bind('click', function ()
                                           {
                                            $('input#tryAgain').hide();
                                            $('input#submit').show();
                                            
                                            $('a#reset').bind('click', function (e)
                                                                        {
                                                                         resetForm();
                                                                         e.stopPropagation();
                                                                         return false;
                                                                        });
                                            
                                            // Remove all 'incorrect' classes
                                            $('a.incorrect', 'div#questions_container li.droppable').removeClass('incorrect');
                                            
                                            resetForm();
                                            $('a#reset').removeClass('disabled');
                                           });
       }
     }
   }
  
  /**
   * Get group list
   */
  function questions()
   {
    var questions = app.template.getData().questions;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      questions = app.toolkit.getData().questions;
     }
    
    return questions;
   }

  /**
   * TODO: Update this description
   * @return
   */
  function questionsManager(args)
   {
    args = args || {};

    // Get the current TestManager instance
    var answers = args.answers || app.getTest().getQuestionBank(),
        incorrectAnswers = [],
        correctAnswers = [];
    
    // Check if interaction data exists
    // Removing null may cause problems because an 'id' of integer 0 will fail
    if (answers[0].learner_response !== undefined)
     {
      var answersLength = answers.length,
          recordedTestAttempts = 0;
      
      if ($('#lightbox_toolkit_lb').length <= 0)
       {
        recordedTestAttempts = app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].attempts;
       }
      
      var x;
      for (x = 0; x < answersLength; x++) {
        // Build in/correct answer lists to pass
       var questionObject = {
                             correct : false
                            };
       
       $.each(questions()[x].correctAnswer, function(index, value)
                                {
//                                 if ($('#lightbox_toolkit_lb').length > 0) //feedback free from toolkit
//                                  {
//                                   questionObject.correct = true;
//                                   
//                                   questionObject.answer = answerList()[answers[x].learner_response - 1];
//                                   
//                                   questionObject.id = 0;
//                                   
//                                   return false;
//                                  }
                                 
                                 if (((answers[x].learner_response) || '').toString() === value)
                                  {
                                   questionObject.correct = true;
                                   
                                   questionObject.answer = answerList()[answers[x].learner_response - 1];
                                   
                                   questionObject.id = x;
                                   
                                   return false;
                                  }
                                });

       if (questionObject.correct === true)
        {
         correctAnswers.push({
                              answer : questionObject.answer,
                              index : questionObject.id
                             });
        }        
       }
      
      // Update number of attempts
      if (recordedTestAttempts !== undefined)
       {
        var count = 0;
        
        $.each(recordedTestAttempts, function(index, value)
                                      {
                                       count++;
                                      });
        
        attempts = count;
       }

      //Build in/correct answers
      buildAnswerBank({
                       correctAnswers : correctAnswers,
                       incorrectAnswers : incorrectAnswers
                      });
      
      buildAnswerBank({
                       answerList : answerList()
                      });
      
      // Remove the dupes created
      $('div#questions_container a.draggable.correct span').each(function(i, e)
                                                                  {
                                                                   $('div#answers_content a span').each(function(index, element)
                                                                                                         {
                                                                                                          if ($(e).html().replace(/(<.*?>)/ig, '') === $(element).html().replace(/(<.*?>)/ig, ''))
                                                                                                           {
                                                                                                            $(element).parent('a').remove();
                                                                                                           }
                                                                                                         });
                                                                   
//                                                                   if ($("div#answers_content a span:contains('" + $(this).html() + "')").length > 0)
//                                                                    {
//                                                                     $("div#answers_content a span:contains('" + $(this).html() + "')").parent('a').remove();
//                                                                    }
                                                                  });
      
      // If we're at the limit then move over the incorrect answers and change state to assessment
      if (attempts >= 3 || $('div#answers_content li a').length === 0)
       {
//        $('div#answers_content a.draggable').each(function(index, element)
//                                                   {
//                                                    $(this).removeClass('ui-draggable')
//                                                           .appendTo('div#questions_container questions_' + app.getTest().getQuestionBank()[$(this).attr('id').split('_')[1]].learner_response + 1);
//                                                   });
        
        $.each(app.getTest().getQuestionBank(), function(index, element)
                                                 {
                                                  var correctness = true;
                                                  
                                                  $.each(element.correctAnswer, function(i, e)
                                                                                 {
                                                                                  if (parseInt(e) === element.learner_response)
                                                                                   {
                                                                                    correctness = true;
                                                                                    return false;
                                                                                   }
                                                                                  else
                                                                                   {
                                                                                    correctness = false;
                                                                                   }
                                                                                 });
                                                  
                                                  if(correctness === false)
                                                   {
//                                                    $('div#answers_content a#question_' + index).removeClass('ui-draggable')
//                                                                          .appendTo('div#questions_container li:eq(' + element.id + ')');
                                                   }
                                                  
//                                                  $(this).removeClass('ui-draggable')
//                                                         .appendTo('div#questions_container questions_' + app.getTest().getQuestionBank()[$(this).attr('id').split('_')[1]].learner_response + 1);
                                                 });
        assessAnswers();
        manageFooterButtons();
       }
     }
    else
     {
      //If no instances are saved just build from scratch
      buildAnswerBank({
                       answerList : answerList()
                      });
     }
   }

  function render()
   {
    if ($('#lightbox_toolkit_lb').length <= 0)
     {
      app.setUpLocalData();
      
      if (app.template.getData().metadata[0].cjDD !== undefined)
       {
        $.each(app.questionBank[app.getPageName()], function(index, value)
                                                     {
                                                      if (value.learner_response !== undefined)
                                                       {
//                                                      Build HTML for drop areas
                                                        buildQuestions(groupList(), questions());
                                                        templateRendered = true ; // template is rendered
                                                        if ($.browser.msie === undefined)
                                                         {
                                                          // Round corners for everything but IE
                                                          Nifty('div#group_wrapper_container');
                                                         }
                                                        
                                                        $('div#answers_container').css('display', 'none');
                                                        
//                                                        $('#lightbox_toolkit_lb #group_wrapper_container div.group').last()
//                                                                                                                    .removeClass('clear');
                                                        
//                                                        $('#lightbox_toolkit_lb div#group_wrapper_container').css('width', 'auto');
                                                        
                                                        // Logic for dropping answers
                                                        $('div#group_wrapper_container li').each(function(index, element)
                                                                                                  {
                                                                                                   $(element).html('');
                                                                                                  });
                                                        
                                                        $.each(app.questionBank[app.getPageName()], function(index, value)
                                                                                                 {						
                                                                                                  if (value.learner_response !== undefined)
                                                                                                   {
                                                                                                    $('div#group_' + ((value.group || value._group) - 1) + ' li.droppable:empty:eq(0)').html('<a class="draggable"><span>' + app.template.getData(app.getPageName()).content[0].answerList[value.learner_response - 1] + '</span></a>');
                                                                                                   }
                                                                                                 });
                                                        
                                                        return false;
                                                       }
                                                     });
       }
      
      // Build HTML for drop areas
      if (templateRendered == false){
			buildQuestions(groupList(), questions());
      		
	  }
      
      // Insert submit and reset buttons in a neat little container
      buildButtons();
      
      // Round corners
      Nifty('div#group_wrapper_container');
      
      // TODO: Update this description
      questionsManager();
      
      // TODO: Update this description
      bindDragAndDrop();
	  if (templateRendered == true){
			adjustButtons();
      		
	  }
      
      app.hooks.clearHooks();
      app.hooks.setHook({
                         name : 'TemplateUnloaded',
                         functionName : function ()
                                         {
                                          app.thisTemplate.templateUnloaded();
                                         }
                        });
     }
   }

  /**
   * Can reset all questions or individual ones via passing
   * a set value in the args object
   * @param args.set array of integers representing "li.droppable a#question_{#}"
   * @return
   */
  function resetForm(filter)
   {
    // Remove feedback icons and lightboxes
    hideFeedback();
    
    // If a filter set is passed, remove only those
    if (filter) {
      var x;
      for (x = 0; x < filter.length; x++) {
        //Move answer back to answer area
        $('#answers_content li.droppable:eq(' + filter[x] + ')').prepend($('a', 'div#questions_container li.droppable:eq(' + filter[x] + ')'));
       }
     } else {
      // Remove everything
      // Clear dropped div's 
      $('div#questions_container a.draggable:not(a.correct)').remove();
      
      // Remove old answer bank
      $('div#answers_content ul').remove();
      
      // Re-build answer bank
      buildAnswerBank({
                       answerList : answerList()
                      });
      
      // Remove the dupes created
      $('div#questions_container a.draggable.correct span').each(function(i, e)
        {
         $('a','div#answers_content').find('span').each(function(index, element)
                                               {
                                                if ($(e).html().replace(/(<.*?>)/ig, '') === $(element).html().replace(/(<.*?>)/ig, ''))
                                                 {
                                                 
                                                  $(element).parent('a').remove();
                                                 }
                                               });
        });
     }
    
    // Reset droppable area state
    bindDragAndDrop();
    
    // Make sure ghosting is in the correct state
    checkEnableSubmitButton();
    
    $('a#reset').addClass('disabled');
   }

  function saveTest(testData)
   {
    var testDataLength = testData.length,
        x;
    for (x = 0; x < testDataLength; x++) {
      if (x === (testDataLength - 1))
       {
        app.getTest().recordInteraction({
                                         id : testData[x].index,
                                         value : testData[x].learner_response + 1,
                                         description : testData[x].description
                                        });
       }
      else
       {
        app.getTest().recordInteraction({
                                         id : testData[x].index,
                                         value : testData[x].learner_response + 1
                                        });
       }
     }
   }
  
  /**
   * Adds green checkmark or red x next to questions and
   * adds a create lightbox on click event
   * @return
   */
  function showFeedback(args)
   {
    var correctAnswer = args.correctAnswer,
        correctness = args.correctness,
        feedback = args.feedback,
        target = args.target,
        yourAnswer = args.yourAnswer;
    
    // Create new feedback element
    var feedbackElement = document.createElement('a');
    feedbackElement.className = 'feedback ' + correctness;
    feedbackElement.href = '#';
    $(target).append(feedbackElement);
    
    // Bind feedback lightbox to it
    $(feedbackElement).bind('click', function ()
                                      {
                                       app.lightbox.render({
                                                            global : ale,
                                                            id : app.lightbox.getFreshLightboxId(),
                                                            data : {
                                                                    // We're using the same style feedback lightbox as vidNotesFeedback
                                                                    type : 'vidNotesFeedback',
                                                                    content : {
                                                                               yourAnswer : yourAnswer,
                                                                               correctAnswer : correctAnswer,
                                                                               feedback : feedback
                                                                              }
                                                                    }
                                                           });
                                      });
   }

  /**
   * Compares answers given to correct answers
   * Stores incorrect answers in tryAgainAnswers[]
   * Determines whether to show 'continue' or 'try again'
   * @return
   */
  function submitForm()
   {
    // Add a test attempt
    attempts = attempts + 1;
    
    // Reset tryAgainAnswers
    tryAgainAnswers = [];
    
    // Assess answers & save test data      
      assessAnswers();
    
    // Disable drag and dropability
    $('a.draggable').draggable('destroy');
    $('li.droppable').droppable('destroy');
    
    manageFooterButtons();
   }

  /**
   * Allows draggables to be destroyed when page is unloaded and rebuilt
   */
  function templateUnloaded()
   {
    // Disable drag and dropability
    $('a.draggable').draggable('destroy');
    $('li.droppable').droppable('destroy');
   }
  
  /** 
   * Show feedback 
   */
  function updateCompletedQuestionsCount()
   {
    var newTotal = answersLength - $('div#answers_container li.hasSpace').length;
    
    $('#answers_content .droppable').each(function(){
     if($(this).children().length < dropNum){
      $(this).addClass('hasSpace yellow_box');
     }
     else{
      $(this).removeClass('hasSpace yellow_box');
     }
    });
    newTotal = Math.max(newTotal, 0);
    $('span#completed_questions').html(newTotal);
    
    return newTotal;
   }
  
  App.prototype.toolkitInit = function (args)
                               {
                                // Build HTML for drop areas
                                buildQuestions(app.toolkit.getData().content[0].groupList, app.questionBank[args.template]);
                                
                                if ($.browser.msie === undefined)
                                 {
                                  // Round corners for everything but IE
                                  Nifty('#lightbox_toolkit_lb div#group_wrapper_container');
                                 }
                                
                                $('#lightbox_toolkit_lb div#answers_container').css('display', 'none');
                                
                                $('#lightbox_toolkit_lb #group_wrapper_container div.group').last()
                                                                                            .removeClass('clear');
                                
                                $('#lightbox_toolkit_lb div#group_wrapper_container').css('width', 'auto');
                                
                                // Logic for dropping answers
                                $('#lightbox_toolkit_lb div#group_wrapper_container li').each(function(index, element)
                                                                          {
                                                                           $(element).html('');
                                                                          });
                                
                                $.each(app.questionBank[args.template], function(index, value)
                                                                         {
                                                                          if (value.learner_response !== undefined)
                                                                           {
                                                                            $('#lightbox_toolkit_lb div#group_' + ((value.group || value._group) - 1) + ' li.droppable:empty:eq(0)').html('<a class="draggable"><span>' + app.toolkit.getData(args.template).content[0].answerList[value.learner_response - 1] + '</span></a>');
                                                                           }
                                                                         });
                               };

  
  // Public interface
  // ----------------
  this.render = render;
  this.templateUnloaded = templateUnloaded;
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.thisTemplate = new DragAndDrop(ale);