/**
 * FreWrite template class
 * @param app
 * @return undefined
 */
function FreeWrite(app)
 {
  // Private vars
  // ------------
  var container = '#data_notes_content';
  
  
  // Private methods
  // ---------------
  function applyBorderCorner()
   {
    var freeWrite = RUZEE.ShadedBorder.create({
                                               corner: 10
                                              });
    freeWrite.render("free_write_container_wrapper");
   }

  function applyPalette()
   {
    var checkPaletteBooleanValue = app.template.getData().metadata[0].showPalette;
    if(checkPaletteBooleanValue == "true") {
      $('textarea').palette({
                             containment : '#free_write_container',
                             language : 'spanish'
                            });
      
//      // Corrects the IE8 behavior of scrolling to an incorrect line
//      $('textarea').focus(function()
//                           {
//                            $(this).scrollTop($(this)[0].scrollHeight - $(this).height());
//                           });
     }
   }

  function bindEvents()
   {
    $('div#tabs li').unbind('click.notes')
                    .bind('click.notes', function (e)
                                          {
                                           try
                                           {      
                                            flowplayer('*').each(function()
                                              {
                                             cosnole.log(this);
                                               if (this.isLoaded() === true)
                                                {
                                                 this.stop();
                                                 this.close();
                                                 this.unload();
                                                }
                                              });
                                           }
                                          catch(e)
                                           {
                      //                      alert(e)
                                           }
                                           var contentIndex = $('div#tabs li').index(this),
                                               contentTitle = app.template.getData().content[0].tabs[contentIndex].name;
                                           
                                           // Remove active class from all li elements
                                           $('div#tabs li').removeClass('active');
                                           
                                           // Add active class to current tab
                                           $(this).addClass('active');
                                           
                                           // Hide all content wrappers
                                           $('div#content_wrapper div').hide();
                                           
                                           // Show the right one 
                                           $('#data_' + contentTitle + '_content').show();
                                           
                                           // Load up a flowplayer if there is a video in that tab
                                           if ($('#data_' + contentTitle + '_content a.flowplayer').length > 0) {
                                            var thisIndex = $('a.flowplayer').index($('#data_' + contentTitle + '_content a.flowplayer'));
                                            var DOMelement = 'a.flowplayer:eq(' + thisIndex + ')';
                                            //var DOMelement = 'a.flowplayer:eq(' + id + ')';
                                             app.template.flowplayerHelper().play(DOMelement);
                                            }
                                            // Prevent anchors from taking the browser to a new URL,
                                            // while the event will still propagate.
                                            return false;

                                          });
   }
  
  function bindSaveChangesButton()
   {
    $('a.nimbb_button.save').unbind('click')
                            .bind('click', function ()
                                            {
                                             saveChanges();
                                            });
   }
  
  function bindSubmitButton()
   {
    $('input.ALE_accept').bind('click', function ()
                                         {
                                          submitAnswers();
                                          return false;
                                         });
   }

  function buildHTML(localData)
   {
    /*
    var documentFragment = [],
        notesArray = app.template.getData().content[0].notes;
        */
        
    buildTabs();
    insertSubmitButton();
    
    // The save changes button was commented out because this template is 
    // set to not persist data making this feature very complex to implement
    // as well as a little bit of a hack. Will revisit after (if) TestManager 
    // gets refactored to support multiple tests per package.
    //insertSaveChanges();
    
    // Going to need to bind the data again after building the tabs
    
    bindSubmitButton();
    bindSaveChangesButton();
    populateAnswers(localData);
   }
   
  function buildTabs()
   {
    var tabsArray = app.template.getData().content[0].tabs,
        tabsLength = tabsArray.length,
      
        // Create tab container
        tabContainerFragment = document.createDocumentFragment(),
        tabContainer = document.createElement('ul');
        
    var x;
    for (x = 0; x < tabsLength; x++) {
      // Append to div#tabs
      var tabFragment = document.createDocumentFragment(),
          liContainer = document.createElement('li'),
          aTag = document.createElement('a');
          aTag.href = tabsArray[x].name;
      aTag.innerHTML = tabsArray[x].title;
      
      // Sew everything up
      liContainer.appendChild(aTag);
      tabFragment.appendChild(liContainer);
      tabContainer.appendChild(tabFragment);
     }
    
    tabContainerFragment.appendChild(tabContainer);
    document.getElementById('tabs').appendChild(tabContainerFragment);
     
    // Set active tab
    $('div#tabs li:eq(0)').addClass('active');
   }

  // Set hooks to fire after TestManager gets loaded
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

  function insertSubmitButton()
   {
    var submitButtonContainer = document.createDocumentFragment(),
        submitButton = document.createElement('input'),
        content_container = document.getElementById('content_container');
        
    submitButton.className = 'ALE_accept button';
    submitButton.type = 'button';
    submitButton.value = '';
    submitButtonContainer.appendChild(submitButton);
    content_container.appendChild(submitButtonContainer);
   }
  
  /**
   * NOTE: This function is currently not being used.
   * See notes in buildHTML()
   * @return
   */
  function insertSaveChanges()
   {
    var aElement = document.createElement('a'),
        content_container = document.getElementById('content_container'),
        submitButtonContainer = document.createDocumentFragment();
    
    aElement.href = '#saveChanges';
    aElement.className = 'sprite save nimbb_button';
    aElement.innerHTML = '';
    content_container.appendChild(aElement);
    
    $(container).append(submitButtonContainer);
   }

  function populateAnswers(localData)
   {
    if (localData.thisPage && localData.thisPage[0] && localData.thisPage[0].learner_response) {
      $("textarea").val(localData.thisPage[0].learner_response);
     } else if (localData.persistData.freeWrite && localData.persistData.freeWrite[0]) {
      $("textarea").val(localData.persistData.freeWrite[0].learner_response);
     }
   }
   
  function render()
   {
    app.setUpLocalData(['freeWrite']);
    buildHTML(app.localData);
    app.template.fixImgPaths();
    bindEvents();
    showFirstAvailableTab();
    applyBorderCorner();
    applyPalette();
   }
  
  function saveChanges()
   {
    // Save textarea data
    app.getTest().recordInteraction({
                                     id : 1,
                                     value : $('#content_container textarea').val()
                                    });
   }

  function showFirstAvailableTab()
   {
    $('div#tabs a[href="' + app.template.getData().content[0].tabs[0].name + '"]').trigger('click');
   }

  function submitAnswers()
   {
    app.getTest().recordInteraction({
                                     template : 'freeWrite',
                                     id : $("textarea").attr('id').split('_')[2],
                                     value : $.trim($("textarea").val())
                                    });
    app.getTest().recordTest({
                              score : 0 // indicates completion - instructor will manually grade later 
                             });
    app.getTest().ungateThisTest();
    app.doNext();
   }

  
  // Public interface
  // ----------------
  this.render = render;
  
  
  // One-time setup
  // --------------
  init();
 };

App.prototype.thisTemplate = new FreeWrite(ale);