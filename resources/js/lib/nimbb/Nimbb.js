/**
 * Nimbb instance factory
 * @param {Object} args
 */
function Nimbb(app)
 {
  var nimbbInstanceIds = 0;
  
  this.createPlayer = createPlayer;
  this.init = init;
  
  /**
   * Check the browser's Flash player version and display either a new Nimbb instance
   * or a message asking the user to upgrade to the latest version
   * @param {Object} args
   */
  function createPlayer(args)
   {
    // Determine flash version
    var flashVersion = app.getFlashVersion().split(',');
    flashVersion = (flashVersion[0] + '.' + flashVersion[1]) * 1;
    
    // Nimbb player requires flash player version 10.1 in IE
    return ($.browser.msie !== true || ($.browser.msie === true && flashVersion > '10.0')) ? new NimbbInstance({
                                                                                                                'account' : args.account || '3d7bb2816e',
                                                                                                                'guid' : args.guid || null,
                                                                                                                'id' : args.id || nextNimbbInstanceId(),
                                                                                                                'link' : app || this,
                                                                                                                'nimbbContainer' : args.nimbbContainer || '',
                                                                                                                'nimbbHandler' : args.nimbbHandler || {},
                                                                                                                'playOnly' : args.playOnly || false
                                                                                                               })
                                                                                           : new UpgradeScreen(args);
   }
  
  /**
   * Was intended to replicate the function of the API finding
   * algorithm used in Scorm.js however it now just defaults
   * to literally "return window;"
   */
  function getWindowObject()
   {
    return window;
    
    var windowObject = {};
    
    if (!window.frameElement)
     {
      return window;
     }
    
    if (window.frameElement.tagName === 'FRAME') // frame
     {
      return window.parent;
     }
    else if (window.frameElement.tagName === 'IFRAME') // iframe
     {
      return window.top;
     }
    else // idk
     {
      return window;
     }
   }
  
  function init()
   {
    insertCSS();
    initNimbbCallbacks();
   }
   
  function initNimbbCallbacks()
   {
    windowObject = getWindowObject();
    windowObject.Nimbb_captureChanged = function (idPlayer)
                                         {
                                          //info('@Nimbb.Nimbb_captureChanged(' + idPlayer + ')');
                                          
                                          app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                 "callback" : "Nimbb_captureChanged",
                                                                                                 "idPlayer" : idPlayer
                                                                                                });
                                         };
                                         
    windowObject.Nimbb_initCompleted = function (idPlayer)
                                        {
                                         //console.info('@Nimbb.Nimbb_initCompleted(' + idPlayer + ')');
                                         
                                         app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                "callback" : "Nimbb_initCompleted",
                                                                                                "idPlayer" : idPlayer
                                                                                               });
                                        };
                                        
    windowObject.Nimbb_initStarted = function (idPlayer)
                                      {
                                       //console.info('@Nimbb.Nimbb_initStarted(' + idPlayer + ')');
                                       
                                       app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                              "callback" : "Nimbb_initStarted",
                                                                                              "idPlayer" : idPlayer
                                                                                             });
                                      }
                                      
    windowObject.Nimbb_modeChanged = function (idPlayer, mode)
                                      {
                                       //console.info('@Nimbb.Nimbb_modeChanged(' + idPlayer + ', ' + mode + ')');
                                       
                                       app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                              "callback" : "Nimbb_modeChanged",
                                                                                              "idPlayer" : idPlayer,
                                                                                              "mode" : mode
                                                                                             });
                                      }
                                      
    windowObject.Nimbb_playbackStarted = function (idPlayer)
                                          {
                                           //console.info('@Nimbb.Nimbb_playbackStarted(' + idPlayer + ')');
                                           
                                           app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                  "callback" : "Nimbb_playbackStarted",
                                                                                                  "idPlayer" : idPlayer
                                                                                                 });
                                          }
                                          
    windowObject.Nimbb_playbackStopped = function (idPlayer)
                                          {
                                           //console.info('@Nimbb.Nimbb_playbackStopped(' + idPlayer + ')');
                                           
                                           app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                  "callback" : "Nimbb_playbackStopped",
                                                                                                  "idPlayer" : idPlayer
                                                                                                 });
                                          }
                                          
    windowObject.Nimbb_recordingStarted = function (idPlayer)
                                           {
                                            //console.info('@Nimbb.Nimbb_recordingStarted(' + idPlayer + ')');
                                            
                                            app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                   "callback" : "Nimbb_recordingStarted",
                                                                                                   "idPlayer" : idPlayer
                                                                                                  });
                                           }
                                           
    windowObject.Nimbb_recordingStopped = function (idPlayer)
                                           {
                                            //console.info('@Nimbb.Nimbb_recordingStopped(' + idPlayer + ')');
                                            
                                            app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                   "callback" : "Nimbb_recordingStopped",
                                                                                                   "idPlayer" : idPlayer
                                                                                                  });
                                           }
                                           
    windowObject.Nimbb_stateChanged = function (idPlayer, state)
                                       {
                                        //console.info('@Nimbb.Nimbb_stateChanged(' + idPlayer + ', ' + state + ')');
                                        
                                        app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                               "callback" : "Nimbb_stateChanged",
                                                                                               "idPlayer" : idPlayer,
                                                                                               "state" : state
                                                                                              });
                                       }
                                       
    windowObject.Nimbb_videoSaved = function (idPlayer)
                                     {
                                      //console.info('@Nimbb.Nimbb_videoSaved(' + idPlayer + ')');
                                      
                                      app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                             "idPlayer" : idPlayer,
                                                                                             "callback" : "Nimbb_videoSaved"
                                                                                            });
                                     }
                                     
    windowObject.Nimbb_volumeChanged = function (idPlayer)
                                        {
                                         //console.info('@Nimbb.Nimbb_volumeChanged(' + idPlayer + ')');
                                         
                                         app.thisTemplate.nimbbPlayer[idPlayer].nimbbCallbacks({
                                                                                                "idPlayer" : idPlayer,
                                                                                                "callback" : "Nimbb_volumeChanged"
                                                                                               });
                                        }
   }
   
  /**
   * Creates CSS link element in the DOM and
   * appends to <head>
   */
  function insertCSS()
   {
    // Insert CSS
    if ($('#nimbbCSS').length < 1)
     {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = app.baseURL + 'resources/js/lib/nimbb/nimbb.css';
      css.type = 'text/css';
      css.id = 'nimbbCSS';
      document.getElementsByTagName('head')[0].appendChild(css);
     }
   }
   
  function nextNimbbInstanceId()
   {
    return nimbbInstanceIds++;
   }
   
  /**
   * Display a message to upgrade your Flash player version
   * @param {Object} args
   */
  function UpgradeScreen(args)
   {
    init();
    
    function init()
     {
      // Build the player HTML here using a unique ID
      var recordContainerFragment = document.createDocumentFragment();
      var recordContainer = document.createElement('div');
      recordContainer.className = 'record_container'; // Changed id to class
      recordContainerFragment.appendChild(recordContainer);
      
      // Add linked upgrade image
      var upgradeLink = document.createElement('a');
      upgradeLink.href = 'http://get.adobe.com/flashplayer/';
      recordContainer.appendChild(upgradeLink);
      
      var upgradeImage = document.createElement('img');
      upgradeImage.className = 'flashUpgrade';
      upgradeImage.src = 'resources/img/160x41_get_flashplayer.gif';
      upgradeLink.appendChild(upgradeImage);
            
      // Add upgrade message
      var upgradeMessage = document.createElement('p');
      upgradeMessage.className = 'flashUpgrade';
      upgradeMessage.innerHTML = 'This feature requires a later version of the Flash player.<br>';
      recordContainer.appendChild(upgradeMessage);
      
      var upgradeLink2 = document.createElement('a');
      upgradeLink2.href = 'http://get.adobe.com/flashplayer/';
      upgradeLink2.innerHTML = 'Click here to upgrade';
      upgradeMessage.appendChild(upgradeLink2);
      
      
      // Add newly created elements to DOM
      $(args.nimbbContainer).append(recordContainerFragment);
      
      /** 
       * NOTE: We need to call this again since a new record_container 
       * was just created above
       */
      Nifty('div.record_container');
     }
   }
  
  // One-time setup
  // --------------
  init();
 }

/**
 * 
 * @param {Object} args
 */
function NimbbInstance(args)
 {
  var _config = {};
  setConfig(args);

  /**
   * TODO: Define the purpose of this variable more clearly
   */
  var _nimbbInstance;

  var app = getConfig().link, // Used for SCORM calls
      console = new Console(),
      guid = getConfig().guid,
      id = getConfig().id, // Gets set as the <object> id in buildHTML()
      nimbbContainer = getConfig().nimbbContainer,
      nimbbHandler = getConfig().nimbbHandler,
      that = this;
  
  //window.console.log(nimbbContainer, ': nimbbContainer'); // fails when console is not present in window.

  this.getGuid = Nimbb_getGuid;
  this.getLanguage = Nimbb_getLanguage;
  this.getMode = Nimbb_getMode;
  this.getState = Nimbb_getState;
  this.getVolume = Nimbb_getVolume;
  this.isCaptureAllowed = Nimbb_isCaptureAllowed;
  this.isReadOnly = Nimbb_isReadOnly;
  this.nimbbCallbacks = nimbbCallbacks;
  this.playVideo = Nimbb_playVideo;
  this.recordVideo = Nimbb_recordVideo;
  this.saveVideo = Nimbb_saveVideo;
  this.setGuid = Nimbb_setGuid; // Takes 'guid', must me in view mode
  this.setMode = Nimbb_setMode; // Takes 'view' or 'record'
  this.setVolume = Nimbb_setVolume; // Values 0 - 100
  this.stopVideo = Nimbb_stopVideo;

  init();
  
  function bindNimbbPlayerControls()
   {
    // Show initial record controls
    $('div.nimbb_controls a', nimbbContainer).hide();
    
    $(nimbbContainer).delegate('a.nimbb_button', 'click.nimbb_button', function (e)
                                                                        {
                                                                         nimbbMap({
                                                                                   'event' : e,
                                                                                   'value' : $(this).html()
                                                                                  });
                                                                         return false;
                                                                        });
   }

  function buildHTML()
   {
    // Build the player HTML here using a unique ID
    var recordContainerFragment = document.createDocumentFragment();
    var recordContainer = document.createElement('div');
    recordContainer.className = 'record_container'; // Changed id to class
    recordContainerFragment.appendChild(recordContainer);
    
    var objectWrapper = document.createElement('div');
    objectWrapper.className = 'object_wrapper'; // Changed id to class
    objectWrapper.appendChild(document.createElement('span'));
    recordContainer.appendChild(objectWrapper);
    
    // TODO: Stringify this and add via swfObject
    var objectHTML = [];
    
    // Create player <object> tag
    objectHTML.push('<object id="nimbb_', id, '" ');
    objectHTML.push('classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ');
    objectHTML.push('width="80%"');
    objectHTML.push('codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"');
    objectHTML.push('>');
    /* This was the previous implementation. Note: IE does not allow an <object> to be passed as a param to appendChild()
    var objectElement = document.createElement('object');
    objectElement.id = 'nimbb_' + id;
    objectElement.className = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
    objectElement.width = 1;
    objectElement.height = 1;
    objectElement.codebase = 'http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab';
    objectWrapper.appendChild(objectElement);
    */
    
    // Add parameters
    var playMode = (guid) ? 'play' : 'record';
    objectHTML.push('<param name="movie" value="'+window.location.protocol+'//player.nimbb.com/nimbb.swf?');
    if (guid)
    {
     objectHTML.push('guid='+ guid +'&');
    }
    objectHTML.push('mode='+ playMode +'&key=' + getConfig().account + '&lang=en&showlabels=0&disablecamera=1">');
    
    if (guid)
    {
     objectHTML.push('<param name="guid" value="' + guid + '">');
    }
    objectHTML.push('<param name="showlabels" value="0">');
    objectHTML.push('<param name="allowScriptAccess" value="always">');
    
    // Insert embed tag
    objectHTML.push('<embed name="nimbb_', id, '"');
    objectHTML.push(' src="'+window.location.protocol+'//player.nimbb.com/nimbb.swf?');
    if (guid)
    {
     objectHTML.push('guid='+ guid +'&');
    }
   
    objectHTML.push('mode=');
    objectHTML.push(playMode, '&key=', getConfig().account, '&lang=en&showlabels=0&disablecamera=1"');
    objectHTML.push(' width="80%" allowScriptAccess="always" pluginsPage="http://www.adobe.com/go/getflashplayer">');
    objectHTML.push('</embed>');
    /*objectHTML.push('<!--[if !IE>--><object id="nimbb_', id, '" type="application/x-shockwave-flash" data="',
                    'http://player.nimbb.com/nimbb.swf?mode=' + playMode + '&key=' + getConfig().account + '&lang=en&showlabels=0&disablecamera=1',
                    '" width="1" height="1"><!--<![endif]-->',
                    '<div><p>Please activate JavaScript to view this content</p></div>',
                    '<!--[if !IE]>--></object><!--<![endif]-->');*/
    /*
    var param = document.createElement('param');
    param.name = 'movie';
    param.value = 'http://player.nimbb.com/nimbb.swf?mode=record&key=' + getConfig().account + '&lang=en&showlabels=0&disablecamera=1';
    objectElement.appendChild(param);
    
    if (guid)
     {
      var param2 = document.createElement('param');
      param2.name = 'guid';
      param2.value = guid;
      objectElement.appendChild(param2);
     }
    
    var param3 = document.createElement('param');
    param3.name = 'showlabels';
    param3.value = '0';
    objectElement.appendChild(param3);
    
    var param4 = document.createElement('param');
    param4.name = 'allowScriptAccess';
    param4.value = 'always';
    objectElement.appendChild(param4);
    
    // Create player <embed> tag
    var embedObject = document.createElement('embed');
    embedObject.name = 'nimbb_' + id;
    var embedString = [];
    var playMode = (guid) ? 'play' : 'record';
    embedString.push('http://player.nimbb.com/nimbb.swf?mode=', playMode, '&key=', getConfig().account, '&lang=en&showlabels=0&disablecamera=1')
    if (guid)
     {
      embedString.push('&guid=', guid);
     }
    embedObject.src = embedString.join('');
    embedObject.width = '80%';
    embedObject.setAttribute('allowScriptAccess', 'always');
    embedObject.setAttribute('pluginsPage', 'http://www.adobe.com/go/getflashplayer');
    objectElement.appendChild(embedObject);
    */
    
    objectHTML.push('</object>');
    
    // Create player controls
    var nimbbControls = document.createElement('div');
    nimbbControls.className = 'nimbb_controls'; // Changed id to class
    nimbbControls.appendChild(createNimbbControls());
    recordContainer.appendChild(nimbbControls);
    
    // Create instructional text
    var pElement = document.createElement('p');
    pElement.className = 'record_text'; // Changed id to class
    pElement.innerHTML = 'The audio recorder will activate the microphone on your computer to record your voice.';
    recordContainer.appendChild(pElement);
    
    // Add newly created elements to DOM
    $(nimbbContainer).append(recordContainerFragment);
    
    $('div.object_wrapper', nimbbContainer).html(objectHTML.join(''));
    
    swfobject.registerObject('nimbb_' + id, '9.0.115');
    $('div.object_wrapper object', nimbbContainer).css({
                                                        'visibility' : 'visible'
                                                       });
   }

  function createButton(args)
   {
     var id = args.id;
     
     var aElement = document.createElement('a');
     aElement.href = ['#', id].join('');
     aElement.className = [id, ' ', 'nimbb_button'].join(''); // Changed id to class
     aElement.innerHTML = id;
     
     return aElement;
     //return ['<a href="#', id, '" id="', id, '" class="nimbb_button">', id, '</a>'].join('');
   }

  function createNimbbControls()
   {
    var controls = ['accept', 'play', 'playing', 'record', 'recording', 'rerecord', 'stopPlaying', 'stopRecording'],
        length = controls.length,
        nimbbControls = document.createDocumentFragment(); // Container for button HTML 
    
    for (var x = length; x--;)
    {
     nimbbControls.appendChild(createButton({
                                             'id' : controls[x]
                                            }));
    }
    
    return nimbbControls;
   }

  function getConfig()
   {
    return _config;
   }

  function getNimbbInstance()
   {
    return document[_nimbbInstance];
   }

  function init()
   {
    render();
   }

  function nimbbCallbacks(args)
   {
    var callback = args.callback,
        idPlayer = args.idPlayer,
        mode = args.mode,
        state = args.state;
    
    function addSubControls()
     {
      if ($('div.nimbb_subcontrols', nimbbContainer).length < 1) 
       {
        // Move re-record and accept to outside the container
        $('<div class="nimbb_subcontrols_wrapper"></div>').insertAfter(nimbbContainer + ' div.record_container');
        $('<div class="clear"></div>').insertAfter(nimbbContainer + ' div.record_container');
        
        //$('<div class="nimbb_subcontrols"></div>').insertAfter(nimbbContainer + ' div.record_container');
        //$('<div class="nimbb_subcontrols"></div>').appendTo(nimbbContainer + 'div.nimbb_subcontrols_wrapper');
        $('div.nimbb_subcontrols_wrapper', nimbbContainer).html('<div class="nimbb_subcontrols"></div>');
        
        $('a.rerecord, a.accept, a.stopRecording', nimbbContainer).appendTo(nimbbContainer + ' div.nimbb_subcontrols');
        $('<div class="progress_wrapper"></div>').insertBefore(nimbbContainer + ' div.nimbb_controls');
        
        // Set-up wrapper around play/stop
        $('a.playing, a.recording, a.play, a.stopPlaying', nimbbContainer).appendTo(nimbbContainer + ' div.progress_wrapper');
        $('<div class="progress_content"></div>').appendTo(nimbbContainer + ' div.progress_wrapper');
       }
      
      // Remove controls if player is set to 'playOnly'
      if (getConfig().playOnly)
       {
        $('p.record_text', nimbbContainer).empty(); // Keep the <p> container so we don't have to re-clear anything :\ 
        $('div.nimbb_controls', nimbbContainer).remove();
        $('div.nimbb_subcontrols', nimbbContainer).remove();
       }
     }
    
    /**
     * Shows or hides the nimbb player's flash object depending on if it has been given access or not.
     * Called by the "Nimbb_initCompleted" case in the switch in nimbbCallbacks();
     * Context is determined by the "nimbbContainer" var defined in this object instance.
     * @return
     */
    function authenticate()
     {
      /**
       * Hide the player if: 
       * NOTE: WE'RE HIDING THE PLAYER ON LOAD NOW HENCE THE FIRST 'TRUE' // Update - 10/13/10: Removed "true" as it was preventing the player from working
       *  - capture is allowed
       *  - a guid is passed
       *  - the browser is !mozilla 
       *  // Update - 10/14/10: Removed this condition as it was preventing the player from working in IE & !mozilla 
       *  (I believe there was an issue with isCaptureAllowed() which caused me to add those two conditions)
       */
      if (getNimbbInstance().isCaptureAllowed() !== false || $('object param[name=guid]', nimbbContainer).length > 0)
       {
        $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                              'height' : '1',
                                                                                              'width' : '1'
                                                                                             });/*
                                                                                       .css({
                                                                                             'visibility' : 'hidden'
                                                                                            });*/
       }
      else // Show Flash player
       {
        $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                              'width' : '80%'
                                                                                             });/*
                                                                                       .css({
                                                                                             'visibility' : 'visible'
                                                                                            });*/
        $('a.record', nimbbContainer).hide();
       }
     }
    
    function hideControls()
     {
      $('div.nimbb_controls a', nimbbContainer).hide();
     }
    
    function ifGuidInitViewMode()
     {
      if ($('object param[name=guid]', nimbbContainer).length > 0)
       {
        getNimbbInstance().setMode('view');
        getNimbbInstance().setGuid($('object param[name=guid]', nimbbContainer).attr('value'));
       }
     }
    
    switch (callback)
     {
      case "Nimbb_captureChanged" :
       
       $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                             'height' : '1',
                                                                                             'width' : '1'
                                                                                            });/*
                                                                                      .css({
                                                                                            'visibility' : 'hidden'
                                                                                           });*/
       
       $('.record', nimbbContainer).show();
       
       nimbbHandler().Nimbb_captureChangedCallback(idPlayer);
       break;
      
      case "Nimbb_initCompleted" :
       setNimbbInstance(idPlayer);
       authenticate(); // Show Flash player for authentication
       /*
       $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                              'height' : '1',
                                                                                              'width' : '1'
                                                                                             })
                                                                                       .css({
                                                                                             'visibility' : 'hidden'
                                                                                            });*/
       
       hideControls(); // Hide all buttons
       addSubControls(); // Add subcontrols
       $('div.progress_wrapper, div.progress_wrapper *', nimbbContainer).hide(); // Hide everything
       $('a.record', nimbbContainer).show(); // Display necessary buttons
       ifGuidInitViewMode(); // Switch player into view mode if initialized with guid (from LMS data)
       nimbbHandler().Nimbb_initCompletedCallback(idPlayer);
       break;
      
      case "Nimbb_initStarted" :
       // Nothing here yet
       nimbbHandler().Nimbb_initStartedCallback(idPlayer);
       break;
      
      case "Nimbb_modeChanged" :
       switch (mode[0]) 
        {
         case 'view' :
          // Reset all controls
          $('div.nimbb_controls a, a.stopPlaying, a.record, a.record_text', nimbbContainer).hide();
          
          // Stop playback controls
          $('a.playing', nimbbContainer).playing({
                                                  'action' : 'stop',
                                                  'context' : nimbbContainer,
                                                  'link' : app
                                                 });
          
          // Show appropriate controls
          $('div.progress_wrapper, a.play', nimbbContainer).show();
          $('a.playing', nimbbContainer).css({
                                              'display' : 'block'
                                             });
          $('a.accept, a.rerecord', nimbbContainer).css({
                                                         'display' : 'inline-block'
                                                        });
       
          break;
         case 'record' :
          // record
          
          // Reset all controls
          $('div.nimbb_controls a, a.rerecord, a.accept, a.stopPlaying, a.play, a.progress_wrapper', nimbbContainer).hide();
          
          // Show appropriate controls
          $('div.nimbb_controls a, a.stopRecording', nimbbContainer).show();
          break;
         default : 
          //console.info('display default state: mode = ' + mode);
        }
       
       nimbbHandler().Nimbb_modeChangedCallback(idPlayer, mode);
       break;
      
      case "Nimbb_playbackStarted" :
       // Hide play button
       $('a.play', nimbbContainer).hide();
       
       // Show "stop playing" button 
       $('a.stopPlaying', nimbbContainer).show();
       $('div.progress_wrapper', nimbbContainer).removeClass('isRecording');
       $('div.progress_content', nimbbContainer).show();
       $('a.playing', nimbbContainer).css({
                                          'display' : 'block'
                                         });
       
       // Start playback controls
       $('a.playing', nimbbContainer).playing({
                                               'action' : 'start',
                                               'context' : nimbbContainer,
                                               'length' : '10000',
                                               'link' : app
                                              });
       
       // Start playback animation
       //ale.recordAudio.nimbb().startPlaybackAnim();
       
       nimbbHandler().Nimbb_playbackStartedCallback(idPlayer);
       break;
      
      case "Nimbb_playbackStopped" :
       // Reset all controls
       $('div.nimbb_controls a, a.stopPlaying', nimbbContainer).hide();
     
       // Stop playback controls
       $('a.playing', nimbbContainer).playing({
                                               'action' : 'stop',
                                               'context' : nimbbContainer,
                                               'link' : app
                                              });
       
       // Display necessary buttons
       $('a.play', nimbbContainer).show();
       $('a.accept, a.rerecord', nimbbContainer).css({
                                                      'display' : 'inline-block'
                                                     });
       
       nimbbHandler().Nimbb_playbackStoppedCallback(idPlayer);
       break;
      
      case "Nimbb_recordingStarted" :
       // Remove all buttons
       $('div.nimbb_controls a, p.record_text, a.play, a.playing, a.rerecord, a.stopPlaying, a.accept', nimbbContainer).hide();
       
       // Display necessary buttons
       $('a.stopRecording', nimbbContainer).show();
       $('div.progress_wrapper', nimbbContainer).addClass('isRecording');
       $('div.progress_wrapper, a.recording, div.progress_content', nimbbContainer).show();
       
       // Display the recording element
       $('a.recording', nimbbContainer).recording({
                                                   'action' : 'start',
                                                   'context' : nimbbContainer,
                                                   'link' : app
                                                  });
       
       nimbbHandler().Nimbb_recordingStartedCallback(idPlayer);
       break;
      
      case "Nimbb_recordingStopped" :
       // Hide recording controls
       $('div.recording', nimbbContainer).recording({
                                                     'action' : 'stop',
                                                     'context' : nimbbContainer,
                                                     'link' : app
                                                    });
                                                    
       $('div.progress_wrapper', nimbbContainer).removeClass('isRecording');
       $('div.nimbb_controls a, a.stopRecording, a.stopPlaying, a.recording', nimbbContainer).hide();
       
       // Show playback controls
       $('a.playing', nimbbContainer).html('Escuche su grabaci&#243;n.');
       $('div.progress_content', nimbbContainer).show();
       $('a.playing', nimbbContainer).css({
                                         'display' : 'block'
                                        });
       
       // Display necessary buttons
       $('a.play', nimbbContainer).show();
       $('a.accept, a.rerecord', nimbbContainer).css({
                                                      'display' : 'inline-block'
                                                     });
       
       nimbbHandler().Nimbb_recordingStoppedCallback(idPlayer);
       break;
       
      case "Nimbb_stateChanged" :
       /**
        * An error e.g., a problem with authentication, causes the flash object to
        * become visible since the exact error and any necessary controls will be there.
        */
       if (state[0] === 'error')
        {
         $('a.stopRecording', nimbbContainer).hide();
         $('a.playing', nimbbContainer).hide();
         $('div.progress_wrapper', nimbbContainer).hide();
         //nimmMapFunctions.record();
         
         $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                               'height' : '200px',
                                                                                               'width' : '80%'
                                                                                              });/*
                                                                                        .css({
                                                                                              'visibility' : 'visible'
                                                                                             });*/
        }
       
       nimbbHandler().Nimbb_stateChangedCallback(idPlayer, state);
       break;
      
      case "Nimbb_videoSaved" :
       getNimbbInstance().stopVideo();
       nimbbHandler().Nimbb_videoSavedCallback(idPlayer);
       break;
       
      case 'Nimbb_volumeChanged' :
       // Nothing here yet
       nimbbHandler().Nimbb_volumeChangedCallback(idPlayer);
       break;
     }
    
   }

  function Nimbb_getGuid()
   {
    return getNimbbInstance().getGuid();
   }

  function Nimbb_getLanguage()
   {
    getNimbbInstance().getLanguage();
   }

  function Nimbb_getMode()
   {
    getNimbbInstance().getMode();
   }

  function Nimbb_getState()
   {
    getNimbbInstance().getState();
   }

  function Nimbb_getVolume()
   {
    getNimbbInstance().getVolume();
   }

  function Nimbb_isCaptureAllowed()
   {
    getNimbbInstance().isCaptureAllowed();
   }

  function Nimbb_isReadOnly()
   {
    getNimbbInstance().isReadOnly();
   }

  function Nimbb_playVideo()
   {
    getNimbbInstance().playVideo();
   }

  function Nimbb_recordVideo()
   {
    getNimbbInstance().setRecordLength(120);
    getNimbbInstance().recordVideo();
   }

  function Nimbb_saveVideo()
   {
    getNimbbInstance().saveVideo();
   }

  function Nimbb_setGuid(guid)
   {
    getNimbbInstance().setGuid(guid);
   }

  function Nimbb_setMode(mode)
   {
    getNimbbInstance().setMode(mode);
   }

  function Nimbb_setVolume(volume)
   {
    getNimbbInstance().setVolume(volume);
   }

  function Nimbb_stopVideo()
   {
    getNimbbInstance().stopVideo();
   }

  function nimbbMap(args)
   {
    var value = args.value,
        e = args.event;
    
    switch (value)
     {
      case 'accept':
       nimbbMapFunctions().accept(e);
       break;
      case 'continue':
       nimbbMapFunctions().doContinue(e);
       break;
      case 'play':
       nimbbMapFunctions().play(e);
       break;
      case 'record':
       nimbbMapFunctions().record(e);
       break;
      case 'rerecord':
       nimbbMapFunctions().rerecord(e);
       break;
      case 'review':
       nimbbMapFunctions().review(e);
       break;
      case 'stopPlaying':
       nimbbMapFunctions().stopPlaying(e);
       break;
      case 'stopRecording':
       nimbbMapFunctions().stopRecording(e);
       break;
      default:
       null;
     }
   }

  function nimbbMapFunctions()
   {
    return {
            accept: function () // Clicking this button should advance learner to next template
                     {
                      // TODO: Find out why this conditional is here. In what case would we
                      //       want to save a readOnly? ...maybe when we're loading... oh, when
                      //       we've loaded up a previously recorded guid and then we're just saving it, again.
                      if (getNimbbInstance().isReadOnly())
                       {
                        //nimbbHandler().Nimbb_videoSavedCallback('nimbb_0'); // TODO: Remove hardcoding
                        nimbbHandler().Nimbb_videoSavedCallback(getNimbbInstance());
                       }
                      else 
                       {
                        getNimbbInstance().saveVideo();
                       }
                     },
                     
            doContinue: function ()
                         {
                          // Advance user to next template page
                         },
                         
            play: function (args)
                   {
                    var args = args || {},
                        newGuid = args.guid || null;
                        //nimbbContainer = (args.liveFired) ? args.liveFired.id : 'body'; 
                    
                    // Note: These DOM changes are made in the Nimbb callback
                    //       as well but sometimes the playbackStarted callback
                    //       doesn't seem to fire. This is for redundancy.
                    // Hide play button
                    $('a.play', nimbbContainer).hide();
                    
                    // Show "stop playing" button 
                    $('a.stopPlaying', nimbbContainer).show();
                    
                    /*
                     * The first condition is for playing back an unsaved recording.
                     * Mode has to be set to record to play a video with no guid.
                     */
                    if (!getNimbbInstance().getGuid() && newGuid === null)
                     {
                      // Prevent changes if already in view mode
                      if (getNimbbInstance().getMode() === 'record')
                       {
                        getNimbbInstance().playVideo();
                        return;
                       }
                      
                      getNimbbInstance().setMode('record');
                      getNimbbInstance().playVideo();
                     }
                    else 
                     {
                      // Prevent changes if already in view mode
                      if (getNimbbInstance().getMode() === 'view') 
                       {
                        if (newGuid !== null)
                         {
                          getNimbbInstance().setGuid(newGuid);
                         }
                        
                        //getNimbbInstance().stopVideo();
                        getNimbbInstance().playVideo();
                        return;
                       }
                       
                      getNimbbInstance().setMode('view');
                      
                      if (newGuid !== null)
                       {
                        getNimbbInstance().setGuid(newGuid)
                       }
                      
                      $('div.object_wrapper object, div.object_wrapper object embed', nimbbContainer).attr({
                                                                                                            'height' : '1',
                                                                                                            'width' : '1'
                                                                                                           });/*
                                                                                                     .css({
                                                                                                           'visibility' : 'hidden'
                                                                                                          });*/
                      getNimbbInstance().stopVideo();
                      getNimbbInstance().playVideo();
                     }
                   },
                   
            record: function ()
                     {
                      // Stop the video first
                      getNimbbInstance().stopVideo();
                                    
                      // Prevent changes if already in recording mode
                      if (getNimbbInstance().getMode() === 'record')
                       {
                        getNimbbInstance().setRecordLength(120);
                        getNimbbInstance().recordVideo();
                        return;
                       }
                       
                      getNimbbInstance().setMode('record');
                      
                      
                      getNimbbInstance().setRecordLength(120);
                      getNimbbInstance().recordVideo();
                      
                      // Display the recording element
                      $('a.recording', nimbbContainer).recording({
                                                                  'link' : app,
                                                                  'action' : 'start'
                                                                 });
                     },
            /*
            recordGuid : function (args)
                          {
                           console.info('@recordAudio.nimbb().recordGuid()');
                           
                           var guid = args.guid;
                           
                           console.info('guid passed: ' + guid);
                           
                           // Save data as interaction record
                           app.scorm.scormSetProcessValue('cmi.interactions.0.id', 0);
                           app.scorm.scormSetProcessValue('cmi.interactions.0.learner_response', guid);
                          },*/
                          
            rerecord: function ()
                       {
                        // Stop the video first
                        getNimbbInstance().stopVideo();
                        
                        // Prevent changes if already in recording mode
                        if (getNimbbInstance().getMode() === 'record')
                         {
                          getNimbbInstance().setRecordLength(120);
                          getNimbbInstance().recordVideo();
                          return;
                         }
                         
                        getNimbbInstance().setMode('record');
                        getNimbbInstance().setRecordLength(120);
                        getNimbbInstance().recordVideo();
                       },
                       
            review: function ()
                     {
                      // Reset all buttons
                      $('.nimbb_controls a', nimbbContainer).hide();
                      
                      // Display necessary buttons
                      $('a.playing', nimbbContainer).css({
                                                          'display' : 'block'
                                                         });
                      $('a.stop', nimbbContainer).show();
                      
                      // Prevent changes if already in view mode
                      if (getNimbbInstance().getMode() === 'view')
                       {
                        getNimbbInstance().playVideo();
                        return;
                       }
                       
                      getNimbbInstance().setMode('view');
                      getNimbbInstance().playVideo();
                     },
                     
            startPlaybackAnim: function ()
                                {
                                 // get video length
                                 // figure out incrememter
                                 // set interval loop (remember to attach it to the global app)
                                },
                                
            stopPlaying: function ()
                          {
                           $('a.playing', nimbbContainer).playing({
                                                                   'action' : 'stop',
                                                                   'context' : nimbbContainer,
                                                                   'link' : app
                                                                  });
                           
                           getNimbbInstance().stopVideo();
                          },
                          
            stopRecording: function ()
                            {
                             // Stop the recording element
                             $('a.recording', nimbbContainer).recording({
                                                                         'action' : 'stop',
                                                                         'context' : nimbbContainer,
                                                                         'link' : app
                                                                        });
                             getNimbbInstance().stopVideo();
                            }
           }
   }

  function render()
   {
    buildHTML();
    bindNimbbPlayerControls();
   }

  function setConfig(args)
   {
    _config = $.extend({
                        'guid' : null, // Can be passed in for player mode
                        'id' : null, // Should be an integer for creating a unique HTML container
                        'link' : this, // Used for calls to SCORM instance
                        'nimbbContainer' : '.nimbb_container',
                        'nimbbHandler' : {}, // Object containing methods to handle Nimbb's callbacks
                        'playOnly' : false // Remove record controls if this is passed in
                       }, args);
   }

  function setNimbbInstance(idPlayer)
   {
    _nimbbInstance = idPlayer;
   }
 }