/**
 * RecordAudio template class
 * @param app
 * @returns undefined
 */
function RecordAudio(app)
 {
  // Private vars
  // ------------
  var nimbbContainer = '#question_container',
      nimbbPlayer = [],
      that = this;


  // Private methods
  // ---------------
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
  function buildHTML(localData)
   {
    buildQuestions(localData);
    
    bindSaveChangesButton();
   }

  /**
   * Loops through questionBank, for 'fill-in' questions, adds a 
   * unique nimbbPlayer[] entry equal to a new Nimbb instance, for
   * 'long-fill-in' questions, creates a textarea 
   * @param {Object} args
   */
  function buildQuestions(localData)
   {
    var i;
    for (i in localData.thisPage) {
      // For video containers show the player
      // For script containers show a text area
      switch (localData.thisPage[i].type) {
        case 'fill-in' : // player / recorder
         nimbbPlayer['nimbb_' + i] = app.nimbb.createPlayer({
                                                             id : i,
                                                             guid : localData.thisPage[i].learner_response,
                                                             link : app,
                                                             nimbbContainer : nimbbContainer, // jQuery selector
                                                             nimbbHandler : nimbbHandler
                                                            });
         break;
        
        case 'long-fill-in' : // textarea
         var textareaContainerFragment = document.createDocumentFragment();
         var textareaContainer = document.createElement('div');
         textareaContainer.id = 'textarea_container';
         textareaContainerFragment.appendChild(textareaContainer);
         
         var h2Element = document.createElement('h2');
         h2Element.innerHTML = 'guion';
         textareaContainer.appendChild(h2Element);
         
         var textarea = document.createElement('textarea');
         
         /*
          * Set the textarea equal according to what is available
          */
         if (localData.thisPage[i].learner_response !== undefined) {
           textarea.innerHTML = localData.thisPage[i].learner_response;
          } else if (localData.persistData.freeWrite) {
           if (localData.persistData.freeWrite[0]) {
             textarea.innerHTML = localData.persistData.freeWrite[0].learner_response;
            } else {
             textarea.innerHTML = '';
            }
          } else {
           textarea.innerHTML = '';
          }
         
         /*
         else if (app.template.getGlobalQuestionBank()) {
           if (app.template.getGlobalQuestionBank()[0] && app.template.getGlobalQuestionBank()[0].description === 'freeWrite') {
             textarea.innerHTML = app.template.getGlobalQuestionBank()[0].learner_response;
            }
           else {
             textarea.innerHTML = '';
            }
          }
         else {
           textarea.innerHTML = '';
          }
         */
         
         
         /*
         textarea.innerHTML = (questions[i].learner_response !== undefined) 
                            ? questions[i].learner_response 
                            : (app.template.getGlobalQuestionBank())
                              ? (app.template.getGlobalQuestionBank()[0])
                                ? (app.template.getGlobalQuestionBank()[0].learner_response || null)
                                : null
                                  : null;*/
         
         textareaContainer.appendChild(textarea);
        
         var aElement = document.createElement('a');
         aElement.href = '#saveChanges';
         aElement.className = 'sprite save nimbb_button';
         aElement.innerHTML = 'guardar';
         textareaContainer.appendChild(aElement);
         
         $(nimbbContainer).append(textareaContainerFragment);
         break;
        
        default: 
         return null;
       }

     }
     
     // Add clearing div
     var clearingDiv = '<div class="clear">&nbsp;</div>';
     $(nimbbContainer).append(clearingDiv);
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
    
    var x;
    for (x = length; x--;) {
      temp.push(createButton({
                              id : controls[x]
                             }));
     }
    
    return temp.join('');
   }

  /**
   * Sets up RenderTest hook for TestManager to call render()
   */
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
                                             //console.info('@recordAudio.nimbbHandler.Nimbb_captureChangedCallback()');
                                            },
             
            Nimbb_initCompletedCallback : function (idPlayer)
                                           {
                                            //console.info('@recordAudio.nimbbHandler.Nimbb_initCompletedCallback()');
                                            Nifty('div.record_container');
                                            Nifty('div#question_container');
                                            removeTheNimbbClearingDiv();
                                           },
           
            Nimbb_initStartedCallback : function (idPlayer)
                                         {
                                          //console.info('@recordAudio.nimbbHandler.Nimbb_initStartedCallback()');
                                         },
             
            Nimbb_modeChangedCallback : function (idPlayer, mode)
                                         {
                                          //console.info('@recordAudio.nimbbHandler.Nimbb_modeChangedCallback()');
                                         },
             
            Nimbb_playbackStartedCallback : function (idPlayer)
                                             {
                                              //console.info('@recordAudio.nimbbHandler.Nimbb_playbackStartedCallback()');
                                             },
             
            Nimbb_playbackStoppedCallback : function (idPlayer)
                                             {
                                              //console.info('@recordAudio.nimbbHandler.Nimbb_playbackStoppedCallback()');
                                             },
             
            Nimbb_recordingStartedCallback : function (idPlayer)
                                              {
                                               //console.info('@recordAudio.nimbbHandler.Nimbb_recordingStartedCallback()');
                                              },
             
            Nimbb_recordingStoppedCallback : function (idPlayer)
                                              {
                                               //console.info('@recordAudio.nimbbHandler.Nimbb_recordingStoppedCallback()');
                                              },
             
            Nimbb_stateChangedCallback : function (idPlayer, state)
                                          {
                                           //console.info('@recordAudio.nimbbHandler.Nimbb_stateChangedCallback()');
                                          },
             
            Nimbb_videoSavedCallback : function (idPlayer)
                                        {
                                         //console.info('@recordAudio.nimbbHandler.Nimbb_videoSavedCallback()');
                                         
                                         // Push it to the LMS
                                         save(idPlayer);
                                        },
             
            Nimbb_volumeChangedCallback : function (idPlayer, volume)
                                           {
                                            //console.info('@recordAudio.nimbbHandler.Nimbb_volumeChangedCallback()');
                                           }
           };
   }

  /**
   * The Nimbb player inserts a clearing div between the player and the 
   * subcontrols which breaks the textarea's 50% width. 
   * TODO: Solve this with a better solution later.
   */
  function removeTheNimbbClearingDiv()
   {
    $('#question_container div.clear').first().remove();
   }

  /**
   * Calls buildHTML() then,
   * instantiates the .palette() plugin
   */
  function render()
   {
    app.setUpLocalData(['freeWrite']);
    buildHTML(app.localData);
    $('textarea').palette({
                           language : 'spanish',
                           containment : '#question_container'
                          });
    
//    // Corrects the IE8 behavior of scrolling to an incorrect line
//    $('textarea').focus(function()
//                         {
//                          $(this).scrollTop($(this)[0].scrollHeight - $(this).height());
//                         });
    
    // Ungate and hide controls since the instructor isn't going to re-record
    if (app.instructorIsViewing() === true)
     {
      $('div.record_container').hide();
      $('div.nimbb_subcontrols_wrapper').hide();
      app.getTest().ungateThisTest();
     }
   }
  
  function save(idPlayer)
   {
    // Pass guid over to conclusion page
    //app.recordAudioData = [];
    //app.recordAudioData['guid'] = nimbbPlayer[idPlayer].getGuid();
    
    // Pass script over to conclusion page
    //app.recordAudioData['script'] = $('#textarea_container textarea').val();
    
    // Save guid
    app.getTest().recordInteraction({
                                     id : 0,
                                     value : nimbbPlayer[idPlayer].getGuid()
                                    });
    // Save textarea data
    app.getTest().recordInteraction({
                                     id : 1,
                                     value : $('#textarea_container textarea').val()
                                    });
    // "Record test"
    app.getTest().recordTest({
                              score : 0 // indicates completion - instructor will manually grade later
                             });
    
    // To allow ungated access after a test is submitted
    app.getTest().ungateThisTest();
    
    // Redirect user to next template
    app.doNext();
   }

  /**
   * Sends 
   */
  function saveChanges()
   {
    // Save textarea data
    app.getTest().recordInteraction({
                                     id : 1,
                                     value : $('#textarea_container textarea').val()
                                    });
   }

 
  // Public interface
  // ----------------
  this.nimbbPlayer = nimbbPlayer;
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 }

App.prototype.thisTemplate = new RecordAudio(ale);