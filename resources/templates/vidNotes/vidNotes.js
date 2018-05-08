function VidNotes(args)
 {
  var _config = {};
  setConfig(args);

  var _visibleQuestion = 0,
      app = getConfig().link,
      console = new Console();

  this.render = render;

  // Set hooks to fire after TestManager gets loaded
  init();

  function animateExcerpts(args)
   {
    // Close all others, and open args.id
    var elementHeight = $(window).height() - $('#question_container').offset().top - 300,
        id = args.id || 0,
        previous = args.previous || 0;
    
    // Set min/max
    elementHeight = (elementHeight < 500) ? 500 : elementHeight;
    
    $('.lightbox').hide();
    
    if (id !== previous)
     {
      $('div.excerpt h1').eq(previous).toggleClass('active');
      
      $('div.excerpt div.excerptBody').eq(previous)
                                      .animate({
                                                'height': 0
                                               })
                                      .queue(function ()
                                              {
                                               $('.excerpt:eq(' + previous + '), .excerpt:eq(' + previous + ') .niftycorners b').css({
                                                                                                                                      'background' : '#e5e5e5'
                                                                                                                                     });
                                              });
     }
    
    $('div.excerpt div.excerptBody:eq(' + id + ')').dequeue()
                                                   .animate({
                                                             'height' : elementHeight
                                                            });
    
    $('div.excerpt:eq(' + id + '), div.excerpt:eq(' + id + ') .niftycorners b').css({
                                                                                     'background' : '#fff'
                                                                                    });
    $('div.excerpt:eq(' + id + ') h1').addClass('active');
                                                                                    
    var DOMelement = 'a.flowplayer:eq(' + id + ')';
    app.template.flowplayerHelper().play(DOMelement);
   }

  function applyLightboxFunctions(args)
   {
    var lightbox = $('#lightbox_' + args.id),
        target = args.target;
    
    // Change value when clicking the radio buttons
    $('input:radio', lightbox).unbind('click')
                              .bind('click', function ()
                                              {
                                               $(target).html($(this).val());
                                               
                                               updateCompletedQuestionsCount();
                                               
                                               //console.info("$(this).attr('id').split('_')[1]: " + $(this).attr('id').split('_')[1]);
                                               
                                               app.getTest().recordInteraction({
                                                                                'id' : $(this).attr('id').split('_')[1],
                                                                                'value' : $(this).attr('id').split('_')[2]
                                                                               });
                                                                               
                                               checkEnableSubmitButton();
                                              });
                                        
    // Close lightbox when clicking 'ok'
    $('.close', lightbox).bind('click', function ()
                                         {
                                          $(lightbox).hide();
                                          return false;
                                         });
   }

  function bindExcerptAnimations()
   {
    // Action for clicking on the excerpt title bars
    $('div.excerpt h1').bind('click', function ()
                                       {
                                        var previousQuestion = getVisibleQuestion();
                                        
                                        setVisibleQuestion({
                                                            'value' : $('.excerpt h1').index(this)
                                                           });
                                                           
                                        var id = $('.excerpt h1').eq(getVisibleQuestion());

                                        animateExcerpts({
                                                         'id' : $('.excerpt h1').index(id),
                                                         'previous' : previousQuestion
                                                        });
                                        return false;
                                       });
    
    // Action for clicking on the 'go to next' link in each eacerpt (except the last)
    /* // NOTE: NOT WORKING CORRECTLY NOW - COMMENTED OUT UNTIL LATER.
    $('a.next_excerpt').bind('click', function ()
                                       {
                                        var previousQuestion = getVisibleQuestion();
                                        
                                        setVisibleQuestion({
                                                            'value' : $('a.next_excerpt').index(this) + 1
                                                           });
                                                           
                                        var id = $('a.next_excerpt').eq(getVisibleQuestion());
                                            
                                        animateExcerpts({
                                                         'id' : $('a.next_excerpt').index(id) + 1,
                                                         'previous' : previousQuestion
                                                        });
                                        return false;
                                       });
    */
    
    animateExcerpts({
                     'id' : 0
                    });
   }

  function bindLightboxes(args)
   {
     var questions = args.questionBank;
    
    // Bind lightbox events
    $('span.answerArea').bind('click', function (e)
                                        {
                                         var answer,
                                             checked = '',
                                             html = [],
                                             id = $('.answerArea').index(this),
                                             that = this,
                                             question,
                                             
                                             // Counts for (var i in questions[id].answers)
                                             x = 0; 
                                         
                                         // Insert answer form elements
                                         for (var i in questions[id].answers)
                                          {
                                           answer = questions[id].answers[i].value;
                                           checked = (questions[id].learner_response === i) ? ' checked' : null;
                                           question = questions[id];
                                           
                                           html.push('<div class="answer">');
                                           html.push('<input type="radio" value="', answer ,'" name="question_', id ,'_choices" id="question_', id ,'_', i ,'"', checked, '>');
                                           html.push('<label for="question_', id ,'_', i ,'">', question.answers[i].value, '</label>');
                                           html.push('</div>');
                                           x++;
                                          } 
                                         
                                         // Insert submit button
                                         html.push('<input class="button go close" value="">');
                                         
                                         app.lightbox.render({
                                                              'global' : ale,
                                                              'data' : {
                                                                        'type' : 'vidNotes',
                                                                        'content' : {
                                                                                     'html' : html.join(''),
                                                                                     'title' : 'seleccionar'
                                                                                    }
                                                                       },
                                                              'id' : id,
                                                              'independent' : $(this).hasClass('independent'),
                                                              'modal' : false,
                                                              'position' : {
                                                                          'type' : 'relative',
                                                                          'x' : ($(that).offset().left + ($(that).width() / 2)),
                                                                          'y' : $(that).offset().top + $(that).height() + 23
                                                                         },
                                                              'size' : 'small'
                                                             });
                                                             
                                         applyLightboxFunctions({
                                                                 'id' : id,
                                                                 'target' : $('.answerArea').eq(id)
                                                                });                   
                                          
                                        });
   }

  function bindSubmitButton()
   {
    $('input.saveAndContinue').bind('click', function ()
                                              {
                                               console.info('submit this question...');
                                               submitAnswers();
                                               return false;
                                              });
   }

  function buildHTML()
   {
    var questionBank = app.getTest().getQuestionBank();
    
    buildQuestions({
                    'questionBank' : questionBank,
                    'callback' : populateAnswers
                   });
    
    bindLightboxes({
                    'questionBank' : questionBank
                   });
    
    bindExcerptAnimations();
    bindSubmitButton();
                   
    // bind submit functions here
    // 1.) animateOpen($(element).eq(getVisibleQuestion())) {
    //      var height = getViewportHeight();
    //      
    //     }
    // 2.) toggleStyles() {
    //      toggle background class
    //      toggle h1 class
    //     }
    
   }

  function buildQuestions(args)
   {
    var applySwf = [],
    
        // The last function to get called in buildQuestions
        callback = args.callback || function(){},
        
        // Contains the <div class="excerpt"> containers
        documentFragment = [],
        
        // Returns app.template.getData().content[0].excerptData;
        excerptData = getExcerptData(),
        
        // Will contain an eval()'d version of a dynamic object literal built in 
        // the form of a string and passed through data binding later
        json,
        
        // Looks like this is only used in a loop
        //lastAnswered = getVisibleQuestion(),
        
        // Resolves to app.getTest().getQuestionBank()
        // Which resolves to _questionBank
        // Which is set in TestManager.recordInteraction.record()
        questions = args.questionBank,
        
        // 
        string,
        
        // Count for (var i in excerptData)
        l = 0;
        
    for (var i in excerptData)
     {
      
      var question = questions[i];
      
      // The product of this loop, lastAnswered, isn't used anywhere else in this function
      // Maybe it's just old.
      /*
      if (typeof question.learner_response !== 'undefined')
       {
        lastAnswered++;
       }
      */
     
      // TODO: Refactor this to create DOM objects instead of the push string builder method
      documentFragment.push('<div class="excerpt">');
        documentFragment.push('<h1>', excerptData[l].title, '</h1>');
        documentFragment.push('<div class="excerptBody">');
            switch (excerptData[l].type)
             {
              case 'video' :
               documentFragment.push('<div class="contentColumn" id="data_video_', l, '">');
               string = '{"video_' + l + '": {"type" : "swf","content" : "'+ excerptData[l].assetURL +'"}}';
               json = eval("(" + string + ')');
               applySwf.push(json);
               break;
               
              case 'audio' :
               documentFragment.push('<div class="contentColumn" id="data_audio_', l, '">');
               string = '{"audio_' + l + '": {"type" : "audio","content" : "'+ excerptData[l].assetURL +'"}}';
               json = eval("(" + string + ')');
               applySwf.push(json);
               break;
               
              default: // Text
               // NOTE: This div probably doesn't need the "_video_" id since it's just printing HTML
               // which will display properly regardless of the container ID.
               documentFragment.push('<div class="contentColumn" id="data_video_', l, '">');
               documentFragment.push('<p>', excerptData[l].description, '</p>');
               documentFragment.push('<img src="/s3scorm/ale/content/assets/', excerptData[l].assetURL ,'" alt="', excerptData[l].assetURL ,'">');
             }
          documentFragment.push('</div>');
          documentFragment.push('<div class="answerColumn">');
            documentFragment.push('<h2>', excerptData[l].title, ' apuntes</h2>');
            documentFragment.push('<div id="questions_content">');
            
            var m = 0; // Count for (var i in questions)
            for (var x in questions)
             {
              // Match questions in the current group
              if ((questions[x].group * 1) === (l + 1)) // +1 is added because 'group' is expected to start with 1 since is it human generated 
               {
                documentFragment.push('<p class="answerDescription">');
                documentFragment.push(questions[x].description);
                documentFragment.push('</p>');
               }
              m++;
             }
            documentFragment.push('</div> <!-- questions_content -->');
            
            // Don't include the 'next excerpt' link on the last page
            /* NOTE: NOT WORKING CORRECTLY. COMMENTED OUT UNTIL LATER.
            if (i < (excerptData.length - 1))
             {
              documentFragment.push('<a href="#" class="next_excerpt">va al siguiente parte</a>');
             }
             */
            
          documentFragment.push('</div>');
        documentFragment.push('</div>');
      documentFragment.push('</div>');
      l++;
     }
    
    $(getConfig().mainContainer).append(documentFragment.join(""));
    //added for giving student name where ever cssSkin will be set to learnername in metadata
    $('body.showLearnerName ' + getConfig().mainContainer + ' #questions_content').append(app.scorm.learnerName());
    
    // Call swfobject
    if (applySwf.length > 0) 
     {
      for (var j = 0; j < applySwf.length; j++)
       {
         app.template.bindData({
                                source : applySwf[j]
                               });
         //set video width instead of default 100% in flowplayer lib
         // Commenting this out for now since this will cause viewing this template in an iframe to break due to the fixed width
         //$('div#data_video_' + j).css({'width':'600px'});
       }
      
      /*
      swfobject.registerObject("swf_" + applySwf.l, "9.0.115", applySwf.assetURL);
      */
      
      // For some reason, the object element's visibility gets set to hidden so we have to unhide it
      $('#swf_' + applySwf.l).css({
                                   'visibility' : 'visible'
                                  });
      
      // This code showed up in Kyle's commit
      // $('#swf_' + excerptData[l]).css({'visibility':'visible'});
     }
    
    documentFragment = [];
    documentFragment.push('<div id="submit_container"><span id="completed_questions">', questions.length ,'</span> <span>de</span> <span id="total_questions">', questions.length ,'</span> apuntes para completar <input type="button" class="button saveAndContinue" id="answerAndContinue" disabled></div>');
    $(documentFragment.join('')).insertAfter(getConfig().mainContainer);
    
    callback();
   }

  function checkEnableSubmitButton()
   {
    var questions,
        unansweredQuestions = false;
    
    // Check if all questions have been answered
    //if (updateCompletedQuestionsCount() === app.getTest().getQuestionBank().length) // This was used before when we were counting up from zero
    if (updateCompletedQuestionsCount() === 0)
     {
      unansweredQuestions = false;
     }
    else
     {
      unansweredQuestions = true;
     }
    
    // Enable submit button
    if (!unansweredQuestions)
     {
      $('#answerAndContinue').removeAttr('disabled');
     }
    
   }

  function getConfig()
   {
    return _config;
   }
  
  function getContainer()
   {
    return getConfig().container;
   }
  
  function getExcerptData()
   {
    return app.template.getData().content[0].excerptData;
   }
  
  function getMainContainer()
   {
    return getConfig().mainContainer;
   }
   
  function getQuestionLength()
   {
    return $(getConfig().container).length;
   }
  
  function getVisibleQuestion()
   {
    return _visibleQuestion;
   }
  
  function init()
   {
    app.hooks.clearHooks();
    app.hooks.setHook({
                        'name' : 'RenderTest',
                        'functionName' : function ()
                                          {
                                           app.thisTemplate.render();
                                          }
                       });
   }
  
  function populateAnswers()
   {
    var answers = app.getTest().getQuestionBank();
    
    // Loop through containers and populate them with
    // their respective answers given if any.
    $('.answerArea').each(function (index)
                           {
                            if (answers[index])
                             {
                              if (answers[index].learner_response)
                               {
                                $(this).html(answers[index].answers[answers[index].learner_response].value);
                               }
                             }
                           });
                           
    // Update the 'x of n remaining' count
    updateCompletedQuestionsCount();
   }
  
  function render()
   {
    if (!getVisibleQuestion())
     {
      setVisibleQuestion({
                          'value' : 0
                         });
     }
    buildHTML();
    roundQuestionContainer();
   }
   
  // NOTE: Function does nothing.
  function reorderExcerptRows()
   {
    var rows = $('.questionNumber'),
        lastRowNumber = 0;
    
    /* NOTE: Function incomplete. Stopped midway.
    $.each(rows, function (index, value)
                  {
                   console.info('$(this).html(): ' + $(this).html() + ', & typeof: ' + typeof $(this).html());
                   
                   if ($(this).html() === lastRowNumber)
                    {
                     // Remove duplicate numbers
                     lastRowNumber = $(this).html();
                     $(this).html('');
                    }
                   else
                    {
                     // Replace the tr class of $(this).parent() with 
                    }
                  });*/
    
    /* Replaced with loop above
    $.each(rows, function(index, value)
                  {
                   console.info('@vidNotes.reorderExcerptRows() -> index: ' + index);
                   console.info('@vidNotes.reorderExcerptRows() -> value:');
                   console.debug(value);
                   console.info('$(this).html(): ' + $(this).html());
                   $('.questionNumber[abbr*=' + index + ']');
                   console.info("$('.questionNumber[abbr*=" + index + "]').length: " + $('.questionNumber[abbr*=' + index + ']').length);
                   
                   // Find out if there are multiple questions per group
                   if ($('.questionNumber[abbr*=' + index + ']').length > 1)
                    {
                     // If there are, move the current item to just behind the last item in the group
                     //$('.questionNumber[abbr*=' + index + ']').parent().remove().insertAfter($('.questionNumber[abbr*=' + index + ']:eq(' + $('.questionNumber[abbr*=' + index + ']').length + ')').parent());
                     
                     // Remove all numbers, and add back only the first
                     console.debug($('.questionNumber[abbr*=' + index + ']:parent'));
                     $('.questionNumber[abbr*=' + index + ']').html('');
                     $('.questionNumber[abbr*=' + index + ']:eq(0)').html(index);
                     
                     // Add class to all <tr>s and then remove it from the last one
                     $('.questionNumber[abbr*=' + index + ']').parent().addClass('short_dotted');
                     $('.questionNumber[abbr*=' + index + ']:eq(' + $('.questionNumber[abbr*=" + index + "]').length + 1 + ')').parent().removeClass('short_dotted');
                    }
                   
                  });*/
   }
   
  function roundQuestionContainer()
   {
    Nifty('div#question_container');
    Nifty('div.excerpt');
   }

  function roundExerpts()
   {
    Nifty('div.exerpt', 'big');
    
   }

  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this,
                        'container' : '.question',
                        'mainContainer' : '#question_container'
                       }, args);
   }

  function setVisibleQuestion(args)
   {
    _visibleQuestion = args.value;
   }

  /*
   * Interaction includes submitting answers to the LMS <del>and navigating to the next page</del> and displaying the results page
   */
  function submitAnswers()
   {
    // Must include a stop for IE
    var DOMelement = 'a.flowplayer:eq(' + getVisibleQuestion() + ')';
    app.template.flowplayerHelper().stop(DOMelement);
    
    $('.lightbox').hide();
    $('#question_container').hide();
    $('#submit_container').hide();
    
    // Need to get excerpt data
    var correctCount = 0,
        questions = app.getTest().getQuestionBank(),
        resultsSummary = '',
        score,
        totalQuestions = questions.length,
        m = 0; // Counts for (var i in questions)
        
    // build results table
    resultsSummary = '<table><thead><th id="results_col1_header">#</th><th>apunte</th><th>resultado</th></thead><tbody>';
    
    // Calculate score
    for (var i in questions)
     {
      var correctAnswer = null,
          correctness, // Stores 'correct/incorrect'
          feedback,
          learnerResponse = '',
          newCorrectAnswer, // Augmented below 
          newDescription, // Augmented below
          newLearnerResponse, // Augmented below
          question = questions[i],
          trClass = '',
          wasCorrect = false;
       
       
       
       // Add '.last' class to last tr
       (m === (questions.length-1)) ? trClass = ' class="last"' : null;
       
       resultsSummary += '<tr' + trClass + '>';
       
       // Get correct answer
       correctAnswer = question.correctAnswer[0];
       
       // TODO: question.id is undefined. Figure out where we should be grabbing it from.
       // ID was removed from the questions JSON in another template - look there.
       
       // Loop through answers 
       for (var j in question.answers)
        {
         var questionAnswersLength = question.answers.length;
         
         // Can't rely exclusively on the radio:checked method
         // since if they return from a suspended session, the lightboxes
         // don't get recreated even if there is learner information meaning
         // in that case, the results state will thrown the "feedback
         // undefined" error
         
         // Check radio inputs for latest input
         if ($('#question_' + m + '_' + j).length > 0) 
          {
           if ($('#question_' + m + '_' + j + ':checked').length > 0) 
            {
             learnerResponse = question.answers[j].value;
             feedback = question.answers[j].feedback || '';
            }
          }
         else
          {
           // Check questionBank for previous answers
           learnerResponse = app.getTest().getQuestionBank()[m].answers[(app.getTest().getQuestionBank()[m].learner_response * 1)].value;
           feedback = app.getTest().getQuestionBank()[m].answers[(app.getTest().getQuestionBank()[m].learner_response * 1)].feedback;
          }
        }
        
      wasCorrect = (correctAnswer == learnerResponse);
      correctness = (wasCorrect) ? 'correct': 'incorrect';
      
      // Replace question areas with colored answers given
      // Not sure why/how we're getting description from the question array
      // NOTE: The commented line below newDescription - this was causing errors
      // since we decided to use the description field to store remediation attempt data
      // so I changed it to pull from the JSON file instead of the questionBank()
      // which seems more appropriate anyways.
      newDescription = app.template.getData().questions[i].description.replace('<span class=\'answerArea\'></span>', '<span class=' + correctness + '>' + learnerResponse + '</span>');
      //newDescription = question['description'].replace('<span class=\'answerArea\'></span>', '<span class=' + correctness + '>' + learnerResponse + '</span>');
      //matching if the glossary terms are more than one and at any index level in place of only one glossary term of single index level
      newDescription = newDescription.replace(/<a href=\'#\' class=\'contextual_glossary( )?(data_[0-9]+)?\'>/g, '');
      newDescription = newDescription.replace(/<\/a>/g, '');
      newDescription = newDescription.replace(/'|’/g, "&#146;");
      newLearnerResponse = newDescription; // So the Lightbox type case is semantic
      
      // Value is passed to the lightbox however, the vidNotes lightbox case was 
      // modified to remove the correct answer for the purpose of remidiation.
      newCorrectAnswer = app.template.getData().questions[i].description.replace('<span class=\'answerArea\'></span>', '<span class=correct>' + correctAnswer + '</span>');
      //newCorrectAnswer = question['description'].replace('<span class=\'answerArea\'></span>', '<span class=correct>' + correctAnswer + '</span>');
      //matching if the glossary terms are more than one and at any index level in place of only one glossary term of single index level
      newCorrectAnswer = newCorrectAnswer.replace(/<a href=\'#\' class=\'contextual_glossary( )?(data_[0-9]+)?\'>/g, '');
      newCorrectAnswer = newCorrectAnswer.replace(/<\/a>/g, '');
      newCorrectAnswer = newCorrectAnswer.replace(/'/i, "&#146;");       
      
      if (wasCorrect)
       {
        correctCount++;
       }
    
      // Replace this with excerpt (group) number
      //resultsSummary += '<td class="questionNumber">' + ((i * 1) + 1) + '</td>';
      
      // NOTE: Replaced with question number.
      //resultsSummary += '<td class="questionNumber" abbr="' + question['group'] + '">' + question['group'] + '</td>';
      resultsSummary += '<td class="questionNumber" abbr="' + question['group'] + '">' + ((i * 1) + 1) + '</td>';
      
      resultsSummary += '<td>' + newDescription + '</td>';
      
      if (wasCorrect)
       {
        resultsSummary += '<td class="questionFeedback"><div class="sprite correct" onclick="ale.lightbox.render({'+
                                                                                                                  'global:\x27ale\x27,' +
                                                                                                                  'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                                                                                  'data:{type:\x27vidNotesFeedback\x27,content:{' +
                                                                                                                  'question:\x27' + newDescription + '\x27,' +
                                                                                                                  'yourAnswer:\x27' + newLearnerResponse + '\x27,' +
                                                                                                                  'correctAnswer:\x27' + newCorrectAnswer + '\x27,' +
                                                                                                                  'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                                                                                  '}}' +
                                                                                                                '})"></div></td>';

       }
      else
       {
        resultsSummary += '<td class="questionFeedback"><div class="sprite incorrect" onclick="ale.lightbox.render({' +
                                                                                                                    'global:\x27ale\x27,' +
                                                                                                                    'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                                                                                    'data:{type:\x27vidNotesFeedback\x27,content:{' +
                                                                                                                    'question:\x27' + newDescription + '\x27,' +
                                                                                                                    'yourAnswer:\x27' + newLearnerResponse + '\x27,' +
                                                                                                                    'correctAnswer:\x27' + newCorrectAnswer + '\x27,' +
                                                                                                                    'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                                                                                    '}}' +
                                                                                                                  '})"></div></td>';
       }
      resultsSummary += '</tr>';
      m++;
     }
     
    resultsSummary += '</tbody></table>';
    
    score = Math.round(correctCount * 100 / totalQuestions);
    
    resultsSummary = '<div id="scoreSummary"><h3>Resultado: ' + score + '%</h3><h2>Antes de continuar, v&#233;ase abajo los detalles de su resultado.</h2></div><div class="sprite feedbackArrow"></div><div id="resultsSummary">' + resultsSummary + '</div>';
    $('#test').html(resultsSummary);
    
    //reorderExcerptRows();
    
    app.getTest().recordTest({
                              'score' : score
                             });
                             
    // To allow ungated access after a test is submitted
    app.testCompleted = 'true';
    
    // To ungate the current test
    // TODO: This is copied from template.js & needs to not be duplicate code
    $('a.ALE_next').removeAttr('disabled');
    $('a.ALE_next').removeClass('disabled');
    $('a.ALE_next').unbind('click')
                   .bind('click', function ()
                                   {
                                    app.doNext();
                                    return false;
                                   });
                             
    Nifty('div#scoreSummary','big');
    Nifty('div#resultsSummary','big');
   }
  
  function updateCompletedQuestionsCount()
   {
    var newTotal = $('span.answerArea').length - $('span.answerArea:not(:empty)').length;
    
    $('span#completed_questions').html(newTotal);
    
    return newTotal;
   }
  
 }

/**
 * NOTE: We use "thisTemplate" instead of "TemplateName" (e.g., "RecordAudio") because
 * other classes like Nimbb need template agnostic access to whichever template is
 * implementing it.
 * 
 * TODO: Change over all other templates to use this pattern since some of them (e.g., dragAndDrop) don't   
 */
App.prototype.thisTemplate = new VidNotes({
                                           'link' : ale
                                          });