function FA_quiz(args)
 {
  var _config = {};
  setConfig(args);

  var _visibleQuestion = 0,
      app = getConfig().link,
      console = new Console();

  console.info('@FA_quiz.js');

  this.render = render;

  init(); // Set hooks to fire after TestManager gets loaded

  function buildHTML()
   {
    console.info('@test.buildHTML()');
    
    var questionBank = app.getTest().getQuestionBank();
    
    buildQuestions({
                    'questionBank' : questionBank
                   });
                   
    if (getQuestionLength() > 0)
     {
     $(getContainer()).hide();
      $(getContainer()).eq(getVisibleQuestion()).show();
       
       // Add save and continue button
       $(getContainer()).not(':last').append('<input type="button" class="button saveAndContinue" value="Save and Continue" disabled>');
       $(getContainer()).last().append('<input type="button" class="button" id="submit" value="Submit" disabled>');
       
       console.info('binding saveAndContinue');
       
       $('.saveAndContinue').unbind('click')
                            .bind('click', function ()
                                            {
                                             /*
                                              * Compare given answer against correctAnswer.
                                              * Assessment is technically made immediately and 
                                              * the results are reviewed later on the summary "page".
                                              */
                                              
                                              app.getTest().recordInteraction({
                                                                               'id' : $(this).parent().attr('id').substr(-1),
                                                                               'value' : $(this).siblings('div.answer').children('input[type=radio]:checked').val()
                                                                              });
                                                                              
                                             setVisibleQuestion({
                                                                 'value' : getVisibleQuestion() + 1
                                                                });
                                             $(getContainer()).hide();
                                             $(getContainer()).eq(getVisibleQuestion()).show();
                                            });
       
       /*
        * Since the Save & Continue button is disabled by default, 
        * enable it once the learner has clicked a radio button.
        * NOTE: We may want to just set the default checked value
        * (ex: the first value) in order to avoid this logic.
        */
       $('input:radio', getContainer()).unbind('click')
                                       .bind('click', function ()
                                                       {
                                                        $(this).parent()
                                                               .siblings('input:button')
                                                               .removeAttr('disabled');
                                                       });
     }
    else
     {
      // Add the submit button
      $(getMainContainer()).append('<input type="button" id="submit" value="Submit">');
     }
    
    $('#submit').unbind('click')
                .bind('click', function ()
                                {
                                 console.info('submit this question...');
                                 submitAnswers();
                                 return false;
                                });
   }

  function buildQuestions(args)
   {
    console.info('@Test.buildQuestions()');
    
    var documentFragment = [],
        lastAnswered = getVisibleQuestion(),
        questions = args.questionBank,
        l = 0; // Count for (var i in questions)
    
    for (var i in questions)
     {
      var question = questions[i],
          k = 0; // Counts for (var j in question.answers)
          
      if (typeof question.learner_response !== 'undefined')
       {
        lastAnswered++;
       }
       
      documentFragment.push("<div id='question_" + l + "' class='question'>");
      documentFragment.push('<div class="questionHeader"><h3>Question ', (l * 1 + 1), '</h3> of <span id="totalQuestions">', questions.length, '</span></div>');
      documentFragment.push("<p>" + question.description + "</p>");
      
      switch (question.type)
       {
        case 'choice' :
        
         var ansIndex = 0; 
         
         for (var j in question.answers)
          {
          
           /*
            * Allows us to show select boxes or radio buttons
            */
           switch (question.form)
            {
             case 'radio' :
              // For question sets with two columns, j runs twice
              
              //for (var x = 0; x < question.answers.length; x++)
               //{
                var answer = question.answers[k].value;
                var checked = (question.learner_response === answer) ? ' checked' : null;
                
                documentFragment.push('<div ');
                if (question.correctAnswer === answer)
                 {
                  // TODO: Remove this in production for obvious reasons
                  documentFragment.push('class="correctAnswer"');
                 }
                else
                 {
                  documentFragment.push('class="answer"');
                 }
                 
                documentFragment.push("><input type='radio' value='", answer ,"' name='question_", l ,"_choices' id='question_", l ,"_", k ,"' ", checked ,">");
                documentFragment.push("<label for='question_", l ,"_", k ,"'>", answer ,"</label></div>");
                ansIndex++;
               //}
              break;
              
             case 'select' :
              // For question sets with two columns, j runs twice
              documentFragment.push('<select>');
              //for (var x = 0; x < question.answers.length; x++)
               //{
                var answer = question.answers[k].value;
                documentFragment.push('<option ');
                if (question.correctAnswer === answer)
                 {
                  // TODO: Remove this from production for obvious reasons
                  documentFragment.push('class="correctAnswer"');
                 }
                else
                 {
                  documentFragment.push('class="answer"');
                 }
                documentFragment.push(" name='question_", l ,"_", k ,"_choices' id='question_", l ,"_", k ,"_", ansIndex ,"'>");
                documentFragment.push(answer);
                documentFragment.push("</option>");
                ansIndex++;
               //}
              documentFragment.push('</select>');
              
              // some other funky stuff in here
              
              break;
              
             default :
              alert('Invalid question form detected:\n' + question.form);
              break;
            }
           k++;
          }
         break;
         
        default : 
         alert('Invalid question type detected:\n' + question.type);
         break;
       }
      documentFragment.push('</div>');
      l++;
     }
     
    $('#question_container').append(documentFragment.join(""));
    
    // Moves the visible question to the last completed question
    if (lastAnswered === questions.length)
     {
      submitAnswers();
     }
    else
     {
      setVisibleQuestion({
                          'value' : lastAnswered
                         });
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
    console.info('@FA_quiz.init()');
    
    app.hooks.clearHooks();
    app.hooks.setHook({
                       'name' : 'RenderTest', 
                       'functionName' : function ()
                                         {
                                          app.FA_quiz.render();
                                         }
                      });
   }

  function render()
   {
    console.info('@FA_quiz.render()');
    
    // TODO: build the initial HTML and let the existing code finish the job
    
    if (!getVisibleQuestion())
     {
      setVisibleQuestion({
                          'value' : 0
                         });
     }
    buildHTML();
    roundQuestionContainer();
   }

  function roundQuestionContainer()
   {
    Nifty('div#question_container', 'big');
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

  function submitAnswers()
   {
    console.info('@test.submitAnswers()');
    
    // TODO: break this down into smaller functions
    
    $('#question_container').hide();
    $('#data_header_title p').hide();
    
    var correctCount = 0,
        questions = app.getTest().getQuestionBank(),
        resultsSummary = '',
        score,
        totalQuestions = questions.length,
        m = 0; // Counts for (var i in questions)
        
    resultsSummary = '<table><thead><th colspan="2">question</th><th>result</th></thead><tbody>';
    
    // Calculate score
    for (var i in questions)
     {
      var correctAnswer = null,
          feedback,
          l = 0, // for (var j in question.answers)
          learnerResponse = "",
          question = questions[i],
          trClass = '',
          wasCorrect = false;
      
      // Add '.last' class to last tr 
      (m === (questions.length-1)) ? trClass = ' class="last"' : null ;
      
      resultsSummary += '<tr' + trClass + '>';
      
      switch (question.type)
       {
        case 'choice' : 
         /**
          * For each answer we'll loop through to find a match against
          * the correctAnswer.
          */
         for (var j in question.answers)
          {
           var questionAnswersLength = question.answers.length;
           
           // Get correct answer
           if(question.answers[j].value === question.correctAnswer[0])
            {
             correctAnswer = question.correctAnswer[0];
            }
           
           if (document.getElementById('question_' + m + "_" + l).checked)
            {
             learnerResponse = question.answers[l].value;
             feedback = question.answers[l].feedback || '';
            }
           l++; // Move the next question
          }
         break;
         
        default : 
         alert('Invalid question type detected:\n' + question.Type);
         break;
       }
      
      wasCorrect = (correctAnswer == learnerResponse);
      
      if (wasCorrect)
       {
        correctCount++;
       }
      
      resultsSummary += '<td class="questionNumber">' + ((i * 1) + 1) + '</td>';
      resultsSummary += '<td>' + question.description + '</td>';
      
      if (wasCorrect)
       {
        resultsSummary += '<td class="questionFeedback"><div class="sprite correct" onclick="ale.lightbox.render({'+
                                                                                                                  'global:\x27ale\x27,' +
                                                                                                                  'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                                                                                  'data:{type:\x27feedback\x27,content:{' +
                                                                                                                  'question:\x27' + question['description'].replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                  'yourAnswer:\x27' + learnerResponse.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                  'correctAnswer:\x27' + correctAnswer.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                  'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                                                                                  '}}' +
                                                                                                                '})"></div></td>';
                                                                                                                
       }
      else
       {
        resultsSummary += '<td class="questionFeedback"><div class="sprite incorrect" onclick="ale.lightbox.render({' +
                                                                                                                    'global:\x27ale\x27,' +
                                                                                                                    'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                                                                                    'data:{type:\x27feedback\x27,content:{' +
                                                                                                                    'question:\x27' + question['description'].replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                    'yourAnswer:\x27' + learnerResponse.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                    'correctAnswer:\x27' + correctAnswer.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                                    'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                                                                                    '}}' +
                                                                                                                  '})"></div></td>';
       }
      resultsSummary += '</tr>';
      m++;
     }
     
    resultsSummary += '</tbody></table>';
    
    score = Math.round(correctCount * 100 / totalQuestions);
    
    resultsSummary = '<div id="scoreSummary"><h3>Your Score: ' + score + '%</h3><h2>Before moving on, take a look at your results in detail below.</h2></div><div class="sprite feedbackArrow"></div><div id="resultsSummary">' + resultsSummary + '</div>';
    $('#test').html(resultsSummary);
    
    app.getTest().recordTest({
                              'score' : score
                             });
                             
    app.testCompleted = 'true';
    
    Nifty('div#scoreSummary','big');
    Nifty('div#resultsSummary','big');
   }
   
 }

App.prototype.FA_quiz = new FA_quiz({
                                     'link' : ale
                                    });