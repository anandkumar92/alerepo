/**
 * ConclusionRecordAudio template class
 * Requires Nifty plugin
 * @param app
 * @returns {ConclusionRecordAudio}
 */
function ConclusionRecordAudio(app)
 {
  // Private vars
  // ------------
  // app.recordAudioData is an object with 'guid' and 'script' properties 
      // which are set in recordAudio.js template file.  
      //localData = app.recordAudioData || [];
   var localData,

      // Stores nimbb player info
      nimbbPlayer = [];


  // Private methods
  // ---------------
  function applyRoundCorners()
   {
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
    // Hide conclusion video if instructor is viewing
    if (app.instructorIsViewing()) {
      $('#data_videoURL').hide();
      $('#video_container').hide();
      $('#body_inner_container').css('padding-left', '0px');
     }
    
    nimbbPlayer['nimbb_' + 1] = app.nimbb.createPlayer({
                                                        id : 1,
                                                        guid : localData[0].learner_response,
                                                        link : app,
                                                        nimbbContainer : 'div#record_container', // jQuery selector
                                                        nimbbHandler : nimbbHandler,
                                                        playOnly : 'true'
                                                       });
                                            
    // Update script
    $('#data_scriptMessage').html('<span>You wrote:</span><br>' + localData[1].learner_response || $('#data_scriptMessage').html()); 
   }

  /**
   * Calls render()
   * @returns undefined
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
  
  /**
   * Calls buildHTML(), and applyRoundCorners()
   * @returns undefined
   */
  function render()
   {
    $('body').one('template.loaded', function()
                                      {
                                       localData = app.getTest().getQuestionBank(app.getPagesObject().pages[app.getCurrentPage()].persistFrom[0].recordAudio);
                                       buildHTML();
                                      });
    applyRoundCorners();
   }


  // Public interface
  // ----------------
  this.init = init;
  this.nimbbPlayer = nimbbPlayer;
  this.render = render;
 }
 
App.prototype.thisTemplate = new ConclusionRecordAudio(ale);

ale.thisTemplate.init();