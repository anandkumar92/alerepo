function Console(args)
 {
  var _config = {},
      ieConfig = [];
      
  setConfig(args);

  function debugSet()
   {
    //console.info(getConfig().config.debug);
    
    return getConfig().config.debug;
   }

  function displayAlert(args)
   {
    if (ieConfig.length > 20)
     {
      ieConfig.shift();
      ieConfig.shift();
     }
    ieConfig.push(args, '\n');
    return ieConfig.join('');
   }

  function getConfig()
   {
    return _config;
   }

  function getValue(args)
   {
    return args;
   }

  function setConfig(args)
   {
    _config = $.extend(true, {
                              config : {
                                        debug : true
                                       }
                             }, args);
   }
  
  return {
    debug : function (args)
     {
      if ((typeof console !== 'undefined') && debugSet() && $.browser.msie !== true) 
       {
        console.debug(getValue(args));
       }
      else if (debugSet())
       {
        (typeof console !== 'undefined') ? console.warn(getValue(args)) : null;
        //alert(displayAlert(getValue(args)));
       }
     },
    
    info : function (args)
     {
      if ((typeof console !== 'undefined') && debugSet() && $.browser.msie !== true) 
       {
        console.info('info: ' + getValue(args));
       }
      else if (debugSet())
       {
        (typeof console !== 'undefined') ? console.info('    info: ' + getValue(args)) : null;
        //alert(displayAlert(getValue(args)));
       }
     },
     
    log : function (args)
     {
      if ((typeof console !== 'undefined') && debugSet() && $.browser.msie !== true) 
       {
        (typeof console !== 'undefined') ? console.log('info: ' + getValue(args)) : null;
       }
      else if (debugSet())
       {
        //console.log('    info: ' + getValue(args));
        //alert(displayAlert(getValue(args)));
       }
     }
   };
 }