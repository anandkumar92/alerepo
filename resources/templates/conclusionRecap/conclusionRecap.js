/**
 * @class conclusionRecap template class
 * @param app
 * @returns {conclusionNotes}
 */
function ConclusionNotes(app)
 {
  /** Get the page object by testId.
   * Retrieve from local cache if same testId previously requested.
   */
  var getActivityJSON = (function()
                          {
                           var cache = {};
                           return function(testId, callback)
                                   {
                                    cache[testId] = cache[testId] || (function() 
                                                                       {
                                                                        var result;
                                                                        $.ajax({
                                                                            dataType : 'json',
                                                                            url : '/s3scorm/ale/content/data/' + testId + '.json',
                                                                            async : false,
                                                                            cache : false,
                                                                            success : function (data)
                                                                                       {
                                                                                        result = data;
                                                                                       },
                                                                            error : function (XMLHttpRequest, textStatus, errorThrown)
                                                                                     {
                                                                                      result = null;
                                                                                     }
                                                                        });
                                                                        return result;
                                                                       })(); 
                                    if(typeof callback === 'function')
                                     {
                                      callback(cache[testId]);  
                                     }
                                   };
                          })(),
      // Get the test results from question bank and mix into this object.
      compiler = (function(activities)
                   {
                    activities = [].concat(activities);
                    
                    var results = {};
                    return {
                        mixinTestData: function(questionBank) 
                                        {
                                         var activity,
                                             questions;
                                         while(activity = activities.shift())
                                          {
                                           if(questions = questionBank[activity.testId])
                                            {
                                             activity.questions = [].concat(questions);
                                             results[activity.testId] = activity;
                                            }
                                          }
                                         return this;
                                        },
                       get: function(testId)
                             {
                              if(testId) 
                               {
                                return results[testId];   
                               }
                              return results;
                             }
                    }
                   })(app.getPagesObject().pages[app.getCurrentPage()].persistFrom),
     cumulative = [],
     nimbbPlayer = [],
     // Store the information of current active result content.
     // {
     //  testId: 'string',
     //  attemptNo: 'integer'
     // }
     current = {};
  
  /**
   * setter for active activity
   * @param testId
   * @param attemptNo
   */
  function setCurrentActivity(testId, attemptNo)
   {
    current.testId = testId;
    current.attemptNo = attemptNo;
   }
  
  /**
   * getter for active activity
   * @returns current (object)
   */
  function getCurrentActivity()
   {
    return current;
   }

  function applyRoundCorners()
   {
    if($.browser.msie)
     {
      Nifty('#rightTop_container', 'big');
     }
   }

  /**
   * Allows per-instance callback management
   * NOTE: This code is duplicated at least in two other places now: 
   *       simConvoSplit.js and conclusionSimConvoSplit.js
   * TODO: Fix that ---^
   */
  function nimbbHandler()
   {
    return {
            Nimbb_captureChangedCallback : function (idPlayer, allowed)
                                            {
                                             //console.info('@recordAudio.nimbbHandler.Nimbb_captureChangedCallback(' + idPlayer + ', ' + allowed + ')');
                                            },
             
            Nimbb_initCompletedCallback : function (idPlayer)
                                           {
                                            //console.info('@recordAudio.nimbbHandler.Nimbb_initCompletedCallback(' + idPlayer + ')');
                                            
                                            // Check first if Nifty elements exist so we don't do it twice
                                            if ($('div.record_container .niftycorners').length < 1) {
                                              Nifty('div.record_container');
                                             }
                                            
                                            if ($('div#question_container .niftycorners').length < 1) {
                                              Nifty('div#question_container');
                                             }
                                            
                                            // Nifty the results page if it is visible
                                            if ($('div#test').css('display') === 'block') {
                                              Nifty('div.record_container');
                                             }
                                           },
           
            Nimbb_initStartedCallback : function (idPlayer)
                                         {
                                          //console.info('@recordAudio.nimbbHandler.Nimbb_initStartedCallback(' + idPlayer + ')');
                                         },
             
            Nimbb_modeChangedCallback : function (idPlayer, mode)
                                         {
                                          //console.info('@recordAudio.nimbbHandler.Nimbb_modeChangedCallback(' + idPlayer + ', ' + mode + ')');
                                         },
             
            Nimbb_playbackStartedCallback : function (idPlayer)
                                             {
                                              //console.info('@recordAudio.nimbbHandler.Nimbb_playbackStartedCallback(' + idPlayer + ')');
                                             },
             
            Nimbb_playbackStoppedCallback : function (idPlayer)
                                             {
                                              //console.info('@recordAudio.nimbbHandler.Nimbb_playbackStoppedCallback(' + idPlayer + ')');
                                             },
             
            Nimbb_recordingStartedCallback : function (idPlayer)
                                              {
                                               //console.info('@recordAudio.nimbbHandler.Nimbb_recordingStartedCallback(' + idPlayer + ')');
                                              },
             
            Nimbb_recordingStoppedCallback : function (idPlayer)
                                              {
                                               //console.info('@recordAudio.nimbbHandler.Nimbb_recordingStoppedCallback(' + idPlayer + ')');
                                              },
             
            Nimbb_stateChangedCallback : function (idPlayer, state)
                                          {
                                           //console.info('@recordAudio.nimbbHandler.Nimbb_stateChangedCallback(' + idPlayer + ', ' + state + ')');
                                          },
             
            Nimbb_videoSavedCallback : function (idPlayer)
                                        {
                                         //console.info('@recordAudio.nimbbHandler.Nimbb_videoSavedCallback(' + idPlayer + ')');
                                        },
             
            Nimbb_volumeChangedCallback : function (idPlayer, volume)
                                           {
                                            //console.info('@recordAudio.nimbbHandler.Nimbb_volumeChangedCallback(' + idPlayer + ', ' + volume + ')');
                                           }
           };
   }
  
  /**
   * Binds next and previous buttons for each template results view
   */
  function bindHeader()
   {
    $('#prevBtn').unbind('click')
                 .bind('click', function()
                                 {
                                  if(!$(this).hasClass('disabled'))
                                   {
                                    attemptNav(false);  
                                   }
                                 });
    $('#nextBtn').unbind('click')
                 .bind('click', function()
                                 {
                                  if(!$(this).hasClass('disabled'))
                                   {
                                    attemptNav(true);  
                                  }
                                 });
   }
  /**
   * Build the content of attempt header, 
   * and bind the event.
   */
  function buildAttemptHeader() 
   {
    $('#rightTop_container').html('<div id="attemptInfo" class="aleInline">&nbsp;</div><div class="aleInline links"></div>' +
                                  '<div class="navs aleInline"><div id="prevBtn" class="buttons_sprite disabled previous">&nbsp;</div><div id="nextBtn" class="buttons_sprite disabled next">&nbsp;</div></div>');
    bindHeader();
   }
  
  /**
   * Build each activity score box.
   * @param item
   * @param template
   * @param questions
   * @returns
   */
  function buildActivity(item, template, questions)
   {
    var html = [],
        attempts = questions[questions.length - 1].attempts,
        // Local helper function iterating the attempts and apply callback function with arguments.
        iterateAttemps = function(args, fn)
                          {
                           var attempt,
                               index = 1;
                           while(attempt = args[index + '']) 
                            {
                             fn(index, attempt, typeof args[++index + ''] === 'undefined');
                            }
                          };
    var temp;
    html.push('<div class="scoreBox" id="' + item.testId + '"><div class="activityName">' + item.name + '</div><div class="score">');
    switch(template)
     {
      case 'selectAndJustify':
      case 'vidNotesRemediation':
      case 'counting':
      case 'dragAndDrop':
      case 'themes':
      case 'campaign':
       var multipleTemplates = false;
       
       if (template === 'themes')
        {
         $.each(app.getPagesObject().pages[app.getCurrentPage()].persistFrom, function(index, item)
                                                                               {
                                                                                if (item.persistFrom !== undefined && typeof item.persistFrom[0] === 'object') // Object type is psychology only (template name and title), string type is for sociology (template only)
                                                                                 {
                                                                                  multipleTemplates = index;
                                                                                
                                                                                  return false;
                                                                                 }
                                                                               }); 
        }
       
       if (multipleTemplates !== false)
        {
         var newGen = new cumulativeGen,
             persistFrom = app.getPagesObject().pages[app.getCurrentPage()].persistFrom[multipleTemplates].persistFrom;
         
         // First template that is tying in the persisted ones
         $.each(app.questionBank[app.getPagesObject().pages[app.getCurrentPage()].persistFrom[multipleTemplates].testId], function(index, individual)
                                                                                                                           {
                                                                                                                            if (individual.attempts !== undefined)
                                                                                                                             {
                                                                                                                              newGen.add({
                                                                                                                                          correctCount : ((individual.attempts[1].score / 100) * questions.length),
                                                                                                                                          questionCount : questions.length
                                                                                                                                         });
                                                                                                                              
                                                                                                                              addCumulative({
                                                                                                                                             correctCount : ((individual.attempts[1].score / 100) * questions.length),
                                                                                                                                             questionCount : questions.length
                                                                                                                                            });
                                                                                                                             }
                                                                                                                           });
         
         // Now the persisted ones
         $.each(persistFrom, function(i, testItem)
                              {
                               $.each(app.questionBank[testItem.template], function(index, individual)
                                                               {
                                                                if (individual.attempts !== undefined)
                                                                 {                                                       
                                                                  newGen.add({
                                                                              correctCount : ((individual.attempts[1].score / 100) * questions.length),
                                                                              questionCount : questions.length
                                                                             });
                                                                  
                                                                  addCumulative({
                                                                                 correctCount : ((individual.attempts[1].score / 100) * questions.length),
                                                                                 questionCount : questions.length
                                                                                });
                                                                 }
                                                               });
                              });
         
         html.push('<div class="aleInline' + (Math.floor(newGen.score()) === 100 ? ' lastAttempt' : ' lastAttempt none') + '">' + Math.floor(newGen.score()) + '%</div>');
        }
       else
        {
         iterateAttemps(attempts, function(index, item, isLast) {
          temp = 'aleInline';
          
          // NaN comes up for feedback free setting on templates (themes & dragAndDrop)
          if (isNaN(item.score) || item.score === null)
           {
            if(isLast)
             {
              temp = temp + ' lastAttempt';
             }
            
            html.push('<div class="textOnly">see your results</div>');
           }
          else
           {
            if(isLast)
             {
              temp = temp + (item.score === 100 ? ' lastAttempt' : ' lastAttempt none');
              
              // Push to cumulative array
              addCumulative({
                             correctCount : ((item.score / 100) * questions.length),
                             questionCount : questions.length
                            });
             }
            
            html.push('<div class="' + temp + '">' + item.score + '%</div>');
           }
         });
        }
       break;
      case 'freeWrite':
          html.push('<div class="textOnly">see your essay</div>');
          break;
      case 'simConvoSplit':
      case 'recordAudio':
          html.push('<div class="textOnly">see your recorded audio</div>');
          break;
      case 'captions':
          html.push('<div class="textOnly">see your captioning</div>');
          break;
      default:
     }   
    html.push('</div></div>');
    return html.join('');
   }
  
  /**
   * update attempt info (attempt 1: 100%)
   * @param activity
   * @param attemptNo
   */
  function updateAttemptInfo(activity, attemptNo)
   {
    var html = '',
        questions = activity.questions,
        attempt,
        // object to return indicating showing next/prev buttons or not.
        navInfo = {
         next: false,
         prev: attemptNo ? attemptNo !== 1 : false
        };
    switch(activity.template)
     {
      case 'selectAndJustify':
      case 'vidNotesRemediation':
      case 'counting':
      case 'dragAndDrop':
      case 'themes':
       attempt = questions[questions.length - 1].attempts[attemptNo + ''];
       
       if (activity.persistFrom !== undefined)
        {
         html = '';
        }
       else
        {
         if (isNaN(attempt.score))
          {
           html = ['attempt ', attemptNo, ':'].join('');
          }
         else
          {         
           html = ['attempt ', attemptNo, ': ', attempt.score, '%'].join('');
          }
        }
       
       if(questions[questions.length - 1].attempts[(attemptNo + 1) + ''])
        {
         navInfo.next = true;
        }
       break;
      default:
       html = activity.name;
     }
    $('#attemptInfo').html(html);
    return navInfo;
   }
  
  /**
   * Update the body content for the attempt of the activity.
   * @param activity
   * @param attemptNo
   */
  function updateContent(/*string*/activity, /*integer*/attemptNo)
   {
    var content = [],
        questions = [].concat(activity.questions),
        attempt,
        callback,
        subTitle = 'sub title comes here..';
    
    var iterateQuestions = (function(list)
                             {
                              list = [].concat(list);
                              return function(fn)
                                      {
                                       var item,
                                           idx = 0;
                                       while(item = list.shift())
                                        {
                                          fn(idx++, item);
                                        }
                                      };
                             })(questions);                            
    switch(activity.template)
     {
      case 'selectAndJustify':
       if ($('div.activityName:contains(' + activity.name + ')').parent().find('div.score:has(div.textOnly)').length > 0)
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results"></span>';
        }
       else
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results">results</span>';
        }
       
          attempt = questions[questions.length - 1].attempts[attemptNo + ''];
          getActivityJSON(activity.testId, function(data)
                                            {
                                             var questionList = data.questions,
                                                 question,
                                                 getAnswer = function(list, value) 
                                                              {
                                                               var ret = '';
                                                               $.each(list, function(index, val)
                                                                             {
                                                                              if(val.value === value)
                                                                               {
                                                                                ret = val.text;
                                                                                return false;
                                                                               }
                                                                             });
                                                               return ret;
                                                              },
                                                list = [].concat(attempt.result),
                                                item,
                                                answerNumber,
                                                index = 0;
                                                for(item in list){
                                                 if(list[item]){
                                                 if(!isNaN(list[item])){
                                                  {
                                                   answerNumber = list[item];
                                                   } 
                                                 }
                                                 else{
                                                  answerNumber = list[item].answerNumber;
                                                 }
                                                 
                                                  question = questionList[index++];
                                                  content.push('<div class="headerRow"><div class="aleInline number">', typeof list[item] === 'object' ? '' : index, '</div><div class="aleInline">',
                                                    typeof list[item] === 'object' ? list[item].header : question.description, '</div></div>' );
                                                  content.push('<div class="answerRow ',  question.correctAnswer[0] === answerNumber ? 'correct' : 'incorrect', '"><div class="aleInline category">', typeof list[item] === 'object' ? list[item].answer : getAnswer(question.answers, list[item]) , '</div>', // If text is stored, just return the text. (for when only one answer is required, feedback free)
                                                    (data.metadata[0].displayFeedback === false ? '' : '<div class="resultIcon">&nbsp;</div>'),
                                                  '</div>');
                                                 }
                                                }
                                            });
       break;
      case 'vidNotesRemediation':
       subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;question</span><span class="results">results</span>';
       attempt = questions[questions.length - 1].attempts[attemptNo + ''];
       getActivityJSON(activity.testId, function(data)
                                         {
                                          var questionList = data.questions,
                                              question,
                                              hotspot = questionList[0].type === 'choice' ? '<span class=\'answerArea\'></span>' : '<input type=\'text\' class=\'inputArea\'></input>',
                                              getFeedback = function(args, idx)
                                                             {
                                                              var answer = args.answers[idx].value;
                                                              return {
                                                               answer: answer,
                                                               feedback: args.description.replace(hotspot, '<span class="answerArea">' + answer + '</span>')
                                                              };
                                                             },
                                              result,               
                                              list = [].concat(attempt.result),
                                              item,
                                              index = 0;
                                         while(item = list.shift())
                                          {
                                           question = questionList[index++];
                                           result = getFeedback(question, parseInt(item));
                                           content.push('<div class="answerRow ',  question.correctAnswer[0] === result.answer ? 'correct' : 'incorrect', '"><span class="rowNo">', index, '</span><div class="aleInline">', result.feedback, '</div>',
                                                        '<div class="resultIcon">&nbsp;</div>','</div>');
                                          }
                                         });
       
       break;
      case 'counting':
       subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;question</span><span class="results">results</span>';
       attempt = questions[questions.length - 1].attempts[attemptNo + ''];
       getActivityJSON(activity.testId, function(data)
               {
                var questionList = data.questions,
                    question,
                    answer,
                    list = [].concat(attempt.result),
                    index = 0,
                    item;
                while(item = list.shift())
                 {
                  question = questionList[index++];
                  answer = question.answers[parseInt(item)].value;
                  content.push('<div class="answerRow ',  question.correctAnswer[0] === answer ? 'correct' : 'incorrect', '"><span class="rowNo">', index, '</span><div class="aleInline">', question.description, '</div>',
                               '<div class="resultIcon">&nbsp;</div><div class="answer">', answer, '</div></div>');
                 }
                
               });
          
       break;
      case 'dragAndDrop':
       if ($('div.activityName:contains(' + activity.name + ')').parent().find('div.score:has(div.textOnly)').length > 0)
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results"></span>';
        }
       else
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results">results</span>';
        }
       
       attempt = questions[questions.length - 1].attempts[attemptNo + ''];
       getActivityJSON(activity.testId, function(data)
                                         {
                                          var groupList = data.content[0].groupList,
                                              answerList = data.content[0].answerList,
                                              questionList = data.questions,
                                              groups = {};
                                          
                                          if (!isNaN(attempt.score))
                                           {
                                            $.each(groupList, function(index, value)
                                                               {
                                                                groups[index + 1 + ''] = {
                                                                 title: value,
                                                                 items: []
                                                                };
                                                               }); 
                                            
                                            $.each(attempt._group, function(index, value)
                                                               {
                                                                if (value !== null && answerList[parseInt(attempt.result[index]) - 1] !== undefined)
                                                                 {
                                                                  value = value + '';
                                                                  groups[value].items.push({
                                                                   correct: value === questionList[index].group,
                                                                   answer: answerList[parseInt(attempt.result[index]) - 1]
                                                                  }); 
                                                                 }
                                                               });
                                            $.each(groups, function(key, value)
                                                            {
                                                             content.push('<div class="headerRow"><div class="aleInline number">', key, '</div><div class="aleInline">',
                                                                           value.title, '</div></div>' );
                                                             $.each(value.items, function(index, item)
                                                                                  {
                                                                                   content.push('<div class="answerRow ', item.correct ? 'correct' : 'incorrect', '"><div class="aleInline category">', this.answer , '</div>',
                                                                                                '<div class="resultIcon">&nbsp;</div>','</div>');
                                                                                  });      
                                                            }); 
                                           }
                                          else
                                           {
                                            // Case for feedback free
                                            $.each(groupList, function(index, value)
                                                               {
                                                                groups[index + 1 + ''] = {
                                                                 title: value,
                                                                 items: []
                                                                };
                                                               }); 
                                            
                                            $.each(attempt._group, function(index, value)
                                                                    {
                                                                     if (value !== undefined && !isNaN(attempt.result[index]))
                                                                      {
                                                                       value = value + '';
                                                                       
                                                                       groups[value].items.push({
                                                                                                 correct: value === questionList[index].group,
                                                                                                 answer: answerList[parseInt(attempt.result[index]) - 1]
                                                                                                });  
                                                                      }
                                                                    });
                                            
                                            $.each(groups, function(key, value)
                                                            {
                                                             content.push('<div class="headerRow"><div class="aleInline number">', key, '</div><div class="aleInline">',
                                                                          value.title, '</div></div>' );
                                                             $.each(value.items, function(index, item)
                                                                                  {
                                                                                   content.push('<div class="answerRow ', item.correct ? 'correct' : 'incorrect', '"><div class="aleInline category">', this.answer , '</div>',
                                                                                                '<div class="resultIcon">&nbsp;</div>','</div>');
                                                                                  });      
                                                            }); 
                                           }
                                         });
                                         
       break;
      case 'freeWrite':
       content.push(questions[0].learner_response);
       break;
      case 'recordAudio':
       subTitle = '';
       content.push('<div class="scBox"><div class="aleInline number">audio clip</div><div class="player playOnly aleInline"></div></div><div class="textArea"></div>');
       callback = function() 
                   {
                    nimbbPlayer['nimbb_' + questions[0].learner_response] = app.nimbb.createPlayer({
                     guid : questions[0].learner_response,
                     id : questions[0].learner_response,
                     link: app,
                     nimbbContainer: '#contentBody .player:eq(0)', // jQuery selector
                     nimbbHandler: nimbbHandler,
                     playOnly : 'true'
                    });
                    $('#contentBody .textArea').html(questions[1].learner_response);
                   };
       break;
      case 'simConvoSplit':
       iterateQuestions(function(index, item)
                         {
                          content.push('<div class="scBox"><div class="aleInline number">', (index + 1), '</div><div class="player playOnly aleInline"></div></div>' );
                         });
       subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;audio clip</span>';
       callback = function() 
                   {
                    $('#contentBody .scBox .player').each(function(index)
                     {
                       nimbbPlayer['nimbb_' + questions[index].learner_response] = app.nimbb.createPlayer({
                        guid : questions[index].learner_response,
                        id : questions[index].learner_response,
                        link: app,
                        nimbbContainer: '#contentBody .player:eq(' + index + ')', // jQuery selector
                        nimbbHandler: nimbbHandler,
                        playOnly : 'true'
                       });
                     });
                   };
       break;
      case 'captions':
       subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;photo</span><span class="caption">caption</span>';
       getActivityJSON(activity.testId, function(data) 
                                         {
                                          if(data)
                                           {
                                            $.each(data.content[0].slideShows, function(index)
                                                                                {
                                                                                 content.push('<div class="cptnBox"><div class="aleInline number">', (index + 1), '</div><div class="aleInline imgContainer">', '<img src="',
                                                                                              '/s3scorm/ale/content/assets/', this.images[0], '"</img></div><div class="aleInline"><div class="captionBody">', questions[index].learner_response, '</div></div></div>');
                                                                                });
                                           }
                                         });
       break;
      case 'themes':
       if ($('div.activityName:contains(' + activity.name + ')').parent().find('div.score:has(div.textOnly)').length > 0)
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results"></span>';
        }
       else
        {         
         subTitle = '<span>#&nbsp;&nbsp;</span><span>&nbsp;&nbsp;category</span><span class="results">results</span>';
        }
       
       getActivityJSON(activity.testId, function(data) 
                                         {
                                          if(data)
                                           {
                                            var list = data.content[0].answerList,
                                                decideText = data.content[0].decideText,
                                                isIncorrect;
                                            
                                            if ((questions[0].learner_response === 'valid' || questions[0].learner_response === 'invalid') && activity.persistFrom === undefined)
                                             {
                                              var results = questions[questions.length - 1].attempts[attemptNo].result;
                                              
                                              isIncorrect = (function(correctAnswers)
                                                            {
                                                             var set = {};
                                                             $.each(correctAnswers, function(index, item)
                                                                                     {
                                                                                      set[item] = true;
                                                                                     });
                                                             return function(index, value)
                                                                     {
                                                                      return value === 'valid' ^ set[index + 1 + ''];
                                                                     };
                                                            })(data.questions[0].correctAnswer);
                                              
                                              $.each(list, function(index, item)
                                                            {
                                                             content.push('<div class="headerRow"><div class="aleInline number">', index + 1, '</div><div class="aleInline">',
                                                             item.value, '</div></div>' );
                                                             content.push('<div class="answerRow ',  isIncorrect(index, results[index]) ? 'incorrect' : 'correct', '"><div class="aleInline category">', decideText !== undefined ? decideText[questions[index].learner_response] : results[index] , '</div>',
                                                                          '<div class="resultIcon ' + (data.metadata[0].displayFeedback === false ? 'noFeedback' : '') + '">&nbsp;</div>','</div>');
                                                            });
                                             }
                                            else
                                             {
                                              // case for if there is an additional test to compare with
                                              // first results will appear in grey, the persisted test will show second
                                              if (activity.persistFrom !== undefined)
                                               {
                                                if (activity.persistFrom.length === 1)
                                                 {
                                                  $.each(list, function(index, item)
                                                                {
                                                                 var firstAnswer = app.questionBank[activity.persistFrom[0]][app.questionBank[activity.persistFrom[0]].length - 1].attempts[1].result[index],
                                                                     secondAnswer = questions[questions.length - 1].attempts[1].result[index];
                                                                 
                                                                 content.push('<div class="headerRow"><div class="aleInline number">', index + 1, '</div><div class="aleInline">',
                                                                 item.value, '</div></div>' );
                                                                 content.push('<div class="answerRow"><div class="aleInline category">', decideText[questions[index].learner_response] , '</div>',
                                                                   
//                                                                              '<div class="resultScale first" style="width:120px;border:1px solid black;height:20px;float:left;line-height:1.7;text-align:center;">',
//                                                                              firstAnswer === 'Completely agree' ? firstAnswer : secondAnswer === 'Completely agree' ? secondAnswer : '',
//                                                                              '</div><div class="resultScale second" style="width:120px;border:1px solid black;height:20px;float:left;line-height:1.7;text-align:center;">',
//                                                                              firstAnswer === 'Somewhat agree' ? firstAnswer : secondAnswer === 'Somewhat agree' ? secondAnswer : '',
//                                                                              '</div><div class="resultScale third" style="width:120px;border:1px solid black;height:20px;float:left;line-height:1.7;text-align:center;">',
//                                                                              firstAnswer === 'Somewhat disagree' ? firstAnswer : secondAnswer === 'Somewhat disagree' ? secondAnswer : '',
//                                                                              '</div><div class="resultScale fourth" style="width:120px;border:1px solid black;height:20px;float:left;line-height:1.7;text-align:center;">',
//                                                                              firstAnswer === 'Completely disagree' ? firstAnswer : secondAnswer === 'Completely disagree' ? secondAnswer : '',
//                                                                              '</div>', '</div>');
                                                                 
                                                                              '<div class="resultIcon noFeedback"> 2. ', app.questionBank[activity.persistFrom[0]][app.questionBank[activity.persistFrom[0]].length - 1].attempts[1].result[index] === questions[questions.length - 1].attempts[1].result[index] ? questions[questions.length - 1].attempts[1].result[index] : '<b>' + questions[questions.length - 1].attempts[1].result[index] + '</b>', '</div>',
                                                                              '<div class="resultIcon noFeedback"> 1. ', app.questionBank[activity.persistFrom[0]][app.questionBank[activity.persistFrom[0]].length - 1].attempts[1].result[index], '</div>','</div>'); // Note this case is only for feedback free with 1 attempt
                                                                });
                                                 }
                                                else
                                                 {
                                                  var isIncorrect = (function(correctAnswers)
                                                                      {
                                                                       var set = {};
                                                                       $.each(correctAnswers, function(index, item)
                                                                                               {
                                                                                                set[item] = true;
                                                                                               });
                                                                       return function(index, value)
                                                                               {
                                                                                return value === 'valid' ^ set[index + 1 + ''];
                                                                               };
                                                                      })(data.questions[0].correctAnswer);
                                                  
//                                                  content.push('<div class="page_meta"><span>', questions[questions.length - 1].question.header,'</span>', questions[questions.length - 1].question.question,'</div>');
                                                  content.push('<div class="page_meta"><span>', activity.title,'</span>', '</div>');
                                                  
                                                  $.each(list, function(index, item)
                                                    {
                                                     content.push('<div class="headerRow"><div class="aleInline number">', index + 1, '</div><div class="aleInline">',
                                                     item.value, '</div></div>' );
                                                     content.push('<div class="answerRow ',  isIncorrect(index, questions[questions.length - 1].attempts[attemptNo].result[index]) ? 'incorrect' : 'correct', '"><div class="aleInline category">', decideText !== undefined ? decideText[questions[index].learner_response] : questions[questions.length - 1].attempts[attemptNo].result[index] , '</div>',
                                                                  '<div class="resultIcon ' + (data.metadata[0].displayFeedback === false ? 'noFeedback' : '') + '">&nbsp;</div>','</div>');
                                                    });
                                                  
                                                  // Now do the persisted templates
                                                  $.each(activity.persistFrom, function(i, test)
                                                                                {
                                                                                 var isIncorrect = (function(correctAnswers)
                                                                                                     {
                                                                                                      var set = {};
                                                                                                      $.each(correctAnswers, function(index, item)
                                                                                                                              {
                                                                                                                               set[item] = true;
                                                                                                                              });
                                                                                                      return function(index, value)
                                                                                                              {
                                                                                                               return value === 'valid' ^ set[index + 1 + ''];
                                                                                                              };
                                                                                                     })(app.questionBank[test.template][0].correctAnswer);
                                                                                 
//                                                                                 content.push('<div class="page_meta"><span>', app.questionBank[test.template][app.questionBank[test.template].length - 1].question.header,'</span>', app.questionBank[test.template][app.questionBank[test.template].length - 1].question.question,'</div>');
                                                                                 
                                                                                 // This is for custom headers, previous line will use the actual template's headers
                                                                                 content.push('<div class="page_meta"><span>', test.title,'</span>', '</div>');
                                                                                 
                                                                                 $.each(list, function(index, item)
                                                                                               {
                                                                                                content.push('<div class="headerRow"><div class="aleInline number">', index + 1, '</div><div class="aleInline">',
                                                                                                item.value, '</div></div>' );
                                                                                                content.push('<div class="answerRow ',  isIncorrect(index, questions[questions.length - 1].attempts[attemptNo].result[index]) ? 'incorrect' : 'correct', '"><div class="aleInline category">', decideText[app.questionBank[test.template][app.questionBank[test.template].length - 1].attempts[1].result[index]] , '</div><div class="resultIcon ">&nbsp;</div>',
                                                                                                             /*'<div class="resultIcon noFeedback">', app.questionBank[test][app.questionBank[test].length - 1].attempts[1].result[index], '</div>',*/'</div>'); // Note this case is only for feedback free with 1 attemptiv class="resultIcon noFeedback firstCompare"> 1. ', app.questionBank[activity.persistFrom[0]][app.questionBank[activity.persistFrom[0]].length - 1].attempts[1].result[index], '</div>','</div>'); // Note this case is only for feedback free with 1 attempt
                                                                                               });
                                                                                });
                                                 }
                                               }
                                              else
                                               {
                                                $.each(list, function(index, item)
                                                              {
                                                               content.push('<div class="headerRow"><div class="aleInline number">', index + 1, '</div><div class="aleInline">',
                                                               item.value, '</div></div>' );
                                                               content.push('<div class="answerRow"><div class="aleInline category">', decideText[questions[index].learner_response] , '</div>',
                                                                            '<div class="resultIcon noFeedback">', questions[questions.length - 1].attempts[1].result[index], '</div>','</div>'); // Note this case is only for feedback free with 1 attempt
                                                              });
                                               }
                                             }
                                           }
                                         });
       break;
      case 'campaign':
       var question;
       for(question in questions){
        if(questions.hasOwnProperty(question)){
         content.push('<div class="campaignContainer">');
         content.push('<div class="imgContainer">' + questions[question].htmlContent + '</div><div class="campaignAnswer">'+ questions[question].learner_response +'</div>');
         content.push('</div>');
        }
       }
      default:
     }
    $('#contentBody').html(content.join('')).removeClass('empty');
    $('#data_viewer #title').html(activity.description || activity.name);
    $('#subTitle').html(subTitle);
    
    /*
     * trigger callback function right after place the innerHTML to the DOM if any.
     */
    if(callback)
     {
      callback();  
     }
   }
  
  /*
   * args: 
   *  {
   *   next: boolean,
   *   prev: boolean
   *  }
   */
  function toggleNavButtons(args)
   {
    $('#nextBtn').toggleClass('disabled', !args.next);
    $('#prevBtn').toggleClass('disabled', !args.prev);
   }
  
  /**
   * Update the content by testId and attemptNo
   * @param testId
   * @param attemptNo
   * @returns
   */
  function updateView(/*string*/testId, /*integer*/attemptNo)
   {
    // store current activity information.
    setCurrentActivity(testId, attemptNo);
    var activity = compiler.get(testId);
    // update attempt header information, and toggle next/prev buttons.
    toggleNavButtons(updateAttemptInfo(activity, attemptNo));
    updateContent(activity, attemptNo);
    return activity;
   }
 
  /**
   * View next or previous attempt.
   * @param doNext
   */
  function attemptNav(/*boolean*/doNext)
   {
    updateView(getCurrentActivity().testId, getCurrentActivity().attemptNo + (doNext ? 1 : -1));
   }
 
  /**
   * Implementation for clicking the score box, by default showing the first attempt.
   * @param testId
   */
  function activityClicked(testId)
   {
    // Remove all classes from, and add template name to $('#data_viewer')
    // And update the content view. 
    $('#data_viewer').removeClass().addClass(updateView(testId, 1).template);
   }
  
  /**
   * Bind the click event on score boxes for showing the first attempt result of the activity.
   */
  function bindActivity()
   {
    $('#activityList .scoreBox').unbind('click').bind('click', function()
                                                  {
                                                   // If the target is inactive
                                                   if(!$(this).hasClass('active')) 
                                                    {
                                                     // toggle the className active 
                                                     $('#activityList .scoreBox.active').removeClass('active');
                                                     $(this).addClass('active');
                                                     // base on the id, do the logic.
                                                     activityClicked($(this).attr('id'));
                                                    }
                                                  }).eq(0).trigger('click');    
   }
  
  function buildActivityList() 
   {
    var results = compiler.get(),
        prop,
        item,
        html = [];
    
    for(prop in results)
     {
      item = results[prop];
      html.push(buildActivity(item, item.template, item.questions));
     }
    $('#activityList').html(html.join(''));
    
    bindActivity();
   }
  
  function render()
   {
    buildAttemptHeader();

    $('body').one('template.loaded', function()
                                      {
                                       var finalScore;
                                       
                                       compiler.mixinTestData(app.questionBank);
                                       
                                       buildActivityList();
                                       applyRoundCorners();
                                       
                                       finalScore = Math.floor(generateCumulativeScore());
                                       
                                       //lightbox bindings for video
                                       $('a.close, #modal').unbind()
                                                           .bind('click', function()
                                                                           {
                                                                            $('div#modal').remove();
                                                                            
                                                                            $('div#lightbox_toolkit_lb').remove();

                                                                            return false;
                                                                           });
                                       
//                                       if (app.getPackageData().packageData[0].manuallyGradableContent === true)
//                                        {
//                                         // No idea why this is here, theres potentially other tests that need scores
////                                         $('#cumulativeScore').hide();
//                                        }
//                                       else
//                                        {                                         
//                                        }
                                       
                                       if (!isNaN(finalScore))
                                        {                                         
                                         $('#cumulativeScore').html('Cumulative Score: ' + finalScore + '%');
                                        }
                                       
                                       
                                       $('a#finish_btn').unbind('click')
                                                        .bind('click', function ()
                                                                        {
                                                                         if(confirm("Please confirm if you wish to complete this assignment.\n\n(Your progress will be saved)"))
                                                                          {
                                                                           var scr = 0;
                                                                           
                                                                           if (app.getPackageData().packageData[0].manuallyGradableContent === false)
                                                                            {
                                                                             scr = isNaN(finalScore) === false ? finalScore : 0
                                                                            }
                                                                           
                                                                           app.getTest().recordTest({
                                                                                                     score : scr
                                                                                                    });
                                                                           app.doUnload();
                                                                          }
                                                                         return false;
                                                                        });
                                       
                                       setTimeout(function()
                                                   {
                                                    if (app.instructorIsViewing() === true)
                                                     {
                                                      $('a.ALE_finish').css('display', 'none');
                                                      $('a.ALE_complete').css('display', 'none');
                                                      
                                                      if ($('body').hasClass('jumpToFreeWrite'))
                                                       {
                                                        // Ugh why are these elements not including a class with what template they are....
                                                        $('#CJ_SC01_01_freeWrite').trigger('click');
                                                       }
                                                     }                                                    
                                                   }, 50);
                                      });
   }
  
  cumulativeGen = function()
                   {
                    return {
                            cumulative : [],
                            add : function(args)
                                   {
                                    this.cumulative.push(args);
                                    
                                    return this;
                                   },
                            score : function()
                                     {
                                      var correct = 0,
                                      totalQuestions = 0;
                                  
                                      $.each(this.cumulative, function(index, value)
                                                               {
                                                                correct += value.correctCount;
                                                                totalQuestions += value.questionCount;
                                                               });
             
                                      return ((correct / totalQuestions) * 100);
                                     }
                           }
                  };
  
  function addCumulative(args)
   {
    cumulative.push(args);
   }
  
  function generateCumulativeScore()
   {
    var correct = 0,
        totalQuestions = 0;
    
    $.each(getCumulative(), function(index, value)
                             {
                              correct += value.correctCount;
                              totalQuestions += value.questionCount;
                             });

    return ((correct / totalQuestions) * 100);
   }
  
  function getCumulative()
   {
    return cumulative;
   }
  
  /*
   * NOTE: ConclusionNotes is not a test template and so doesn't include the hook
   */
  function init()
   {
    render();
   }
  // Public interface
  // ----------------
  this.render = render;
  this.nimbbPlayer = nimbbPlayer;
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new ConclusionNotes(ale);