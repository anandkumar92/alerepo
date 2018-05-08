/**
 * @class Themes template class
 * @param app
 * @returns {Themes}
 */
function Themes(app)
 {
  // Private vars
  // ------------
  var attempts = 999,
      checked = 0,
      
      // Set as a TestManager RenderTest callback for some reason 
      templateMode = undefined,
      
      // Stores an array of answers to be passed to resetForm upon clicking "try again"
      tryAgainAnswers = [],
      console = app.console;
  
  // Set attempts from json
  if (app.template.getData().content[0].attempts !== undefined)
   {
    attempts = app.template.getData().content[0].attempts;
   }
  
  // Private methods
  // ---------------
  /**
   * Check answers given against correct answers listed in the JSON.
   * A successful condition calls saveTest() at the bottom.
   * @return
   */
  function assessAnswers(args)
   {
    args = args || {};
    
        // Stores answer data below
    var answer, 
        
        // Get answer elements
        answers = $('div#ul_container li'),
    
        // Stores length for use later in the loop
        answersLength = answers.length,
        
        correctAnswers,
        correctAnswersLength,
        correctness = false,
        feedback,
        
        // Value for if the test was passed or not
        pass = true;
        
        // Will store an array which we will pass to saveTest()
        saveTestArray = [];
    
    if (args.feedback !== false)
     {
      if (app.template.getData().questions === undefined) {
        feedback = app.toolkit.getData().questions[0].answers;
       } else {
        feedback = app.template.getData().questions[0].answers;
       } 
       
      if (app.template.getData().questions === undefined) {
        correctAnswers = app.toolkit.getData().questions[0].correctAnswer;
       } else {
        correctAnswers = app.template.getData().questions[0].correctAnswer;
       }
                        
      correctAnswersLength = correctAnswers.length;
  
      //assess (answers that should be checked) against (actually checked answers)
      var x;
      for (x = 0; x < correctAnswersLength; x++) {
        answer = $('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('div.choose a.chooseOne').html() || $('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('div.choose.answered').html();
        
        if (answer !== null) {
          $('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('div.choose').html(answer);
         }
        
        // Note that showFeedback() disables every checkbox
        
        if ($('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('input').attr('checked') && $('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('input').attr('disabled') !== 'true' && $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.feedback').has('a').length === 0) {
          showFeedback({
                        correctAnswer : $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.answer').html(),
                        correctness : 'correct',
                        feedback : feedback[(correctAnswers[x]-1)].feedback[1],
                        target : $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.feedback'),
                        yourAnswer : $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.answer').html()
                       });
         } else {
          if ($('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('input').attr('disabled') !== 'true' && $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.feedback').has('a').length === 0) {
            showFeedback({
                          correctAnswer : 'checked',
                          correctness : 'incorrect',
                          feedback : feedback[(correctAnswers[x]-1)].feedback[0],
                          target : $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.feedback'),
                          yourAnswer : $('div#ul_container li:eq('+(correctAnswers[x]-1)+') div.answer').html()
                         });
  
            setTryAgainAnswers(correctAnswers[x]-1);
            pass = false;
           }
         }
       }
      
      // Mark checked answers that did not receive feedback from previous step as incorrect
      $.each($('div#ul_container li').has('input[type="checkbox"]:checked'), function(index, value)
                                                                              {
                                                                               if ($(value).has('div.feedback:empty').html() !== null && $(value).find('input').attr('disabled') !== 'true') {
  //                                                                               $('div#ul_container li').has('input[type="checkbox"]:checked').find('div.choose').html('invalid');
                                                                                $('div#ul_container li:eq('+$(value).index()+')').find('div.choose').html($('div#ul_container li:eq('+$(value).index()+')').find('div.choose.answered').text() || $('div#ul_container li:eq('+$(value).index()+')').find('div.choose a.chooseOne').html());
                                                                                
                                                                                 showFeedback({
                                                                                               correctAnswer : 'unchecked',
                                                                                               correctness : 'incorrect',
                                                                                               feedback : feedback[$(value).index()].feedback[0],
                                                                                               target : $(value).find('div.feedback'),
                                                                                               yourAnswer : $(value).find('.answer').html()
                                                                                              });
  
                                                                                 setTryAgainAnswers($(value).index());
                                                                                 pass = false;
                                                                                }
                                                                              });
      // Mark remaining unchecked questions as correct
      $.each($('div#ul_container li').has('input[type="checkbox"]'), function(index, value)
                                                                      {
                                                                       // $('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('div.choose').html($('div#ul_container li:eq('+(correctAnswers[x]-1)+')').find('div.choose a.chooseOne').html());
                                                                       
                                                                       if ($(value).has('a.feedback').html() === null && $(value).find('input').attr('disabled') !== 'true') {
                                                                        $('div#ul_container li:eq('+$(value).index()+')').find('div.choose').html($('div#ul_container li:eq('+$(value).index()+')').find('div.choose.answered').text() || $('div#ul_container li:eq('+$(value).index()+')').find('div.choose a.chooseOne').html());
                                                                         showFeedback({
                                                                                       correctAnswer : $(value).find('.answer').html(),
                                                                                       correctness : 'correct',
                                                                                       feedback : feedback[$(value).index()].feedback[1],
                                                                                       target : $(value).find('div.feedback'),
                                                                                       yourAnswer : $(value).find('.answer').html()
                                                                                      });
                                                                        }
                                                                      });
//      if (pass === false) {
//        // Test was not passed, leave page gated and enable retry button
//       }
     }
   }
  
  function bindEvents()
   {
//    $('body').bind('checked', function(e, args)
      function checked (e, args)
                               {
                                var chk = args.chk,
                                    selection = args.selection || '',
                                    value;
                                
                                if (app.template.getData().content[0].decideText !== undefined && typeof app.template.getData().content[0].decideText.invalid === 'object')
                                 {
                                  value = selection;
                                 }
                                else
                                 {
                                  // Store an empty value if the checkbox is unchecked
                                  if ($(chk).attr('checked')) {
                                    $(chk).attr('checked','true');
                                    //value = $(chk).parent('li').find('.answer').html();
                                    value = "valid";
                                   } else {
                                    $(chk).attr('checked','');
                                    //value = '';
                                    value = "invalid";
                                   }
                                 }
                                // Record interaction data           
                                app.getTest().recordInteraction({
                                                                 id : $(chk).parent('li').index(),
                                                                 value : value
                                                                });
                                
                                checkEnableSubmitButton();
                               }
    
    $('a.chooseOne').die('click')
                    .live('click', function ()
                                    {
                                     var html = [],
                                         that = this;
                                     
                                     // Remove all existing lightboxes first
                                     $('.lightbox').remove();
                                     
                                     if (app.template.getData().content[0].decideText !== undefined && typeof app.template.getData().content[0].decideText.invalid === 'object')
                                      {
                                       html.push('<div class="answer_vals">');
                                       
                                       $.each(app.template.getData().content[0].decideText.valid, function(i, v)
                                                                                                   {
                                                                                                    html.push('<div class="question"><input type="radio" class="valid" name="group" id="' + v + '">');
                                                                                                    html.push('<label for="' + v + '">' + v + '</label></div>');
                                                                                                   });
                                       
                                       $.each(app.template.getData().content[0].decideText.invalid, function(i, v)
                                                                                                     {
                                                                                                      html.push('<div class="question"><input type="radio" class="invalid" name="group" id="' + v + '">');
                                                                                                      html.push('<label for="' + v + '">' + v + '</label></div>');
                                                                                                     });
                                       
                                       
                                       html.push('</div>');
                                      }
                                     else
                                      {
                                       html.push('<div class="answer_vals">');
                                       html.push('<div class="question"><input type="radio" class="valid" name="group" id="validRadio">');
                                       html.push('<label for="validRadio">' + (app.template.getData().content[0].decideText ? app.template.getData().content[0].decideText.valid : 'valid') + '</label></div>');
                                       html.push('<div class="question"><input type="radio" class="invalid" name="group" id="invalidRadio">');
                                       html.push('<label for="invalidRadio">' + (app.template.getData().content[0].decideText ? app.template.getData().content[0].decideText.invalid : 'invalid') + '</label></div>');
                                       html.push('</div>');
                                      }

                                     app.lightbox.render({
                                                          global : ale,
                                                          attachCloseEvent : false,
                                                          callback : function()
                                                                      {
                                                                       // Selects the radial if the link value is not "click to decide"
                                                                       if ($(that).html() !== 'click to decide')
                                                                        {
                                                                        if (app.template.getData().content[0].decideText !== undefined && typeof app.template.getData().content[0].decideText.invalid === 'object')
                                                                         {
                                                                          var selection = $(that).html();
                                                                          
                                                                          $('label:contains(' + selection + ')').parent('div.question').find('input').attr('checked', true);
                                                                         }
                                                                        else
                                                                         {
                                                                          if ($(that).html() === (app.template.getData().content[0].decideText !== undefined ? app.template.getData().content[0].decideText.valid : 'valid'))
                                                                           {
                                                                            $('input.valid').attr('checked', true);
                                                                           }
                                                                          else
                                                                           {
                                                                            $('input.invalid').attr('checked', true);
                                                                           }
                                                                         }
                                                                        }
                                                                       
                                                                       $('div#lightbox_val input.valid, div#lightbox_val input.invalid, div#lightbox_val a.close').click(function()
                                                                                                                                                                          {
                                                                                                                                                                           // Commented code is used if we had this event for the "X" close window graphic
                                                                                                                                                                           //  var target = $(this).parent().parent().find('input:radio:checked'),
                                                                                                                                                                           var selection = $(this).parent().find('label'),
                                                                                                                                                                               target = $(this),
                                                                                                                                                                               targetCheckBox = $('ul#hiddenUL li:eq(' + $(that).parent('div.choose').parent().index() + ')').find('input[type="checkbox"]').attr('checked','false');
                                                                                                                                                                           
                                                                                                                                                                           if (target.attr('class') === undefined || target.attr('class') === 'close') {
                                                                                                                                                                             $('#lightbox_val').remove();
                                                                                                                                                                             return;
                                                                                                                                                                            }
                                                                                                                                                                           //Update hidden checkbox
                                                                                                                                                                           if (target.attr('class') === 'valid') {
                                                                                                                                                                             targetCheckBox.attr('checked', true);
                                                                                                                                                                             
                                                                                                                                                                             checked('checked', {
                                                                                                                                                                                                 chk : targetCheckBox,
                                                                                                                                                                                                 selection : selection.html()
                                                                                                                                                                                                });
                                                                                                                                                                            } else {
                                                                                                                                                                             targetCheckBox.attr('checked', false);
                                                                                                                                                                             
                                                                                                                                                                             checked('checked', {
                                                                                                                                                                                                 chk : targetCheckBox,
                                                                                                                                                                                                 selection : selection.html()
                                                                                                                                                                                                });
                                                                                                                                                                            }
                                                                                                                                                                           
                                                                                                                                                                           // Change "choose" value and add answered class
                                                                                                                                                                           $('div.choose:eq(' + $(that).parent('div.choose').parent().index() + ')').addClass('answered');
                                                                                                                                                                           
                                                                                                                                                                           if (app.template.getData().content[0].decideText !== undefined && typeof app.template.getData().content[0].decideText.invalid === 'object')
                                                                                                                                                                            {
                                                                                                                                                                             $(that).parent('div.choose').html('<a href="" class="chooseOne">' + $(selection).html() + '</a>');
                                                                                                                                                                            }
                                                                                                                                                                           else
                                                                                                                                                                            {
                                                                                                                                                                             $(that).parent('div.choose').html('<a href="" class="chooseOne">' + (app.template.getData().content[0].decideText !== undefined ? app.template.getData().content[0].decideText[target.attr('class')] : target.attr('class')) + '</a>');                                                                                    
                                                                                                                                                                            }
                                                                                                                                                                           
                                                                                                                                                                           // Remove and rebind
                                                                                                                                                                           $('#lightbox_val').remove();
                                                                                                                                                                           checkEnableSubmitButton();
                                                                                                                                                                          });
                                                                      },
                                                          data : {
                                                                  type : 'things',
                                                                  content : {
                                                                             html : html.join(''),
                                                                             title : '&nbsp;'
                                                                            }
                                                                 },
                                                          id : 'val',
                                                          independent : false,
                                                          modal : false,
                                                          position : {
                                                                      type : 'relative',
                                                                      x : ($(that).offset().left + ($(that).width() / 2)),
                                                                      y : $(that).offset().top + $(that).height() + 23
                                                                     },
                                                          size : 'small'
                                                         });
                                     
                                     // Disabling change graphic functionality
//                                     $('body').trigger('section-selected', {
//                                                                            id : $(this).parent('div.choose').parent('li').index('div#ul_container li')
//                                                                           });
                                     
                                     return false;
                                    });
   }
  
  function buildButtons(args)
   {
    args = args || {};
    
    var appendTo = args.appendTo || 'div#questions_container';
    
    if ($('#button_content').length <= 0)
     {
      // Add button container 
      var buttonContainer = document.createElement('div');
      buttonContainer.id = 'button_content';
      $(appendTo).append(buttonContainer);      
     }
    
    if ($('input#submit').length <= 0 && ($('input#tryAgain').length <= 0 || $('input#tryAgain').css('display') === 'none'))
     {
      buildSubmitButton();
     }
   }
  
  function buildQuestions(args)
   {
    var capturedAnswers = args.capturedAnswers,
        jsonAnswers = args.jsonAnswers,
        jsonAnswersLength,
        lightboxPrefix = '',
        questionsFragment = document.createDocumentFragment(),
        // Create <ul> container and append to fragment
        questionsUL = document.createElement('ul');
    
    questionsFragment.appendChild(questionsUL);
    
    if (jsonAnswers) {
      jsonAnswersLength = jsonAnswers.length;
      
      var x;
      for (x = 0; x < jsonAnswersLength; x++) {
        var chkBox = document.createElement('input'),
            chkBox = $(chkBox),
            divElement1 = document.createElement('div'),
            divElement1 = $(divElement1),
            divElement2 = document.createElement('div'),
            divElement2 = $(divElement2),
            divElement3 = document.createElement('div'),
            divElement3 = $(divElement3),            
            spanElement1 = document.createElement('span'),
            spanElement1 = $(spanElement1),
            liElement = document.createElement('li'),
            liElement = $(liElement),
            questionsCount,
            questionsUL = $(questionsUL);
            
        $(questionsUL).attr('id', 'hiddenUL');
        
        chkBox.attr('type','checkbox');
        spanElement1.addClass('tag');
        divElement1.addClass('feedback');
        divElement2.addClass('answer');
        divElement3.addClass('choose');

        spanElement1.html(jsonAnswers[x].tag);
        divElement2.html(jsonAnswers[x].value);
        
        liElement.append(chkBox);
        liElement.append(spanElement1);
        liElement.append(divElement2);
        liElement.append(divElement3);
        liElement.append(divElement1);
        questionsUL.append(liElement);
        
        // Append questions with interaction data if it was passed
          if(capturedAnswers !== undefined && capturedAnswers[x].learner_response === 'valid')
           {
            var modifier = 'valid';
            
            if (getData().content[0].decideText !== undefined && getData().content[0].decideText.valid !== undefined)
             {
              modifier = getData().content[0].decideText.valid;
             }
            chkBox.attr('checked','true');
            // Update UI and hidden form field
            divElement3.addClass('answered');
            
            if ($('#lightbox_toolkit_lb').length > 0)
             {
              divElement3.html(modifier);
             }
            else
             {
              divElement3.html('<a class="chooseOne" href="">' + modifier + '</a>');
             }
            
            checked++;
            if (getData().metadata[0].displayFeedback !== undefined && getData().metadata[0].displayFeedback !== false)
             {
              if ((parseInt(getData().questions[x].correctAnswer[0]) - 1) === x)
               {
                divElement1.html('<a class="feedback correct" href=""></a>');
               }
              else
               {                
                divElement1.html('<a class="feedback incorrect" href=""></a>');
               }
             }
            else
             {
              // case for old themes
              $.each(getData().questions[x].correctAnswer, function(index, value)
                                                            {
                                                             if (getData().metadata[0].displayFeedback !== undefined && getData().metadata[0].displayFeedback === false)
                                                              {
                                                               return false;
                                                              }
                                                             if ((parseInt(value) - 1) === x && capturedAnswers[x].learner_response === 'valid')
                                                              {
                                                               divElement1.html('<a class="feedback correct" href=""></a>');
                                                               return false;
                                                              }
                                                             else
                                                              {
                                                               divElement1.html('<a class="feedback incorrect" href=""></a>');
                                                              }
                                                            });
//              if ((parseInt(getData().questions[x].correctAnswer[0]) - 1) === x)
//               {
//                divElement1.html('<a class="feedback correct" href=""></a>');
//               }
//              else
//               {                
//                divElement1.html('<a class="feedback correct" href=""></a>');
//               }
             }
           }
          else if (capturedAnswers[x].learner_response === "invalid")
           {
            var modifier = 'invalid';
            
            if (getData().content[0].decideText !== undefined && getData().content[0].decideText.invalid !== undefined)
             {
              modifier = getData().content[0].decideText.invalid;
             }
            
            // Update UI and hidden form field
            divElement3.addClass('answered');
            
            if ($('#lightbox_toolkit_lb').length > 0)
             {
              divElement3.html(modifier);
             }
            else
             {
              divElement3.html('<a class="chooseOne" href="">' + modifier + '</a>');
             }
            
            if (getData().metadata[0].displayFeedback !== undefined && getData().metadata[0].displayFeedback !== false)
             {
              if ((parseInt(getData().questions[x].correctAnswer[0]) - 1) !== x)
               {
                divElement1.html('<a class="feedback correct" href=""></a>');
               }
              else
               {
                alert('mur1')
                divElement1.html('<a class="feedback incorrect" href=""></a>');
               }
             }
            else
             {
              // case for old themes
              $.each(getData().questions[x].correctAnswer, function(index, value)
                                                            {
                                                             if (getData().metadata[0].displayFeedback !== undefined && getData().metadata[0].displayFeedback === false)
                                                              {
                                                               return false;
                                                              }
                                                             
                                                             if ((parseInt(value) - 1) !== x && capturedAnswers[x].learner_response === 'invalid')
                                                              {
                                                               divElement1.html('<a class="feedback correct" href=""></a>');
                                                               return false;
                                                              }
                                                             else
                                                              {
                                                               divElement1.html('<a class="feedback incorrect" href=""></a>');
                                                              }
                                                            });
              
//              if ((parseInt(getData().questions[x].correctAnswer[0]) - 1) === x)
//               {
//                divElement1.html('<a class="feedback incorrect" href=""></a>');
//               }
//              else
//               {                
//                divElement1.html('<a class="feedback incorrect" href=""></a>');
//               }
             }
           }
          else if (capturedAnswers[x].learner_response !== 'click to decide' && capturedAnswers[x].learner_response !== undefined)
           {
            if ($('#lightbox_toolkit_lb').length > 0)
             {
              divElement3.addClass('answered');
              divElement3.html(capturedAnswers[x].learner_response);
             }
            else
             {
              divElement3.addClass('answered');
              divElement3.html('<a class="chooseOne" href="">' + capturedAnswers[x].learner_response + '</a>');
             }
           }
          else
            {
             divElement3.html('<a class="chooseOne" href="">click to decide</a>');
            }
          
          $('#lightbox_toolkit_lb a.chooseOne').each(function(i, e)
                                                      {
                                                       $(this).replaceWith($(this).html());
                                                      });
         
       }
     }
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      lightboxPrefix = '#lightbox_toolkit_lb ';
     }

    // Finally, append fragment to DOM
    $(lightboxPrefix + '#ul_container').append(questionsFragment);
    
//    if (app.questionBank[app.getPageName()][(app.questionBank[app.getPageName()].length - 1)].attempts !== undefined)
//     {
    
      // Strip out links
      $(lightboxPrefix + 'a.chooseOne').each(function(i, e)
                             {
//                              if ($(this).parent().parent().find('div.feedback').find('a.feedback').hasClass('incorrect') !== true)
                               // commented out because the behavior is that we need the revise button to appear                 
                              if ($(this).html() !== 'click to decide')
                               {                                
                                $(this).replaceWith($(this).html());
                               }
                             });
//     }
    
    // revise wrong answers
    if ($('a.feedback.incorrect').length > 0)
     {
      if ($('#lightbox_toolkit_lb').length <= 0)
       {        
        $('#button_content').empty();
       }
      
      $('a.feedback.incorrect').each(function(index, value)
                                      {                                       
                                       setTryAgainAnswers($('a.feedback').index(this));
                                      });

      submitForm();
     }
      
    // Feedback free finished
    if ($('a.chooseOne').length === 0 && $('a.feedback.incorrect').length <= 0 && app.template.getData().metadata[0].displayFeedback === false)
     {
      // Add button container 
      var buttonContainer = document.createElement('div');
      buttonContainer.id = 'button_content';
      $('div#ul_container').append(buttonContainer);
      
//    Release this page's gated setting
      app.getTest().ungateThisTest();
      
      manageFooterButtons({
                           noSubmit : false
                          });
     }
    else if ($('a.chooseOne').length === 0 && $('a.feedback.incorrect').length <= 0)
     {
//    Release this page's gated setting
      app.getTest().ungateThisTest();
     }
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
  
  function checkEnableSubmitButton()
   {
    // Check if all questions have been answered 
    if ($('a.chooseOne:contains("click to decide")').length === 0) {
      $('input#submit').removeAttr('disabled');
      $('input#submit').removeClass('disableds');
     } else {
      if ($('input#submit').length <= 0)
       {
        buildSubmitButton();
       }
      
      // Resetting this value every time prevents you from having to 
      // reset it on remidation or reset
      $('input#submit').attr('disabled', 'true');
      $('input#submit').addClass('disableds');
      return 0;
     }
   }

  function displayCorrectAnswers()
   {
    var answers = app.getTest().getQuestionBank(),
        answersLength = answers.length,
        questionsBank = app.getTest().getQuestionBank(),
        correctAnswers = questionsBank[0].correctAnswer,
        correctAnswersLength = correctAnswers.length;
    
    $('#ul_container').empty();
    // Get correct answers from capturedAnswers
    for (var x = 0; x < correctAnswersLength; x++) {
      answers[correctAnswers[x]-1].id = (correctAnswers[x]-1);
      answers[correctAnswers[x]-1].learner_response = jsonAnswers()[correctAnswers[x]-1].value;
     }
    
    // Append objects in array with id & learner_response values
    buildQuestions({
                    "jsonAnswers" : jsonAnswers(),
                    "capturedAnswers" : answers
                   });
    
    submitForm({
                noSubmit : true
               });
   }
  
  function init()
   {
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      return;
     }
    
    
    app.hooks.clearHooks();
    app.hooks.setHook({
                       name : 'RenderTest',
                       functionName : function ()
                                       {
                                        app.thisTemplate.render(templateMode);
                                       }
                      });
   }
  
  function getData()
   {
    var data;
    
    if ($('#lightbox_toolkit_lb.themes').length > 0)
     {
      data = app.toolkit.getData();
     }
    else
     {
      data = app.template.getData();
     }
    
    return data;
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
   * Returns app.template.getData().content[0].answerList
   * @return object
   */
  function jsonAnswers()
   {
    // TODO: Not sure why the commented code isnt needed
    var ret;
    
    if (app.template.getData().content === undefined) {
      ret = app.toolkit.getData().content[0].answerList;
     } else {
      ret = app.template.getData().content[0].answerList;
     }
    
    return ret;
    // return app.template.getData().content[0].answerList || app.toolkit.getData().content[0].answerList;
   }
  
  function getQuestionBank()
   {
    return app.getTest().getQuestionBank();
   }
  
  function questionsManager(args)
   {
    // Get the current TestManager instance
    var capturedAnswers,
        jsonData;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      capturedAnswers = args.testData;
      jsonData = args.jsonData.content[0].answerList;
     }
    else
     {
      capturedAnswers = app.getTest().getQuestionBank();
      jsonData = jsonAnswers();
     }

    buildQuestions({
                    jsonAnswers : jsonData,
                    capturedAnswers : capturedAnswers
                   });
    
    /*
    // Check if interaction data exists
    if (capturedAnswers[0].id !== null && capturedAnswers[0].id !== undefined) {
      // Build in/correct answers
      buildQuestions({
                      jsonAnswers : jsonAnswers(),
                      capturedAnswers : capturedAnswers
                     });
     } else {
      // If no instances are saved just build from scratch
      buildQuestions({
                      jsonAnswers : jsonAnswers()
                     });
     }*/
   }
  
  function manageFooterButtons(args)
   {
    var args = args || {},
        continueButton,
        noSubmit = args.noSubmit,
        tryAgainButton;

    // Hide submit & ghost reset buttons
    $('input#submit').hide();

    // Show 'try again' or 'continue' based on attempts & score
    if (attempts <= 0 || tryAgainAnswers.length === 0 || app.template.getData().metadata[0].displayFeedback === false) {
      // Show 'continue' button (create it first if it doesn't already exist)
      // Do not display if the noSubmit value is true
      if ($('input#continue').length > 0 && noSubmit === false) {
        $('input#continue').show();
      } else {
        if (noSubmit === false) {
         var score;
         
          // Create continue button
          continueButton = document.createElement('input');
          continueButton.type = 'button';
          continueButton.id = 'continue';
          $('div#button_content').append(continueButton);
          
          if (app.template.getData().metadata[0].displayFeedback !== false)
           {
            //Show our tooltip for clicking feedback visible
            $('img#data_tooltip').css('display','inline');
            
            score = Math.round($('a.feedback.correct').length * 100 / $('a.feedback').length);
           }
          else
           {
            score = undefined;
           }
          // Remove all event handlers previously attached using .live()
          $('a.chooseOne').die().bind('click', function() {return false;});
//          alert('attempt: ' + app.questionBank[app.getPageName()][app.questionBank[app.getPageName()].length - 1].attempts.length)
//          app.getTest().recordAttemptResult({
//                                             testId: app.getPageName(),
//                                             attempt: app.questionBank[app.getPageName()][app.questionBank[app.getPageName()].length - 1].attempts ? app.questionBank[app.getPageName()][app.questionBank[app.getPageName()].length - 1].attempts.length : 1,
//                                             score: score,
//                                             persist: true
//                                            });
          
          // Release this page's gated setting
          app.getTest().ungateThisTest();
          
          if (app.template.getData().metadata[0].persistData !== undefined && app.template.getData().metadata[0].persistData !== 'false')
           {
            app.getTest().recordTest({
                                      score : score
                                     });
           }
          
          // Bind event to it
          $('input#continue').bind('click', function ()
                                             {
                                              // Hide any rogue lightboxes
                                              $('#val').remove();
                                              
                                              // Continue to the next page
                                              app.doNext();
                                              return false;
                                             });
          
         }
       }
     } else {
      // Show 'try again' button (create it first if it doesn't already exist)
      if ($('input#tryAgain').length > 0) {
        $('input#tryAgain').show();
      //Show our tooltip for clicking feedback visible
     
       } else {
        // Create 'try again' button
//      Add button container 
        var buttonContainer = document.createElement('div');
        
        if ($('input#tryAgain').length <= 0)
         {          
          if ($('div#button_content').length <= 0)
           {            
            buttonContainer.id = 'button_content';
            $('div#questions_container').append(buttonContainer);
           }
          
          tryAgainButton = document.createElement('input');
          tryAgainButton.type = 'button';
          tryAgainButton.id = 'tryAgain';
          $('div#button_content').append(tryAgainButton);
         }
        
        // Bind event to it
        $('input#tryAgain').bind('click', function ()
                                           {
                                            $('input#tryAgain').hide();
                                            $('input#submit').show();
                                            $('.lightbox').remove();

                                            $('div.choose').each(function()
                                                                  {
                                                                   if ($(this).parent('li').find('div.feedback a.feedback').hasClass('correct') === false) {
                                                                     $(this).removeClass('answered');
                                                                     $(this).html('<a href="" class="chooseOne">click to decide</a>')
                                                                    } else {
                                                                     $(this).parent('li').find('div.feedback a.correct').addClass('correct_blur');
                                                                    }
                                                                  });
                                            
                                            $('img#data_tooltip').css('display', 'none');
                                            
                                            // Remove all 'incorrect' classes
                                            $('a.incorrect', 'div#questions_container li.droppable').removeClass('incorrect');
                                            
                                            resetForm({
                                                       filter : tryAgainAnswers
                                                      });
                                           });
       }
      if (app.template.getData().metadata[0].displayFeedback !== false)
       {
        $('img#data_tooltip').css('display','inline');
       }
     }
   }
  
  function render()
   {
    var mode = app.toolkit.mode || null,
        lightboxPrefix = '';
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      lightboxPrefix = '#lightbox_toolkit_lb ';
     }
    
    // Round corners
//    Nifty('div#questions_container');
    DD_roundies.addRule('#questions_container', '5px', true);
    // Detect if the template is loaded into a lightbox
    if ($('.lightbox_window_width').length > 0) {
      // If the template is in a lightbox then display corrected answers
//      displayCorrectAnswers();
     } else {
      // TODO: Update this description
      questionsManager();
     }
    
    bindEvents();
    
//  Creates tiled table look
    $('body.soc #ul_container ul li:odd').addClass('odd');
    
    checkEnableSubmitButton();
    
    $('body').one('template.loaded', function()
                                      {                                       
                                       app.template.fixImgPaths(lightboxPrefix + 'div#data_portrait_caption');
                                       
                                       switch (true)
                                        {
                                         case $(lightboxPrefix || 'body').hasClass('assessment'):
                                          $('div#portrait_image_container').insertAfter(lightboxPrefix + 'div#data_portrait_caption');
                                          
                                          // Not used since we do not need custom sprites
//                                          $('img#data_portrait_image').replaceWith($(document.createElement('div')).css('background-image', 'url(' + $('img#data_portrait_image').attr('src') + ')'));
                                          
                                          // Custom bind events for assessment
                                          $('body').bind('section-selected', function(e, args)
                                                                              {
                                                                               var coords = app.template.getData().content[0].answerList[args.id].coords;
                                                                               
                                                                               $('div#portrait_image_container div').css('background-position', coords.x + 'px ' + coords.y + 'px');                                                                               
                                                                              });
                                          
                                          if ($('div#button_content').length <= 0)
                                           {
                                            buildButtons({
                                                          appendTo : lightboxPrefix + 'div#ul_container'//'ul#hiddenUL li:eq(' + ($('ul#hiddenUL li').length - 1) + ')'
                                                         });
                                           }
                                          
                                          DD_roundies.addRule('#portrait_container', '5px', true);
                                          DD_roundies.addRule('#ul_container', '5px', true);
                                          DD_roundies.addRule('#button_content', '5px', true);
                                         break;
                                         
                                         default:
                                          buildButtons();

                                         // If everything is graded then do bindings
                                         if ($('ul#hiddenUL li:has(a.feedback)').length === $('ul#hiddenUL li').length)
                                          {
                                           $('a.feedback').remove();
                                           
                                           assessAnswers()
                                          }
                                        }
                                      });
   }
  
  /**
   * Can reset all questions or individual ones via passing
   * a set value in the args object
   * @param args.set array of integers representing "li.droppable a#question_{#}"
   * @return
   */
  function resetForm(args)
   {
    var args = args || {},
        filter = args.filter || null,
        filterLength = filter.length,
        questionsLength = jsonAnswers().length;
    
    // Reset try again answers since we're using them here
    tryAgainAnswers = [];
    
    // Check if feedback is correct, if so then disable the checkbox and leave it alone
    // Otherwise remove the feedback
    var x;
    for (x = 0; x < questionsLength; x++) {
      if ($('#ul_container li:eq(' + x + ') div.feedback').has('a.feedback.correct').length > 0) {
        $('#ul_container li:eq(' + x + ') input').attr('disabled','true');
       } else {
        if ($('#ul_container li:eq(' + x + ') input').attr('checked')) {
          $('#ul_container li:eq(' + x + ') input').removeAttr('checked');
         }
       }
     }
    
    // If a filter set is passed, remove only those
    if (filter) {
      for (x = 0; x < filterLength; x++) {
        $('#ul_container li:eq(' + filter[x] + ') div.feedback').empty();
        $('#ul_container li:eq(' + filter[x] + ') input').removeAttr('disabled');
       }
     }
    
    // Make sure ghosting is in the correct state
    checkEnableSubmitButton();
   }
  
  function setTryAgainAnswers(value)
   {
    tryAgainAnswers.push(value);
    tryAgainAnswers.sort();
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
    
    // Disable all checkboxes in between states, retry will handle enabling
    $('checkbox').attr('disabled','true');
    
    // Create new feedback element
    var feedbackElement = document.createElement('a');
    feedbackElement.className = 'feedback ' + correctness;
    feedbackElement.href = '';
    $(target).append(feedbackElement);
    
    // If there is no feedback then do not bind a lightbox
    if (feedback.length <= 0) 
     {
      //Since feedbackElement is an anchor element, bind to its click event and return false to stop the event.
      $(feedbackElement).bind('click', function()
                                        {
                                         return false;
                                        });
      return false;
     }
    // Bind feedback lightbox to it
    $(feedbackElement).bind('click', function ()
                                      {
                                       app.lightbox.render({
                                                            global : ale,
                                                            attachCloseEvent : false,
                                                            callback : function()
                                                                        {
                                                                         $('div.lightbox a.close, div#modal').unbind()
                                                                                                             .bind('click', function()
                                                                                                                             {
                                                                                                                              $('div.lightbox').remove();
                                                                                                                              $('div#modal').css('display', 'none');
                                                                                                                              return false;
                                                                                                                             });
                                                                        },
                                                            id : app.lightbox.getFreshLightboxId(),
                                                            data : {
                                                                    // We're using the same style feedback lightbox as vidNotesFeedback
                                                                    type : 'vidNotesFeedback',
                                                                    content : {
                                                                               yourAnswer : yourAnswer,
                                                                               correctAnswer : correctAnswer,
                                                                               feedback : feedback
                                                                              }
                                                                   },
                                                            // Set to true so we can allow multiple lightboxes in toolkit mode         
                                                            independent : true
                                                           });
                                       return false;
                                      });
   }
  
  /**
   * Compares answers given to correct answers
   * Stores incorrect answers in tryAgainAnswers[]
   * Determines whether to show 'continue' or 'try again'
   * @return
   */
  function submitForm(args)
   {
    var args = args || {},
        determinedAttempt = 1,
        prefix = $('#lightbox_toolkit_lb').length > 0 ? '#lightbox_toolkit_lb ' : '',
        recordedAttempts = app.questionBank[app.getPageName()][app.questionBank[app.getPageName()].length - 1].attempts,
        noSubmit = args.noSubmit || false;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      return;
     }
        
    if (recordedAttempts)
     {
      $.each(recordedAttempts, function()
                           {
                            determinedAttempt += 1;
                           });
     }
        
        
    $('div.lightbox:not(#lightbox_toolkit_lb)').remove();
    
    // Decrement attempts
    attempts -= 1;

    // Assess answers if json has displayFeedback enabled
    if (getData().metadata[0].displayFeedback !== false)
     {
      // Remove tooltip, since there wont be any feedback      
      if ($('#lightbox_toolkit_lb').length <= 0)
       {     
        $(prefix + 'a.feedback').remove();
        
        assessAnswers();
        
        manageFooterButtons({
                             noSubmit : noSubmit
                            });
       }

      app.getTest().recordAttemptResult({
                                         testId: app.getPageName(),
                                         attempt: determinedAttempt,
                                         extraProp : 'question',
                                         score: Math.round($('a.feedback.correct').length * 100 / $('a.feedback').length),
                                         persist: true
                                        });
      
      app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].question = {
                                                                                              header : (typeof app.template.getData().content[0].header === 'string' ? $(app.template.getData().content[0].header).text() : 'gather supporting evidence') || app.template.getData().content[0].header,
                                                                                              question : $(app.template.getData().content[0].paragraph).text() || app.template.getData().content[0].paragraph
                                                                                             };
      
      return;
     }
    else
     {
      $(prefix + 'img#data_tooltip').remove();
      
//    Assess answers if json has displayFeedback disabled
      if ($('#lightbox_toolkit_lb').length <= 0)
       {        
        assessAnswers({
                     feedback : false
                    });
        
        app.getTest().recordAttemptResult({
                                           testId: app.getPageName(),
                                           attempt: determinedAttempt,
                                           extraProp : 'question',
                                           score: Math.round($('a.feedback.correct').length * 100 / $('a.feedback').length),
                                           persist: true
                                          });
        
        app.getTest().getQuestionBank()[app.getTest().getQuestionBank().length - 1].question = {
                                                                                                header : (typeof app.template.getData().content[0].header === 'string' ? $(app.template.getData().content[0].header).text() : 'gather supporting evidence') || app.template.getData().content[0].header,
                                                                                                question : $(app.template.getData().content[0].paragraph).text() || app.template.getData().content[0].paragraph 
                                                                                               };
       }
        
        $('a.chooseOne').each(function(i, e)
                               {
                                $(this).replaceWith($(this).html());
                               });
//       }
     }
    
    // Disable submit button
    manageFooterButtons({
                         noSubmit : noSubmit
                        });
   }
  
  App.prototype.toolkitInit = function(args)
                               {
                                if ($('#lightbox_toolkit_lb').length > 0)
                                 {
                                  $('#lightbox_toolkit_lb.assessment div#portrait_image_container').insertAfter('#lightbox_toolkit_lb.assessment div#lightbox_data_portrait_caption');
                                  
                                  questionsManager({
                                                    prefix : '#lightbox_toolkit_lb ',
                                                    jsonData : args.jsonData,
                                                    template : args.template,
                                                    testData : args.testData
                                                   });
                                  
                                  $('#lightbox_toolkit_lb a.chooseOne').each(function(i, e)
                                                                              {
                                                                               $(this).replaceWith($(this).html());
                                                                              });
                                 }
                               }
  
  
  // Public interface
  // ----------------
  this.init = init;
  this.render = render;
 }

App.prototype.thisTemplate = new Themes(ale);

ale.thisTemplate.init();