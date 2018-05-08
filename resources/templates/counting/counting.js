function Counting(app)
 {
  // Private vars
  // ------------
  var mainContainer = '#question_container',
  
      // This is a band-aid solution for the bug where the question description
      // was disappearing on the result state in Firefox. For some reason this
      // template was built so that the questions get rebuilt when the user 
      // clicks submit. For some other reason, at that time, the
      // question.description was empty ONLY on Firefox... FIREFOX of all things
      // Ultimately, I would like to refactor this template properly.
      questionDescriptionContainer = [],

      //FIXME 
      //By default set 2 for now, remove after modifying all the JSON files.
      attemptsAllowed = app.template.getData().metadata[0].remediationAttempts || 2;

  
  function getPersistedAttemptsTaken(questionBank)
   {
    return questionBank[questionBank.length - 1].attemptsTaken || 0;
   }
  
  var remediationAttempts = (function ()
                              {
                               return {
                                decrease : function ()
                                            {
                                             // Save to interactions entry
                                             app.getTest().recordInteraction({
                                              id : app.getTest().getQuestionBank().length - 1,
                                              attemptsTaken : (app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].attemptsTaken || 0) + 1
                                             });
                                            },
                               get: function()
                                     {
                                      var attemptsTaken = getPersistedAttemptsTaken(app.getTest().getQuestionBank());
                                      return attemptsAllowed - attemptsTaken;
                                     },
                               getAttemptsTaken: function() 
                                                  {
                                                   // Return the number of current attempt.
                                                   var result = getPersistedAttemptsTaken(app.getTest().getQuestionBank());
                                                   if(result > (attemptsAllowed + 1)) {
                                                    result = attemptsAllowed + 1;
                                                   }
                                                   return result;
                                                  }  
                               };
                              }());
  
  function testLimitReached()
   {
    // Check the remediation attempts
    return (remediationAttempts.get() > 0) ? false : true;
   }
  // Lock/unlock the answers according to the value of property "correctness" of each question element
  // in question bank.
  function lockCorrectAnswers()
   {
      var questions = app.getTest().getQuestionBank(),
          correctness,
          attempts = questions[questions.length - 1].attempts;
      // If attempts is undefined, do not remove or block answers.
      if(typeof attempts !== 'undefined')
       {
        // Get the latest attempt object.
        var attempt = 1;
        while(attempt in attempts)
         {
          if(!attempts[attempt + 1])
           {
            break;
           }
          attempt++;
         }
        // Set a flag indicating that wrong answers were reset, and correct ones are blocked for this specific attempt.
        var erased = attempts[attempt].erased;
        attempts[attempt].erased = true;
          
        $('select').each(function(index) 
                          {
                           correctness = questions[index].correctness;
                           if(correctness === 'correct') 
                            {
                             $(this).attr('disabled', true);
                            }
                           else if(!erased)
                            {
                             $(this).val('');
                             delete questions[index].learner_response;
                            }
                          });
       }
      toggleSubmitButton();
   }
  function buildHTML(callback)
   {
    var documentFragment = [],
        flag = "",
        questions = app.getTest().getQuestionBank(),
        quesIndex = 0; 
      
    documentFragment.push('<table id="questionsTbl" cellspacing="0" cellpadding="0"><thead><tr><th class="firstcol">preguntas</th><th class="othercol">respuestas</th></tr></thead><tbody>');
    
    var i;
    for (i in questions) {
      if (questions.hasOwnProperty(i)) {
        var question = questions[i];
        
        switch (question.type) {
          case 'choice' :
           switch (question.form) {
             case 'select' : 
              questionDescriptionContainer.push(question.description);
              documentFragment.push('<tr><td class="firstcol">',
                                    questionDescriptionContainer[i],
                                    '</td><td class="othercol"><select id="answer_',
                                    quesIndex,
                                    '"><option id="question_',
                                    quesIndex,
                                    '_answer_01" value="">select</option>');
               
              var ansIndex = 0,
                  answer,    
                  j;
              for (j in question.answers) {
                if (question.answers.hasOwnProperty(j)) {
                  answer = question.answers[j].value;
                  
                  documentFragment.push('<option ');
                  
                  if (question.correctAnswer[0] === answer) {
                    documentFragment.push('class="correctAnswer"');
                   } else {
                    documentFragment.push('class="answer"');
                   }
                  
                  documentFragment.push('id="question_',
                                        quesIndex,
                                        '_answer_',
                                        ansIndex,
                                        '" value ="');
                  documentFragment.push(answer);
                  documentFragment.push('">');
                  documentFragment.push(answer);
                  documentFragment.push('</option>');
                  
                  ansIndex++;
                 }
               }
              break;
            }
           
           documentFragment.push('</select></td>');
           break;
         }
        
        documentFragment.push('</tr>');
        
        quesIndex++;
        flag = question.group;
       }
     }
     
    documentFragment.push('</tbody></table>');
    $(mainContainer).append(documentFragment.join(""));

    // Populate the answers.
    callback();
    // Lock correct and reset incorrect answers.
    // If reached max attempts or scored 100, display the results.
    var display = false;
    if((remediationAttempts.get() + 1) <= 0) 
     {
      display = true;
     }
    else
     {
      lockCorrectAnswers();
     }
    if(display || isAllCorrect())
     {
      displayResults();
     }
   }
  
  /**
   * Indicating if all questions are correctly answered.
   * @returns boolean
   */
  function isAllCorrect()
   {
    return $('select[disabled!=true]').length ? false : true;
   }
  
  // added functionality for special character comparison
  function htmlDecode(answerString)
   {
    var arr = answerString.match(/&#[0-9]{1,5};/g),
        arrayIndex,
        charCode;
    
    if (arr !== null) {
      var x,
          arrLength = arr.length;
      for (x = 0; x < arrLength; x++) {
        arrayIndex = arr[x];
        charCode = arrayIndex.substring(2,arrayIndex.length-1);
        if (charCode >= -32768 && charCode <= 65535) {
          answerString = answerString.replace(arrayIndex, String.fromCharCode(charCode));
         } else {
          answerString = answerString.replace(arrayIndex, "");
         }
       }
     }
    return answerString;
   }

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
  
  function populateAnswers()
  {
   var answers = app.getTest().getQuestionBank();
   $('select').each(function (index)
                     {
                      if (answers[index].learner_response !== undefined)
                       {
                        $(this).find('option:eq(' + (parseInt(answers[index].learner_response) + 1) + ')').attr({
                                                                                                                 selected : true
                                                                                                                });
                       }
                     });
  }

  // If any question is unanswered, disabled the submit button.
  function toggleSubmitButton()
   {
    var answeredCount = 0;
    $('select').each(function()
                     {
                      answeredCount += $(this).val().length > 0 ? 1 : 0;
                     });

    if (answeredCount === $('select').length)   
     {
      $('#submit_handler').removeAttr('disabled')
                          .removeClass('disableds');
     }
    else
     {
      $('#submit_handler').attr('disabled', 'true')
                          .addClass('disableds');
     }    
   }      
  
  function recordInteractions()
   {
    $('select').change(function ()
                        {
                         app.getTest().recordInteraction({
                                                          id : $(this).attr('id').split('_')[1],
                                                          value : $(this).find('option:selected').attr('id').split('_')[3]
                                                         });
                         toggleSubmitButton();
                        });
   }

  function render()
   {
    buildHTML(populateAnswers);
    recordInteractions();
    submitHandler();
    Nifty('div#question_container');
   }
  
  /*
   * display try again button after submitting.
   */
  function displayTryAgainButton()
   {
    // tryAgainButtonContainer existed, just show it.
    if($('#tryAgainButtonContainer').length)
     {
      $('#tryAgainButtonContainer').show();
     }
    else
     {
      // Create tryAgainButtonContainer contains try again button.
      $('<div id="tryAgainButtonContainer"><input id="tryAgain" type="button"></input></div>').insertAfter('#main_content_container');
      $('#tryAgain').bind('click', function()
                                    {
                                     $('table#questionsTbl', mainContainer).show();
                                     $('#tryAgainButtonContainer').hide();
                                     $("#data_transaction_buttton").show();
                                     $('#feedback').hide();
                                     $('table#summaryTbl', mainContainer).remove();
                                     $('#result').remove();
                                     lockCorrectAnswers();                             
                                    });
     }
   }

  function submitHandler()
   {
    var handler = $('#submit_handler');
    handler.unbind("click.submit").bind("click.submit", function ()
                                                         {
                                                          submitAnswers();
                                                         });
                                                        
                                                   
   }
  
  function submitAnswers()
   {
    displayResults();
   }
  
  function displayResults(isTestDone)
   {
    var correctAnswersCount = 0,
        documentFragment = [],
        questions = app.getTest().getQuestionBank(),
        quesIndex = 0,
        selector = "#answer_",
        sprite_class = "",
        totalQuestions = questions.length;
    
    $("#data_transaction_buttton").hide();
    $('table#questionsTbl', mainContainer).hide();
    $('#feedback').show();

    documentFragment.push('<table id="summaryTbl" cellspacing="0" cellpadding="0"><thead><tr><th class="firstcol">question</th><th class="othercol">answer</th></tr></thead><tbody>');

    // Variables used in the loop below
    var answer,
        correct,
        correctanswer,
        feedback,
        flag = "",
        i,
        j,
        question,
        x,
        youranswer;

    for (i in questions) 
     {
      correct = 0;
      question = questions[i];

      documentFragment.push('<tr><td class="firstcol">', questionDescriptionContainer[i] ,'</td><td class="othercol">');

      for (j in question.correctAnswer) 
       {
        correctanswer = question.correctAnswer[j];
        youranswer = "";
        feedback = "";

        if ($(selector + quesIndex).val() === "") 
         {
          documentFragment.push("Not Answered");
         }
        else
         {
          documentFragment.push($(selector + quesIndex).val());
         }

        if ($(selector + quesIndex).val() === htmlDecode(correctanswer)) 
         {
          correct = 1;
          correctAnswersCount++;
          feedback = question.correctFeedback;
         }
        else
         {
          if ($(selector + quesIndex).val() === "") 
           {
            feedback = "Not Answered";
           }
         else
          {
           for (x in question.answers) 
            {
             answer = question.answers[x].value;
             if ($(selector + quesIndex).val() === htmlDecode(answer)) 
              {
               feedback = question.answers[x].incorrectFeedback;
              }
            }
          }
         }
        if ($(selector + quesIndex).val() === "") 
         {
          youranswer = "Not Answered";
         }
        else
         {
          youranswer = $(selector + quesIndex).val();
         }

        if (correct === 1) 
         {
          sprite_class = "correct";
         }
        else
        {
         sprite_class = "incorrect";
        }
        // Set value to question element property "correctness" which will be used
        // to determine whether locking the question.
        question.correctness = sprite_class;
        documentFragment.push('<div class="sprite ',
                              sprite_class,
                              '" onclick="ale.lightbox.render({' +
                                                    'global:\x27ale\x27,' +
                                                    'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                    'data:{type:\x27feedback\x27,content:{' +
                                                    'question:\x27' + question.description.replace(/'/g, "&#34;") + '\x27,' +
                                                    'yourAnswer:\x27' + youranswer.replace(/'/i, "&#146;") + '\x27,' +
                                                    'correctAnswer:\x27' + correctanswer.replace(/'/i, "&#146;") + '\x27,' +
                                                    'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                    '}}' +
                                                  '})"></div>');

        documentFragment.push('</td>');
       }


      documentFragment.push('</tr>');

      quesIndex++;
      flag = question.group;
     }

    documentFragment.push('</tbody></table>');
    var score = Math.round(correctAnswersCount * 100 / totalQuestions);
    $("#main_container h1").after("<div id='result'><h3>Your score " + score + "%.</h3><p>Before moving on take a look at your results in detail below</p></div>");
    Nifty('div#result');
    $(mainContainer + ' table').after(documentFragment.join(''));
    
    if (testLimitReached() || score === 100) 
    {
     // Save score and ungate the test
     app.getTest().recordTest({
                               score : score
                              });
      remediationAttempts.decrease();
      app.getTest().ungateThisTest();
    }
   else 
    {
     // Display try again button
     remediationAttempts.decrease();
     displayTryAgainButton();
    }   
     
   app.getTest().recordAttemptResult({
    testId: app.getPageName(),
    attempt: remediationAttempts.getAttemptsTaken(),
    score: score,
    persist: true
   });
   
  }
  
  
  // Public interface
  // ----------------
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.thisTemplate = new Counting(ale);