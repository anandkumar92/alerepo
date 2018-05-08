ale.template.Widget.data = {
             															options : {
             															           css : {
             															                  element : {
                       															                   //height : 291,
                       															                   position : 'relative',
                                                         width : '848px'
                       															                  },
             															                  lines : {
                                                      backgroundColor : '#666666',
                                                      display : 'block',
                                                      height : '15px',
                                                      margin : 'auto',
                                                      width : '2px'
                                                     },
                                              points : {
                                                        //backgroundImage : '', see styles.css for timeline_point class
                                                        bottom : '9px',
                                                        display : 'inline',
                                                        height : '15px',
                                                        cursor : 'pointer',
                                                        position : 'absolute',
                                                        width : '15px',
                                                        zIndex : '1'
                                                       },
                                              timeline : {
                                                          borderLeft : '2px solid #666666',
                                                          borderRight : '2px solid #666666',
                                                          borderTop : '2px solid #666666',
                                                          height : '15px',
                                                          width : '750px'
                                                         },
                                              times : {
                                                       display : 'inline',
                                                       fontSize : '11pt',
                                                       height : '20px',
                                                       textAlign : 'center',
                                                       position : 'absolute',
                                                       width : '30px'
                                                      }
             															                 }
                       															},
             			
             															_create : function()
             															           {
             															           	// Build dom
             															            var canvas = this.element,
             															                ourPoints = ale.template.getData().content[0].timeline_options.points,
             															                ourTimes = ale.template.getData().content[0].timeline_options.times,
             															                that = this,
             															                timeline = $(document.createElement('ul'));
             															            
             															            this.element.css(this.options.css.element);
             															            
             															            timeline.css(that.options.css.timeline);
             															            
             															            $.each(ourPoints, function(index, value)
             															                                         {
             															                                          var point = $(document.createElement('li'));
             															                                          
             															                                          point.css(that.options.css.points)
             															                                               .css({
             															                                                     left : value.x
             															                                                    });
             															                                          
             															                                          point.click(function()
             															                                                       {
             															                                                        var content,
             															                                                            style,
             															                                                            element = this,
             															                                                            header;
             															                                                        
             															                                                        // remove previous if it wasn't closed and also remove active icon for previous point
             															                                                        $('#lightbox_things_lb').remove();
             															                                                        $('li.timeline_point').addClass('inactive')
             															                                                                              .removeClass('active');
             															                                                        
             															                                                        // toggle active icon
             															                                                        $(element).addClass('active')
             															                                                                  .removeClass('inactive');
             															                                                        
             															                                                        content = (function(){return ourPoints[$(element).index()].content})();
             															                                                        header = (function(){return ourPoints[$(element).index()].header})();
             															                                                        style = (function(){return ourPoints[$(element).index()].css})();
             															                                                        
             															                                                        //load lightbox
             															                                                        ale.lightbox.render({
             															                                                                             'data' : {
             															                                                                                       'type' : 'things',
             															                                                                                       'content' : {
             															                                                                                                    'title' : header,
             															                                                                                                    'html' : content
             															                                                                                                   }
             															                                                                                      },
             															                                                                             'callback' : function()
             															                                                                                           {
             															                                                                                            // This callback is necessary because of a strange bug in ie7
             															                                                                                            // When the html css is set to height: 100%, hiding this element causes the browser to hang
             															                                                                                            $('#lightbox_things_lb a').unbind()
             															                                                                                                                      .bind('click', function()
             															                                                                                                                                      {
             															                                                                                                                                       $('#lightbox_things_lb').remove();
             															                                                                                                                                       
             															                                                                                                                                       $(element).addClass('inactive')
             															                                                                                                                                                 .removeClass('active');
             															                                                                                                                                       
             															                                                                                                                                       return false;
             															                                                                                                                                      });
             															                                                                                            
             															                                                                                            if (style !== undefined)
             															                                                                                             {
             															                                                                                              var originalHeight = $('#lightbox_things_lb').height();
             															                                                                                              
             															                                                                                              $('#lightbox_things_lb').width(style.width)
             															                                                                                                                      .height(style.height);
             															                                                                                              
             															                                                                                              $('#lightbox_things_lb div.lightbox_html_content').css('maxHeight', style.height - 40);
             															                                                                                              
             															                                                                                              $('#lightbox_things_lb').css('top', ($('.timeline_point.active').offset().top - style.height) - 30);
             															                                                                                              
             															                                                                                              $('#lightbox_things_lb .pointer').css('top', style.height - 30);
             															                                                                                             }
             															                                                                                            
             															                                                                                            $('#lightbox_things_lb').addClass('timelinePoint');
             															                                                                                            
             															                                                                                            $('#lightbox_toolkit_lb').css('display', 'inline');
             															                                                                                            
             															                                                                                            if ($('#lightbox_toolkit_lb').length > 0)
             															                                                                                             {
             															                                                                                              $('#lightbox_things_lb').css('left', (parseInt($('#lightbox_things_lb').css('left')) + 269));
             															                                                                                              $('#lightbox_things_lb').css('top', (parseInt($('#lightbox_things_lb').css('top')) + 52));
             															                                                                                             }
             															                                                                                           },         
             															                                                                             'global' : ale,
             															                                                                             'id' : 'things_lb',
             															                                                                             'independent' : false,
             															                                                                             'modal' : false,
             															                                                                             'position' : {
             															                                                                                           'type' : 'relative',
             															                                                                                           'x' : $('#lightbox_toolkit_lb').length > 0 ? ($(element).offset().left + 372) : ($(element).offset().left + 276),
             															                                                                                           'y' : $('#lightbox_toolkit_lb').length > 0 ? (($(element).offset().top + $(element).height()) - 25) : (($(element).offset().top + $(element).height()) - 162)
             															                                                                                          },
             															                                                                             'size' : 'normal'
             															                                                                            });
                          															                                          });
             															                                          
             															                                          point.addClass('timeline_point')
             															                                               .addClass('inactive')
             															                                               .appendTo(timeline);
             															                                         });
             															            
             															            $.each(ourTimes, function(index, value)
                                       															              {
                                       															               var line = $(document.createElement('div')),
                                       															                   time = $(document.createElement('li'));
                                       															               
                                       															               line.css(that.options.css.lines);
                                       															               
                                       															               time.css(that.options.css.times)
                                                                         .css({
                                                                               left : value.x
                                                                              });
                                       															               
                                       															               time.text(value.year)
                                       															                   .prepend(line)
                                       															                   .appendTo(timeline);
                                       															              });
             															            
             															            timeline.appendTo(this.element);
             															           },
             								
             															_init : function()
             															         {
             																									// bind events
             																								},
             															
             															_setConfig : function(args)
             															              {															              	
             															               $.extend(true, this.options, args);
             															               
             															               this.updateDisplay();
             															              },
             															
             															_getConfig : function()
             															              {
             															               return this.options;
             															              }
             														}
              
