/*
The following elements in this script are either copies or derivatives of the jQuery library:
browser, setupBrowsers(), uaMatch(), userAgent

Copyright (c) 2010 John Resig, http://jquery.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Set global
var ALE_Load = {
                browser : {},

                buildCSS : function (args)
                            {
                             var tempVar,
                                 x;
                             
                             for (x = 0; x < args.length; x++) {
                               if (args[x].conditions) {
                                 // Assume this.browser.msie
                                 var operator = args[x].conditions.operator,
                                     browser = args[x].conditions.browser,
                                     version = args[x].conditions.version;
                                 
                                 // Enforce this rule only for IE
                                 if (!this.browser.msie) {
                                   continue;
                                  }
                                 
                                 //alert('operator: ' + operator);
                                 switch (operator) {
                                   case 'equals' :
                                    if ((this.browser.version * 1) === (version * 1)) {
                                      //alert('equals...\nbrowser version: ' + (this.browser.version * 1) + ':' + typeof (this.browser.version * 1) + '\nversion: ' + (version * 1) + ':' + typeof ((version * 1) + 1));
                                      tempVar = document.createElement('link');
                                      tempVar.setAttribute('rel', 'stylesheet');
                                      tempVar.setAttribute('type', 'text/css');
                                      tempVar.setAttribute('href', this.resourcePath + args[x].href);
                                      tempVar.setAttribute('media', args[x].media);
                                     }
                                    break;
                                    
                                   case 'gt' :
                                    if ((this.browser.version * 1) >= (version * 1)) {
                                     //alert('lt...\nbrowser version: ' + (this.browser.version * 1) + ':' + typeof (this.browser.version * 1) + '\nversion: ' + (version * 1) + ':' + typeof ((version * 1) + 1));
                                     tempVar = document.createElement('link');
                                     tempVar.setAttribute('rel', 'stylesheet');
                                     tempVar.setAttribute('type', 'text/css');
                                     tempVar.setAttribute('href', this.resourcePath + args[x].href);
                                     tempVar.setAttribute('media', args[x].media);
                                    }
                                    break;

                                   case 'lt' :
                                    if ((this.browser.version * 1) < (version * 1)) {
                                      //alert('lt...\nbrowser version: ' + (this.browser.version * 1) + ':' + typeof (this.browser.version * 1) + '\nversion: ' + (version * 1) + ':' + typeof ((version * 1) + 1));
                                      tempVar = document.createElement('link');
                                      tempVar.setAttribute('rel', 'stylesheet');
                                      tempVar.setAttribute('type', 'text/css');
                                      tempVar.setAttribute('href', this.resourcePath + args[x].href);
                                      tempVar.setAttribute('media', args[x].media);
                                     }
                                    break;
                                    
                                   case 'lte' :
                                   
                                    if ((this.browser.version * 1) < ((version * 1) + 1)) {
                                      //alert('lte...\nbrowser version: ' + (this.browser.version * 1) + ':' + typeof (this.browser.version * 1) + '\nversion: ' + (version * 1) + ':' + typeof ((version * 1) + 1));
                                      tempVar = document.createElement('link');
                                      tempVar.setAttribute('rel', 'stylesheet');
                                      tempVar.setAttribute('type', 'text/css');
                                      tempVar.setAttribute('href', this.resourcePath + args[x].href);
                                      tempVar.setAttribute('media', args[x].media);
                                     } 
                                    break;
                                    
                                   default : return null;
                                  }
                                } else {
                                 // Otherwise, if the browser isn't msie, just build the style include
                                 tempVar = document.createElement('link');
                                 tempVar.setAttribute('rel', 'stylesheet');
                                 tempVar.setAttribute('type', 'text/css');
                                 tempVar.setAttribute('href', this.resourcePath + args[x].href);
                                 tempVar.setAttribute('media', args[x].media);
                                }
                               
                               document.getElementsByTagName('head')[0].appendChild(tempVar);
                              }
                            },
                            
                buildJS : function (args)
                           {
                            // Set reference to self
                            var that = this;
                            
                            // Check which resource we're building
                            // If none set, set to zero
                            var x = args.resourceNumber || 0;
                            
                            // Check if resourceNumber is higher than resource length
                            if (args.resourceNumber === args.resources.length) {
                              return;
                             }
                            
                            // Build script
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.src = this.resourcePath + args.resources[x];
                            document.getElementsByTagName('head')[0].appendChild(script);
                            
                            // Set script load listeners
                            if (script.readyState) {
                              script.onreadystatechange = function ()
                                                           {
                                                            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                                              script.onreadystatechange = null;
                                                              that.buildJS({
                                                                            resources : args.resources,
                                                                            resourceNumber : (x + 1)
                                                                           });
                                                             }
                                                           };
                             } else {
                              script.onload = function ()
                                               {
                                                that.buildJS({
                                                              resources : args.resources,
                                                              resourceNumber : (x + 1)
                                                             });
                                               };
                             }
                           },
                
                init : function ()
                        {
                         this.setupBrowsers();
                        },
                                        
                uaMatch : function (ua)
                           {
                            ua = ua.toLowerCase();
                            
                            var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                             /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
                             /(msie) ([\w.]+)/.exec( ua ) ||
                             !/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
                               [];
                          
                            return { 
                                    browser : match[1] || "",
                                    version : match[2] || "0"
                                   };
                           },
                
                userAgent : navigator.userAgent,

               // resourcePath : '../../alecoreMultiTest/',
                resourcePath : '',
                
                setupBrowsers : function ()
                                 {
                                  var browserMatch = this.uaMatch(this.userAgent);
                                  
                                  if (browserMatch.browser) {
                                    this.browser[browserMatch.browser] = true;
                                    this.browser.version = browserMatch.version;
                                   }                                  
                                 }
               };

ALE_Load.init();

ALE_Load.buildCSS([{
                    href : 'resources/js/lib/shadedborder/shadedborder.css',
                    media : 'screen'
                   },
                   {
                    href : 'resources/css/blueprint/screen.css',
                    media : 'screen, projection'
                   },
                   {
                    href : 'resources/css/blueprint/print.css',
                    media : 'print'
                   },
                   {
                    href : 'resources/css/jcarousel/skin.css',
                    media : 'screen'
                   },
                   {
                    conditions : {
                                  operator : 'lt',
                                  browser : 'IE',
                                  version : '8'
                                 },
                    href : 'resources/css/blueprint/ie.css',
                    media : 'screen, projection'
                   },
                   {
                    href : 'resources/js/lib/niftycube/niftyCorners.css',
                    media : 'screen'
                   },
                   {
                    href : 'resources/js/lib/palette/css/palette.css',
                    media : 'screen'
                   },
                   {
                    href : 'resources/css/style.css',
                    media : 'screen'
                   },
                   {
                    conditions : {
                                  operator : 'gt',
                                  browser : 'IE',
                                  version : '9.0'
                                 },
                    href : 'resources/css/ie8.css',
                    media : 'screen, projection'
                   },
                   {
                    conditions : {
                                  operator : 'lt',
                                  browser : 'IE',
                                  version : '8.0'
                                 },
                    href : 'resources/css/ie.css',
                    media : 'screen, projection'
                   },
                   {
                    conditions : {
                                  operator : 'equals',
                                  browser : 'IE',
                                  version : '8.0'
                                 },
                    href : 'resources/css/ie8.css',
                    media : 'screen, projection'
                   },
                   {
                    href : 'resources/js/lib/qunit/css/qunit.css',
                    media : 'screen'
                   }]);
                   
ALE_Load.buildJS({'resources' : ['resources/js/lib/jquery/jquery.js',
                                 'resources/js/lib/dd_roundies/DD_roundies_0.0.2a.js',
                                 'resources/js/lib/jquery/extensions.js',
                                 'resources/js/lib/qunit/qunit.js',
                                 'resources/js/lib/JSON/json2.js',
                                 'resources/js/lib/niftycube/niftycube.js',
                                 'resources/js/lib/swfobject/swfobject.js',
                                 'resources/js/lib/shadedborder/shadedborder.js',
                                 'resources/js/lib/palette/js/libs/ui.core.js',
                                 'resources/js/lib/palette/js/libs/ui.draggable.js',
                                 'resources/js/lib/palette/js/libs/jquery.hotkeys-0.7.9.min.js',
                                 'resources/js/lib/palette/js/libs/jquery.mousewheel.min.js',
                                 'resources/js/lib/palette/js/libs/jquery.a-tools-connect.js',
                                 'resources/js/lib/palette/js/libs/jquery.client.js',
                                 'resources/js/lib/palette/js/libs/jquery.cookie.js',
                                 'resources/js/lib/palette/js/libs/palette.js',
                                 'resources/js/lib/jcarousel/jquery.jcarousel.min.js',
                                 'resources/js/lib/flowplayer/flowplayer-3.2.2.min.js',
                                 'resources/js/lib/glossary/js/glossary.js',
                                 'resources/js/lib/nimbb/Nimbb.js',
                                 'resources/js/lib/jquery/jquery-ui-1.8.4.custom.min.js',
                                 'resources/js/Console.js',
                                 //'resources/js/DocumentDomainFix.js',
                                 'resources/js/Scorm.js',
                                 'resources/js/TestManager.js',
                                 'resources/js/Template.js',
                                 'resources/js/Lightbox.js',
                                 'resources/js/Toolkit.js',
                                 'resources/js/Hooks.js',
                                 'resources/js/App.js'
                                ]});