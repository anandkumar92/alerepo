/*! 
 * palette 1.2.8
 *
 * Author: Milan Adamovsky
 * Modified: Prashant Naik
 */
/* USAGE:
 * To apply palette on an input/textarea:
 *    $('#example').palette({
 *                                    align : 'vertical', // vertical | horizontal(default) - orientation
 *                                    auto : false,	  // false | true (default) - open on focus or click icon to open
 *                                    language : 'french', // french | spanish(default) - language
 *                                    resize : true	// true | false(default) - resize the input/textarea to accomodate the palette icon. Works only if "auto = false".
 *                                    containment : 'document'(default) - // containment will initialize the draggable containment limit of the palette.
 *                                   });
 *
 *
 * To close any open palette:
 *    $.closePalette();
 *
 *
 * To remove palette implemented an element:
 *    $("#example").palette("destroy");
 *
 *
 * To add palette to TinyMce, pallette needs to be called on init of tinymce as below
 *	Add class "tinymce" to the element - IMPORTANT
 *   $('textarea.test').tinymce({
 *     ...
 *     ...
 *    	init_instance_callback:function(inst){
 *		$('#'+inst.editorId).palette({
 *						  language : 'spanish',
 *						  auto:false
 *						 });}, 
 *     ...
 *     ...
 *  });
 *
 *
 *
 *
 * In this version of the palette, if "auto:false" & "resize:true", the input/textarea and the palette icon will both have "float:left" applied to them and will be wrapped  
 * inside a "div" element with "clearfix" class applied.
 *
 * In some cases it is desired that the above should not happen, add class "palette_no_container" to the input/textarea.
 * In some other case it is desired for the above to happen but do not require "clearfix" class applied to the wrapped "div" element. In such cases add class "palette_container_noclearfix"
 * to the input/textarea.
 *
 *
 * Version 1.2.3 - Added code to apply highest z-index to the palette.
 * Version 1.2.4 - Modified code to handle issues in IE, and uses latest a-tools version 1.5
 * Version 1.2.5 - Added new palette icon, enable deutsch/german and italiano languages, Implemented new palette UI structure
 * Version 1.2.6 - Added language selector if language not specified. Will default to spanish, invole palette with languageSelect ; defaults to false
 * Version 1.2.7 - Added TinyMce editor support
 * Version 1.2.8 - Added palette event Callback support
 * 				   Supported Events are beforeShow, afterShow, beforeInsert, afterInsert
 * 				   usage :  $('input.french').palette({
 *							   						'language' : 'french',
 *							   						'eventCallback' : {
 *								   									   'beforeInsert' : function() {
 *								   										console.log('before insert');
 *								   									   },
 *							   										   'afterInsert' : function() {
 *							   											console.log('after insert');
 *							   										   },
 *							   										   'beforeShow' : function() {
 *							   											console.log('before show');
 *							   										   },
 *							   										   'afterShow' : function() {
 *							   											console.log('after show');
 *							   										   }
 *							   									      }
 *						   							});
 * 
 */
(function ($) {
    function Palette(self, args) {
        var active = '',
            config = {},
            map = new CharacterMap,
            state = 'ready'; // ready|hidden|shown
        this.map = map,
        this.version = '1.2.8',
        this.copy = copyCharacter,
        this.hide = hidePalette,
        this.info = getKeyInfo,
        this.load = loadCharacterMap,
        this.show = showPalette,
        this.snap = snapPalette,
        this.charIndex = -1,
        this.charAdded = false,
        this.activeSelectionLength = 0,
        this.activeSelectionStart = 0,
        this.activeSelectionEnd = 0,
        this.lineNumber = 0,
        this.getActive = getActive,
        this.getConfig = getConfig,
        this.getState = getState,
        this.setState = setState;
        this.printUrl = "http://connect.mcgraw-hill.com/connectweb/html/palette/"; //********************** SET THE BASE URL FOR THE PRINT PAGES eg: "http://connect.mcgraw-hill.com/connectweb/". This print url for spanish will become http://connect.mcgraw-hill.com/connectweb/spanish.html **********************//
        initConfig.apply(this, [args]);
        function getActive() {
                return active;
            }
        function getConfig() {
                return config;
            }
        function getState() {
                return state;
            }
        function setActive(args) {
                active = args.active;
            }
        function setState(args) {
                state = args.state;
            }
        function setConfig(args) {
                var language = args.language;
				if(language=="german"){
					language = "deutsch";
				}
                var characterSet = args.set[language];
                map.setMap(characterSet);
                config = args;
                config.language = language;
            }
        function bindSet() {
                var palette = this,
                	iframe,
                    config = getConfig(),
                    characterSet = config.set,
                    charSetLength = characterSet.length;
                $(document).unbind('loadMap.palette').bind('loadMap.palette', this.load);
                if(config.tinymceEditor) {
		            if(document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentWindow) {
		            	iframe =  document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentWindow;
		        	}
		        	else {
		        		iframe = document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentDocument;
		        	}
                }
                function switchToUCase() {
                        $(document).unbind('keydown.palette').bind('keydown.palette', function (event) {
                            if (event.keyCode == 16) {
                                map.setCase("uppercase");
                                self.palette.load();
                                $(document).unbind('keydown.palette');
                                if(self.charIndex!=-1 && $(config.box.status).html()!=''){
					$(config.box.status).html(self.palette.info({
					    index: self.charIndex
					}).shortcut || '');
                                }
                            }
                        });
                        if(iframe) {
                        	$(iframe.document).unbind('keydown.palette').bind('keydown.palette', function (event) {
                                if (event.keyCode == 16) {
                                    map.setCase("uppercase");
                                    self.palette.load();
                                    $(document).unbind('keydown.palette');
                                    if(self.charIndex!=-1 && $(config.box.status).html()!=''){
    					$(config.box.status).html(self.palette.info({
    					    index: self.charIndex
    					}).shortcut || '');
                                    }
                                }
                            });
                        }
                    }
                function switchToLCase() {
                        $(document).unbind('keyup.palette').bind('keyup.palette', function (event) {
                            if (event.keyCode == 16) {
                                map.setCase("lowercase");
                                self.palette.load();
                                switchToUCase();
                                if(self.charIndex!=-1 && $(config.box.status).html()!=''){
					$(config.box.status).html(self.palette.info({
					    index: self.charIndex
					}).shortcut || '');
                                }
                            }
                        });
                        if(iframe) {
                            $(iframe.document).unbind('keyup.palette').bind('keyup.palette', function (event) {
                                if (event.keyCode == 16) {
                                    map.setCase("lowercase");
                                    self.palette.load();
                                    switchToUCase();
                                    if(self.charIndex!=-1 && $(config.box.status).html()!=''){
    					$(config.box.status).html(self.palette.info({
    					    index: self.charIndex
    					}).shortcut || '');
                                    }
                                }
                            });                        	
                        }
                    }
                switchToUCase();
                switchToLCase();
            }
        function copyCharacter(args) {
                var index = args.index;
                var characterMap = this.map.getMap();
                var activeObject = getActive();
                if(config.tinymceEditor) {
                	tinyMCE.activeEditor.execCommand('mceInsertContent',false,characterMap[index].character);return false;
                }
				else{
                 var selectionLength = this.activeSelectionLength,
                    selectionStart = this.activeSelectionStart,
                    selectionEnd = this.activeSelectionEnd;
                 	var foreRunner = activeObject[0].value.slice(0,selectionStart);
                 	var postRunner = activeObject[0].value.slice(selectionStart);
                 //if(index!=-1){    
					if (selectionLength != undefined && selectionLength != 0) {
						activeObject.replaceSelection(characterMap[index].character);
						activeObject.setCaretPos(selectionStart + 2);
					}
					else {
						var character = characterMap[index].character;
						
						var nls = this.lineNumber+1;

						var isTextarea = activeObject.is('textarea');
						/*if($.client.browser == 'Explorer') {
							activeObject[0].value = foreRunner+character+postRunner;
							activeObject.setCaretPos(selectionStart+3-nls);
						}else {	*/						
							//activeObject.setCaretPos(selectionStart+1);
							activeObject.insertAtCaretPos(character);
						//}
						
					}
                 //}
				 }
                return (self);
            }
        function getKeyInfo(args) {
                var config = getConfig(),
                    os = config.os,
                    index = args.index,
                    characterMap = this.map.getMap(),
                    osSpecific = characterMap[index][os];
                self.charIndex = index    
                delete(characterMap[index].win);
                delete(characterMap[index].mac);
                var newConfig = $.extend(true, characterMap[index], osSpecific);
                return (characterMap[index]);
            }
        function initConfig(args) {
                setConfig($.extend({
                    align: 'horizontal',
                    auto: true,
                    box: {
                        close: '#palette_close',
                        icon: 'palette_icon',
                        key: 'palette_key',
                        palette: '#palette_container',
                        set: '#palette_set',
                        snap: '#palette_snap',
                        status: '#palette_shortcut .palette_hint_right',
                        print: '#palette_print'
                    },
                    browser: $.client.browser,
                    containment : 'document',
                    items: 20,
                    iconsize: 59,
                    language: 'spanish',
                    languageSelect : false,
                    tinymceEditor : false,
					eventCallback : {
									},
                    os: ($.client.os != 'Windows' ? 'mac' : 'win'),
                    resize: false,
		    set : {
			   french : [
				     {
				      lowercase : {
						   character : '\u00E0', /*  */
						   mac : {
							  hotkey : 'Option+`+a',
							  shortcut : 'Option +` a'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+4',
							  shortcut : 'Alt +0224'
							 }
						  },
				      uppercase : {
						   character : '\u00C0', /*  */
						   mac : {
							  hotkey : 'Option+`+Shift+a',
							  shortcut : 'Option +` Shift+a'
							 },
						   win : {
							  hotkey : 'Alt+0+1+9+2',
							  shortcut : 'Alt +0192'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00E2', /*  */
						   mac : {
							  hotkey : 'Option+i+a',
							  shortcut : 'Option +i a'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+6',
							  shortcut : 'Alt +0226'
							 }
						  },
				      uppercase : {
						   character : '\u00C2', /*  */
						   mac : {
							  hotkey : 'Option+i+Shift+a',
							  shortcut : 'Option +i Shift+a'
								       },
						   win : {
							  hotkey : 'Alt+0+1+9+4',
							  shortcut : 'Alt +0194'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00E4', /*  */
						   mac : {
							  hotkey : 'Option+u+a',
							  shortcut : 'Option +u a'
								 },
						   win : {
							  hotkey : 'Alt+0+2+2+8',
							  shortcut : 'Alt +0228'
							 }
						  },
				      uppercase : {
						   character : '\u00C4', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+a',
							  shortcut : 'Option +u Shift+a'
							 },
						   win : {
							  hotkey : 'Alt+0+1+9+6',
							  shortcut : 'Alt +0196'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00E8', /*  */
						   mac : {
							  hotkey : 'Option+`+e',
							  shortcut : 'Option +` e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+2',
							  shortcut : 'Alt +0232'
							 }
						  },
				      uppercase : {
						   character : '\u00C8', /*  */
						   mac : {
							  hotkey : 'Option+`+Shift+e',
							  shortcut : 'Option +` Shift+e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+0',
							  shortcut : 'Alt +0200'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00E9',  /*  */
						   mac : {
							  hotkey : 'Option+e+e',
							  shortcut : 'Option +e e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+3',
							  shortcut : 'Alt +0233'
							 }
						  },
				      uppercase : {
						   character : '\u00C9', /*  */
						   mac : {
							  hotkey : 'Option+e+Shift+e',
							  shortcut : 'Option +e Shift+e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+1',
							  shortcut : 'Alt +0201'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00EA',  /*  */
						   mac : {
							  hotkey : 'Option+i+e',
							  shortcut : 'Option +i e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+3',
							  shortcut : 'Alt +0234'
							 }
						  },
				      uppercase : {
						   character : '\u00CA', /*  */
						   mac : {
							  hotkey : 'Option+e+Shift+e',
							  shortcut : 'Option +i Shift+e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+2',
							  shortcut : 'Alt +0202'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00EB',  /*  */
						   mac : {
							  hotkey : 'Option+u+e',
							  shortcut : 'Option +u e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+5',
							  shortcut : 'Alt +0235'
							 }
						  },
				      uppercase : {
						   character : '\u00CB', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+e',
							  shortcut : 'Option +u Shift+e'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+3',
							  shortcut : 'Alt +0203'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00E7',  /*  */
						   mac : {
							  hotkey : 'Option+c',
							  shortcut : 'Option +c'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+1',
							  shortcut : 'Alt +0231'
							 }
						  },
				      uppercase : {
						   character : '\u00C7', /*  */
						   mac : {
							  hotkey : 'Option+e+Shift+e',
							  shortcut : 'Option +e Shift+e'
							 },
						   win : {
							  hotkey : 'Alt+0+1+9+1',
							  shortcut : 'Alt +0199'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00EE',  /*  */
						   mac : {
							  hotkey : 'Option+i+i',
							  shortcut : 'Option +i i'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+8',
							  shortcut : 'Alt +0238'
							 }
						  },
				      uppercase : {
						   character : '\u00CE', /*  */
						   mac : {
							  hotkey : 'Option+i+Shift+i',
							  shortcut : 'Option +i Shift+i'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+6',
							  shortcut : 'Alt +0206'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00EF',  /*  */
						   mac : {
							  hotkey : 'Option+u+i',
							  shortcut : 'Option +u i'
							 },
						   win : {
							  hotkey : 'Alt+0+2+3+9',
							  shortcut : 'Alt +0239'
							 }
						  },
				      uppercase : {
						   character : '\u00CF', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+i',
							  shortcut : 'Option +u Shift+i'
							 },
						   win : {
							  hotkey : 'Alt+0+2+0+7',
							  shortcut : 'Alt +0207'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00F4',  /*  */
						   mac : {
							  hotkey : 'Option+i+o',
							  shortcut : 'Option +i o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+4+4',
							  shortcut : 'Alt +0244'
							 }
						  },
				      uppercase : {
						   character : '\u00D4', /*  */
						   mac : {
							  hotkey : 'Option+i+Shift+o',
							  shortcut : 'Option +i Shift+o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+1+2',
							  shortcut : 'Alt +0212'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00F6',  /*  */
						   mac : {
							  hotkey : 'Option+u+o',
							  shortcut : 'Option +u o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+4+6',
							  shortcut : 'Alt +0246'
							 }
						  },
				      uppercase : {
						   character : '\u00D6', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+o',
							  shortcut : 'Option +u Shift+o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+1+4',
							  shortcut : 'Alt +0214'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u0153',  /*  */ 
						   mac : {
							  hotkey : 'Option+q',
							  shortcut : 'Option +q'
							 },
						   win : {
							  hotkey : 'Alt+0+1+5+6',
							  shortcut : 'Alt +0156'
							 }
						  },
				      uppercase : {
						   character : '\u0152', /*  */
						   mac : {
							  hotkey : 'Option+Shift+q',
							  shortcut : 'Option Shift+q'
							 },
						   win : {
							  hotkey : 'Alt+0+1+4+0',
							  shortcut : 'Alt +0140'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00F9',  /*  */
						   mac : {
							  hotkey : 'Option+`+u',
							  shortcut : 'Option +` u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+4+9',
							  shortcut : 'Alt +0249'
							 }
						  },
				      uppercase : {
						   character : '\u00D9', /*  */
						   mac : {
							  hotkey : 'Option+`+Shift+u',
							  shortcut : 'Option +` Shift+u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+1+7',
							  shortcut : 'Alt +0217'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00FB',  /*  */
						   mac : {
							  hotkey : 'Option+i+u',
							  shortcut : 'Option +i u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+5+1',
							  shortcut : 'Alt +0251'
							 }
						  },
				      uppercase : {
						   character : '\u00DB', /*  */
						   mac : {
							  hotkey : 'Option+i+Shift+u',
							  shortcut : 'Option +i Shift+u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+1+9',
							  shortcut : 'Alt +0219'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00FC',  /*  */
						   mac : {
							  hotkey : 'Option+u+u',
							  shortcut : 'Option +u u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+5+2',
							  shortcut : 'Alt +0252'
							 }
						  },
				      uppercase : {
						   character : '\u00DC', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+u',
							  shortcut : 'Option +u Shift+u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+0',
							  shortcut : 'Alt +0220'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00AB',  /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  },
				      uppercase : {
						   character : '\u00AB', /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00BB',  /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift+ Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  },
				      uppercase : {
						   character : '\u00BB', /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift +Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u20AC', 
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  },
				      uppercase : {
						   character : '\u20AC', /*  */
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  }
				     }
				    ],
			   spanish : [
				      {
				       lowercase : {
						    character : '\u00E1', /*  */
						    mac : {
							   hotkey : 'Option+e+a',
							   shortcut : 'Option +e a'
							  },
						    win : {
							   hotkey : 'Alt+0+2+2+5',
							   shortcut : 'Alt +0225'
							  }
						   },
				       uppercase : {
						    character : '\u00C1', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+a',
							   shortcut : 'Option +e Shift+a'
							  },
						    win : {
							   hotkey : 'Alt+0+1+9+3',
							   shortcut : 'Alt +0193'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00E9',  /*  */
						    mac : {
							   hotkey : 'Option+e+e',
							   shortcut : 'Option +e e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+3',
							   shortcut : 'Alt +0233'
							  }
						   },
				       uppercase : {
						    character : '\u00C9', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+e',
							   shortcut : 'Option +e Shift+e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+1',
							   shortcut : 'Alt +0201'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00ED',  /*  */
						    mac : {
							   hotkey : 'Option+e+i',
							   shortcut : 'Option +e i'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+7',
							   shortcut : 'Alt +0237'
							  }
						   },
				       uppercase : {
						    character : '\u00CD', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+i',
							   shortcut : 'Option +e Shift+i'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+5',
							   shortcut : 'Alt +0205'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00F3', /*  */
						    mac : {
							   hotkey : 'Option+e+o',
							   shortcut : 'Option +e o'
							  },
						    win : {
							   hotkey : 'Alt+0+2+4+3',
							   shortcut : 'Alt +0243'
							  }
						   },
				       uppercase : {
						    character : '\u00D3', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+o', 
							   shortcut : 'Option +e Shift+o'
							  },
						    win : {
							   hotkey : 'Alt+0+2+1+1', 
							   shortcut : 'Alt +0211'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00FA', /*  */
						    mac : {
							   hotkey : 'Option+e+u',
							   shortcut : 'Option +e u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+5+0',
							   shortcut : 'Alt +0250'
							  }
						   },
				       uppercase : {
						    character : '\u00DA', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+u', 
							   shortcut : 'Option +e Shift+u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+1+8', 
							   shortcut : 'Alt +0218'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00FC', /*  */
						    mac : {
							   hotkey : 'Option+u+u',
							   shortcut : 'Option +u u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+5+2',
							   shortcut : 'Alt +0252'
							  }
						   },
				       uppercase : {
						    character : '\u00DC', /*  */
						    mac : {
							   hotkey : 'Option+u+Shift+u', 
							   shortcut : 'Option +u Shift+u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+2+0', 
							   shortcut : 'Alt +0220'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00F1', /*  */
						    mac : {
							   hotkey : 'Option+n+n',
							   shortcut : 'Option +n n'
							  },
						    win : {
							   hotkey : 'Alt+0+2+4+1',
							   shortcut : 'Alt +0241'
							  }
						   },
				       uppercase : {
						    character : '\u00D1', /*  */
						    mac : {
							   hotkey : 'Option+n+Shift+n', 
							   shortcut : 'Option +n Shift+n'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+9', 
							   shortcut : 'Alt +0209'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00A1', /*  */
						    mac : {
							   hotkey : 'Option+1',
							   shortcut : 'Option +1'
							  },
						    win : {
							   hotkey : 'Alt+0+1+6+1',
							   shortcut : 'Alt +0161'
							  }  
						   },
				       uppercase : {
						    character : '\u00A1', /*  */
						    mac : {
							   hotkey : 'Option+1',
							   shortcut : 'Option +1'
							  },
						    win : {
							   hotkey : 'Alt+0+1+6+1', 
							   shortcut : 'Alt +0161'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00BF', /*  */
						    mac : {
							   hotkey : 'Shift+Option+?', 
							   shortcut : 'Shift +Option +?'
							  },
						    win : {
							   hotkey : 'Alt+0+1+9+1', 
							   shortcut : 'Alt +0191'
							  }
						   },
				       uppercase : {
						    character : '\u00BF', /*  */
						    mac : {
							   hotkey : 'Shift+Option+?', 
							   shortcut : 'Shift +Option +?'
							  },
						    win : {
							   hotkey : 'Alt+0+1+9+1', 
							   shortcut : 'Alt +0191'
							  }
						   }
				      },
				     {
				      lowercase : {
						   character : '\u00AB',  /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  },
				      uppercase : {
						   character : '\u00AB', /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00BB',  /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift+ Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  },
				      uppercase : {
						   character : '\u00BB', /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift +Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  }
				     }
				     ],
			   deutsch : [
				     {
				      lowercase : {
						   character : '\u00E4', /*  */
						   mac : {
							  hotkey : 'Option+u+a',
							  shortcut : 'Option +u a'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+8',  
							  shortcut : 'Alt +0228'
							 }
						  },
				      uppercase : {
						   character : '\u00C4', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+a',
							  shortcut : 'Option +u Shift+a'
							 },
						   win : {
							  hotkey : 'Alt+0+1+9+6',
							  shortcut : 'Alt +0196'
							 }
						  }
				     },
				      {
				       lowercase : {
						    character : '\u00E9',  /*  */
						    mac : {
							   hotkey : 'Option+e+e',
							   shortcut : 'Option +e e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+3',
							   shortcut : 'Alt +0233'
							  }
						   },
				       uppercase : {
						    character : '\u00C9', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+e',
							   shortcut : 'Option +e Shift+e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+1',
							   shortcut : 'Alt +0201'
							  }
						   }
				      },
				     {
				      lowercase : {
						   character : '\u00F6', /*  */
						   mac : {
							  hotkey : 'Option+u+o',
							  shortcut : 'Option +u o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+4+6',  
							  shortcut : 'Alt +0246'
							 }
						  },
				      uppercase : {
						   character : '\u00D6', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+o',
							  shortcut : 'Option +u Shift+o'
							 },
						   win : {
							  hotkey : 'Alt+0+2+1+4',
							  shortcut : 'Alt +0214'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00FC', /*  */
						   mac : {
							  hotkey : 'Option+u+u',
							  shortcut : 'Option +u u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+5+2',  
							  shortcut : 'Alt +0252'
							 }
						  },
				      uppercase : {
						   character : '\u00DC', /*  */
						   mac : {
							  hotkey : 'Option+u+Shift+u',
							  shortcut : 'Option +u Shift+u'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+0',
							  shortcut : 'Alt +0220'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00DF', /*  */
						   mac : {
							  hotkey : 'Option+s',
							  shortcut : 'Option +s'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+3',
							  shortcut : 'Alt +0223'
							 }
						  },
				      uppercase : {
						   character : '\u00DF', /*  */
						   mac : {
							  hotkey : 'Option+s',
							  shortcut : 'Option +s'
							 },
						   win : {
							  hotkey : 'Alt+0+2+2+3',
							  shortcut : 'Alt +0223'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u201E', 
						   mac : {
							  hotkey : 'Option+Shift+w',
							  shortcut : 'Option Shift+w'
							 },
						   win : {
							  hotkey : 'Alt+0+1+3+2',  
							  shortcut : 'Alt +0132'
							 }
						  },
				      uppercase : {
						   character : '\u201E', /*  */
						   mac : {
							  hotkey : 'Option+Shift+w',
							  shortcut : 'Option Shift+w'
							 },
						   win : {
							  hotkey : 'Alt+0+1+3+2',  
							  shortcut : 'Alt +0132'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u201C', 
						   mac : {
							  hotkey : 'Option+[',
							  shortcut : 'Option +['
							 },
						   win : {
							  hotkey : 'Alt+0+1+4+7',  
							  shortcut : 'Alt +0147'
							 }
						  },
				      uppercase : {
						   character : '\u201C', /*  */
						   mac : {
							  hotkey : 'Option+[',
							  shortcut : 'Option +['
							 },
						   win : {
							  hotkey : 'Alt+0+1+4+7',  
							  shortcut : 'Alt +0147'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u20AC', 
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  },
				      uppercase : {
						   character : '\u20AC', /*  */
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  }
				     }
				],
			   italiano : [
				      {
				       lowercase : {
						    character : '\u00E0', /*  */
						    mac : {
							   hotkey : 'Option+`+a',
							   shortcut : 'Option +` a'
							  },
						    win : {
							   hotkey : 'Alt+0+2+2+4',
							   shortcut : 'Alt +0224'
							  }
						   },
				       uppercase : {
						    character : '\u00C0', /*  */
						    mac : {
							   hotkey : 'Option+`+Shift+a',
							   shortcut : 'Option +` Shift+a'
							  },
						    win : {
							   hotkey : 'Alt+0+1+9+2',
							   shortcut : 'Alt +0192'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00E8',  /*  */
						    mac : {
							   hotkey : 'Option+`+e',
							   shortcut : 'Option +` e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+2',
							   shortcut : 'Alt +0232'
							  }
						   },
				       uppercase : {
						    character : '\u00C8', /*  */
						    mac : {
							   hotkey : 'Option+`+Shift+e',
							   shortcut : 'Option +` Shift+e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+0',
							   shortcut : 'Alt +0200'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00E9',  /*  */
						    mac : {
							   hotkey : 'Option+e+e',
							   shortcut : 'Option +e e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+3',
							   shortcut : 'Alt +0233'
							  }
						   },
				       uppercase : {
						    character : '\u00C9', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+e',
							   shortcut : 'Option +e Shift+e'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+1',
							   shortcut : 'Alt +0201'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00EC',  /*  */
						    mac : {
							   hotkey : 'Option+`+i',
							   shortcut : 'Option +` i'
							  },
						    win : {
							   hotkey : 'Alt+0+2+3+6',
							   shortcut : 'Alt +0236'
							  }
						   },
				       uppercase : {
						    character : '\u00CC', /*  */
						    mac : {
							   hotkey : 'Option+`+Shift+i',
							   shortcut : 'Option +` Shift+i'
							  },
						    win : {
							   hotkey : 'Alt+0+2+0+4',
							   shortcut : 'Alt +0204'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00F2', /*  */
						    mac : {
							   hotkey : 'Option+`+o',
							   shortcut : 'Option +` o'
							  },
						    win : {
							   hotkey : 'Alt+0+2+4+2',
							   shortcut : 'Alt +0242'
							  }
						   },
				       uppercase : {
						    character : '\u00D2', /*  */
						    mac : {
							   hotkey : 'Option+`+Shift+o', 
							   shortcut : 'Option +` Shift+o'
							  },
						    win : {
							   hotkey : 'Alt+0+2+1+0', 
							   shortcut : 'Alt +0210'
							  }
						   }
				      },
				      {
				       lowercase : {
						    character : '\u00F9', /*  */
						    mac : {
							   hotkey : 'Option+e+u',
							   shortcut : 'Option +e u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+4+9',
							   shortcut : 'Alt +0249'
							  }
						   },
				       uppercase : {
						    character : '\u00D9', /*  */
						    mac : {
							   hotkey : 'Option+e+Shift+u', 
							   shortcut : 'Option +e Shift+u'
							  },
						    win : {
							   hotkey : 'Alt+0+2+1+7', 
							   shortcut : 'Alt +0217'
							  }
						   }
				      },
				     {
				      lowercase : {
						   character : '\u00AB',  /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  },
				      uppercase : {
						   character : '\u00AB', /*  */
						   mac : {
							  hotkey : 'Option+\\',
							  shortcut : 'Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+7+1',
							  shortcut : 'Alt +0171'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u00BB',  /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift+ Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  },
				      uppercase : {
						   character : '\u00BB', /*  */
						   mac : {
							  hotkey : 'Shift+Option+\\',
							  shortcut : 'Shift +Option +\\'
							 },
						   win : {
							  hotkey : 'Alt+0+1+8+7',
							  shortcut : 'Alt +0187'
							 }
						  }
				     },
				     {
				      lowercase : {
						   character : '\u20AC', 
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  },
				      uppercase : {
						   character : '\u20AC', /*  */
						   mac : {
							  hotkey : 'Shift+Option+2',
							  shortcut : 'Shift +Option+2'
							 },
						   win : {
							  hotkey : 'Alt+0+1+2+8',  
							  shortcut : 'Alt +0128'
							 }
						  }
				     }
				     ]
			  },
                    speed: 1000
                }, args));
                return (self);
            }
        function hidePalette() {
                var config = getConfig(),
                    container = config.box.palette,
                    activeObject = getActive();
                setState({
                        state: 'hidden'
                    });
                if ($(container).css('display') == 'none') {
                        return (this);
                    }
                if ($.prototype.jquery < '1.4.1') {
                        $(container).hide(1, function () {});
                    }
                else {
                        $(container).hide(1, function () {});
                    }
                return (self);
            }
        function loadCharacterMap() {
                bindSet.call(this);
                var jquery_version = $.prototype.jquery;
                var config = getConfig(),
                    align = config.align,
                    browser = config.browser,
                    container = config.box.palette,
                    palette = config.box.set,
                    palette_key = config.box.key,
                    palette_status = config.box.status,
                    characterMap = this.map.getMap(),
                    charSetLength = characterMap.length,
                    itemLimit = config.items,
                    listHTML = [];
                for (var i = 0; i < charSetLength && i < itemLimit; i++) {
                        listHTML.push('<a href="javascript:;" class="', palette_key, '" onclick="return false;">', characterMap[i].character, '</a>');
                    }
                $(palette).html(listHTML.join('')).bind('mousewheel.palette', carouselify);
                $('.' + palette_key).unbind('mouseenter.palette').bind('mouseenter.palette', function () {
                        $(palette_status).html(self.palette.info({
                            index: $(this).parent().find('.' + palette_key).index(this)
                        }).shortcut || '');
                    }).unbind('mouseleave.palette').bind('mouseleave.palette', function () {
                        $(palette_status).html('');
                        self.charIndex = -1;
                    });
                $(container).removeClass(align == 'vertical' ? 'horizontal' : 'vertical').addClass(align == 'vertical' ? 'vertical' : 'horizontal');
                return (self);
                function carouselify(event, delta) {
                        var direction = delta > 0 ? 1 : 0;
                        // placeholder for mousewheeling
                    }
            }
        function showPalette(args) {
                setActive({
                    active: self
                });
                self.palette = this;
                var config = getConfig(),
                	element = getActive();
                if(config.tinymceEditor) {
					element = $('#' + tinyMCE.activeEditor.editorContainer);
					element.css({
						display : 'block'
					});
					tinyMCE.activeEditor.focus();
                }
                var container = config.box.palette,
                    callback = args && args.callback,
                    containment = config.containment,
                    openSpeed = config.speed,
                    position = element.offset(),
                    elementHeight = element.outerHeight(),
                    newTop = (position.top + elementHeight),
                    newLeft = position.left,
                    css = {
                        left: newLeft + 'px',
                        top: newTop + 'px',
						'z-index': $.topZIndex()+1
                    };
                preShow({
                        args: args,
                        callback: displayPalette,
                        container: container,
                        containment: containment,
                        css: $.extend({}, css, {
                            visibility: 'hidden'
                        }),
                        speed: openSpeed
                    });
					config.eventCallback.beforeShow && config.eventCallback.beforeShow();
                function displayPalette(args) {
                        var callback = args.callback,
                            container = args.container,
                            css = args.css,
                            openSpeed = args.speed;
                        $.extend(css, {
                                visibility: 'visible'
                            });
                        $(container).css(css).data('css', css);
                        if ($.prototype.jquery < '1.4.1') {
                                $(container).show(openSpeed, function () {
                                    $(container).draggable({
                                        containment: args.containment,
                                        cursor: 'move',
                                        handle: '#palette_drag'
                                    });
                                    callback && callback();
                                });
                            }
                        else {
                                $(container).show(openSpeed, function () {
                                    $(container).draggable({
                                        containment: args.containment,
                                        cursor: 'move',
                                        handle: '#palette_drag'
                                    });
                                    callback && callback();
                                });
                            }
                        var sel = self.data('openCursorAt');
                        //var startAt = sel ? sel.start-sel.onLine+1 : $(self).val().length+1;
                        if(!sel) {
                        	sel = self.getSelection();
                        }
                        if($.client.browser == 'Explorer' && sel) {
                        	if((self.val().charAt(sel.start) + self.val().charAt(sel.start+1)) === '\n') {
                        		self.setCaretPos(sel.start+2);
                        	} else {
                        		self.setCaretPos(sel.start+1);
                        	}
                        }
						if($('#palette_container').hasClass('horizontal')){
							$('#palette_print').css('height',$('#palette_set').height()+"px");
							$('#palette_drag').css('height',$('#palette_container li').height()+"px");
						}
						if($('#facebox_overlay').css('display')=="block"){
							$('.horizontal #palette_set_container').css('background-color','transparent');
							$('.horizontal h3').css('background-color','transparent');
						}
						else{
							$('.horizontal #palette_set_container').css('background-color','#fff');							
							$('.horizontal h3').css('background-color','#fff');
						}
                       setState({
                                state: 'shown'
                            });
                    }
                return (self);
                function preShow(args) {
                        var afterShow = args.args.callback,
                            callback = args.callback,
                            container = args.container,
                            containment = args.containment,
                            css = args.css,
                            openSpeed = args.speed,
                            viewportHeight = $(window).height();
                        	$(container).css(css).show(1, function () {
                                var containerHeight = $(this).height(),
                                    viewportTop = $(window).scrollTop(),
                                    bottom = $(this).offset().top + containerHeight - viewportTop,
                                    newTop = (
                                    position.top - (containerHeight + parseInt($(this).css('margin-top')) + parseInt($(this).css('margin-top'))));
                                if (callback && (viewportHeight < bottom) && (parseInt(css.top) > (viewportHeight / 2)) && (newTop > viewportTop)) {
                                        css.top = newTop;
                                    }
                                callback({
                                        callback: afterShow,
                                        container: container,
                                        css: css,
                                        speed: openSpeed,
                                        containment : containment
                                    });
                            });
                    }
            }
        function snapPalette() {
                var config = getConfig(),
                    container = config.box.palette;
                $(container).css($(container).data('css'));
                return (self);
            }
        return (this);
    }
    function CharacterMap(args) {
        this.casing = '';
        this.map = {};
        this.getCase = getCase;
        this.getMap = getMap;
        this.setCase = setCase;
        this.setMap = setMap;
        function getCase() {
            var currentCase = this.casing;
            if (currentCase == '') {
                this.setCase('lowercase');
            }
            return (this.casing);
        }
        function getMap() {
        	
            var currentCase = this.getCase(),
                characterMap = this.map,
                mapLength = characterMap.length - 1,
                newMap = [];
           
            for (var i = mapLength; i >= 0; i--) {
                    newMap[i] = characterMap[i][currentCase];
                }
            
            /*this.getMap = function () {
                    var storedCase = currentCase;
                    currentCase = this.getCase();
                    if (storedCase != currentCase) {
                        return (getMap.call(this));
                    }
                    else {
                        return (newMap);
                    }
                };*/
            return newMap;//(this.getMap());
        }
        function setCase(value) {
            this.casing = value;
        }
        function setMap(value) {
            this.map = value;
        }
    }
    $.fn.palette = function (args) {
        var jquery_version = $.prototype.jquery;
        if (typeof args == "string") {
            if (args.match(/destroy/i)) {
                return $(this).each(function () {
                    $(this).unbind("focus.palette");
		    if ($(this).hasClass('palette_resized')){
			$(this).removeClass('palette_resized').removeClass('palette_added').css('float','none').css('cssText',$(this).attr('style')+';width:'+parseInt($(this).data('palette_oldwidth'))+'px !important');
		    }
                    $(this).next(".palette_icon").remove();
                });
            } else {
                return null;
            }
        } else {
            $('#palette_container:not(.palette_init)').remove();
            if ($('#palette_container.palette_init').length == 0) {
                $('#palette_container')
                $('body').append('\
					<ul id="palette_container" class="clearfix palette_init noPrint">\
						<li>\
							<h3></h3>\
							<div id="palette_set_container" class="clearfix">\
								<div id="palette_set"></div>\
								<div id="palette_print" title="print" style="float:left"> print </div>\
							</div>\
							<div id="palette_shortcut" class="more clearfix">\
								<div class="palette_hint_left">SHIFT for upper case</div>\
								<div class="palette_hint_right"></div>\
							</div>\
							<div id="palette_close" title="close">close</div>\
							<div id="palette_lang_icon" title="change language">language</div>\
							<div id="palette_snap" title="snap back">snap</div>\
							<div id="palette_drag"></div>\
						</li>\
					</ul>');
            }
            return this.each(function () {
                var self = $(this),
                    palette = new Palette(self, args);
                $(self).attr('autocomplete','off');    
                $.fn.palette = $.extend(true, $.fn.palette, palette);
                self = $.extend(true, {}, $(this));
                var config = palette.getConfig(),
                    close_button = config.box.close,
                    palette_container = config.box.palette,
                    palette_icon = config.box.icon,
                    palette_key = '.' + config.box.key,
                    palette_set = config.box.set,
                    palette_status = config.box.status,
                    print_button = config.box.print,
                    snap_button = config.box.snap;
                var display = function (event) {
                        self.palette = palette;
                        var selector = this,
                            currentState = self.palette.getState(),
                            currentDisplay = $(palette_container).css('display');
                        if (currentState == 'shown' && currentDisplay == 'none') {
                                self.palette.setState('hidden');
                            }
                        else if (currentState == 'shown') {
                                return;
                            }
                        if(config.languageSelect === true && $.cookie('palette_language')) {
                        	config.language = $.cookie('palette_language');
                        	var characterSet = config.set[config.language];
							self.palette.map.setMap(characterSet);
                        }
                        self.palette.map.setCase("lowercase");
                                           
                        self.palette.load();
                        
                        self.palette.show({
                                callback: function () {
                                    $(config.box.status).html('');
                                    self.charIndex = -1;
                                    self.palette.charAdded = false;
                                    var selection = self.getSelection();
                                    if (selection.length){
                                    	self.palette.activeSelectionLength = selection.length;
                                    }
                                    else{
                                    	self.palette.activeSelectionLength = 0;
                                    }
                                    if(selection.start)
                                    self.palette.activeSelectionStart = selection.start;
                                    if(selection.end)
                                    self.palette.activeSelectionEnd = selection.end;
                                    $(palette_container).disableSelection();
                                    
                                    if(config.languageSelect === true) {
                                    	$('#palette_set span').removeClass('selected').parent().find('span[lan="'+config.language+'"]').addClass('selected');
                                    	$('#palette_lang_icon').css({
                                    		'display' : 'block'
                                    	});
                                    } else {
                                    	
                                    	
                                    	$('#palette_lang_icon').css({
                                    		'display' : 'none'
                                    	});
                                    }
                                    
                                    $(palette_container).bind('mousedown.palette', function (event) {
                                        $(this).data('containerEventCanceller', true);
                                        var target = event.target;
                                        if ($.client.browser != 'Explorer') {
                                            if (!$(target).is(palette_key)) {
                                                return (0);
                                            }
                                        }
                                        else {
                                            if ($(target).is(palette_key)) {
                                                return (0);
                                            }
                                        }
                                    });
                                    $(print_button).unbind('click.palette').bind('click.palette', function () {
                                        window.open(self.palette.printUrl + config.language + '.html');
                                    });
                                    $(snap_button).unbind('click.palette').bind('click.palette', function () {
                                        self.palette.snap();
                                    });
                                    $(close_button).unbind('click.palette').bind('click.palette', function () {
                                        $(palette_container).data('containerEventCanceller', false);
                                        self.palette.getActive().focus();
                                        if (!self.palette.getActive().is('textarea')) {
                                            if (self.palette.charAdded) {
                                                self.palette.getActive().setCaretPos(self.palette.activeSelectionStart + 2);
                                            }
                                            else {
                                                self.palette.getActive().setCaretPos(self.palette.activeSelectionStart + 1);
                                            }
                                        }
                                        window.setTimeout('$.closePalette()', 0);
                                    });
                                    $(palette_container).unbind('mouseup.palette').bind('mouseup.palette', function (event) {
										if(!config.eventCallback.afterInsert || (config.eventCallback.afterInsert && config.eventCallback.afterInsert() !== false)) {
											var target = event.target;
											if ($(target).is(close_button)) {
												return (0);
											}
											if ($(this).data('containerEventCanceller') == true) {
												self.palette.getActive().focus();
												if (!self.palette.getActive().is('textarea')) {
													if (self.palette.charAdded && !$(target).is(palette_set)) {
														self.palette.getActive().setCaretPos(self.palette.activeSelectionStart + 2);
													}
													else {
														self.palette.getActive().setCaretPos(self.palette.activeSelectionStart + 1);
													}
												}
											}
											$(this).data('containerEventCanceller', false);
										}
                                    });
                                    $(palette_set).unbind('mousedown.palette').bind('mousedown.palette', function (event) {
                                    	if(!config.eventCallback.beforeInsert || (config.eventCallback.beforeInsert && config.eventCallback.beforeInsert() !== false)) {
                                    		self.palette.charAdded = true;
                                            var selection = self.getSelection();
                                            if (selection.length) {
                                                self.palette.activeSelectionLength = selection.length;
                                            }
                                            else {
                                                self.palette.activeSelectionLength = 0;
                                            }
                                            if(selection.start)
                                            self.palette.activeSelectionStart = selection.start;
                                            if(selection.end)
                                            self.palette.activeSelectionEnd = selection.end;
                                            if(selection.onLine)
                                            self.palette.lineNumber = selection.onLine;
                                            var target = event.target;
                                            if ($(target).is('a.palette_key')) {
                                                self.palette.copy({
                                                    index: (jquery_version < '1.4.1') ? $(event.target).parent().find(palette_key).index(event.target) : $(event.target).index()
                                                });
                                            }
                                            if($.client.browser === 'Explorer') {
                                            	var newval = $(self).getSelection();
                                            	self.data('openCursorAt', newval);
                                            }
                                            if($.client.browser === 'Chrome'){
                                            	return false;                                        	
                                            }	
                                    	}
                                        //return false;
                                    }).unbind('click.palette').bind('click.palette', function (event) {
                                    	var target = event.target;
                                        if (!$(target).is('a.palette_key')) {
                                            return (0);
                                        }
                                    });
                                    $('#palette_lang_icon').unbind('click.palette').bind('click.palette', function () {
										$('.palette_hint_left,#palette_print').hide();
										$('#palette_set').html('<i>Select language:</i><span class="palette_lang_select" lan="french">French</span><span class="palette_lang_select selected" lan="spanish">Spanish</span><span class="palette_lang_select" lan="deutsch">German</span><span class="palette_lang_select" lan="italiano">Italiano</span>');
										$('#palette_set span').removeClass('selected').parent().find('span[lan="'+config.language+'"]').addClass('selected');
										$('.palette_lang_select', '#palette_set').unbind('click.palette').bind('click.palette', function () {
											$.cookie('palette_language',$(this).attr('lan'), { expires: 1 })
											config.language = $(this).attr('lan');
											var characterSet = config.set[config.language];
											self.palette.map.setMap(characterSet);
											self.palette.load();
											$('.palette_hint_left,#palette_print').show();
											if($('#palette_container').hasClass('horizontal')){
												$('#palette_print').css('height',$('#palette_set').height()+"px");
												$('#palette_drag').css('height',$('#palette_container li').height()+"px");
											}
											if($('#facebox_overlay').css('display')=="block"){
												$('.horizontal #palette_set_container').css('background-color','transparent');
												$('.horizontal h3').css('background-color','transparent');
											}
											else{
												$('.horizontal #palette_set_container').css('background-color','#fff');							
												$('.horizontal h3').css('background-color','#fff');
											}
										});							
									});
									config.eventCallback.afterShow && config.eventCallback.afterShow();
                                }
                            }).unbind('blur.palette').bind('blur.palette', function (event) {
                            	if (!$(palette_container).data('containerEventCanceller')) {
                                    $(palette_container).data('containerEventCanceller', false);
                                    self.palette.hide();
                                    self.palette.setState({
                                        state: 'hidden'
                                    });
                                }
                            });
                            if(config.tinymceEditor) {
                            	if(document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentWindow) {
            		            	iframe =  document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentWindow;
            		        	}
            		        	else {
            		        		iframe = document.getElementById(tinyMCE.activeEditor.editorId + '_ifr').contentDocument;
            		        	}
                            	$(iframe.document).find('body').unbind('blur.palette').bind('blur.palette', function (event) {
                                	if (!$(palette_container).data('containerEventCanceller')) {
                                        $(palette_container).data('containerEventCanceller', false);
                                        self.palette.hide();
                                        self.palette.setState({
                                            state: 'hidden'
                                        });
                                    }
                                });
                            }
                    };
                if (config.auto) {
                        $(this).unbind('focus.palette').bind('focus.palette', display);
                    }
                else {
                        if(!$(this).hasClass('palette_added')){
				if (config.resize){
					var w = $(this).width()==0?$(this).css('width').replace(/px/i,""):$(this).width();
					w = isNaN(w) ? 0: parseInt(w);
					$(this).addClass('palette_resized').data('palette_oldwidth',w).css('cssText',$(this).attr('style')+';width:'+(w-config.iconsize)+'px !important');
					if(!$(this).hasClass('palette_no_container')){
						if(!$(this).hasClass('palette_container_noclearfix')){
							$(this).wrap('<div class="clearfix" />');
						}
						else{
							$(this).wrap('<div class="noclearfix" />');
						}
					}
					else{
						$(this).css('float','none');
					}
				}
				
				if(!config.tinymceEditor) {
					$(this).addClass('palette_added').after('<span class="' + palette_icon + '" title="special character palette" style="margin-top:'+$(this).css('margin-top')+'">palette</span>');
				}
				else {
					if(config.tinymceEditor) {
                    	$('.mceIcon', '[id*="_palette_icon"]').css({
                    		'width' : '30px'
                    	});
                    	
                    	$('[id*="_palette_icon"].mceButton').css({
                    		'width' : '30px'
                    	});
                    }
                    
                    
				}
				if (config.resize){
					$(this).css('float','left');
					$(this).next().css('float','left');
					if($(this).hasClass('palette_no_container')){
						$(this).css('float','none').next().css('float','none');
					}
				}
                        }
                        $(this).unbind('showPalette.palette').bind('showPalette.palette', display);
                        $('.' + palette_icon).unbind('click.palette').bind('click.palette', function () {
                            $(this).prev().trigger('showPalette');
                        });
                    }
                updateCursor = function(el) {
                	var sel = $(el).getSelection();
                	return sel;
                }
                $(this).unbind('click.palette').bind('click.palette',function() {
                	$(this).data('openCursorAt', updateCursor(this));
                }).unbind('keyup.palette').bind('keyup.palette',function() {
                	$(this).data('openCursorAt', updateCursor(this));
                });
                
                return (palette);
            });
        }
    };
    $.closePalette = function () {
        $("#palette_container").hide();
    }
})(jQuery);
  
  /*
   TopZIndex 1.2 (October 21, 2010) plugin for jQuery
   http://topzindex.googlecode.com/
   Copyright (c) 2009-2011 Todd Northrop
   http://www.speednet.biz/
   Licensed under GPL 3, see  <http://www.gnu.org/licenses/>
  */
(function(a){a.topZIndex=function(b){return Math.max(0,Math.max.apply(null,a.map((b||"*")==="*"?a.makeArray(document.getElementsByTagName("*")):a(b),function(b){return parseFloat(a(b).css("z-index"))||null})))};a.fn.topZIndex=function(b){if(this.length===0)return this;b=a.extend({increment:1},b);var c=a.topZIndex(b.selector),d=b.increment;return this.each(function(){this.style.zIndex=c+=d})}})(jQuery);