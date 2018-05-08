function ConclusionNotes(app)
 {
  // Private vars
  // ------------
  var localData;
 
 
  // Private methods
  // ---------------
  function applyRoundCorners()
   {
    Nifty('#message_container_wrapper');
    
    // TODO: Figure out why this doesn't apply unless delayed
    setTimeout(function ()
                {
                 Nifty('div#body_container_wrapper');
                }, 500);
   }
  
  function buildHTML(localData)
   {
    var documentFragment = [],
        html = "";
        
    // Hide conclusion video if instructor is viewing
    if (app.instructorIsViewing()) {
      $('#data_videoURL').hide();
      $('#video_container').hide();
      $('#body_inner_container').css('padding-left', '0px');
     }
    
    if (localData.persistData.captions !== undefined)
     {
      documentFragment.push('<span>You wrote:</span>');
      
      $(localData.persistData.captions).each(function (index)
                                              {
                                               if (this.learner_response !== undefined)
                                                {
                                                 if (this.learner_response.length !== 0)
                                                  {
                                                   documentFragment.push('<li>',
                                                                         '<span>',
                                                                         index + 1,
                                                                         '</span>',
                                                                         '<p>',
                                                                         this.learner_response,
                                                                         '</p>',
                                                                         '</li>'
                                                                        );
                                                  }
                                                }
                                              });
     }
    
    if (localData.persistData.freeWrite[0].learner_response !== undefined)
     {
      $(localData.persistData.freeWrite).each(function (index)
                                               {
                                                // If there is a description, then vidNotes content is attempting to be shown
                                                // NOTE: Currently there are no instances of templates which persist actual entered vidnotes answered
                                                // so this feature is not fully implemented. Currently it is only being used functionally to persist
                                                // freeWrite data.
                                                if (this.description === 'vidNotes') {
                                                 html = this.description.replace(/<span.*\/span>/i, this.answers[this.learner_response].value);
                                                 documentFragment.push('<li>',
                                                                       '<h2>',
                                                                       index + 1,
                                                                       '</h2>',
                                                                       '<p>',
                                                                       html,
                                                                       '</p>',
                                                                       '</li>'
                                                                      );
                                                } else {
                                                 // Otherwise we're loading freeWrite data
                                                 // NOTE: These are the only two cases this 
                                                 // template is coded to support at the moment
                                                 html = this.learner_response; 
                                                 
                                                 documentFragment.push(
                                                                       '<span>You wrote:</span>',
                                                                       '<li>',
                                                                       '<div class="pre">',
                                                                       html,
                                                                       '</div>',
                                                                       '</li>'
                                                                      );
                                                }
                                               });
     }
    
    $('#notesContent').append(documentFragment.join(''));
   }
   
  /*
   * ConclusionNotes is a test template hence the hook-setting.
   * NOTE: ConclusionNotesStatic is not a test template and so doesn't include the hook
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
  
  function render()
   {
    $('body').one('template.loaded', function()
                                      {
                                       app.setUpLocalData(['dragAndDrop', 'freeWrite', 'captions']);
                                       buildHTML(app.localData);
                                      });
    applyRoundCorners();
   }

  
  
  // Public interface
  // ----------------
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new ConclusionNotes(ale);