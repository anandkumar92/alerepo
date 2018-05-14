function SimConvo(args)
 {
  var _config;
  setConfig(args);

  var _visibleQuestion = 0,
      app = getConfig().link,
      console = new Console(),
      nimbbPlayer = [];

  console.info('@simConvo.js');

  this.nimbbPlayer = nimbbPlayer;
  this.render = render;

  init(); // Set hooks to fire after TestManager gets loaded

  function bindLightboxes()
   {
    var questionBank = app.getTest().getQuestionBank();
    
    /* Need to add this functionality to allow the feedback modal
     * to be bound to an existing DOM element... unless we delegate, again.
     * Basically creating all the lightboxes in the background
     * so they appear to load faster when clicked.
     */
    /*
    $('div.questions_container a').each(function (index, Element)
                                         {
                                          // Get the group data by splitting the id
                                          var idArray = $(this).attr('id').split('_');
                                          
                                          var group = idArray[1],
                                              subGroup = idArray[2],
                                              subGroup2 = idArray[3];
                                          
                                          app.lightbox.render({
                                                               'global' : ale,
                                                               'id' : index,
                                                               'data' : {
                                                                         'type' : 'simConvo',
                                                                         'content' : {
                                                                                      'title' : 'select the best response: ' + index,
                                                                                      'questions' : [{
                                                                                                      'title' : 'question one'
                                                                                                     },
                                                                                                     {
                                                                                                      'title' : 'question two',
                                                                                                     },
                                                                                                     {
                                                                                                      'title' : 'question three',
                                                                                                     }]
                                                                                     }
                                                                        },
                                                               'position' : {
                                                                             'type' : 'relative',
                                                                             'x' : ($(this).offset().left + ($(this).width() / 2)),
                                                                             'y' : $(this).offset().top + $(this).height() + 10
                                                                            },
                                                               'visible' : false
                                                              });
                                         });*/
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
    
    $('div#masthead_container').delegate('a.subQuestion', 'click', function (questions)
                                                                    {
                                                                     var questionID = $(this).attr('href');
                                                                     
                                                                     // Check questionID for '/'
                                                                     questionID = questionID.split('/');
                                                                                                                                          
                                                                     // If yes then check length and return the last item
                                                                     questionID = questionID[questionID.length - 1];
                                                                     
                                                                     var answerID = $('div.lightbox_content_container a', 'div#lightbox_' + questionID).index(this)
                                                                     
                                                                         //correct = ($(this).html() === app.template.getData().questions[questionID].answers[answerID].value) ? 'correct' : 'incorrect';
                                                                     var correct = (app.template.getData().questions[questionID].answers[answerID].value === app.template.getData().questions[questionID].correctAnswer[0]) ? 'correct' : 'incorrect',
                                                                         lightboxID = [(getVisibleQuestion() + 1), questionID, answerID].join(''), 
                                                                         questions = questions;
                                                                     
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
                                                                     if (correct === "correct")
                                                                      {
                                                                       // Create the recorder if it hasn't been created before
                                                                       if ($('div.recorder object', 'div#lightbox_' + lightboxID).length < 1)
                                                                        {
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
                                                                      
                                                                     ($('div.record_container_wrapper .niftycorners', 'div#lightbox_' + lightboxID).length < 1) ? Nifty('div.record_container_wrapper') : null;
                                                                     
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
        questionGroupsLength = app.template.getData().content[0].questionGroups.length;
    
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
      
      // Create subQuestion element
      for (var y = 0; y < app.template.getData().content[0].questionGroups[x].questionSubGroups.length; y++)
       {
        var cssClass,
            subQuestionContainer = document.createElement('div'),
            questionsContainerUL;
            
        // Set 'first' / 'last' cssClass
        if (y === 0)
         {
          cssClass = 'first';
          subQuestionContainer.className = cssClass;
         }
        else if (y === (app.template.getData().content[0].questionGroups[x].questionSubGroups.length - 1))
         {
          cssClass = 'last';
          subQuestionContainer.className = cssClass;
         }
        
        // Add title
        var header = document.createElement('h2');
        header.appendChild(document.createTextNode(app.template.getData().content[0].questionGroups[x].questionSubGroups[y].title + '...'))
        subQuestionContainer.appendChild(header);
        
        // Add questionsContainerUL
        questionsContainerUL = document.createElement('ul');
        
        // Add individual subQuestions
        // Loop through question bank 
        for (var q = 0; q < app.template.getData().content[0].questionGroups[x].questionSubGroups.length; q++)
         {
          // Create <a>
          var anchor = document.createElement('a');
          anchor.href = '#';
          anchor.id = 'question_' + (x + 1) + '_' + y + '_' + q; // 'x' is set to (x + 1) here to match the JSON 'group' format
          
          // Problem with UTF encoding - Spanish chars aren't making it through createTextNode... 
          anchor.appendChild(document.createTextNode(app.template.getData().content[0].questionGroups[x].questionSubGroups[y].subGroupQuestions[q]));
          
          // Create <li>
          var listItem = document.createElement('li');
          listItem.appendChild(anchor);
          
          // Append <li> to <ul>
          questionsContainerUL.appendChild(listItem);
         }
        
        subQuestionContainer.appendChild(questionsContainerUL);
        
        // Create clearing element for Nifty corners
        var clear = document.createElement('div');
        clear.className = 'clear';
        subQuestionContainer.appendChild(clear);
        
        questionsContainer.appendChild(subQuestionContainer);
       }
      
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
                             source : tempDataBindingObject
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
    console.info('@vidNotes.getVisibleQuestion()');
    
    return _visibleQuestion;
   }

  function init()
   {
    console.info('@simConvo.init()');
    
    app.hooks.clearHooks();
    app.hooks.setHook({
                       'name' : 'RenderTest',
                       'functionName' : function ()
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
                                            ($('div.record_container .niftycorners').length < 1) ? Nifty('div.record_container') : null;
                                            ($('div#question_container .niftycorners').length < 1) ? Nifty('div#question_container') : null;
                                            
                                            // Nifty the results page if it is visible
                                            if ($('div#test').css('display') === 'block') 
                                             {
                                              Nifty('div.record_container')
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
           }
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
    console.info('@simConvo.render()');
    
    var questions = app.getTest().getQuestionBank();
    
    // Check for previously submitted answers
    if (app.scorm.scormProcessGetValue('cmi.interactions._count') > 0)
     {
      setVisibleQuestion({
                          'value' : app.scorm.scormProcessGetValue('cmi.interactions._count')
                         });
     }
    
    if (!getVisibleQuestion())
     {
      setVisibleQuestion({
                          'value' : 0
                         });
     }
    $('div#test').hide();
    buildHTML(questions);
    bindLightboxes(questions);
    bindFeedbackLightboxes(questions);
    showQuestion({
                  'question': getVisibleQuestion()
                 });
    roundQuestionContainer();
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
  
  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this,
                        'container' : 'div.question',
                        'mainContainer' : 'div#question_container'
                       }, args);
   }

  function setVisibleQuestion(args)
   {
    _visibleQuestion = args.value;
   }

  function showQuestion(args)
   {
    console.info('@simConvo.showQuestion(' + args.question + ')');
    
    var question = args.question;
    
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
      var DOMelement = '.video-js:eq(' + question + ')';
      app.template.videoplayerHelper().play(app.template.videoplayerHelper().getVideoPlayerId(DOMelement));
    //   var DOMelement = 'a.flowplayer:eq(' + question + ')';
    //   app.template.flowplayerHelper().play(DOMelement);
      $('div.question_content').hide();
      $('div.question_content:eq(' + question + ')').show();
      
      //$('a.flowplayer', 'div.question_content:eq(' + question + ')').trigger('initflowplayer');
     }
     
    /*
    alert('binding question[' + question + ']');
    var newVideoURL = 'videoURL_' + question;
    app.template.bindData({
                           newVideoURL : app.template.getData().content[0].questionGroups[question].videoURL
                          });*/
   }

  function showResults()
   {
    $('div#question_container').hide();
    $('div#test').show();
    
    // To allow ungated access after a test is submitted
    app.testCompleted = 'true';

    // "Record test"
    app.getTest().recordTest({
                              'score' : 0 // indicates completion - instructor will manually grade later
                             });

    /* Commenting this out because there is no next page in simConvo
    // To ungate the current test
    // TODO: This is copied from template.js & needs to not be duplicate code
    $('a.ALE_next').removeAttr('disabled');
    $('a.ALE_next').removeClass('disabled');
    $('a.ALE_next').unbind('click')
                   .bind('click', function ()
                                   {
                                    app.doNext();
                                    return false;
                                   });*/

    // Create Fragment
    var conclusionFragment = document.createDocumentFragment();

    // Show header
    console.info('show header');
    var conclusionSuccessHeader = document.createElement('div');
    conclusionSuccessHeader.id = "conclusion_success_header";
    
    // Add conclusion success icon
    var conclusionSuccessIcon = document.createElement('div');
    conclusionSuccessIcon.className = "sprite checkmark";
    conclusionSuccessHeader.appendChild(conclusionSuccessIcon);
    
    // Add conclusion success paragraph
    var conclusionSuccessParagraph = document.createElement('p')
    conclusionSuccessParagraph.appendChild(document.createTextNode('Congratulations! You\'ve successfully completed this assignment'));
    conclusionSuccessHeader.appendChild(conclusionSuccessParagraph);
    //document.getElementById('test').appendChild(conclusionSuccessHeader);
    conclusionFragment.appendChild(conclusionSuccessHeader);
    
    // Add content container
    var conclusionContentContainer = document.createElement('div');
    conclusionContentContainer.id = "conclusion_content_container";
    //document.getElementById('test').appendChild(conclusionContentContainer);
    conclusionFragment.appendChild(conclusionContentContainer);
    
    // Add conclusion_video_container
    var conclusionVideoContainer = document.createElement('div');
    conclusionVideoContainer.id = "data_conclusion_video_container";
    conclusionContentContainer.appendChild(conclusionVideoContainer);
    
    // Add player container
    var conclusionPlayerContainer = document.createElement('div');
    conclusionPlayerContainer.id = "conclusion_player_container";
    conclusionContentContainer.appendChild(conclusionPlayerContainer);
    
    // Add playback header
    var playbackHeader = document.createElement('h1');
    playbackHeader.appendChild(document.createTextNode('listen to the conversation'));
    conclusionPlayerContainer.appendChild(playbackHeader);
    
    // Add player_wrapper
    var playerWrapper = document.createElement('div');
    playerWrapper.id = 'player_wrapper';
    conclusionContentContainer.appendChild(playerWrapper);
        
    // Test to show both guids
    for (var x = 0; x < app.scorm.scormProcessGetValue('cmi.interactions._count'); x++)
     {
      console.info("@simConvo.showResults() -> app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'): " + app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'));
      
      var answerID = app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.id');
      
      // Create container element
      var newContainer = document.createElement('div');
      newContainer.id = 'player_' + app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response');
      newContainer.className = 'playOnly';
      
      // Create video label
      var videoLabel = document.createElement('h2');
      videoLabel.appendChild(document.createTextNode('Part ' + (x + 1)));
      newContainer.appendChild(videoLabel);
      
      /* Not implemented for now. Didn't realize this functionality was in place so haven't been creating video thumb assets.
      // Create thumbnail
      var videoThumbnail = document.createElement('img');
      videoThumbnail.src = "resources/assets/" + app.template.getData().questions[answerID].videoThumb;
      newContainer.appendChild(videoThumbnail);
      */
      playerWrapper.appendChild(newContainer);
      
      // Add to DOM
      document.getElementById('test').appendChild(conclusionFragment);
      
      // Pass that container as context to nimbb player
      nimbbPlayer['nimbb_' + app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response')] = app.nimbb.createPlayer({
                                                                                                                                    'guid' : app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'),
                                                                                                                                    'id' : app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'),
                                                                                                                                    'link': app,
                                                                                                                                    'nimbbContainer': '#player_' + app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'), // jQuery selector
                                                                                                                                    //'nimbbHandler' : app.thisTemplate.nimbbHandler
                                                                                                                                    'nimbbHandler': nimbbHandler,
                                                                                                                                    'playOnly' : true
                                                                                                                                   });
      
     }
    // Round the success header and content container
    Nifty('div#conclusion_success_header');
    //Nifty('div#conclusion_content_container');    
    
    // Bind video data to it
    app.template.bindData({
                           source : {
                                     "conclusion_video_container" : app.template.getData().content[0].conclusionVideoURL
                                    }
                          });
   }
  
  function submitAnswers()
   {
    console.info('@simConvo.submitAnswers()');
   }
 }
 
App.prototype.thisTemplate = new SimConvo({
                                           "link" : ale
                                          });