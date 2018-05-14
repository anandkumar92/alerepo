/**
 * SimConvoSplit template class
 * @param {Object} app
 * @returns {SimConvoSplit}
 */
function SimConvoSplit(app)
 {
  // Private vars
  // ------------
  var console = app.console,
      container = app.container || 'div.question',
      mainContainer = 'div#question_container',
      visibleQuestion = 0,
      nimbbPlayer = [];


  // Private methods
  // ---------------
  /**
   * Binds feedback lightbox creation to their parent lightbox links
   */
  function bindLightboxes()
   {
    var questionBank = app.getTest().getQuestionBank();
    
    $('div.questions_container').delegate('a', 'click', function () 
                                                         {
                                                          var questionGroup = $(this).attr('id').split('_', 4)[1],
                                                              questionSubGroup = $(this).attr('id').split('_', 4)[2],
                                                              subGroupQuestions = $(this).attr('id').split('_', 4)[3],
                                                              questionID = $('div.questions_container a').index(this);
                                                          
                                                          app.lightbox.render({
                                                                               'global' : ale,
                                                                               'id' : $('div.questions_container a').index(this),
                                                                               'data' : {
                                                                                         'type' : 'simConvo',
                                                                                         'content' : {
                                                                                                      'title' : 'select the best response: ',
                                                                                                      'questions' : [{
                                                                                                                      //'title' : app.template.getData().questions[($(this).attr('id').split('_', 2)[2])].answers[$('a', this + ':parent:parent').index(this)]
                                                                                                                      'title' : app.template.getData().questions[questionID].answers[0].value,
                                                                                                                      'questionID' : questionID
                                                                                                                     },
                                                                                                                     {
                                                                                                                      'title' : app.template.getData().questions[questionID].answers[1].value,
                                                                                                                      'questionID' : questionID
                                                                                                                     },
                                                                                                                     {
                                                                                                                      'title' : app.template.getData().questions[questionID].answers[2].value,
                                                                                                                      'questionID' : questionID
                                                                                                                     }]
                                                                                                     }
                                                                                        },
                                                                               'position' : {
                                                                                             'type' : 'relative',
                                                                                             'x' : ($(this).offset().left + ($(this).width() / 2) + 20),
                                                                                             'y' : $(this).offset().top + $(this).height() + 10
                                                                                            },
                                                                               'size' : 'simConvo',
                                                                               'modal' : false
                                                                              });
                                                          Nifty('div.lightbox_content_container li');
                                                                              
                                                          return false;
                                                         });
   }

  function bindFeedbackLightboxes(args)
   {
    var questions = args.questions;
    
    $('div#question_container').delegate('a', 'click', function (questions)
                                                                    {
                                                                     //var questionID = $(this).attr('href');
                                                                     var questionID = $(this).parent().attr('id');
                                                                     
                                                                     // Check questionID for '/'
                                                                     questionID = questionID.split('_');
                                                                                                                                          
                                                                     // If yes then check length and return the last item
                                                                     questionID = questionID[1];
                                                                     
                                                                     //var answerID = $('div.lightbox_content_container a', 'div#lightbox_' + questionID).index(this);
                                                                     var answerID = $(this).attr('href');
                                                                     
                                                                     console.info('answerID:');
                                                                     console.debug(answerID);
                                                                     
                                                                     console.info("app.template.getData().questions[" + questionID + "].answers[" + answerID + "].value:");
                                                                     console.debug(app.template.getData().questions[questionID].answers[answerID]);
                                                                     
                                                                         //correct = ($(this).html() === app.template.getData().questions[questionID].answers[answerID].value) ? 'correct' : 'incorrect';
                                                                     var correct = (app.template.getData().questions[questionID].answers[answerID].value === app.template.getData().questions[questionID].correctAnswer[0]) ? 'correct' : 'incorrect',
                                                                         lightboxID = [(getVisibleQuestion() + 1), questionID, answerID].join('');
                                                                     
                                                                     app.lightbox.render({
                                                                                          'guid' : null, // Check for previously saved guid
                                                                                          'global' : ale,
                                                                                          'data' : {
                                                                                                    'type' : 'simConvoFeedback',
                                                                                                    'content' : {
                                                                                                                 'answerGiven' : $(this).html(),
                                                                                                                 'correct' : correct,
                                                                                                                 'feedback' : app.template.getData().questions[questionID].answers[answerID].feedback,
                                                                                                                 'title' : 'feedback'
                                                                                                                }
                                                                                                   },
                                                                                          'id' : lightboxID
                                                                                         });
                                                                                         
                                                                     // Clear recorder and player containers
                                                                     $('div.recorder, div.player').empty();
                                                                     
                                                                     // Show the recorder if inside a correct answer
                                                                     if (correct === "correct") {
                                                                       // Create the recorder if it hasn't been created before
                                                                       if ($('div.recorder object', 'div#lightbox_' + lightboxID).length < 1) {
                                                                         nimbbPlayer['nimbb_' + questionID] = app.nimbb.createPlayer({
                                                                                                                                      // Gets set as the <object> id in [instance].buildHTML()
                                                                                                                                      'id': questionID,
                                                                                                                                      'nimbbContainer': 'div#lightbox_' + lightboxID + ' div.recorder', // jQuery selector
                                                                                                                                      'nimbbHandler': nimbbHandler
                                                                                                                                     });
                                                                         
                                                                         /*
                                                                         nimbbPlayer['nimbb_' + questionID + answerID] = app.nimbb.createPlayer({
                                                                                                                                                 'guid' : app.template.getData().questions[questionID].audioURL,
                                                                                                                                                 'id' : questionID + answerID, // Gets set as the <object> id in [instance].buildHTML()
                                                                                                                                                 'link': app,
                                                                                                                                                 'nimbbContainer': 'div#lightbox_' + lightboxID + ' div.player', // jQuery selector
                                                                                                                                                 'nimbbHandler': nimbbHandler,
                                                                                                                                                 'playOnly' : 'true'
                                                                                                                                                });*/
                                                                         
                                                                        }
                                                                       $('div#lightbox_' + lightboxID).center();
                                                                      }
                                                                      
                                                                     if ($('div.record_container_wrapper .niftycorners', 'div#lightbox_' + lightboxID).length < 1) {
                                                                       Nifty('div.record_container_wrapper');
                                                                      }
                                                                     
                                                                     return false;
                                                                    });
                                                                    
                                                                    
    $('div#masthead_container').delegate('a.saveAndContinue', 'click', function ()
                                                                        {
                                                                         // Set visible question
                                                                         setVisibleQuestion({
                                                                                             'value' : getVisibleQuestion() + 1
                                                                                            });
                                                                                            
                                                                         // Record interaction
                                                                         
                                                                         // Move to next question
                                                                         showQuestion({
                                                                                       'question': getVisibleQuestion()
                                                                                      });
                                                                         
                                                                         // Close lightbox
                                                                         app.lightbox.close();
                                                                         
                                                                         // Update title
                                                                         //$('div#data_header').html('part 2');
                                                                         
                                                                         return false;
                                                                    });
   }

  function buildHTML(questions)
   {
    console.info('@simConvo.buildHTML()');
    
    var questionBank = questions,
        questionBankLength = questionBank.length,
        questionGroups = app.template.getData().content[0].questionGroups,
        questionGroupsLength,
        questionCounter = 0;
    
    questionGroupsLength = questionGroups.length;
    
    for (var x = 0; x < questionGroupsLength; x++)
     {
      // Create question container
      var questionFragment = document.createDocumentFragment(); 
      var questionContainer = document.createElement('div');
      questionContainer.id = 'question_' + x;
      questionContainer.className = 'question_content';
      questionFragment.appendChild(questionContainer);
      
      // Create and append video container
      var videoContainer = document.createElement('div');
      videoContainer.className = 'video_container';
      videoContainer.id = 'data_videoURL_' + x;
      
      // Add header to video container
      var videoContainerHeader = document.createElement('h1');
      videoContainerHeader.appendChild(document.createTextNode('escuchar'));
      videoContainer.appendChild(videoContainerHeader);
      
      // Add videoContainer to questionContainer
      questionContainer.appendChild(videoContainer);
      
      // Create and append questions container
      var questionsContainer = document.createElement('div');
      questionsContainer.className = 'questions_container';
      
      // Create questionsContainerHeader
      var questionsContainerHeader = document.createElement('h1');
      questionsContainerHeader.appendChild(document.createTextNode('responder'));
      questionsContainer.appendChild(questionsContainerHeader);
      
      // Create instructional text
      var questionsContainerInstructions = document.createElement('p');
      questionsContainerInstructions.appendChild(document.createTextNode('Haga clic en las opciones para revisar las posibles respuestas.'));
      questionsContainer.appendChild(questionsContainerInstructions);
      
      var subQuestionContainer = document.createElement('div'),
          // Add questionsContainerUL
          questionsContainerUL = document.createElement('ul');
      
      // Create subQuestion element
      for (var y = 0; y < app.template.getData().content[0].questionGroups[x].questionSubGroups.length; y++)
       {
        // Add individual subQuestions
        // Loop through question bank 
        for (var q = 0; q < app.template.getData().content[0].questionGroups[x].questionSubGroups.length; q++)
         {
          var questionGroupIndex = (x + 1),
              questionSubGroupIndex = y,
              subGroupQuestionIndex = q,
              multiplier = parseInt(questionGroupIndex + questionSubGroupIndex, 10) - 1;
          
          for (var r = 0; r < app.template.getData().questions[multiplier].answers.length; r++)
           {
            // Create <a>
            var anchor = document.createElement('a');
            anchor.href = r;
            $(anchor).html(app.template.getData().questions[questionCounter].answers[r].value);

            // Create <li>
            var listItem = document.createElement('li');
            listItem.id = "subQuestion_" + questionCounter;
            listItem.appendChild(anchor);
            
            // Append <li> to <ul>
            questionsContainerUL.appendChild(listItem);
            
            //alert(app.template.getData().questions[questionCounter].answers[r].value);
           }
          
          questionCounter++;
         }
        
       }

      subQuestionContainer.appendChild(questionsContainerUL);
      
      // Create clearing element for Nifty corners
      var clear = document.createElement('div');
      clear.className = 'clear';
      subQuestionContainer.appendChild(clear);
      
      questionsContainer.appendChild(subQuestionContainer);
      questionContainer.appendChild(questionsContainer);
      
      // Add questions to DOM
      document.getElementById('question_container').appendChild(questionFragment);
      
      // Force a unique id
      $('div#data_videoURL').attr({
                                   'id' : $('div#data_videoURL').attr('id') + '_' + x
                                  });
                                  
      // Bind video data
      var tempDataBindingObject = {};
      tempDataBindingObject['videoURL_' + x] = app.template.getData().content[0].questionGroups[x].videoURL;
      app.template.bindData({
                             source: tempDataBindingObject
                            });
      
     // Force a unique id
      /*$('object#player_videoURL_api').attr({
                                            'id' : $('object#player_videoURL_api').attr('id') + '_' + x
                                           });
                                           
      // Force a unique id
      $('a#player_videoURL').attr({
                                   'id' : $('a#player_videoURL').attr('id') + '_' + x
                                  });*/
     }
   }

  function getContainer()
   {
    return container;
   }

  function getExcerptData()
   {
    return app.template.getData().content[0].excerptData;
   }

  function getMainContainer()
   {
    return mainContainer;
   }

  function getQuestionLength()
   {
    return $(container).length;
   }

  function getVisibleQuestion()
   {
    console.info('@vidNotes.getVisibleQuestion()');
    
    return visibleQuestion;
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
  
  /**
   * Allows per-instance callback management
   */
  function nimbbHandler()
   {
    return {
            Nimbb_captureChangedCallback : function (idPlayer, allowed)
                                            {
                                             console.info('@recordAudio.nimbbHandler.Nimbb_captureChangedCallback(' + idPlayer + ', ' + allowed + ')');
                                             
                                            },
             
            Nimbb_initCompletedCallback : function (idPlayer)
                                           {
                                            console.info('@recordAudio.nimbbHandler.Nimbb_initCompletedCallback(' + idPlayer + ')');
                                            
                                            // Check first if Nifty elements exist so we don't do it twice
                                            if ($('div.record_container .niftycorners').length < 1) 
                                             {
                                              Nifty('div.record_container');
                                             }
                                             
                                            if ($('div#question_container .niftycorners').length < 1) 
                                             {
                                              Nifty('div#question_container');
                                             }
                                            
                                            // Nifty the results page if it is visible
                                            if ($('div#test').css('display') === 'block') 
                                             {
                                              Nifty('div.record_container');
                                             }
                                           },
           
            Nimbb_initStartedCallback : function (idPlayer)
                                         {
                                          console.info('@recordAudio.nimbbHandler.Nimbb_initStartedCallback(' + idPlayer + ')');
                                         },
             
            Nimbb_modeChangedCallback : function (idPlayer, mode)
                                         {
                                          console.info('@recordAudio.nimbbHandler.Nimbb_modeChangedCallback(' + idPlayer + ', ' + mode + ')');
                                         },
             
            Nimbb_playbackStartedCallback : function (idPlayer)
                                             {
                                              console.info('@recordAudio.nimbbHandler.Nimbb_playbackStartedCallback(' + idPlayer + ')');
                                             },
             
            Nimbb_playbackStoppedCallback : function (idPlayer)
                                             {
                                              console.info('@recordAudio.nimbbHandler.Nimbb_playbackStoppedCallback(' + idPlayer + ')');
                                             },
             
            Nimbb_recordingStartedCallback : function (idPlayer)
                                              {
                                               console.info('@recordAudio.nimbbHandler.Nimbb_recordingStartedCallback(' + idPlayer + ')');
                                              },
             
            Nimbb_recordingStoppedCallback : function (idPlayer)
                                              {
                                               console.info('@recordAudio.nimbbHandler.Nimbb_recordingStoppedCallback(' + idPlayer + ')');
                                              },
             
            Nimbb_stateChangedCallback : function (idPlayer, state)
                                          {
                                           console.info('@recordAudio.nimbbHandler.Nimbb_stateChangedCallback(' + idPlayer + ', ' + state + ')');
                                          },
             
            Nimbb_videoSavedCallback : function (idPlayer)
                                        {
                                         console.info('@recordAudio.nimbbHandler.Nimbb_videoSavedCallback(' + idPlayer + ')');
                                         
                                         // Push it to the LMS
                                         save(idPlayer);
                                        },
             
            Nimbb_volumeChangedCallback : function (idPlayer, volume)
                                           {
                                            console.info('@recordAudio.nimbbHandler.Nimbb_volumeChangedCallback(' + idPlayer + ', ' + volume + ')');
                                           }
           };
   }

  function populateAnswers()
   {
    /*
     * Leave this blank for now. Users will be returned to their last incomplete
     * question so will not need to review their previous answers until the
     * conclusion page. This method will serve as a placeholder until new
     * requirements surface around inter-question navigation.
     */
   }

  function render()
   {
    $('body').one('template.loaded', function()
                                       {
                                        var answeredQuestionsCount = 0,
                                        questions = app.getTest().getQuestionBank(),
                                        questionCount = questions.length;
                                    
                                        $.each(questions, function ()
                                                           {
                                                            if (this.learner_response && this.learner_response != '')
                                                             {
                                                              answeredQuestionsCount++;
                                                             }
                                                           });
                                        
                                        // Check for previously submitted answers
                                        if (answeredQuestionsCount > 0) {
                                          setVisibleQuestion({
                                                              value : answeredQuestionsCount
                                                             });
                                         }
                                        
                                        if (!getVisibleQuestion()) {
                                          setVisibleQuestion({
                                                              value : 0
                                                             });
                                         }
                                         
                                        $('div#test').hide();
                                        buildHTML(questions);
                                        //bindLightboxes(questions);
                                        bindFeedbackLightboxes(questions);
                                        showQuestion({
                                                      question: getVisibleQuestion()
                                                     });
                                        roundQuestionContainer();
                                       });
   }
  
  function roundQuestionContainer()
   {
    /*
    Nifty('div.first', 'top');
    Nifty('div.last', 'bottom');
    */
   }

  function save(idPlayer)
   {
    console.info('@simConvo.save(' + idPlayer + ')');
    
    var idPlayerID = idPlayer;
    
    idPlayerID = ("" + idPlayer).split('_')[1];
    
    // Save guid
    app.getTest().recordInteraction({
                                     'id' : idPlayerID,
                                     'value' : nimbbPlayer[idPlayer].getGuid()
                                    });
    
    // Set visible question
    setVisibleQuestion({
                        'value' : getVisibleQuestion() + 1
                       });
                       
    // Move to next question
    showQuestion({
                  'question': getVisibleQuestion()
                 });
    
    // Close lightbox
    app.lightbox.close();
    
    // Update title
    $('div#data_header').html('part 2');
    
    // Re-bind video data
    /*
    console.info('re-binding video data');
    app.template.bindData({
                           "videoURL" : app.template.getData().content[getVisibleQuestion()].videoURL 
                          });*/
   }

  function setVisibleQuestion(args)
   {
    visibleQuestion = args.value;
   }

  function showQuestion(args)
   {
    console.info('@simConvo.showQuestion(' + args.question + ')');
    
    var playMode = 'play',
        question = args.question;
    
    /*
     * Check if the question being shown is more than the number of questions.
     * If it is then show the results page.
     */
    // Check number of questions
    if (question > (app.template.getData().content[0].questionGroups.length - 1))
     {
      // Show results page
      $('div.question_content').hide();
      showResults();
     }
    else
     {
      var DOMelement;
      
      // Audio uses a different format than video ('swf' case)
      if (app.template.getData().content[0].questionGroups[question].videoURL.type === 'audio')
       {
        DOMelement = '#data_videoURL_' + question  + ' .video-js';
        // DOMelement = '#data_videoURL_' + question  + ' a.flowplayer';
       }
      else
       {
        DOMelement = '.video-js:eq(' + question + ')';
        // DOMelement = 'a.flowplayer:eq(' + question + ')';
       }
      
      // Check if flowplayer package config exists and disable autplay if it is set to do so
      if (app.getPackageData().packageData[0].flowplayer !== undefined)
       {
        if (app.getPackageData().packageData[0].flowplayer.autoPlay !== undefined && app.getPackageData().packageData[0].flowplayer.autoPlay === false)
         {
          playMode = 'load';
         }
        else
         {
          playMode = 'play';
         }
       }
      
      app.template.videoplayerHelper()[playMode](app.template.videoplayerHelper().getVideoPlayerId(DOMelement));
    //   app.template.flowplayerHelper()[playMode](DOMelement);
      $('div.question_content').hide();
      $('div.question_content:eq(' + question + ')').show();
     }
   }

  /**
   * This function needs to ungate the test, and show a "final" video.
   * User will be able to continue to see their results
   * @return undefined
   */
  function showResults()
   {
    $('div#question_container').hide();
    $('div#test').show();
    app.getTest().ungateThisTest();
    
    // To allow ungated access after a test is submitted
    app.testCompleted = 'true';
    
    // "Record test"
    app.getTest().recordTest({
                              score : 0 // indicates completion - instructor will manually grade later
                             });
    
    // Create Fragment
    var conclusionFragment = document.createDocumentFragment();
    
    // Add content container
    var conclusionContentContainer = document.createElement('div');
    conclusionContentContainer.id = "conclusion_content_container";
    //document.getElementById('test').appendChild(conclusionContentContainer);
    conclusionFragment.appendChild(conclusionContentContainer);
    
    // Add conclusion_video_container
    var conclusionVideoContainer = document.createElement('div');
    conclusionVideoContainer.id = "data_conclusion_video_container";
    conclusionContentContainer.appendChild(conclusionVideoContainer);
    
    // Add to DOM
    document.getElementById('test').appendChild(conclusionFragment);
    
    // Display video
    app.template.bindData({
                           source: {
                                    conclusion_video_container: app.template.getData().content[0].conclusionVideoURL
                                   }
                          });
   }


  // Public interface
  // ----------------
  /**
   * Set hooks to fire after TestManager gets loaded
   */
  this.init = init;
  this.nimbbPlayer = nimbbPlayer;
  this.render = render;
 }
 
App.prototype.thisTemplate = new SimConvoSplit(ale);

ale.thisTemplate.init();