function FreeWrite(args)
 {
  var _config = {};
  setConfig(args);
  
  var app = getConfig().link,
      console = new Console();
  
  console.info('@freeWrite.js');
  
  this.render = render;
  
  init(); // Set hooks to fire after TestManager gets loaded
  
  function applyBorderCorner()
   {
    var freeWrite = RUZEE.ShadedBorder.create({
                                               corner: 10
                                              });
    freeWrite.render("free_write_container_wrapper");
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
    $('input.ALE_done').bind('click', function ()
                                         {
                                          console.info('submit this question...');
                                          submitAnswers();
                                          return false;
                                         });
    
    /*
    var answers;
    
    $('input.save').unbind('click.freeWrite')
                   .bind('click.freeWrite', function ()
                                             {
                                              app.getTest()
                                                 .recordInteraction({
                                                                     id : $("textarea").attr('id').split('_')[2],
                                                                     value : $.trim($("textarea").val())
                                                                    });
                                              return false;
                                             });*/
   }

  function bindEvents()
   {
    $('div#tabs li').unbind('click.notes')
                    .bind('click.notes', function (e)
                                          {
                                           var contentIndex = $('div#tabs li').index(this),
                                               contentTitle;
                                           
                                           if (getData().content[0].tabs[contentIndex])
                                            {
                                             contentTitle = getData().content[0].tabs[contentIndex].name;
                                            }
                                           else
                                            {
                                             return;
                                            }
                                           
                                           // Remove active class from all li elements
                                           $('div#tabs li').removeClass('active');
                                           
                                           // Add active class to current tab
                                           $(this).addClass('active');
                                           
                                           // Hide all content wrappers
                                           $('div#content_wrapper div').hide();
                                           
                                           // Show the right one 
                                           $('#data_' + contentTitle + '_content').show();
                                           
                                           // Load up a flowplayer if there is a video in that tab
                                        //    if ($('#data_' + contentTitle + '_content a.flowplayer').length > 0) 
                                        //     {
                                        //      var thisIndex = $('#data_' + contentTitle + '_content a.flowplayer').index('a.flowplayer');
                                        //      var DOMelement = 'a.flowplayer:eq(' + thisIndex + ')';
                                        //      app.template.flowplayerHelper().play(DOMelement);
                                        //     }
                                        if ($('#data_' + contentTitle + '_content .video-js').length > 0) 
                                            {
                                             var thisIndex = $('#data_' + contentTitle + '_content .video-js').index('.video-js');
                                             var DOMelement = '.video-js:eq(' + thisIndex + ')';
                                             app.template.videoplayerHelper().play(app.template.videoplayerHelper().getVideoPlayerId(DOMelement));
                                            //  app.template.flowplayerHelper().play(DOMelement);
                                            }
    
                                           //app.template.flowplayerHelper().init();
                                           
                                           return false;
                                          });
    
    $('textarea').blur(function()
                        {
                         saveChanges();                                   
                        });
    
    /*
    $("#notes_tab").unbind("click.notes")
                   .bind("click.notes", function ()
                                         {
                                           $(".active").removeClass("active");
                                           $(this).addClass("active");
                                           $("#notes_content_wrapper").show();
                                           $("#media_content_wrapper").hide();
                                           return false;
                                         });
    $("#media_tab").unbind("click.notes")
                   .bind("click.notes", function ()
                                         {
                                          $(".active").removeClass("active");
                                          $(this).addClass("active");
                                          $("#media_content_wrapper").show();
                                          $("#notes_content_wrapper").hide();
                                          return false;
                                         });
                                         */

   }

  function buildHTML()
   {
    console.info('@freeWrite.buildHTML()');
    
    var documentFragment = [],
        notesArray = getData().content[0].notes;
        
    buildTabs();
    insertSubmitButton();
    
    // The save changes button was commented out because this template is 
    // set to not persist data making this feature very complex to implement
    // as well as a little bit of a hack. Will revit after (if) TestManager 
    // gets refactored to support multiple tests per package.
    //insertSaveChanges();
    
    // Going to need to bind the data again after building the tabs
    
    bindSubmitButton();
    bindSaveChangesButton();
   }
   
  function buildTabs()
   {
    console.info('@freeWrite.buildTabs()');
    
    var tabsArray = getData().content[0].tabs || 0,
        tabsLength = tabsArray.length || 0;
    
    if (tabsLength === 0)
     {
      return;
     }
    
    // Create tab container
    var tabContainerFragment = document.createDocumentFragment(),
        tabContainer = document.createElement('ul');
    
    showFirstAvailableTab();
    
    for (var x = 0; x < tabsLength; x++)
     {
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

  function getConfig()
   {
    return _config;
   }

  function getContainer()
   {
    return getConfig().container;
   }

  function getData()
   {
    var data;
    
    // Check data cache
    if(app.getCache().freeWrite !== undefined)
     {
      data = app.getCache().freeWrite;
     }
    else
     {
      // If we've opened up this template from the toolkit for the first time
      
      // Next, hit this inner conditional which will check to see if we're accessing from the toolkit
      // or normal template instantiation. 
      (app.toolkit.getData() === undefined)
       ? data = app.template.getData()
       : data = app.toolkit.getData();
      
      app.setCache({
                    freeWrite : data
                   });
     }

     return data;
   }
  
   function init()
    {
     if ($('#lightbox_toolkit_lb').length > 0)
      {
       return;
      }
     
     console.info('@freeWrite.init()');
 
     app.hooks.clearHooks();
     app.hooks.setHook({
                         'name' : 'RenderTest',
                         'functionName' : function ()
                                           {
                                            app.thisTemplate.render();
                                           }
                        });
    }

  function insertSubmitButton()
   {
   $('.ALE_done.button').remove();
    var submitButtonContainer = document.createDocumentFragment(),
        submitButton = document.createElement('input'),
        content_container = document.getElementById('content_container');
        
    submitButton.className = 'ALE_done button';
    submitButton.type = 'button';
    submitButton.value = '';
    submitButtonContainer.appendChild(submitButton);
    content_container.appendChild(submitButtonContainer);
   }
  
  function insertSaveChanges()
   {
    var aElement = document.createElement('a'),
        content_container = document.getElementById('content_container'),
        submitButtonContainer = document.createDocumentFragment();
    aElement.href = '#saveChanges';
    aElement.className = 'sprite save nimbb_button';
    aElement.innerHTML = '';
    content_container.appendChild(aElement);
    
    $(getConfig().mainContainer).append(submitButtonContainer);
   }

  function populateAnswers()
   {
    var answer = app.getTest().getQuestionBank();
    if (answer[0].learner_response)
     {
      $("textarea").val(answer[0].learner_response);
     }
    else if (app.scorm.scormProcessGetValue('cmi.interactions.1.learner_response'))
     {
      $("textarea").val(app.scorm.scormProcessGetValue('cmi.interactions.1.learner_response'));
     }
   }
   
  function render()
   {
    console.info('@freeWrite.render()');
    
    buildHTML();
    populateAnswers();
    bindEvents();
    
    // Transparent background, dont need rounded corners
//    applyBorderCorner();
    $('body').one('template.loaded', function()
                                      {                                       
                                       $('#data_toName, #lightbox_data_toName').html(app.scorm.learnerName().split(' ')[1]);
                                      });
   }
  
  function saveChanges()
   {
    console.info('@recordAudio.nimbb().saveChanges()');
    
    // Save textarea data
    app.getTest().recordInteraction({
                                     description : 'freeWrite',
                                     id : $("textarea").attr('id').split('_')[2],
                                     value : $.trim($("textarea").val())
                                    });
   }
  
  function setConfig(args)
   {
    _config = $.extend({
                        'link' : this,
                        'container' : '#data_notes_content'
                       }, args);
   }

  function showFirstAvailableTab()
   {
    console.info('@freeWrite.showFirstAvailableTab()');
    
    // Click first available tab
    console.info('anchor:');
    console.debug($('div#tabs a[href="' + getData().content[0].tabs[0].name + '"]'));
    
    $('div#tabs a[href="' + getData().content[0].tabs[0].name + '"]').trigger('click');
    //$('div#data_' + app.template.getData().content[0].tabs[0].name + '_content', 'div#content_wrapper').trigger('click');
   }

  function submitAnswers()
   {
    console.info('@freeWrite.submitAnswers()');
    
    app.getTest().recordInteraction({
                                     description : 'freeWrite',
                                     id : $("textarea").attr('id').split('_')[2],
                                     value : $.trim($("textarea").val())
                                    });
    app.getTest().recordTest({
                              'score' : 0 // indicates completion - instructor will manually grade later 
                             });
    app.doNext();
   }
  
  App.prototype.toolkitInit = function(args)
                                 {
   buildHTML();
   window.setTimeout(function(){
    $('#lightbox_toolkit_lb #lightbox_data_answerAreaDirections #lightbox_data_toName').html(app.scorm.learnerName().split(' ')[1]);
   },300);
   $('#lightbox_toolkit_lb #content_container').empty()
                                                     .html(args.testData[0].learner_response);
   
   return;
                                 };

 }

App.prototype.thisTemplate = new FreeWrite({
                                            "link" : ale
                                           });