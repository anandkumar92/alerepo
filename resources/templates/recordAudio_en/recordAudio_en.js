/**
 * RecordAudio template class
 * @param {Object} args
 */
function RecordAudio(args)
 {
  var _config = {};
  setConfig(args);

  var app = getConfig().link,
      console = new Console(),
      nimbbContainer = getConfig().mainContainer,
      nimbbPlayer = [],
      that = this;

  this.init = init;
  this.nimbbPlayer = nimbbPlayer;
  this.render = render;

  /**
   * Binds click event to saveChanges()
   */
  function bindSaveChangesButton()
   {
    $('a.nimbb_button.save').unbind('click')
                            .bind('click', function ()
                                            {
                                             saveChanges();
                                            });
   }

  /**
   * Gets & passes questionBank to buildQuestions()
   */
  function buildHTML()
   {
    var questionBank = app.getTest().getQuestionBank();
    
    buildQuestions({
                    'questionBank' : questionBank,
                    'callback' : populateAnswers
                   });
    
    bindSaveChangesButton();
   }

  /**
   * Loops through questionBank, for 'fill-in' questions, adds a 
   * unique nimbbPlayer[] entry equal to a new Nimbb instance, for
   * 'long-fill-in' questions, creates a textarea 
   * @param {Object} args
   */
  function buildQuestions(args)
   {
    var callback = args.callback || function(){},
        documentFragment = [],
        questions = args.questionBank;
      
    for (var i in questions)
     {
      // For video containers show the player
      // For script containers show a textarea
      switch (questions[i].type)
       {
        case 'fill-in' : // player / recorder
         nimbbPlayer['nimbb_' + i] = app.nimbb.createPlayer({
                                                             'id' : i,
                                                             'guid' : questions[i].learner_response,
                                                             'link' : app,
                                                             'nimbbContainer' : nimbbContainer, // jQuery selector
                                                             'nimbbHandler' : nimbbHandler
                                                            });
         break;
        
        case 'long-fill-in' : // textarea
         var textareaContainerFragment = document.createDocumentFragment();
         var textareaContainer = document.createElement('div');
         textareaContainer.id = 'textarea_container';
         textareaContainerFragment.appendChild(textareaContainer);
         
         var h2Element = document.createElement('h2');
         h2Element.innerHTML = 'gui&#243;n';
         textareaContainer.appendChild(h2Element);
         
         var textarea = document.createElement('textarea');
         textarea.innerHTML = (questions[i].learner_response !== undefined) 
                            ? questions[i].learner_response 
                            : (app.template.getGlobalQuestionBank())
                              ? (app.template.getGlobalQuestionBank()[0])
                                ? (app.template.getGlobalQuestionBank()[0].learner_response || null)
                                : null
                                  : null;
         
         textareaContainer.appendChild(textarea);
        
         var aElement = document.createElement('a');
         aElement.href = '#saveChanges';
         aElement.className = 'sprite save nimbb_button';
         aElement.innerHTML = 'guardar';
         textareaContainer.appendChild(aElement);
         
         $(getConfig().mainContainer).append(textareaContainerFragment);
         break;
        
        default: 
         null;
       }

     }
     
     // Add clearing div
     var clearingDiv = '<div class="clear">&nbsp;</div>';
     $(getConfig().mainContainer).append(clearingDiv);

   }

  function createButton(args)
   {
    var id = args.id;
    
    return ['<a href="#', id, '" id="', id, '" class="nimbb_button">', id, '</a>'].join('');
   }

  function createNimbbControls()
   {
    $('#record_container').css({'background':'#fcc'});
    
    var controls = ['accept', 'play', 'playing', 'record', 'recording', 'rerecord', 'stopPlaying', 'stopRecording'],
        length = controls.length,
        temp = []; // Container for button HTML 
    
    for (var x = length; x--;)
    {
     temp.push(createButton({
                             'id' : controls[x]
                            }));
    }
    
    return temp.join('');
   }

  function getConfig()
   {
    return _config;
   }

  /**
   * Sets up RenderTest hook for TestManager to call render()
   */
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

  /**
   * Allows per-instance callback management
   */
  function nimbbHandler()
   {
    return {
            Nimbb_captureChangedCallback : function (idPlayer, allowed)
                                            {
                                             console.info('@recordAudio.nimbbHandler.Nimbb_captureChangedCallback()');
                                       
                                            },
             
            Nimbb_initCompletedCallback : function (idPlayer)
                                           {
                                            console.info('@recordAudio.nimbbHandler.Nimbb_initCompletedCallback()');
                                            Nifty('div.record_container');
                                            Nifty('div#question_container');
                                           },
           
            Nimbb_initStartedCallback : function (idPlayer)
                                         {
                                          console.info('@recordAudio.nimbbHandler.Nimbb_initStartedCallback()');
                                         },
             
            Nimbb_modeChangedCallback : function (idPlayer, mode)
                                         {
                                          console.info('@recordAudio.nimbbHandler.Nimbb_modeChangedCallback()');
                                         },
             
            Nimbb_playbackStartedCallback : function (idPlayer)
                                             {
                                              console.info('@recordAudio.nimbbHandler.Nimbb_playbackStartedCallback()');
                                             },
             
            Nimbb_playbackStoppedCallback : function (idPlayer)
                                             {
                                              console.info('@recordAudio.nimbbHandler.Nimbb_playbackStoppedCallback()');
                                             },
             
            Nimbb_recordingStartedCallback : function (idPlayer)
                                              {
                                               console.info('@recordAudio.nimbbHandler.Nimbb_recordingStartedCallback()');
                                              },
             
            Nimbb_recordingStoppedCallback : function (idPlayer)
                                              {
                                               console.info('@recordAudio.nimbbHandler.Nimbb_recordingStoppedCallback()');
                                              },
             
            Nimbb_stateChangedCallback : function (idPlayer, state)
                                          {
                                           console.info('@recordAudio.nimbbHandler.Nimbb_stateChangedCallback()');
                                          },
             
            Nimbb_videoSavedCallback : function (idPlayer)
                                        {
                                         console.info('@recordAudio.nimbbHandler.Nimbb_videoSavedCallback()');
                                         
                                         // Push it to the LMS
                                         save(idPlayer);
                                        },
             
            Nimbb_volumeChangedCallback : function (idPlayer, volume)
                                           {
                                            console.info('@recordAudio.nimbbHandler.Nimbb_volumeChangedCallback()');
                                           }
           }
   }

  /**
   * Set as a callback to buildQuestions() when called inside buildHTML()
   */
  function populateAnswers()
   {
    // Placeholder for now
    
    
   }

  /**
   * Calls buildHTML() then,
   * instantiates the .palette() plugin
   */
  function render()
   {
    buildHTML();
    $('textarea').palette({
                           'language' : 'spanish',
                           'containment' : '#question_container'
                          });
   }

  function save(idPlayer)
   {
    // Pass guid over to conclusion page
    app.recordAudioData = [];
    app.recordAudioData['guid'] = nimbbPlayer[idPlayer].getGuid();
    
    // Pass script over to conclusion page
    app.recordAudioData['script'] = $('#textarea_container textarea').val();
    
    // Save guid
    app.getTest().recordInteraction({
                                     'id' : 0,
                                     'value' : nimbbPlayer[idPlayer].getGuid()
                                    });
    // Save textarea data
    app.getTest().recordInteraction({
                                     'id' : 1,
                                     'value' : $('#textarea_container textarea').val()
                                    });
    // "Record test"
    app.getTest().recordTest({
                              'score' : 0 // indicates completion - instructor will manually grade later
                             });
    
    // To allow ungated access after a test is submitted
    app.testCompleted = 'true';
    
    // Redirect user to next template
    app.doNext();
   }

  /**
   * Sends 
   */
  function saveChanges()
   {
    console.info('@recordAudio.nimbb().saveChanges()');
    
    // Save textarea data
    app.getTest().recordInteraction({
                                     'id' : 1,
                                     'value' : $('#textarea_container textarea').val()
                                    });
   }

  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this,
                        'container' : '.question',
                        'mainContainer' : '#question_container'
                       }, args);
   }

 }

/**
 * NOTE: We use "thisTemplate" instead of "TemplateName" (e.g., "RecordAudio") because
 * other classes like Nimbb need template agnostic access to whichever template is
 * implementing it.
 * 
 * TODO: Change over all other templates to use this pattern since some of them (e.g., dragAndDrop) don't   
 */
App.prototype.thisTemplate = new RecordAudio({
                                              "link" : ale
                                             });
                                             
ale.thisTemplate.init();