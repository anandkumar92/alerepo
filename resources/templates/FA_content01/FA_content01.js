function FA_content01(args)
 {
  var config = {};
  setConfig(args);
  
  var //_minHeight = 250,
      app = getConfig().link,
      console = new Console();
  
  console.info('@FA_content01');
    
  init();

  function bindTranscriptToggle()
   {
    console.info('@FA_content01.bindTranscriptToggle()');
    
    var transcriptShowHide = 'show';
    
    $('#transcript_tab').unbind('click')
                        .bind('click', function (){
                                        //if($('#data_html_content_wrapper').css('visibility') === 'hidden')
                                        if(transcriptShowHide === 'hide')
                                         {
                                          $(this).toggleClass('active');
                                          //$('#data_html_content_wrapper').css({'display':'block'});
                                          //$('#data_media_content_wrapper').css({'width':'70%'});
                                          $('#data_media_content_wrapper').animate({
                                                                             width : '70%'
                                                                            });
                                          
                                          $('#data_html_content_wrapper').delay(500).fadeTo('slow', 1, function ()
                                                                                             { 
                                                                                              transcriptShowHide = 'show'; 
                                                                                             })
                                                                                             .css({
                                                                                                   'z-index' : '2',
                                                                                                   'position' : 'relative'
                                                                                                   });
                                         }
                                        else
                                         {
                                          $(this).toggleClass('active');
                                          //$('#data_html_content_wrapper').css({'display':'none'});
                                          //$('#data_media_content_wrapper').css({'width':'100%'});
                                          $('#data_html_content_wrapper').fadeTo(200, '.01', function ()
                                                                                               { 
                                                                                                transcriptShowHide = 'hide'; 
                                                                                               })
                                                                                               .css({
                                                                                                     'z-index' : '-1',
                                                                                                     'position':'absolute'
                                                                                                     });
                                          $('#data_media_content_wrapper').delay(200).animate({
                                                                             width : '100%'
                                                                            });
                                         }
                                       });
   };

  function bindWindowResize()
   {
    console.info('@FA_content01.bindWindowResize()');
    
    resizeTranscriptBar();
    Nifty('div#main_media_container', 'big');
    $(window).resize(function () 
                      {
                       resizeMedia('#data_media_content object', $(window).height(), 100);
                       resizeTranscriptBar();
                       //$('#data_media_content object').css({'height':($(window).height() - (/*$('#data_media_content object').offset().top*/ 100 + footerPadding)) > minHeight ? ($(window).height() - (/*$('#data_media_content object').offset().top*/ 100 + footerPadding)) : minHeight}); 
                      });
   }
   
  function getConfig()
   {
    return config;
   }
    
  function init()
   {
    console.info('@FA_content01.init()');
    
    resizeMedia('#data_media_content object', $(window).height(), 100);
    bindWindowResize();
    resizeTranscriptBar('expandOnly');
    bindTranscriptToggle();
   }

  function resizeMedia(selector, windowHeight, offset)
   {
    console.info('@FA_content01.resizeMedia()');
    
    var footerPadding = 155;
    
    $(selector).css({'height':(windowHeight - (offset + footerPadding))});
   }
    
  function resizeTranscriptBar(state)
   {
    console.info('@FA_content01.resizeTranscriptBar()');
    
    //var height = $('#main_media_container_wrapper').css('height');
    var height = $('#data_media_content object').height();
    console.info('height: ' + height);
    
    var transcriptBarHeight = $('#data_html_content').height();
    console.info('transcriptBarHeight: ' + transcriptBarHeight);
    
    //alert('#data_media_content object: ' + $('#data_media_content object').height());
    //alert("$('#data_html_content'): " + $('#data_html_content'));
    console.info('state: ' + state);
    
    if (height > transcriptBarHeight || state !== 'expandOnly') 
     {
      $('#data_html_content').css({
                                   'height': height + 'px'
                                  });
     }
   }
   
  function setConfig()
   {
    config = $.extend({
                       'link' : this
                      }, args);
   }
 };
 
 App.prototype.thisTemplate = new FA_content01({
                                                'link':ale
                                               });

//APP.ALE.thisTemplate = new APP.ALE.FA_content01();
//APP.ALE.thisTemplate.init();