function Lightbox(args)
 {
  // Private vars
  // ------------
  var _config = {},
      _freshLightboxId = 1,
      that = this;
  
  
  // Private methods
  // ---------------
  function bindCloseButton(args)
   {
    var isIndependent = (function ()
                          {
                           return getConfig().independent;
                          }()); // Closure required to pass value not reference

    $('#' + args.element + ' .lightbox_title_content a').unbind('click.lightbox')
                                                        .bind('click.lightbox', function ()
                                                                                 {
                                                                                  if ($('#lightbox_toolkit_lb').hasClass('multibox') === true)
                                                                                   {
                                                                                    $('div.lightbox.normal.centered').remove();
                                                                                    
                                                                                    $('body').trigger('lightbox.closed');
                                                                                    
                                                                                    return false;
                                                                                   }
                                                                                  
                                                                                  if (isIndependent) {
                                                                                    close({
                                                                                           element : args.element
                                                                                          });
                                                                                   } else {
                                                                                    close();
                                                                                   }
                                                                                                  
                                                                                  return false;
                                                                                 });
    $('#modal').unbind('click.lightbox')
               .bind('click.lightbox', function (e) 
                                        {
                                         if (getConfig().attachCloseEvent) {
                                           var targetObj = $(e.target);
                                           if (isIndependent) {
                                             close({
                                                    element : args.element
                                                   });
                                            } else {
                                             close();
                                            }
                                          }
                                         return false;
                                        });
                                          
    $(document).unbind('keydown.lightbox')
               .bind('keydown.lightbox', function (e)
                                          {
                                           if (getConfig().attachCloseEvent && e.keyCode === 27) {
                                             var targetObj= $(e.target);
                                             if (isIndependent) {
                                               close({
                                                      element: args.element
                                                     });
                                              } else {
                                               close();
                                              }
                                             return false;
                                            }
                                          });
   }
  
  function rePosition(selector)
   {
    // Reposition existing lightbox
    // No need to do roundCorners, since it's been done.
    switch (getConfig().position.type)
     {
      case 'relative' :
       $(selector).position(getConfig().position.x - ($('.lightbox').width() / 2), getConfig().position.y)
                      .position(getConfig().position.x - ($('.lightbox').width() / 2), getConfig().position.y);
       break;
       
       // Case for near-full screen
      case 'full' :
       $(selector).position(getConfig().position.x, getConfig().position.y)
                      .css('left', '2.5%')
                      .position(getConfig().position.x, getConfig().position.y)
                      .css('left', '2.5%');
       break;
      default :
     }
   }
  
  function buildHTML() // Includes data binding
   {
    var html = [],
        thisLightboxId = (getConfig().id !== '') ? getConfig().id : null,
        thisLightboxGroup = (getConfig().group != undefined) ? getConfig().group : '',
        lightboxSize = (getConfig().size !== '') ? ' ' + getConfig().size : '';
    
    html.push('<div');
    html.push(' id="lightbox_' + thisLightboxGroup + thisLightboxId + '"');
    html.push(' class="lightbox' + lightboxSize + '">');
    
    var dataType = getConfig().data.type;
    switch (dataType) {
      case 'clickPic' :
       var app = getConfig().global;
       
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        } else {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
        
       html.push('<div class="lightbox_content_container">'); 
       
       if (getConfig().data.content.header !== '') {
         html.push('<p class="header">', getConfig().data.content.header, '</p>');
        }
       //html.push('<p class="audio">', getConfig().data.content.audio + '</p>');
       
       html.push('<div id="data_audio_' + thisLightboxId + '">'); // class="audioFlowplayer" href="resources/assets/' + getConfig().data.content.audio.content + '">');
       html.push('</div>');
       
       //html.push('<audio class="audio"><source src="../resources/assets/', getConfig().data.content.audio, '" type="type="audio/mpeg""></audio>');
       //<audio id="audiotag1" src="audio/flute_c_long_01.wav" autobuffer="autobuffer">
       
       if (getConfig().data.content.definition !== '') {
         html.push('<p class="definition"><span class="header">definici&#243;n</span>', getConfig().data.content.definition, '</p>');
        }
       
       if (getConfig().data.content.imageCaptionURL) {
         html.push('<div class="image_caption_content">');
         html.push('<img class="imageCaptionURL" src="/s3scorm/ale/content/assets/', getConfig().data.content.imageCaptionURL, '" alt="">');
         html.push('<p class="imageCaption">', getConfig().data.content.imageCaption, '</p>');
         html.push('</div>');
        }
        
       html.push('</div>');
       break;
      
      case 'floatImage':
          var app = getConfig().global;
          
          if (getConfig().data.content.title !== '') {
            html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
           } else {
            html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
           }
          html.push('<div class="lightbox_content_container floatImage">');    
          if (getConfig().data.content.imageCaptionURL !== '') 
           {
            html.push('<img class="imageCaptionURL" src="/s3scorm/ale/content/assets/', getConfig().data.content.imageCaptionURL, '" alt="">');
           }
          html.push('<p class="header">');
          if (getConfig().data.content.definition)
          {
           html.push('<b>', getConfig().data.content.definition, '</b><br/>');
          }
          if (getConfig().data.content.header !== '') 
           {
            html.push(getConfig().data.content.header);
           }
          html.push('</p></div>');
          break;
      case 'faq' :
       //html.push('');
       break;
      
      case 'follow_up_video' :
       //html.push(''); 
       break;
       
      case 'feedback' :
       var correctness = getConfig().data.content.yourAnswer === getConfig().data.content.correctAnswer ? 'correct' : 'incorrect';
       
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content">');
         if (getConfig().data.content.titleIcon !== undefined) {
           html.push('<div class="sprite ' + getConfig().data.content.titleIcon + '"></div>');
          }
         html.push('<div class="lightbox_title_data">',getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        }
       else {
         html.push('<div class="lightbox_title_content">');
         if (getConfig().data.content.titleIcon !== undefined) {
           html.push('<div class="sprite ' + getConfig().data.content.titleIcon + '"></div>');
          }
         html.push('<div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
       
       html.push('<div class="lightbox_content_container">');
       
       if (getConfig().data.content.html !== '') {
         html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
        }
       
       if (getConfig().data.content.question !== '') {
         html.push('<div class="lightbox_feedbackQuestion_content">', getConfig().data.content.question, '</div>');
        }
       
       html.push('<div class="lightbox_feedback_header"><p>your answer:</p>');
       
       html.push('<div class="sprite ' + correctness + '"></div>');
       
       html.push('</div>');
       
       if (getConfig().data.content.yourAnswer !== '') {
         html.push('<div class="lightbox_feedbackYourAnswer_content ' + correctness + '">', getConfig().data.content.yourAnswer, '</div>');
        }
       
       html.push('<div class="lightbox_feedback_header"><p>correct answer:</p>');
       html.push('</div>');
       
       if (getConfig().data.content.correctAnswer !== '') {
         html.push('<div class="lightbox_feedbackCorrectAnswer_content">', getConfig().data.content.correctAnswer, '</div>');
        }
       
       html.push('<div class="lightbox_feedback_header"><p>feedback:</p>');
       html.push('</div>');
       
       if (getConfig().data.content.feedback !== '') {
         html.push('<div class="lightbox_feedback_content">', getConfig().data.content.feedback, '</div>');
        }
       
       if (getConfig().data.content.relatedReading !== '') {
         html.push('<div class="lightbox_feedback_related_reading_content">',
                   buildRelatedReading(getConfig().data.content.relatedReading),
                   '</div>');
        }
       
       if (getConfig().data.content.relatedFaq !== '') {
         html.push('<div class="lightbox_feedback_related_faq_content">',
                   buildRelatedFaq(getConfig().data.content.relatedFaq),
                   '</div>');
        }
       
       if (getConfig().data.content.relatedVideo !== '') {
         html.push('<div class="lightbox_feedback_related_video_content">',
                   buildRelatedVideo(getConfig().data.content.relatedVideo),
                   '</div>');
        }
       
       html.push('</div>');
       break;
       
      case 'generic' :
       var app = getConfig().global;
       
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        } else {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
        
       html.push('<div class="lightbox_content_container">'); 
       
       if (getConfig().data.content.header !== '') {
         html.push('<p class="header">', getConfig().data.content.header, '</p>');
        }
       
       if (getConfig().data.content.html !== '') {
        html.push(getConfig().data.content.html);
       }
       
       html.push('</div>');
       break;
       
      case 'things' :
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        }
       
       html.push('<div class="lightbox_content_container">');
       html.push('<div class="pointer"></div>');
       html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
       html.push('</div>');
       break; 
       
      case 'toolkit' :
       html.push('<div class="lightbox_title_content"><div class="lightbox_title_data"></div><a href="" class="close">close</a></div>');
       html.push('<div class="lightbox_content_container">');
       
       if (getConfig().data.content.header !== '') {
         html.push('<p class="header">', getConfig().data.content.header, '</p>');
        }
       
       html.push('</div>');
       
       break; 
      
      case 'vidNotes' :
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        }
       
       html.push('<div class="lightbox_content_container">');
       html.push('<div class="pointer"></div>');
       
       if (getConfig().data.content.html !== '') {
         html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
        }
       
       html.push('</div>');
       break;
      
      case 'vidNotesFeedback' :
      case 'vidNotesFillinFeedback':
      case 'selectAndJustify':
       var correctness;
       if(dataType === 'vidNotesFeedback')
        {
         correctness = getConfig().data.content.yourAnswer === getConfig().data.content.correctAnswer ? 'correct' : 'incorrect';
        }
       else 
        {
         correctness = getConfig().data.content.correctness;// vidNotesFillinFeedback
        }
       
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content">');
         if (getConfig().data.content.titleIcon !== undefined) {
           html.push('<div class="sprite ' + getConfig().data.content.titleIcon + '"></div>');
          }
         html.push('<div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        }
       else {
         html.push('<div class="lightbox_title_content">');
         if (getConfig().data.content.titleIcon !== undefined) {
           html.push('<div class="sprite ' + getConfig().data.content.titleIcon + '"></div>');
          }
         html.push('<div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
       
       html.push('<div class="lightbox_content_container">');
       
       if (getConfig().data.content.html !== '') {
         html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
        }
       
       html.push('<div class="lightbox_feedback_header"><p>your answer:</p>');
       
       html.push('<div class="sprite ' + correctness + '"></div>');
       
       html.push('</div>');
       
       if (getConfig().data.content.yourAnswer !== '') {
         html.push('<div class="lightbox_feedbackYourAnswer_content">', getConfig().data.content.yourAnswer, '</div>');
        }
       
       if (getConfig().data.content.feedbackMessage !== '') {
    	   html.push('<div class="lightbox_feedback_header"><p>' + getConfig().data.content.feedbackMessage + '</p>');
       }
       else{
    	   html.push('<div class="lightbox_feedback_header"><p>why it\'s ' + correctness + '</p>'); 
       }
       html.push('</div>');
       
       if (getConfig().data.content.feedback !== '') {
         html.push('<div class="lightbox_feedback_content">', getConfig().data.content.feedback, '</div>');
        }
       
       if (getConfig().data.content.relatedReading !== '') {
         html.push('<div class="lightbox_feedback_related_reading_content">',
                   buildRelatedReading(getConfig().data.content.relatedReading),
                   '</div>');
        }
       
       if (getConfig().data.content.relatedFaq !== '') {
         html.push('<div class="lightbox_feedback_related_faq_content">',
                   buildRelatedFaq(getConfig().data.content.relatedFaq),
                   '</div>');
        }
       
       if (getConfig().data.content.relatedVideo !== '') {
         html.push('<div class="lightbox_feedback_related_video_content">',
                   buildRelatedVideo(getConfig().data.content.relatedVideo),
                   '</div>');
        }
       
       html.push('</div>');
       break;

      case 'map' :
       if (getConfig().data.content.html !== '') {
         html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
        }
       break;

      case 'simConvo' :
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        } else {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
       
       html.push('<div class="lightbox_content_container">'); 
       html.push('<div class="pointer"></div>');
       
       html.push('<ul>');
       // Loop through getConfig().data.content.questions
       var i;
       for (i = 0; i < getConfig().data.content.questions.length; i++) {
         html.push('<li><div class="sprite quoteLeft"></div><a href="', getConfig().data.content.questions[i].questionID, '" class="subQuestion">', getConfig().data.content.questions[i].title, '</a><div class="sprite quoteRight"></div></li>');
        }
       html.push('</ul>');
       
       html.push('</div>');
       break;

      case 'simConvoFeedback' : 
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        } else {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">feedback</div><a href="" class="close">close</a></div>');
        }
       html.push('<div class="lightbox_content_container">'); 
       
       html.push('<h3>your answer:</h3>');
       html.push('<div class="sprite ', getConfig().data.content.correct, '"></div>');
       html.push('<p>', getConfig().data.content.answerGiven, '</p>');
       
       html.push('<h3>why it\'s ', getConfig().data.content.correct, ':</h3>');
       html.push('<p>', getConfig().data.content.feedback, '</p>');
       
       if (getConfig().data.content.correct === 'correct') {
         // Call up a Nimbb player here
         html.push('<div class="record_container_wrapper">');
         html.push('<h2>Before you move on</h2>');
         html.push('<div class="record_your_answer">');
         html.push('<h3>Record your answer:</h3>');
         html.push('<div class="recorder"></div>');
         //html.push('<h2><a href="continue" class="saveAndContinue">continue</a></h2>');
         html.push('</div> <!-- record_your_answer -->');
         html.push('<div class="compare_your_recording">');
         html.push('<h3>Then compare your recording to that of a native Spanish speaker.</h3>');
         html.push('<div class="player"></div>');
         html.push('</div> <!-- compare_your_recording -->');
         html.push('</div> <!-- record_container_wrapper -->');
        }
       html.push('<div class="clear"></div>');
       html.push('</div> <!-- lightbox_content_container -->');
       
       break;
       
      default: 
       if (getConfig().data.content.title !== '') {
         html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', getConfig().data.content.title, '</div><a href="" class="close">close</a></div>');
        }
      
       html.push('<div class="lightbox_content_container">');
       
       if (getConfig().data.content.html !== '') {
         html.push('<div class="lightbox_html_content">', getConfig().data.content.html, '</div>');
        }
       
       html.push('</div>');
     }
    
    html.push('</div>');
    
    switch (getConfig().position.type) {
      case 'relative' :
       var thisLightbox = html.join('');
       $(thisLightbox).insertBefore('#modal')
                      .position(getConfig().position.x - ($('.lightbox').width() / 2), getConfig().position.y)
                      .roundCorners()
                      .position(getConfig().position.x - ($('.lightbox').width() / 2), getConfig().position.y);
                       
       // TODO: add functionality to reposition lightbox on window resize
       // Nullify window resize function
       $(window).unbind('resize');
       break;
       
      // Case for near-full screen
      case 'full' :
       var thisLightbox = html.join('');
       $(thisLightbox).insertBefore('#modal')
                      .position(getConfig().position.x, getConfig().position.y)
                      .css('left', '2.5%')
                      .roundCorners()
                      .position(getConfig().position.x, getConfig().position.y)
                      .css('left', '2.5%');
       
       // Nullify window resize function
       $(window).unbind('resize');
       break;
       
      // Case for near-full screen
      case 'auto' :
       var thisLightbox = html.join('');
       $(thisLightbox).insertBefore('#modal')
                      .roundCorners();
       
       // Nullify window resize function
       $(window).unbind('resize');
       break;
       
      default :
       var thisLightbox = html.join('');
       $(thisLightbox).insertBefore('#modal')
                      .addClass('centered')
                      .center()
                      .roundCorners()
                      .center();
 
       $(window).bind('resize', function ()
                                 {
                                  $('.lightbox.centered').center(); 
                                 });
     }

    bindCloseButton({
                     element : 'lightbox_' + thisLightboxGroup + thisLightboxId
                    });
    
    // Show/hide based on visibility setting
    if (getConfig().visible === false) {
      close({
             element : 'lightbox_' + thisLightboxId
            });
     }
   }
  
  function buildRelatedReading(args)
   {
    
   }
  
  function buildRelatedFaq(args)
   {
    
   }
  
  function buildRelatedVideo(args)
   {
    
   }
  
  /**
   * Manages closing of lightboxes and modals
   * @method close
   * @params args : object contains 'element' which is an element id
   */
  function close(args)
   {
    args = args || {};
    
    var element = args.element || false;
    if (element) {
      $('#' + element).hide();
     } else {
      $('div.lightbox').hide();
     }
     
    // Only hide the modal if no other lightboxes exist
    // This is meant to prevent closing a lightbox on an lightbox from hiding both modals.
    // e.g., "it was used on themes template within the toolkit lightbox" - Kyle 12/15/10
    $.each($('.lightbox'), function()
                            {
                             if ($(this).css('display') !== 'none') {
                               return false;
                              } else {
                               hideModal();
                              }
                            });
    
    // Currently this is only used for stopping playback of flowplayers in clickPic
    $('body').trigger('lightbox.closed');
   }
  
  function createModal()
   {
    var modal = '<div id="modal"></div>';
    
    $(document).ready(function ()
                       {
                        $('body').append(modal);
                       });
   }

  function getConfig()
   {
    return _config;
   }
    
  function getFreshLightboxId()
   {
    _freshLightboxId++;
                          
    // Check if an existing lightbox already exists
    if ($('#lightbox_' + _freshLightboxId).length > 0) {
      // If this element exists already, increase the counter and try again
      getFreshLightboxId();
     }
     
    return _freshLightboxId;
   }
    
  function hideModal()
   {
    $('#modal').hide();
   }

  function loaded()
   {
    // whatevs
   }
  /**
   * 
   * @param args
   * @returns lightbox instance if any
   * args: {
   *    id: 1,
   *    group: 'answers'
   * }
   */
  function getLightBoxInstance(args) 
   {
    if(!args || (typeof args.id === 'undefined')) 
     {
        return null;
     }
    return $('#lightbox_' + (args.group || '') + args.id);
   }
  function render(args)
   {
    setConfig(args);
    
    var args = getConfig(),
        buildNewCallback = args.buildNewCallback || function (){ },
        callback = args.callback,
        group = args.group || '',
        id = args.id,
        modal = args.modal,
    
        // Get independent state
        isIndependent = (function ()
                          {
                           return args.independent;
                          }()); // Closure required here
    
    // Check #id passed in hash (if any) else create a new HTML element
    if (modal) {
      showModal();
     }

    // If the lightbox is set to independent, don't close other lightboxes
    // This allows us to allow multiple active lightbox instances 
    if ($('#lightbox_' + group + id).length > 0) {
      if (!isIndependent)
       {
        $('.lightbox').hide();
       } 
      $('#lightbox_' + group + id).show();
      // If the lightbox is existed, need to reposition it.
      rePosition('#lightbox_' + group + id);
     } else {
      if (isIndependent) {
        buildHTML();
        buildNewCallback();
       } else {
        $('.lightbox:not(.toolkit_ignore)').hide();
        buildHTML();
        buildNewCallback();
       }
     }
    
    callback();
   }

  function showModal()
   {
    if ($('#modal').length < 1) {
      createModal();
     }
    
    if ($('body').hasClass('darkModal') === true)
     {      
      $('#modal').fadeTo('fast', 0.9);
     }
    else
     {      
      $('#modal').fadeTo('fast', 0.5);
     }
   }

  function setConfig(args)
   {
    _config = $.extend(true, {
                              attachCloseEvent : true,
                              callback : that.loaded,
                              data : {
                                      type : '', // 'Default' takes only html & title
                                      content : {
                                                 html : '', // Every type will have at least HTML & title
                                                 title : '' // See buildHTML() switch above for all cases
                                                }
                                     },
                              draggable : false, 
                              element : '', // jQuery selector
                              global : ale || {},
                              id : '#testid', // will be set as id="arg"
                              independent : false, // flags whether this lightboxes should close only itself (independently) or all open lightboxes
                              modal : true, 
                              position : {
                                          type : 'absolute',
                                          x : '',
                                          y : ''
                                         },
                              size : 'normal',
                              visible : true
                             }, args);
   }

  /**
   * @param args
   * {
   *  content: 'selector' or domNode, // append to the body of lightbox
   *  header: 'string', // header text
   *  title: 'string', // title content
   *  modal: boolean // indicator for showing modal or not
   *  onClose: function // callback function which will be triggered after click the close button on lightbox.
   * }
   * 
   * ex.
   * args = {
   *  content: '<div>This is Content<div>',
   *  header: 'this is header!',
   *  title: 'this is title',
   *  modal: true,
   *  onClose: function()
   *            {
   *             alert('closing');
   *            }
   * };
   */
  var showBox = (function()
                  {
                   // Remove the existing content.
                   var reset = function()
                                {
                                 $('#lightbox_body').empty();
                                 $('#lightbox_container .lightbox_title_data').empty();
                                },
                       resize = function(width)
                                 {
                                  $('#lightbox_container').width((width || $('#lightbox_body').width()) + 104);
                                  if(width)
                                   {
                                    $('#lightbox_container').centerWithNavigation();
                                   }
                                 },
                       bindEvent = function(onClose)
                                    {
                                     $('#lightbox_container a.close').unbind('click').bind('click', function()
                                                                                                     {
                                                                                                      // Call onClose callback function if any.
                                                                                                      onClose && onClose();
                                                                                                      $('#lightbox_body').empty();
                                                                                                      $('#lightbox_container').hide();
                                                                                                      $('#modal').hide();
                                                                                                      return false;
                                                                                                     });
                                     $(window).unbind('resize').bind('resize', function ()
                                                                                {
                                                                                 $('#lightbox_container').centerWithNavigation(); 
                                                                                });
                                    };
                   return function showBox(args)
                           {
                            if(!args)
                             {
                              return;
                             }
                            var container = $('#lightbox_container');
                            args.modal ? showModal() : hideModal();
                            // Check if the singleton light has been created.
                            if(container.length)
                             {
                              // Update the content if any box instance is exited.
                              reset();
                              $('#lightbox_body').append('<p class="header">', args.header || '', '</p>').append(args.content || '');
                              if(args.title)
                               {
                                $('#lightbox_container .lightbox_title_data').html('<p>' + args.title + '</p>');   
                               }
                              $('#lightbox_container').show(function()
                                                             {
                                                              $(this).centerWithNavigation();
                                                             });
                             }
                            else
                             {
                              // Build new instance of lightbox.
                              var html = [];
                              html.push('<div style="display:none;" id="lightbox_container" class="lightbox fullCenter', args.wrapperClass ? (' ' + args.wrapperClass) : '', '">');
                              html.push('<div class="lightbox_title_content"><div class="lightbox_title_data">', args.title || '', '</div><a href="" class="close">close</a></div>');
                              html.push('<div id="lightbox_body" class="lightbox_content_container">');
                              html.push('<p class="header">', args.header || '', '</p>');
                              html.push('</div></div>');
                              $(html.join('')).insertBefore('#modal')
                                              .addClass('centered'); 
                                
                              $('#lightbox_body').append(args.content || '');
                              $('#lightbox_container').centerWithNavigation()
                                                      .roundCorners()
                                                      .centerWithNavigation().show();
                             }
                            bindEvent(args.onClose);
                            resize(args.contentWidth);
                           };
                  })();  
  
  // Public interface
  // ----------------
  this.close = close;
  this.getFreshLightboxId = getFreshLightboxId;
  this.hideModal = hideModal;
  this.loaded = loaded;
  this.render = render;
  this.showModal = showModal;
  this.getLightBoxInstance = getLightBoxInstance;
  this.showBox = showBox;
  
  // One-time setup
  // --------------
  setConfig(args);
 }