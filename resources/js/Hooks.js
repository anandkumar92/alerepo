/**
 * Allows templates to insert functions into framework functions.
 * @return
 */
function Hooks(args)
 {
  // Private vars
  // ------------
  var collection = [];
  
  
  // Public methods
  // --------------
  /**
   * Restricts hooks to running on a per template basis
   */
  this.clearHooks = function ()
                     {
                      collection = [];
                     };
  
  this.getHooks = function (args)
                   {
                    var i, // Used in the loop below
                        name = args.name,
                        link = args.link || this;
                    
                    for (i in collection)
                     {
                      if (collection[i].name === name) {
                        collection[i].functionName.apply(link);
                       }
                     }
                   };
  
  this.setHook = function (args)
                  {
                   var name = args.name,
                       functionName = args.functionName;
                   
                   collection.push({
                                     name : name, 
                                     functionName : functionName
                                    });
                  };
 }