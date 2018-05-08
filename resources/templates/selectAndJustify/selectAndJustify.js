/**
 * @class SelectAndJustify template class
 * @param app
 * @returns {SelectAndJustify}
 */
function SelectAndJustify(app)
 {
  var questionConfig,
      toolkitTestData;
  
  function getData()
   {
    var data;
    
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      data = {
              questions : toolkitTestData
             };
     }
    else
     {
      data = app.template.getData();
     }

    return data;
   }
  
  function htmlEncode(source)
  {
   var result = ''; 
   
   source = source.replace(/\&/g,'&amp;');
   source = source.replace(/\</g,'&lt;');
   source = source.replace(/\>/g,'&gt;');
   
   var i,
       c,
       len = source.length;
   for (i = 0; i < len; i++) {
     c = source.charAt(i);
     if (c < ' ' || c > '~') {
       c = '&#' + c.charCodeAt() + ';';
      }
     result += c;
    }
   
   return result;
  }
  
  /**
   * Returns the number of attempts taken
   * @param questionBank
   * @returns number or undefined
   */
  function getPersistedAttemptsTaken(questionBank)
   {
    return questionBank[questionBank.length - 1].attemptsTaken || 0;
   }
  /**
   * @method remediationAttempts
   * @description Determines how many attempts are remaining and then reveals an object when the self executing function is completed.
   * @returns
   */
  var remediationAttempts = (function (attemptsAllowed)
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
                                        return attemptsAllowed - getPersistedAttemptsTaken(app.getTest().getQuestionBank());
                                       },
                                      getAttemptsTaken: function() 
                                       {  
                                        // Return the number of current attempt.
                                        var result = getPersistedAttemptsTaken(app.getTest().getQuestionBank());
                                        if(result > (attemptsAllowed + 1))
                                         {
                                          result = attemptsAllowed + 1;
                                         }
                                        return result;
                                      }
                               };
                              }($('#lightbox_toolkit_lb').length > 0 ? 0 : getData().metadata[0].remediationAttempts));
  
  /**
   * @method testLimitReached
   * @description Check the remediation attempts.  Forces the limit to be reached if the template is loaded in a lightbox.
   * @returns
   */
  function testLimitReached()
   {
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      return true;
     }
    else
     {      
      return (remediationAttempts.get() > 0) ? false : true;
     }
   }
  
  function setQuestionConfig(config)
   {
    questionConfig = config; 
   }
  
  function getQuestionConfig()
   {
    return questionConfig;  
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
    setQuestionConfig(app.template.getData().questionConfig); 
   }
  
  /**
   * @method buildQuestionsHTML
   * @description Base on the question type, build the question HTML.  Currently, listRef is deprecated.  listRef is meant to look similar to the themes template.  Since there is already a themes template, there is no reason to use this type.
   * @param type
   * @param questionBank
   * @returns html segment string
   */
  function buildQuestionsHTML(type, questionBank)
   {
    var result = [],
        loopQuestions = function(questions, html, buildFunc)
                         {
                          questions = [].concat(questions);
                          var question, 
                              index = 0,
                              len = questions.length;
                          while(question = questions.shift())
                           {
                            html.push(buildFunc(question, index, index === (len - 1)));
                            index++;
                           }
                         };
                         
    switch(type)
     {
      case 'accordion':
      case 'accordionRef':
       result.push('<div class="contentWrapper">');
       
       loopQuestions(questionBank, result, (function()
                                             {
                                              var buildRadioBtn = function(items, index, htmlFragement)
                                                                   {
                                                                    items = [].concat(items);
                                                                    var i;
                                                                    while(i = items.shift())
                                                                     {
                                                                      htmlFragement.push('<tr><td class="radio"><input class="aleInline" type="radio" name="' + index + '"value="' + i.value + '"/></td><td class="answerText">' + i.text + '</td></tr>');
                                                                     }
                                                                   };
                                              return function(item, index, isLast)
                                                      {
                                                       if ($('#lightbox_toolkit_lb').length > 0)
                                                        {
                                                         item.description = app.toolkit.getData().questions[index].description;
                                                        }
                                                       
                                                       var html = ['<div class=' + (isLast ? '"excerpt last"' : '"excerpt"') + '><div class="title"><span class="arrow">&nbsp;</span>' + item.description + '</div><div class="checkIcon">&nbsp;</div>'];
                                                       html.push('<div class="questionBody" style="display:none">', item.question ? ('<div class="subText">' + item.question + '</div>') : '', '<table>');
                                                       buildRadioBtn(item.answers, index, html);
                                                       html.push('</table><div class="btnContainer"><div class="saveBtn buttons_sprite ok disabled">&nbsp;</div></div>');
                                                       html.push('</div></div>');
                                                       return html.join('');
                                                 };
                                             })());
                               
       result.push('</div>');
       result.push('<div id="infoArea" style="display:none;"></div>');
       break;
      case 'listRef':
       result.push('<div class="question">', questionBank[0].question,'</div><div class="contentWrapper">');   
       loopQuestions(questionBank, result, function(item, index, isLast)
                                            {
                                             return ['<div class="listItem"><span class="item_desc aleInline">', (index + 1) + '.&nbsp;' + item.description, '</span><a href="#" id="item_', index, '">' , item.text || 'Click to decide...','</a><span class="checkIcon"></span></div>'].join('');
                                            });
       result.push('</div>');
       break;
      default:
     }
    return result.join('');
   }
  
  /**
   * @method buildHTML
   * @param type
   * @description Builds the global HTML content besides the questions.
   */
  function buildHTML(type)
   {
    var questionBank = getData().questions;
    
    $('#question_content').html(buildQuestionsHTML(type, questionBank));
    // add question type to body tag class for styling purpose.
    $('body').addClass(type);
    
    // append submit link if not rendering in toolkit lightbox
    if ($('#lightbox_toolkit_lb').length <= 0)
     {
      $('#question_content .contentWrapper').append(type === 'listRef'
                                                     ? '<div id="link_container"><div id="submit_link" class="buttons_sprite submit disabled">&nbsp;</div></div>'
                                                     : '<div id="link_container"><div id="submit_link" class="buttons_sprite submit disabled">&nbsp;</div><div id="revise_btn" class="buttons_sprite revise">&nbsp;</div></div>');
     }

    if($.browser.msie)
     {
      Nifty('div.choice', 'big');  
      setTimeout(function()
                  {
                   $('#data_questionTitle h4').css('height', '30px');
                   if($('div#data_question').html())
                    {
                     Nifty('div#data_question', 'big');
                    }
                   else
                    {
                     $('div#data_question').css('display', 'none');
                    }
                   if($('div#data_questionTitle').html())
                    {
                     Nifty('div#data_questionTitle', 'big');     
                    }
                   else
                    {
                     $('div#data_questionTitle').css('display', 'none');
                    }
                  }, 25);
     }
    
   }
  
  /**
   * @method animate
   * @description Handles the animation for opening/closing groups.
   * @param args
   * {
   *  close: boolean, // flag used to decide close or open
   *  index: integer, // index of the question to take the action
   *  duration: integer // duration for the animation. It's 250 by default.
   * }
   */
  function animate(args)
   {
    if(args.index === -1) 
     {
      return;   
     }
    var duration = args.duration || 250;
    if(args.close)
     {
      $('div.excerpt').eq(args.index).removeClass('active');  
      $('.questionBody').eq(args.index).hide(duration);
     }
    else
     {
      $('.questionBody').eq(args.index).show(duration, function()
                                                   {
                                                    $('div.excerpt').eq(args.index).addClass('active');
                                                   });

     }
   }
  
  function getActiveIndex()
   {
    return $('div.excerpt').index($('div.excerpt.active'));
   }
  
  /**
   * @method nextActiveIndex
   * find out the index of question to open next.
   * @param currentIndex
   * @returns {Number}
   */
  function nextActiveIndex(currentIndex)
   {
    // index by default is 0
    var ret = 0,
        isLastQuestion = (currentIndex === (app.getTest().getQuestionBank().length) - 1);
    
    // isLastQuestion
    //           true: open the first unanswered question if any, or open the first one. 
    //           false: open first unanswered question start after current question.
    $('#question_content div.title').each(function(index)
                                    {
                                     if(!$(this).find('.answer').length)
                                      {
                                       if(isLastQuestion)
                                        {
                                         ret = index;
                                         return false;
                                        }
                                       else
                                        {
                                         ret = index;
                                         if(index > currentIndex)
                                          {
                                           return false;
                                          }
                                        }
                                      }
                                    });
    return ret;
   }
  
  /**
   * @method updateHeader
   * @description update the header after ok button clicked.
   * @param index
   */
  function updateHeader(index)
   {    
    // find the index of checked radio button
    var selectedIdx = $('input:radio[name=' + index + ']:checked').index('input:radio[name=' + index + ']'),
        question = getData().questions[index].answers[selectedIdx];
    
    // find excerpt element by index
    var element = $('#question_content .excerpt').eq(index);
    // find and remove the div with class name answer
    element.find('div.answer').remove();
    
    // find header inside the div
    element = element.find('div.title');
    
    // add answer to the header
    if (getData().metadata[0].minimumAnswered !== undefined)
     {      
      if (question !== undefined)
       {        
        element.html(element.html() + '<div class="answer">' + question.text + '</div>');
        
        return;
       }
      else if (app.questionBank[app.getPageName()][2].attempts)
       {
        
        app.questionBank[app.getPageName()][2].attempts[1].result[0].group === index ? element.html(element.html() + '<div class="answer">' + app.questionBank[app.getPageName()][2].attempts[1].result[0].answer + '</div>') : '';
       }
     }
    else
     {      
      element.html(element.html() + '<div class="answer">' + question.text + '</div>');
     }
   }
  function isAllCorrect()
   {
    return $('#question_content .excerpt.incorrect').length === 0;
   }
  function isAllAnswered()
   {
    var ret = false,
        type = 'accordionRef'; //getQuestionConfig().type || 'accordionRef';
    switch(getQuestionConfig().type)
     {
      case 'accordion':
      case 'accordionRef':
       ret = app.getTest().getQuestionBank().length === $('#question_container div.title div.answer').length ? true : app.template.getData().metadata[0].minimumAnswered === $('#question_container div.title div.answer').length;
       break;
      case 'listRef':
       ret = app.getTest().getQuestionBank().length === $('#question_container a.answered').length;
       break;
     }
    return ret;
   }
  /**
   * close the current active question,
   * and open next one.
   */
  function closeAndShowNext(index, openNext)
   {
    animate({
     close: true,
     index: index
    });
    if(openNext)
     {
      index = nextActiveIndex(index);
      if(index > -1) 
       {
        animate({
         close: false,
         index: index
        });
       }          
     }
   }
  
  /**
   * @method checkSubmitButton
   * @description Check if all the questions are answered in order to enable the submit button.
   */
  function checkSubmitButton()
   {
    if(isAllAnswered())
     {
      $('#submit_link').removeClass('disabled');
     }
   }
  
  /**
   * @method okClicked
   * @description Handles the interactions when the 'ok' button is clicked under each group.  This provides alternate functionality in the case that only one answer is required.
   * @param index
   */
  function okClicked(index)
   {
    updateHeader(index);
    
    if (app.template.getData().metadata[0].minimumAnswered !== undefined && $('#question_container div.title div.answer').length >= app.template.getData().metadata[0].minimumAnswered)
     {
      closeAndShowNext(index, !isAllAnswered());
      $('div.excerpt input:checked').addClass('selected');
      
      $('div.excerpt:not(.active)').find('input:not(.selected)').attr('checked', false);
      $('div.excerpt:not(.active)').find('input:not(.selected)').removeAttr('checked');
      
      $('body.selectAndJustify input').one('click', function()
                                                     {
                                                      $('div.excerpt:not(.active)').find('input').attr('checked', false).removeClass('selected');
                                                      $('div.excerpt div.answer').remove();
                                                      $('#submit_link').addClass('disabled');
                                                     });
      
     }
    else
     {
      closeAndShowNext(index, !isAllAnswered()); 
     }
    
    checkSubmitButton();
   }
  
  function okLinkClicked(index)
   {
    var value = $('.ruleOption:[name=' + index + ']:checked').val();
    $.each(app.getTest().getQuestionBank()[parseInt(index)].answers, function(i ,item)
                                                                      {
                                                                       if(item.value === value)
                                                                        {
                                                                         $('#item_' + index).html(item.text).addClass('answered');
                                                                         return false;
                                                                        }
                                                                      });        
    checkSubmitButton();
   }
  
  function buildNextActivity()
   {
    $('#submit_link').unbind('click');
    $('#revise_btn').unbind('click');
    if(!$('body').hasClass('showFeedback')){
     $('#link_container').empty().append($('<div id="next_activity_btn" class="buttons_sprite nextActivity">&nbsp;</div>').one('click', function()
       {
      app.doNext(); 
       }));    
    }
    else{
     $('#link_container').empty();
    }
   }
  
  /**
   * @method bindEvent
   * @param type
   * @description This handles most of the event bindings across the template.
   */
  function bindEvent(type)
   {
    var answerSelector;
    switch(type)
     {
      case 'accordion':
      case 'accordionRef':
       $('div.excerpt div.title').bind('click', function()
                                          { 
                                           if(!$('#question_content').hasClass('revising') && !$(this.parentNode).hasClass('active') && !$(this.parentNode).hasClass('correct'))
                                            {
                                             animate({
                                              close: true,
                                              index: getActiveIndex()
                                             });
                                             animate({
                                              close: false,
                                              index: $(this).index('div.excerpt div.title')
                                             });
                                            }
                                          });
       $('.btnContainer .saveBtn').bind('click', function()
                                                  {
                                                   if(!$(this).hasClass('disabled'))
                                                    {
                                                     okClicked($(this).index('.btnContainer .saveBtn'));    
                                                    }
                                                  });

       $('.questionBody').bind('click', function(args)
                                         {
                                          var target = $(args.target);
                                          if(target.is('input:radio'))
                                           {
                                            $('div.saveBtn:eq(' + target.attr("name") + ')').removeClass('disabled');
                                           }
                                         });
       if(!$('body').hasClass('showFeedback')){
        answerSelector = '#question_content .answer';
       }
       break;
      case 'listRef':
       $('#question_content a').unbind('click')
                               .bind('click', function()
                                               {
                                                if(!$('#question_content').hasClass('revising'))
                                                 {
                                                  var that = this,
                                                      index = ($('#question_content a').index(that)),
                                                      html = [];
                                                  
                                                  $.each(app.getTest().getQuestionBank()[index].answers, function(i, item)
                                                                                                          {
                                                                                                           html.push('<div><input type="radio" class="aleInline ruleOption" value="' , item.value , '" name="', index, '"><span class="aleInline optionText">', item.text , '</span></input></div>');
                                                                                                          });
                                                
                                                  app.lightbox.render({
                                                   global : app,
                                                   attachCloseEvent: false,
												   																																				callback : function()
												   																																				            {
												   																																					            $('#lightbox_0' + index).addClass('toolkit_ignore');
												   																																				            },
                                                   data : {
                                                           type : 'vidNotes',
                                                           content : {
                                                                      html : html.join(''),
                                                                      title: '&nbsp;'
                                                                     }
                                                           },
                                                   id : index,
                                                   group : '0',
                                                   independent : false,
                                                   modal : false,
                                                   position : {
                                                               type : 'relative',
                                                               x : ($(that).offset().left + ($(that).width() / 2)),
                                                               y : $(that).offset().top + $(that).height() + 23
                                                              },
                                                   size : 'small'
                                                  });
                                                $('.lightbox_html_content input.ruleOption').unbind('click');
                                                
                                                $('#lightbox_0' + index).find('.lightbox_html_content input.ruleOption').bind('click', function()
                                                                                               {
                                                                                                  var group = parseInt($(this).attr('name'));
                                                                                                  $('#lightbox_0' + group).hide();
                                                                                                  okLinkClicked(group);
                                                                                               });
                                                 }
                                                return false;
                                               });
       answerSelector = '#question_content a';
       break;
       default:
     }
    if(answerSelector)
     {
      $('#question_content .checkIcon').die('click').live('click', function()
                                                                    {
                                                                     var index = $(this).index('#question_content .checkIcon'),
                                                                         questions = app.getTest().getQuestionBank(),
                                                                         questionIndex,
                                                                         content = {
                                                                                    correctness : $(this.parentNode).hasClass('correct') ? 'correct' : 'incorrect',
                                                                                    question : questions[index].description,
                                                                                    yourAnswer : $(answerSelector).eq(index).html()
                                                                         };
                                                                     
                                                                     if (app.template.getData().metadata[0].minimumAnswered !== undefined)
                                                                      {
                                                                       questionIndex = $('div.excerpt').eq(index).find('.answerText:contains(' + $('div.title div.answer').text() + ')').index('div.excerpt:eq(' + index + ') .answerText');
                                                                       
                                                                       content.yourAnswer = questions[index].answers[questionIndex].text;
                                                                       
                                                                       content.feedback = questions[index].answers[questionIndex].feedback;
                                                                      }
                                                                     else
                                                                      {
                                                                       $.each(questions[index].answers, function(i) 
                                                                                                         {      
                                                                                                          if(($(this.text).text() !== '' && $(this.text).text() === htmlEncode($(content.yourAnswer).text())) || (this.text !== '' && this.text === htmlEncode(content.yourAnswer)))
                                                                                                           {
                                                                                                            content.feedback = this.feedback;
                                                                                                            return false;  
                                                                                                           }
                                                                                                         });
                                                                      }
                                                                     

                                                                     if(content.feedback)
                                                                      {
                                                                       // Show the lightbox for feedback.
                                                                       ale.lightbox.render({
                                                                                            global: ale,
                                                                                            id: app.lightbox.getFreshLightboxId(),
                                                                                            data: {
                                                                                                   type: 'selectAndJustify',
                                                                                                   content: content
                                                                                                  }
                                                                                           });
                                                                      }
                                                                    });
     }
   }
  
  function showResult(index, isCorrect, type)
   {
    switch(type)
     {
      case 'accordion':
      case 'accordionRef':
       $('#question_content .excerpt').eq(index)
                                      .toggleClass('correct', isCorrect)
                                      .toggleClass('incorrect', !isCorrect);
       break;
      case 'listRef':
       $('#question_content .listItem').eq(index)
                                       .toggleClass('correct', isCorrect)
                                       .toggleClass('incorrect', !isCorrect); 
       break;
     }
   }
  
  /**
   * @method bindSubmitAndRevise
   * @param type
   * @description Handles scoring the template and also unlocking the test if it has been completed.  If not, then it creates an optional revise state which is based on attempts remaining.
   */
  function bindSubmitAndRevise(type)
   {
    $('#submit_link').bind('click', function()
                                     {
                                      if(!$(this).hasClass('disabled'))
                                       {
                                        var questions = app.getTest().getQuestionBank(),
                                            temp = 0,
                                            correct,
                                            questionsLength = app.template.getData().metadata[0].minimumAnswered || questions.length,
                                            score,
                                            doAnimate = false;
                                        switch(type)
                                         {
                                          case 'accordion':
                                          case 'accordionRef':
                                           if (app.template.getData().metadata[0].minimumAnswered !== undefined)
                                            {
                                        	   
                                        	   if (app.template.getData().metadata[0].minimumAnswered === 1){
                                        		   $('input:radio:checked').each(function(){
                                        			   if($('div.answer',$(this).parents('.excerpt')).text().length <= 0){
                                        				   $(this).attr('checked', false);
                                        			   }
                                        		   });
                                        	   }
                                        	   
                                        	  $('input:radio:checked').each(function(index, element){
                                              var parent = $(element).parent().parent().parent().parent().parent().parent().index('div.excerpt');
                                              $(this).val() !== undefined ? questions[parent].learner_response = {
                                               answer : $('div.answer').text(),
                                               group : $('div.title:has(div.answer)').index('div.title'),
                                               header : getData().questions[$('div.title:has(div.answer)').index('div.title')].description,
                                               answerNumber : $(this).val()-1
                                              } : null;
                                              var correctAnswerArr = questions[parent].correctAnswer;
                                              correct = $.inArray($(this).val(), correctAnswerArr) !== -1;
                                              
                                              if(correct)
                                              {
                                               temp++;
                                              }
                                              var args = {};
                                              args.learner_response = questions[parent].learner_response;
                                              args.questions = questions;
                                              args.type = type;
                                              args.parent = $('body');
                                              if($('body').hasClass('showFeedback')){
                                               createFeedback(args);
                                              }
                                              else{
                                               showResult(parent, correct, type);
                                              }
                                              //$(this).val() !== undefined ? questions[index].learner_response = $(this).val() : null;
                                              
                                              // new convention for feedback free and minimumAnswered.  Just drop in the answer since we don't have to compare it later on.
                                               });
                                             score = Math.round(temp * 100 / questionsLength);
                                             temp = false;
                                             doAnimate = true;
                                            }
                                           else
                                            {
                                             $('input:radio:checked').each(function(index)
                                                                   {
                                                                    var correctAnswerArr = questions[index].correctAnswer;
                                                                    correct = $.inArray($(this).val(), correctAnswerArr) !== -1;
                                                                    showResult(index, correct, type);
                                                                    if(correct)
                                                                     {
                                                                      temp++;
                                                                     }
                                                                    $(this).val() !== undefined ? questions[index].learner_response = $(this).val() : null;
                                                                   });

                                             score = Math.round(temp * 100 / questionsLength);
                             
                                             temp = false;
                                             doAnimate = true;
                                            }
                                           break;
                                          case 'listRef':
                                           $('input:radio.ruleOption:checked').each(function(index)
                                                                          {
                                                                           index = parseInt($(this).attr('name'));
                                                                           var correctAnswerArr = questions[index].correctAnswer;
                                                                           correct = $.inArray($(this).val(), correctAnswerArr) !== -1;
                                                                           showResult(index, correct, type);
                                                                           if(correct)
                                                                            {
                                                                             temp++;
                                                                            }
                                                                           questions[index].learner_response = $(this).val();
                                                                          });

                                           score = Math.round(temp * 100 / questionsLength);
                                           temp = false;
                                           $('#question_content a').unbind('click');
                                           break;
                                         }
                                      
                                        if(testLimitReached() || score === 100)
                                         {
                                          temp = true;
                                          app.getTest().recordTest({
                                                                    score : score
                                                                   });
                                          app.getTest().ungateThisTest();
                                         }
                                      
                                        remediationAttempts.decrease();
                                        
                                        if(doAnimate)
                                         {
                                          animate({
                                           close: true,
                                           index: getActiveIndex()
                                          });    
                                         }
                                        
                                        if(temp)
                                         {
                                          buildNextActivity();
                                          if(!$('body').hasClass('showFeedback')){
                                           $('#question_content').addClass('finished');
                                          }
                                          // toolkit might cache this page, so remove the hidden radio buttons that might cause issues.
                                          $('.selectAndJustify input:radio').remove();
                                         }
                                        else
                                         {
                                          $(this).addClass('disabled');
                                          $('#question_content').addClass('revising');     
                                         }
                                        
                                        temp = $('#question_content');
                                        var infoHTML = ['<p>'];
                                        if(temp.length)
                                         {
                                          if (app.template.getData().metadata[0].minimumAnswered === 1 && app.template.getData().metadata[0].displayFeedback === false)
                                           {
                                            infoHTML.push('Click the information icon for<br/>feedback.</p>');
                                            if(!$('body').hasClass('showFeedback')){
                                             $('div.title').unbind('click');
                                             $('#infoArea').html(infoHTML.join('')).fadeIn('200');
                                            }
                                            $('#infoArea').addClass('correct');
                                            
                                            app.getTest().recordAttemptResult({
                                                                               testId: app.getPageName(),
                                                                               attempt: remediationAttempts.getAttemptsTaken(),
                                                                               score: undefined,
                                                                               persist: true
                                                                              });
                                            
                                            return;
                                           }
                                          else if (app.template.getData().metadata[0].minimumAnswered === 1)
                                           {
                                            if(score === 100)
                                             {
                                              infoHTML.push('Click your answer for<br/>feedback.</p>');
                                              $('#infoArea').addClass('correct');
                                             }
                                            else 
                                             {
                                              $('#infoArea').removeClass('correct');
                                              infoHTML.push('Click your incorrect answer for<br/>feedback and/or revise your analysis.</p>');
                                             }
                                            
                                            $('#infoArea').html(infoHTML.join('')).fadeIn('200');
                                            
                                            app.getTest().recordAttemptResult({
                                                                               testId: app.getPageName(),
                                                                               attempt: remediationAttempts.getAttemptsTaken(),
                                                                               score: score,
                                                                               persist: true
                                                                              });
                                            
                                            return;
                                           }
                                          
                                          else if(score === 100)
                                           {
                                            infoHTML.push('Congratulations!<br/>You\'ve got ', temp.find('.excerpt.correct').length, ' out of ', temp.find('.excerpt').length, ' correct!<br/>Click your answer for<br/>feedback.</p>');
                                            $('#infoArea').addClass('correct');
                                           }
                                          else 
                                           {
                                            $('#infoArea').removeClass('correct');
                                            infoHTML.push('You\'ve got ', temp.find('.excerpt.correct').length, ' out of ', temp.find('.excerpt').length, ' correct!<br/>Click your incorrect answer for<br/>feedback and/or revise your analysis.</p>');
                                           }
                                          $('#infoArea').html(infoHTML.join('')).fadeIn('200');
                                         }
                                      
                                        app.getTest().recordAttemptResult({
                                          testId: app.getPageName(),
                                          attempt: remediationAttempts.getAttemptsTaken(),
                                          score: score,
                                          persist: true
                                        });
                                        
                                       }
                                     });  
    
    $('#revise_btn').bind('click', function()
                                    {
                                     var questions = app.getTest().getQuestionBank(),
                                         excerpts = $('#question_content').removeClass('revising');
                                     
                                     switch(type)
                                      {
                                       case 'accordion':
                                       case 'accordionRef':
                                        $('#infoArea').fadeOut('fast');
                                        animate({
                                         close: false,
                                         index: $('#question_content .excerpt.incorrect').index('#question_content .excerpt')
                                        });        
                                        
                                        excerpts = excerpts.find('.excerpt').filter(function(index)
                                                                              {
                                                                               if($(this).hasClass('incorrect'))
                                                                                {
                                                                                 delete questions[index].learner_response;
                                                                                 return true;
                                                                                }
                                                                               return false;
                                                                              });
                                        excerpts.removeClass('incorrect').find('div.answer').remove();
                                        excerpts.find('input:radio:checked').removeAttr('checked');
                                        excerpts.find('div.saveBtn').addClass('disabled');
                                        break;
                                       case 'listRef':
                                        excerpts.find('.listItem').each(function(index, i) 
                                                                         {
                                                                          if($(this).hasClass('incorrect'))
                                                                           {
                                                                            $(this).removeClass('incorrect')
                                                                                   .find('a')
                                                                                   .removeClass('answered')
                                                                                   .html(questions[index].text);
                                                                            delete questions[index].learner_response;
                                                                            $('#lightbox_0' + index).find('a').addClass('disabled');
                                                                            $('#lightbox_0' + index).find('input:checked').attr('checked', false);
                                                                           }
                                                                         });
                                        break;
                                      }
                                    });
   }
  
  function createFeedback(args){
  // $('.aleInline').remove();
   var questions = args.questions;
   var learner_response = args.learner_response;
   buildHTML(args.type);
   populateAnswers({type : args.type});
   bindEvent(args.type);
   $('#question_content .contentWrapper').prepend('<div id="infoArea"><p>Choose an option then click the <br>information icons for feedback.</p></div');
   $('.aleInline.leftRegion').empty().addClass('feedback');
  // var answerIndex = $('.excerpt:eq(' + learner_response.group + ') tr').index($(option));
 
   var feedbackContainer = $(document.createElement('div'));
   var feedbackHtml = [];
   feedbackHtml.push('<div class=feedbackTitle>Your Recommendation</div><br>');
   feedbackHtml.push('<div class=feedbackContent><b>' + learner_response.header + '</b><br>' + learner_response.answer + '</div><br><br>');
   
   if(args.parent.hasClass('noFeedback')){
    $('.aleInline.rightRegion').hide();
    feedbackContainer.addClass('feedbackContainer').html(feedbackHtml.join(''));
    feedbackContainer.appendTo($('.aleInline.leftRegion'));
    feedbackContainer
     .append($(
       '<div id="next_activity_btn" class="buttons_sprite nextActivity">&nbsp;</div>')
       .one('click', function() {
        app.doNext();
       }));
    return;
   }
   
   feedbackHtml.push('<div class=feedbackTitle>Feedback on Your Approach</div><br>');
   feedbackHtml.push("<div class=feedbackContent><b>" + questions[learner_response.group].feedbackMessage + "</b><br>" + questions[learner_response.group].answers[learner_response.answerNumber].feedback + "</div>");
   feedbackContainer.addClass('feedbackContainer').html(feedbackHtml.join(''));
   feedbackContainer.appendTo($('.aleInline.leftRegion'));
   feedbackContainer
    .append($(
      '<div id="next_activity_btn" class="buttons_sprite nextActivity">&nbsp;</div>')
      .one('click', function() {
       app.doNext();
      }));
   $('.saveBtn.ok').parent().remove();
   $('.checkIcon').remove();
   $('.excerpt td.radio').addClass('correct');
   $('.excerpt td.radio').each(function(){
    $(this).html('<div class="checkIcon">&nbsp;</div>');
   });
   $('#question_content .contentWrapper').prepend('<div class="feedbackTitle">What Were Your Other Options?</div>');
   $('.excerpt').css({'border-radius' : '10px 10px 10px 10px'});
   $('.checkIcon').css({
    'display' : 'block',
    'position' : 'static'
   });
   $('.aleInline.rightRegion').css({
    'width' : '380px',
    'min-width' : '300px'
   });
   
   $('.checkIcon').unbind('click').bind('click', function(){
    var quesIndex = $('.excerpt').index($(this).parents('.excerpt'));
    var ansIndex = $(this).parents('.excerpt').find('.checkIcon').index($(this));
    var content = {
      correctness : $(this.parentNode).hasClass('correct') ? 'correct' : 'incorrect',
      question : questions[quesIndex].description,
      yourAnswer : $(this).parent().next().text(),
      feedback : questions[quesIndex].answers[ansIndex].feedback,
      feedbackMessage : questions[quesIndex].feedbackMessage
    };
    if(content.feedback)
    {
     // Show the lightbox for feedback.
     ale.lightbox.render({
                          global: ale,
                          id: app.lightbox.getFreshLightboxId(),
                          data: {
                                 type: 'selectAndJustify',
                                 content: content
                                }
                         });
    }
   });
  }
  
  /**
   * @mthod populateAnswers
   * @description Check if any answers to the questions recored before and populate it.
   * @returns boolean indicating if this activity is completed.
   */
  function populateAnswers(args)
   {
    var completed = testLimitReached(),
        questions,
        attempts,
        jsonData = args.jsonData || {},
        prefix = args.prefix || undefined,
        template = args.template || app.getPageName(),
        type = args.type;
        
    questions = app.getTest().getQuestionBank(template);
    
    attempts = questions[questions.length - 1].attempts;
        
    if(typeof attempts !== 'undefined')
     {
      var attempt = 1;
      while(attempt in attempts)
       {
        if(!attempts[attempt + 1])
         {
          break;
         }
        attempt++;
       }
      attempt = attempts[attempt];   
      completed = completed || (attempt.score === 100);
      
      var fn;
      // populate the answer 
      switch(type)
       {
        case 'accordion':
        case 'accordionRef':
         fn = function(index, value)
               {
                if (prefix !== undefined)
                 {
                  // Have to use a different convention for toolkit because setting the attr to checked on radials is resetting the ones on a background selectAndJustify
                  $(prefix + '#question_content').find('.excerpt')
                                                 .eq(index)
                                                 .addClass(value === jsonData.questions[index].correctAnswer[0] ? 'correct' : 'incorrect')
                                                 .find('.questionBody').addClass(value === jsonData.questions[index].correctAnswer[0] ? 'correct' : 'incorrect')
                                                 .find('input:radio[value=' + value + ']');
                  
                  //$(prefix + 'div.title:eq(' + index + ')').html($(prefix + 'div.title:eq(' + index + ')').html() + '<div class="answer">' + jsonData.questions[index].answers[(questions[index].learner_response - 1)].text + '</div>');
                 }
                else
                 {
                  var skin;
                  if (app.template.getData().metadata[0].minimumAnswered !== undefined && index !== app.questionBank[app.getPageName()][2].attempts[1].result[0].group)
                   {
                    skin = '';
                   }
                  else
                   {
                    skin = value === questions[index].correctAnswer[0] ? 'correct' : 'incorrect';
                   }
                  
                  $('#question_content').find('.excerpt')
                                        .eq(index)
                                        .addClass(skin)
                                        .find('.questionBody').addClass(skin)
                                        .find('input:radio[value=' + value + ']')
                                        .attr('checked', 'checked');
                  updateHeader(index);
                 }
                
               };
         break;
        case 'listRef':
         fn = function(index, value)
               {
                $('#question_content .listItem').eq(index)
                                                .addClass(questions[index].correctAnswer[0] === value ? 'corret' : 'incorrect')
                                                .find('a')
                                                .html((function(answers, val)
                                                        {
                                                         var ret;
                                                         $.each(answers, function()
                                                                          {
                                                                           if(val === this.value)
                                                                            {
                                                                             ret = this.text;
                                                                             return false;  
                                                                            }
                                                                          });    
                                                         return ret;
                                                        })(questions[index].answers, value));
               };
         break;
         default:
       }
      
      if(fn)
       {
        $(attempt.result).each(fn);
       }

      $('#question_content').addClass(completed ? 'finished' : 'revising');
      return !completed;
    }
   else
    {
     if (app.template.getData().metadata[0].minimumAnswered === undefined)
      {       
       animate({
        close: false,
        index: 0,
        duration: 400
       });
      }
     return true;
    }
   }
  
  function render()
   {
    var type = getQuestionConfig().type;
    buildHTML(type);
    if(populateAnswers({ type : type }))
     {
      //this test is incomplete
      bindEvent(type);
      bindSubmitAndRevise(type);
      setTimeout(function()
                  {
                   $('#question_container').css('height', '1000px');
                  }, 1000);
     }
    else
     {
      //ungate this test as it's completed.
      app.getTest().ungateThisTest();
      buildNextActivity(type);
     }
   }
    
  this.render = render;
  
  App.prototype.toolkitInit = function(args)
                               {
                                var type;
                                var learner_response;
                                var questions;
                                toolkitTestData = args.testData;
                                
                                 
                                setQuestionConfig(app.toolkit.getData().questionConfig);
                                type = getQuestionConfig().type;
                                
                                 for(questions in toolkitTestData){
                                  if(toolkitTestData.hasOwnProperty(questions)){
                                   if(toolkitTestData[questions].learner_response){
                                    learner_response = toolkitTestData[questions].learner_response;
                                    break;
                                   }
                                  }
                                 }
                                
                               
                                
                                if($('#lightbox_toolkit_lb').hasClass('showFeedback')){
                                 $('#lightbox_toolkit_lb .aleInline.rightRegion').remove()
                                 $('#lightbox_toolkit_lb .aleInline.leftRegion').empty().addClass('feedback');
                                 // var answerIndex = $('.excerpt:eq(' + learner_response.group + ') tr').index($(option));
                                
                                  var feedbackContainer = $(document.createElement('div'));
                                  var feedbackHtml = [];
                                  feedbackHtml.push('<div class=feedbackTitle>Your Recommendation</div><br>');
                                  feedbackHtml.push('<div class=feedbackContent><b>' + learner_response.header + '</b><br>' + learner_response.answer + '</div><br><br>');
                                  
                                  if($('#lightbox_toolkit_lb').hasClass('noFeedback')){
                                   feedbackContainer.addClass('feedbackContainer').html(feedbackHtml.join(''));
                                   feedbackContainer.appendTo($('#lightbox_toolkit_lb .aleInline.leftRegion'));
                                   return;
                                  }
                                  
                                  feedbackHtml.push('<div class=feedbackTitle>Feedback on Your Approach</div><br>');
                                  feedbackHtml.push("<div class=feedbackContent><b>Why it's correct</b><br>" + toolkitTestData[learner_response.group].answers[learner_response.answerNumber].feedback + "</div>");
                                  feedbackContainer.addClass('feedbackContainer').html(feedbackHtml.join(''));
                                  feedbackContainer.appendTo($('#lightbox_toolkit_lb .aleInline.leftRegion'));
                                }
                                else{
                                 buildHTML(type);
                                 
                                 populateAnswers({
                                  prefix : '#lightbox_toolkit_lb ',
                                  jsonData : args.jsonData,
                                  template : args.template,
                                                  type : type
                                                 });
                                }
                                if($.browser.msie)
                                 {
                                  Nifty('div.choice', 'big');  
                                  setTimeout(function()
                                              {
                                               $('#lightbox_data_questionTitle h4').css('height', '30px');
                                               if($('div#lightbox_data_question').html())
                                                {
                                                 Nifty('div#lightbox_data_question', 'big');
                                                }
                                               else
                                                {
                                                 $('div#lightbox_data_question').css('display', 'none');
                                                }
                                               if($('div#lightbox_data_questionTitle').html())
                                                {
                                                 Nifty('div#lightbox_data_questionTitle', 'big');     
                                                }
                                               else
                                                {
                                                 $('div#lightbox_data_questionTitle').css('display', 'none');
                                                }
                                              }, 25);
                                 }
                               };
    
  init();
  
 }


App.prototype.thisTemplate = new SelectAndJustify(ale);