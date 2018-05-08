function FA_Activity(args)
 {
  var _config = {};
  setConfig(args);

  var _visibleQuestion = 0,
      app = getConfig().link,
      console = new Console();
      
  console.info('@FA_Activity.js');
      
  this.render = render;
      
  init();

  function buildActivityHTML(callback)
   {
    console.info('@FA_Activity.buildActivityHTML()');
    
    var documentFragment = [],
        questions = app.getTest().getQuestionBank(),
        quesIndex = 0; 
      
    documentFragment.push('<table cellspacing="0" cellpadding="0"><thead><tr><th class="firstcol">event</th><th class="othercol">activity type</th><th class="othercol">transaction type</th></tr></thead><tbody>');
    
    var flag = "";
    for (var i in questions)
     {
      var question = questions[i];
      
      switch (question.type)
       {
        case 'choice' :
         switch (question.form)
          {
           case 'select' :
            if(flag != question.group)
             {
              documentFragment.push('<tr><td class="firstcol">',
                                    question.description,
                                    '</td><td class="othercol"><select id="activity_',
                                    quesIndex,
                                    '"><option id="question_',
                                    quesIndex,
                                    '_answer_01" value="">select</option>');
             }
            else
             {
              documentFragment.push('<td class="othercol"><select id="transaction_',
                                    quesIndex,
                                    '"><option id="question_',
                                    quesIndex,
                                    '_answer_01" value="">select</option>');
             }
             
            var ansIndex = 0;
            for (var j in question.answers)
             {
              var answer = question.answers[j].value;
              documentFragment.push('<option ');
              if (question.correctAnswer[0] === answer)
               {
                documentFragment.push('class="correctAnswer"');
               }
              else
               {
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
            break;
           
           default :
            //alert('Invalid question form detected:\n', question.form);
          }
         
         documentFragment.push('</select></td>');
         break;
        
        default : 
         //alert('Invalid question type detected:\n', question.type);
         console.info('Invalid question type detected:');
         console.debug(question.type);
       }
      
      if(flag == question.group)
       {
        documentFragment.push('</tr>');
       }
      quesIndex++;
      flag = question.group;
     }
     
    documentFragment.push('</tbody></table>');
    $(getMainContainer()).append(documentFragment.join(""));
    callback();
   }

  function getConfig()
   {
     return _config;
   }

  function getMainContainer()
   {
    return getConfig().mainContainer;
   }

  function getSubmitHandler()
   {
    return getConfig().submitHandler;
   }

  function init()
   {
    app.hooks.clearHooks();
    app.hooks.setHook({
                       'name' : 'RenderTest', 
                       'functionName' : function ()
                                         {
                                          app.FA_Activity.render();
                                         }
                      });
   }
  function populateAnswers()
   {
    var answers = app.getTest().getQuestionBank();
    $('select').each(function (index)
                      {
                       if (answers[index] && answers[index].learner_response)
                        {
                          $("option", this).each(function() 
                                                  {
                                                   if (answers[index].answers[answers[index].learner_response] && ($(this).val() == answers[index].answers[answers[index].learner_response].value))
                                                    { 
                                                     $(this).attr({'selected':true});
                                                    } 
                                                  else 
                                                   { 
                                                    $.noop;
                                                   }
                                                  })
                        }
                      });
   }
  function recordInteractions()
   {
    $('option', 'select').unbind('click.option')
                         .bind('click.option', function ()
                                                {
                                                 console.info("$(this).attr('id').split('_')[1]: " + $(this).attr('id').split('_')[3]);
                                                 
                                                 app.getTest().recordInteraction({
                                                                                  id : $(this).attr('id').split('_')[1],
                                                                                  value : $(this).attr('id').split('_')[3]
                                                                                 });
                                                });
   }

  function render()
   {
    buildActivityHTML(populateAnswers);
    recordInteractions();
    submitHandler(getSubmitHandler());
    Nifty('div#question_container');
   }

  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this,
                        'mainContainer' : '#question_container',
                        'submitHandler' : "#submit_handler"
                       }, args);
   }

  function submitHandler(target)
   {
    $(target).unbind('click.submit')
             .bind('click.submit', function ()
                                    {
                                     var container = getMainContainer();
                                     $("#data_transaction_buttton").hide();
                                     $('table', container).hide();
                                     $('#feedback').show();
                                     var correctAnswersCount = 0,
                                         documentFragment = [],
                                         questions = app.getTest().getQuestionBank(),
                                         quesIndex = 0,
                                         selector = "",
                                         sprite_class = "",
                                         totalQuestions = questions.length;
                                         
                                     documentFragment.push('<table cellspacing="0" cellpadding="0"><thead><tr><th class="firstcol">event</th><th class="othercol">activity type</th><th class="othercol">transaction type</th></tr></thead><tbody>');
                                     var flag = "";
                                     for (var i in questions)
                                      {
                                       var question = questions[i];
                                       
                                       if(flag != question.group)
                                        {
                                         documentFragment.push('<tr><td class="firstcol">', question.description ,'</td><td class="othercol">');
                                        }
                                       if(flag == question.group)
                                        {
                                         documentFragment.push('<td class="othercol">');
                                        }
                                        
                                       var correct = 0;
                                       
                                       for (var j in question.correctAnswer)
                                        {
                                         var correctanswer = question.correctAnswer[j],
                                             youranswer = "",
                                             feedback = "";
                                             
                                         if (flag != question.group)
                                          {
                                           selector = "#activity_";
                                          }
                                         else
                                          {
                                           selector = "#transaction_";
                                          }
                                         ($(selector + quesIndex).val() === "") ? documentFragment.push("Not Answered") : documentFragment.push($(selector + quesIndex).val());
                                         if($(selector + quesIndex).val() == correctanswer)
                                          {
                                           correct = 1;
                                           correctAnswersCount++;
                                           feedback = question.correctFeedback;
                                          }  
                                         else
                                          {
                                           if($(selector + quesIndex).val() == "")
                                            {
                                             feedback = "Not Answered";
                                            } 
                                           else
                                            {
                                             for (var x in question.answers)
                                              {
                                               var answer = question.answers[x].value;
                                               if ($(selector + quesIndex).val() === answer)
                                                {
                                                 feedback = question.answers[x].incorrectFeedback;
                                                }
                                              }
                                            }
                                          }
                                         ($(selector + quesIndex).val() == "") ? youranswer = "Not Answered" : youranswer = $(selector + quesIndex).val();
                                          
                                         if (correct == 1)
                                          {
                                           sprite_class = "correct";
                                          }
                                         else
                                          {
                                           sprite_class = "incorrect";
                                          }
                                         documentFragment.push('<div class="sprite ',
                                                                sprite_class,
                                                                '" onclick="ale.lightbox.render({' +
                                                                                                 'global:\x27ale\x27,' +
                                                                                                 'id:\x27' + app.lightbox.getFreshLightboxId() + '\x27,' +
                                                                                                 'data:{type:\x27feedback\x27,content:{' +
                                                                                                 'question:\x27' + question.description.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                 'yourAnswer:\x27' + youranswer.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                 'correctAnswer:\x27' + correctanswer.replace(/'/i, "&#146;") + '\x27,' +
                                                                                                 'feedback:\x27' + feedback.replace(/'/i, "&#146;") + '\x27' +
                                                                                                 '}}' +
                                                                                               '})"></div>')
       
                                         documentFragment.push('</td>');
                                        }
       
                                       if (flag == question.group)
                                        {
                                         documentFragment.push('</tr>');
                                        }
                                       quesIndex++;
                                       flag = question.group;
                                      }
                                      
                                     documentFragment.push('</tbody></table>');
                                     var score = Math.round(correctAnswersCount * 100 / totalQuestions);
                                     $("#main_container h1").after("<div id='result'><h3>Your score " + score + "%.</h3><p>Before moving on take a look at your results in detail below</p></div>");
                                     Nifty('div#result');
                                     $(container + ' table').after(documentFragment.join(''));
                                     app.getTest().recordTest({
                                                               'score' : score
                                                              });
                                    });
   }
  
 }

App.prototype.FA_Activity = new FA_Activity({
                                             'link' : ale
                                            });