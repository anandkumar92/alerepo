function ConclusionSimConvo(app)
 {
  // Private vars
  // ------------
  var localData,
      nimbbPlayer = [];
  
  
  // Private methods
  // ---------------
  function applyRoundCorners()
   {
    // These elements are part of the nimbb players
    Nifty('div.record_container');
    Nifty('div#message_container_wrapper');
    
    // TODO: Figure out why this doesn't apply unless delayed
    setTimeout(function ()
                {
                 Nifty('div#body_container_wrapper');
                }, 500);
   }

  function buildHTML()
   {
    // Setup vars
    var conclusionFragment,
        conclusionContentContainer,
        conclusionVideoContainer,
        playerWrapper,
        answerID,
        newContainer,
        videoLabel;
    
    // Hide conclusion video if instructor is viewing
    if (app.instructorIsViewing()) {
      $('#data_videoURL').hide();
      $('#video_container').hide();
      $('#body_inner_container').css('padding-left', '0px');
     }
    
    // Create Fragment
    conclusionFragment = document.createDocumentFragment();

    // Add content container
    conclusionContentContainer = document.createElement('div');
    conclusionContentContainer.id = "conclusion_content_container";
    //document.getElementById('test').appendChild(conclusionContentContainer);
    conclusionFragment.appendChild(conclusionContentContainer);
    
    // Add conclusion_video_container
    conclusionVideoContainer = document.createElement('div');
    conclusionVideoContainer.id = "data_conclusion_video_container";
    conclusionContentContainer.appendChild(conclusionVideoContainer);
    
    // Add player_wrapper
    playerWrapper = document.createElement('div');
    playerWrapper.id = 'player_wrapper';
    conclusionContentContainer.appendChild(playerWrapper);
        
    // Test to show both guids
    var x;
    for (x = 0; x < localData.length; x++) {
      //console.info("@simConvo.showResults() -> app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'): " + app.scorm.scormProcessGetValue('cmi.interactions.' + x + '.learner_response'));
      
      answerID = localData[x].id;
      
      // Create container element
      newContainer = document.createElement('div');
      newContainer.id = 'player_' + localData[x].learner_response;
      newContainer.className = 'playOnly';
      
      // Create video label
      videoLabel = document.createElement('h2');
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
      document.getElementById('record_container').appendChild(conclusionFragment);
      
      // Pass that container as context to nimbb player
      nimbbPlayer['nimbb_' + localData[x].learner_response] = app.nimbb.createPlayer({
                                                                                      guid : localData[x].learner_response,
                                                                                      id : localData[x].learner_response,
                                                                                      link: app,
                                                                                      nimbbContainer: '#player_' + localData[x].learner_response, // jQuery selector
                                                                                      //'nimbbHandler' : app.thisTemplate.nimbbHandler
                                                                                      nimbbHandler: nimbbHandler,
                                                                                      playOnly : 'true'
                                                                                     });
      
     }
     
    // Hide conclusion video if instructor is viewing
    if (app.instructorIsViewing()) {
      $('#data_conclusion_video_container').hide();
     }
     
    // Round the success header and content container
    Nifty('div#body_container_wrapper');    
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
                                         
                                         // Push it to the LMS
                                         save(idPlayer);
                                        },
             
            Nimbb_volumeChangedCallback : function (idPlayer, volume)
                                           {
                                            //console.info('@recordAudio.nimbbHandler.Nimbb_volumeChangedCallback(' + idPlayer + ', ' + volume + ')');
                                           }
           };
   }

  function render()
   {
    $('body').one('template.loaded', function()
                                      {
                                       localData = app.getTest().getQuestionBank(app.getPagesObject().pages[app.getCurrentPage()].persistFrom[0].simConvoSplit);
                                       buildHTML();
                                      });
    applyRoundCorners();
   }
  
  
  // Public interface
  // ----------------
  this.nimbbPlayer = nimbbPlayer;
  this.init = init;
  this.render = render;
 }
 
App.prototype.thisTemplate = new ConclusionSimConvo(ale);

ale.thisTemplate.init();