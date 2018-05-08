/**
 * Video template class
 * @param app
 * @returns {Video}
 */
function Video(app) {
  // Private vars
  // ------------
  function init() {
    if ($('#lightbox_toolkit_lb').length > 0) {
      // Do nothing since video.js is loading into a lightbox
    } else {
      var thisFlowplayerIndex = $('a.flowplayer').length - 1,
        vidWidth = app.template.getData().content[0].videoWidth || '600';

      if (app.template.getData().content[0].videoURL.type === 'audio') {
        $('body').addClass('audio_only');
      }

      $('#data_videoURL').css('width', vidWidth + 'px');

      $('body').one('template.loaded', function() {
        app.template.fixImgPaths();
      });
    }
  }


  App.prototype.toolkitInit = function(args) {
    // No trigger for below piece of code and hence its obsolete
    // app.template.flowplayerHelper().unload('#data_videoURL a.flowplayer');
    // $('body').one('lightbox.close', function() {
    //   if ($('body.interview #data_videoURL').length > 0) {
    //     try {
    //       flowplayer('*').each(function() {
    //         console.warn(this.getState())
    //         if (this.isLoaded() === true) {
    //           this.stop();
    //           this.close();
    //           this.unload();
    //         }
    //       });
    //     } catch (e) {
    //       //                                                             alert(e)
    //     }
    //     setVideo();
    //     return;
    //   }
    // });
  }

  // One-time setup
  // --------------
  init();
}

App.prototype.thisTemplate = new Video(ale);