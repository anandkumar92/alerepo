jQuery.fn.center = function () 
                    {
                     var checkTop = ( $(window).height() - this.height() ) / 2 + $(window).scrollTop(),
                         top = (checkTop > 0) ? checkTop : 0,
                         checkLeft = ( $(window).width() - this.width() ) / 2 + $(window).scrollLeft(),
                         left = (checkLeft > 0) ? checkLeft : 0;
                     
                     this.css("position", "absolute");
                     this.css("top", top + 'px');
                     this.css("left", left + 'px');
                     
                     return this;
                    };
                    
jQuery.fn.centerWithNavigation = function ()
                                  {
                                   var checkTop = ( ($(window).height() - 52) - this.height() ) / 2 + $(window).scrollTop(),
                                       top = (checkTop > 0) ? checkTop : 0,
                                       checkLeft = ( $(window).width() - this.width() ) / 2 + $(window).scrollLeft(),
                                       left = (checkLeft > 0) ? checkLeft : 0;
                                   
                                   this.css("position", "absolute");
                                   this.css("top", top + 'px');
                                   this.css("left", left + 'px');
                                   
                                   return this;
                                  };

jQuery.fn.playing = function (args)
                     {
                      var action = args.action || 'start',
                          app = args.link || this,
                          context = args.context || this,
                          that = this,
                          toggle = 0;
                        
                       if (action === 'stop') {
                         stop();
                        } else {
                         // if (action === 'start')
                         start();
                        }
                       
                       function start()
                        {
                         $(that).html('playing');
                         
                         var iteration = 50,
                             length = args.length || 120000, // milliseconds
                             recording_loader_width = 0;
                         
                         // Set increment
                         recording_loader_width = $('div.progress_wrapper', context).width() / (length / iteration);
                         
                         // Show the loader elements
                         $('div.progress_content', context).width(0);
                         
                         // Start growing the loader bar and counting up
                         app.playing_loader = window.setInterval(function ()
                                                                  {
                                                                   // Increment counter
                                                                   
                                                                   
                                                                   // Increase progress_content width
                                                                   if ($('div.progress_content', context).width() < $('div.progress_wrapper', context).width())
                                                                    {
                                                                     $('div.progress_content', context).width(Math.ceil($('div.progress_content', context).width() + recording_loader_width));
                                                                    }
                                                                    
                                                                  }, iteration);
                        }
                       
                       function stop()
                        {
                         window.clearInterval(app.playing_loader);
                         $(that).html('Escuche su grabaci&#243;n.');
                         $('div.progress_content', context).width(0);
                        }
                       
                       return this;
                     };

jQuery.fn.position = function (x, y)
                      {
                       this.css("position", "absolute");
                       this.css("top", y + 'px');
                       this.css("left", x + 'px');
                       
                       return this;
                      };

jQuery.fn.pulse = function ()
                   {
                    var that = this,
                        x = 0, 
                        y = 0;
                    
                    window.setInterval(function ()
                                        {
                                         $(that).css({
                                          'backgroundPosition': '0px -' + (y * 110) + 'px'
                                         });
                                         (y < 6) ? (y++, x++) : ((x < 20) ? (y = y, x++) : (y = 0, x = 0));
                                        }, 150);
                    
                    return this;
                   };

jQuery.fn.recording = function (args)
                       {
                        var action = args.action || 'start',
                            app = args.link || this,
                            context = args.context || this;
                        
                        var that = this,
                            toggle = 0;
                        
                        if (action === 'stop') {
                          stop();
                         } else {
                          // if (action === 'start')
                          start();
                         }
                        
                        function start()
                         {
                          var secondsCount = 0;
                          
                          $(that).html('recording: 00:<span class="recording_timer">00</span>');
                          
                          var iteration = 50,
                              length = args.length || 120000, // milliseconds
                              recording_loader_width = 0;
                          
                          // Set increment
                          recording_loader_width = $('div.progress_wrapper', context).width() / (length / iteration);
                          
                          // Show the loader elements
                          $('div.progress_content', context).width(0);
                          
                          // Start growing the loader bar and counting up
                          app.recording_loader = window.setInterval(function ()
                                                                     {
                                                                      // Increase progress_content width
                                                                      if ($('div.progress_content', context).width() < $('div.progress_wrapper', context).width()) {
//                                                                        $('div.progress_content', context).width(Math.ceil($('div.progress_content', context).width() + recording_loader_width));
                                                                       
                                                                        secondsCount += 1;
                                                                        
                                                                        $('div.progress_content', context).width(((secondsCount / 1200) * 55)  + '%');
                                                                       }
                                                                       
                                                                     }, iteration);
                                                                      
                          // Start growing the loader bar and counting up
                          app.recording_timer = window.setInterval(function ()
                                                                    {
                                                                     // Increment counter
                                                                     if (($('span.recording_timer', context).html() * 1) < 9) {
                                                                       $('span.recording_timer', context).html('0' + (($('span.recording_timer', context).html() * 1) + 1));
                                                                      } else
                                                                      {
                                                                       $('span.recording_timer', context).html(($('span.recording_timer', context).html() * 1) + 1);
                                                                       
                                                                       // Update to show 1 minute
                                                                       if ($('a.recording.nimbb_button', context).html() === 'recording 01:<span class="recording_timer">60</span>')
                                                                        {
                                                                         $('a.recording.nimbb_button', context).html('recording 02:<span class="recording_timer">00</span>');
                                                                        }
                                                                       
                                                                       if (($('span.recording_timer', context).html() * 1) >= 60)
                                                                        {
                                                                         $('a.recording.nimbb_button', context).html('recording 01:<span class="recording_timer">00</span>');
                                                                        }
                                                                      }
                                                                      
                                                                    }, 1000);
                         }
                        
                        function stop()
                         {
                          window.clearInterval(app.recording_loader);
                          window.clearInterval(app.recording_timer);
                          $('div.progress_content', context).width(0);
                         }
                        
                        return this;
                       };

jQuery.fn.roundCorners = function ()
                          {
                           // Restricts RUZEE from running on IE < 9
                           // UPDATE: This was initially only for IE 7 but we noticed IE 8 was 
                           // unusably slow on SimConvo as well. We have an alternative solution
                           // for rounded corners entirely which will be part of an upcoming
                           // update. For now, we'll strip rounded corners from both IE versions
                           if (($.browser.msie === true && $.browser.version > 9) || $.browser.msie !== true) {
                             var shadow = ($.browser.msie === true) ? 0 : 0,
                                 border = RUZEE.ShadedBorder.create({
                                                                     corner: 18,
                                                                     shadow: shadow,
                                                                     border: 6
                                                                    });
                             border.render(this);
                            } else {
                             // Insert rounding elements
                            
                            }
                           
                           return this;
                          };
                          
jQuery.fn.glossary = function ()
                      {
                       // Restricts RUZEE from running on IE < 8
                       var shadow = ($.browser.msie === true) ? 0 : 0,
                           border = RUZEE.ShadedBorder.create({
                                                               corner: 18,
                                                               shadow: shadow,
                                                               border: 6
                                                              });
                       border.render(this);
                       
                       return this;
                      };