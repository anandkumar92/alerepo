/**
 * Video template class
 * @param app
 * @returns {Video}
 */
function Video(app)
 {
  // Private vars
  // ------------
  function init()
   {
    if ($('#lightbox_toolkit_lb').length > 0)
     {
      // Do nothing since video.js is loading into a lightbox
     }
    else
     {
      var thisFlowplayerIndex = $('a.flowplayer').length - 1,
      vidWidth = app.template.getData().content[0].videoWidth || '600';
  
      $('#data_videoURL').css('width', vidWidth + 'px');
      
      $('body').one('template.loaded', function()
                                        {
                                         app.template.fixImgPaths();
                                        });
     }
   }
  
  
  App.prototype.toolkitInit = function (args)
                       {
//                        app.template.flowplayerHelper().unload('#data_videoURL a.flowplayer');
                        $('body').one('lightbox.close', function()
                                                         {
//                                                          var flowplayerHTML = $('#data_videoURL').html();
//                                                          $('#data_videoURL').html(flowplayerHTML.replace(/(&nbsp;)*/g,""));
//                                                         
//                                                                         app.template.flowplayerHelper().registerFlowplayer({
//                                                                          playerId : $f('*').length,
//                                                                          DOMelement : 'a.flowplayer:eq(0)'
//                                                                         });
//                                                          
//                                                          $('a.flowplayer:eq(0)').flowplayer({
//                                                                                          src : app.baseURL + 'resources/js/lib/flowplayer/flowplayer-3.2.2.swf',
//                                                                                          wmode : 'opaque'
//                                                                                         }, 
//                                                                                         {
//                                                                                          clip : {
//                                                                                                  'autoPlay' : false
//                                                                                                 }
//                                                                                         });
//                                                          
//                                                          // This is to signify when a flowplayer has been reloaded artificially, interview template relies on this and foreseeably simconvo if it is coupled with toolkit
//                                                          $('#data_videoURL').addClass('reloaded');
                                                          
                                                          if ($('body.interview #data_videoURL').length > 0)
                                                           {
                                                            try
                                                            {      
                                                             flowplayer('*').each(function()
                                                               {
                                                                console.warn(this.getState())
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
//                                                             alert(e)
                                                            }
                                                           setVideo();
                                                            return;
                                                           }
                                                         });
                       }
  
  // One-time setup
  // --------------
  init();
 }
 
App.prototype.thisTemplate = new Video(ale);