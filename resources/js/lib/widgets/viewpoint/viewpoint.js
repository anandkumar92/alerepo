ale.template.Widget.data = {
             															options : {
             															           css : {
             															                  element : {
                       															                   //height : 291,
                       															                   position : 'relative',
                                                         maxWidth : '958px'
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
             															                con = $(document.createElement('div')),
             															                counterpoint = this._getData().content[0].viewpoint_options.counterpoint,
             															                point = this._getData().content[0].viewpoint_options.propoint,
             															                pro = $(document.createElement('div')),
             															                that = this;
             															            
             															            this.element.css(this.options.css.element);
             															            
             															            $.each([point], function(index, value)
                                          															              {
                                          															               var desc = $(document.createElement('div')),
                                          															                   imageHolder = $(document.createElement('div')),
                                          															                   parent = $(document.createElement('div'));
                                          															               
//                                          															               parent = index === 0 ? pro : con;
                                          															               parent.addClass('propoint collapsed')
                                          															                     .html('<h1>point</h1>' + '<a href="#" class="closePoint"></a>');
                                          															               
                                          															               desc.html(value.description)
                                          															                   .addClass('description hidden');
                                          															                   
                                          															               imageHolder.html('<h2><a href="">' + value.title + '</a></h2>' + '<img src="/s3scorm/ale/content/assets/' + value.image + '"><h2>' + value.subtitle + '</h2><a href="#" class="bio">biography</a>')
                                          															                          .addClass('imageHolder')
                                          															               
                                          															               parent.append(imageHolder)
                                          															                     .append(desc);
                                          															                   
                                          															               parent.appendTo(that.element);
                                          															              });
             															            
             															            $.each([counterpoint], function(index, value)
             															              {
                                           var desc = $(document.createElement('div')),
                                           imageHolder = $(document.createElement('div')),
                                           parent = $(document.createElement('div'));
                                       
//                                       parent = index === 0 ? pro : con;
                                       parent.addClass('counterpoint collapsed')
                                             .html('<h1>counterpoint</h1>' + '<a href="#" class="closePoint"></a>');
                                       
                                       desc.html(value.description)
                                           .addClass('description hidden');
                                           
                                       imageHolder.html('<h2><a href="">' + value.title + '</a></h2>' + '<img src="/s3scorm/ale/content/assets/' + value.image + '"><h2>' + value.subtitle + '</h2><a href="#" class="bio">biography</a>')
                                                  .addClass('imageHolder')
                                       
                                       parent.append(imageHolder)
                                             .append(desc);
                                           
                                       parent.appendTo(that.element);
             															              });
             															            
             															            
             															            $('a.bio').click(function()
                                                          {
                                                           var content,
                                                               style,
                                                               element = this,
                                                               header,
                                                               which = $(this).parent().parent().attr('class');

                                                           // remove previous if it wasn't closed and also remove active icon for previous point
                                                           $('#lightbox_things_lb').remove();
                                                           $('li.timeline_point').addClass('inactive')
                                                                                 .removeClass('active');
                                                           
                                                           // toggle active icon
                                                           $(element).addClass('active')
                                                                     .removeClass('inactive');

                                                           content = that._getData().content[0].viewpoint_options[which.split(' ')[0]].bio;
                                                           header = that._getData().content[0].viewpoint_options[which.split(' ')[0]].subtitle + ' - Biography';
                                                           
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
                                                                                                                                          
//                                                                                                                                          $(element).addClass('inactive')
//                                                                                                                                                    .removeClass('active');
                                                                                                                                          
                                                                                                                                          return false;
                                                                                                                                         });
                                                                                               
//                                                                                               if (style !== undefined)
//                                                                                                {
//                                                                                                 var originalHeight = $('#lightbox_things_lb').height();
//                                                                                                 
//                                                                                                 $('#lightbox_things_lb').width(style.width)
//                                                                                                                         .height(style.height);
//                                                                                                 
//                                                                                                 $('#lightbox_things_lb div.lightbox_html_content').css('maxHeight', style.height - 40);
//                                                                                                 
//                                                                                                 $('#lightbox_things_lb').css('top', ($('.timeline_point.active').offset().top - style.height) - 30);
//                                                                                                 
//                                                                                                 $('#lightbox_things_lb .pointer').css('top', style.height - 30);
//                                                                                                }
                                                                                               
                                                                                               $('#lightbox_things_lb').addClass('timelinePoint');
                                                                                               
                                                                                               $('#lightbox_toolkit_lb').css('display', 'inline');
                                                                                               $('#lightbox_things_lb').css('display', 'inline');
                                                                                               
                                                                                               if ($('#lightbox_toolkit_lb').length > 0)
                                                                                                {
                                                                                                 $('#lightbox_things_lb').css('left', $(element).offset().left);
                                                                                                 $('#lightbox_things_lb').css('top', ($(element).offset().top - $('#lightbox_things_lb').height()) - 30);
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
                                                           
                                                           return false;
                                                          });
             															            
             															            $('a.closePoint, h2').click(function()
                 															                                     {
                 															                                      $('#lightbox_things_lb').remove();
                 															                                      
                 															                                      if($(this).hasClass('closePoint'))
                 															                                       {
                 															                                        $(this).parent().find('div.description').toggleClass('hidden');
                 															                                        $(this).parent().toggleClass('collapsed');
                 															                                       }
                 															                                      else
                 															                                       {                 															                                        
                 															                                        $(this).parent().parent().toggleClass('collapsed');
                 															                                        $(this).parent().parent().find('div.description').toggleClass('hidden');
                 															                                       }
                 															                                      
                 															                                      return false;
                 															                                     });
             															            
             															            
//             															            $.each(ourPoints, function(index, value)
//             															                                         {
//             															                                          var point = $(document.createElement('li'));
//             															                                          
//             															                                          point.css(that.options.css.points)
//             															                                               .css({
//             															                                                     left : value.x
//             															                                                    });
//             															                                          
             															                                          
//             															                                          
//             															                                          point.addClass('timeline_point')
//             															                                               .addClass('inactive')
//             															                                               .appendTo(timeline);
//             															                                         });
//             															            
//             															            $.each(ourTimes, function(index, value)
//                                       															              {
//                                       															               var line = $(document.createElement('div')),
//                                       															                   time = $(document.createElement('li'));
//                                       															               
//                                       															               line.css(that.options.css.lines);
//                                       															               
//                                       															               time.css(that.options.css.times)
//                                                                         .css({
//                                                                               left : value.x
//                                                                              });
//                                       															               
//                                       															               time.text(value.year)
//                                       															                   .prepend(line)
//                                       															                   .appendTo(timeline);
//                                       															              });
             															            
             															           },
             															
             															_getData : function()
             															            {
             															             if ($('#lightbox_toolkit_lb').length > 0)
             															              {
             															               return ale.toolkit.getData();
             															              }
             															             else
             															              {
             															               return ale.template.getData();
             															              }
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
              
